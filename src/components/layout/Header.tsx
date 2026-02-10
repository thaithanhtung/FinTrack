import { RefreshCw, Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../../stores/themeStore";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuth();
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    // Get click position
    const x = e.clientX;
    const y = e.clientY;

    // Calculate the radius for the circle animation
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Determine if we're going to dark mode
    const isDark = theme === "dark";

    // Start view transition with circle expand animation
    const transition = document.startViewTransition(() => {
      toggleTheme();
    });

    transition.ready.then(() => {
      // Create clip-path animation
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Apply animation to the new layer
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          // Always animate the new layer (which is on top)
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  // Don't show header on login/register pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Au</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
              {t("header.title")}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={themeButtonRef}
            onClick={handleThemeToggle}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={
              theme === "light"
                ? "Chuyển sang Dark Mode"
                : "Chuyển sang Light Mode"
            }
          >
            {theme === "light" ? (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title={t("header.refreshTooltip")}
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <User size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-full transition-colors"
            >
              <LogIn size={14} />
              <span className="text-xs font-medium">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

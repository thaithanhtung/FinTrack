import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LineChart,
  Calculator,
  Bell,
  Settings,
  BarChart3,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { to: "/", icon: Home, key: "home" },
  { to: "/charts", icon: LineChart, key: "charts" },
  { to: "/statistics", icon: BarChart3, key: "statistics" },
  { to: "/history", icon: History, key: "history" },
  { to: "/converter", icon: Calculator, key: "converter" },
  { to: "/alerts", icon: Bell, key: "alerts" },
  { to: "/settings", icon: Settings, key: "settings" },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const currentIndex = navItems.findIndex(
      (item) => item.to === location.pathname
    );
    if (currentIndex !== -1) {
      const activeElement = navRefs.current[currentIndex];
      if (activeElement) {
        const parent = activeElement.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const elementRect = activeElement.getBoundingClientRect();

          setIndicatorStyle({
            left: elementRect.left - parentRect.left + elementRect.width / 2,
            width: elementRect.width * 0.6,
          });
        }
      }
    }
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50" />

      <div className="relative max-w-lg mx-auto">
        {/* Scrollable container */}
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="relative flex items-center px-3 py-2 min-w-max">
            {/* Animated indicator */}
            <div
              className="absolute bottom-1 h-1 bg-gradient-to-r from-gold-400 to-gold-600 dark:from-gold-500 dark:to-gold-400 rounded-full transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                transform: "translateX(-50%)",
              }}
            />

            {navItems.map(({ to, icon: Icon, key }, index) => (
              <NavLink
                key={to}
                to={to}
                ref={(el) => (navRefs.current[index] = el)}
                className="relative flex flex-col items-center gap-1 py-2 px-4 min-w-[70px] flex-shrink-0 group"
              >
                {({ isActive }) => (
                  <>
                    {/* Icon container with animated background */}
                    <div className="relative">
                      {/* Animated background circle */}
                      <div
                        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-gold-100 to-amber-100 dark:from-gold-900/40 dark:to-amber-900/40 scale-100 opacity-100"
                            : "bg-gray-100 dark:bg-gray-800 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        }`}
                      />

                      {/* Icon */}
                      <div
                        className={`relative p-2.5 transition-all duration-300 ${
                          isActive
                            ? "scale-110"
                            : "scale-100 group-hover:scale-105"
                        }`}
                      >
                        <Icon
                          size={22}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={`transition-all duration-300 ${
                            isActive
                              ? "text-gold-600 dark:text-gold-400"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                          }`}
                        />
                      </div>

                      {/* Pulse animation on active */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-gold-400/20 dark:bg-gold-500/20 animate-ping" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[10px] font-medium transition-all duration-300 ${
                        isActive
                          ? "text-gold-700 dark:text-gold-300 scale-105 opacity-100"
                          : "text-gray-500 dark:text-gray-400 scale-100 opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {t(`nav.${key}`)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

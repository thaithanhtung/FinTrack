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
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

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
  const [buttonPosition, setButtonPosition] = useState({ x: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Get current active index
  const currentIndex = navItems.findIndex(
    (item) => item.to === location.pathname
  );

  const activeItem = currentIndex !== -1 ? navItems[currentIndex] : navItems[0];
  const ActiveIcon = activeItem.icon;

  // Calculate button position based on active item
  useEffect(() => {
    const activeRef = navRefs.current[currentIndex];
    if (activeRef) {
      const rect = activeRef.getBoundingClientRect();
      const parentRect = activeRef.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setButtonPosition({
          x: rect.left - parentRect.left + rect.width / 2,
          width: rect.width,
        });
      }
    }
  }, [currentIndex]);

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 md:pb-0 pb-safe">
      {/* Background - Cream/beige */}
      <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-[#ffdead] dark:bg-amber-950/30 rounded-t-[25px] border-t border-gray-200/50" />

      <div className="relative max-w-lg mx-auto px-2">
        {/* Nav items */}
        <div
          style={{ overflowX: "auto", overflowY: "visible" }}
          className="scrollbar-hide"
        >
          <div
            className={`flex items-center py-3 pt-6 relative ${
              navItems.length <= 4 ? "justify-around" : "justify-start gap-1"
            }`}
            style={{ overflow: "visible" }}
          >
            {/* Single floating active button */}
            {buttonPosition.x > 0 && (
              <motion.div
                className="absolute pointer-events-none z-10"
                style={{
                  top: "28px",
                }}
                animate={{
                  x: buttonPosition.x,
                  transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  },
                }}
              >
                <div
                  style={{
                    position: "relative",
                    transform: "translateX(-50%) translateY(-50%)",
                  }}
                >
                  {/* Half-circle white background with side curves */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "72px",
                      height: "36px",
                      borderRadius: "0 0 36px 36px",
                      background: "rgba(255, 255, 255, 0.95)",
                    }}
                  >
                    {/* Left curve cutout */}
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "-13px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "0 16px 0 0",
                        background: "#ffdead",
                        boxShadow: "4px -4px 0 0 rgba(255, 255, 255, 0.95)",
                      }}
                    />
                    {/* Right curve cutout */}
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "-13px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "16px 0 0 0",
                        background: "#ffdead",
                        boxShadow: "-4px -4px 0 0 rgba(255, 255, 255, 0.95)",
                      }}
                    />
                  </div>

                  {/* Coral button */}
                  <motion.button
                    key={activeItem.key}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "relative",
                      zIndex: 10,
                      width: "50px",
                      height: "50px",
                      borderRadius: "9999px",
                      backgroundColor: "#E0605A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      boxShadow:
                        "0 8px 20px rgba(224, 96, 90, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                    className="pointer-events-auto"
                  >
                    <motion.div
                      key={`icon-${activeItem.key}`}
                      initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ActiveIcon
                        size={23}
                        strokeWidth={2.5}
                        color="#FFFFFF"
                        style={{
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                        }}
                      />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {navItems.map(({ to, icon: Icon, key }, index) => {
              const isActive = location.pathname === to;

              return (
                <NavLink
                  key={to}
                  to={to}
                  ref={(el) => (navRefs.current[index] = el)}
                  className={`relative flex flex-col items-center gap-1 flex-shrink-0 ${
                    navItems.length <= 4 ? "flex-1" : "w-[72px]"
                  }`}
                  style={{ overflow: "visible" }}
                >
                  {/* Icon container */}
                  <div
                    className="relative flex items-center justify-center w-full mb-[-16px]"
                    style={{ minHeight: "64px" }}
                  >
                    {!isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          transition: {
                            duration: 0.3,
                            ease: "easeOut",
                          },
                        }}
                        className="flex items-center justify-center"
                      >
                        <Icon
                          size={22}
                          strokeWidth={2}
                          className="text-[#D89898] transition-all duration-200 hover:scale-110"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0.75,
                      scale: isActive ? 1 : 0.95,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className={`text-[11px] font-semibold text-center leading-tight transition-colors duration-200 ${
                      isActive
                        ? "text-[#1a1a1a] dark:text-gray-100"
                        : "text-[#D89898]"
                    }`}
                  >
                    {t(`nav.${key}`)}
                  </motion.span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

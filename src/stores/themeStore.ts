import { create } from "zustand";
import { persist } from "zustand/middleware";
import { analytics } from "@/lib/analytics";

export type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        // Apply theme class to document root
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        // Track theme change
        analytics.changeTheme(theme);
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          // Apply theme class to document root
          if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          // Track theme change
          analytics.changeTheme(newTheme);
          return { theme: newTheme };
        });
      },
    }),
    {
      name: "fintrack-theme",
      onRehydrateStorage: () => (state) => {
        // Apply theme on hydration
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }
  )
);

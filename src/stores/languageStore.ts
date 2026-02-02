import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "vi" | "en";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "vi",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "fintrack-language",
    }
  )
);

import { Moon, Sun, Globe, Info } from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { useThemeStore, useLanguageStore } from "@/stores";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (lang: "vi" | "en") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <Card>
        <CardHeader
          title={t("settings.theme.title")}
          subtitle={t("settings.theme.description")}
          action={
            theme === "dark" ? (
              <Moon size={18} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun size={18} className="text-gray-600 dark:text-gray-400" />
            )
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border-2 transition-all ${
              theme === "light"
                ? "border-gold-500 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <Sun
              size={24}
              className={`mx-auto mb-2 ${
                theme === "light"
                  ? "text-gold-600 dark:text-gold-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                theme === "light"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {t("settings.theme.light")}
            </p>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border-2 transition-all ${
              theme === "dark"
                ? "border-gold-500 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <Moon
              size={24}
              className={`mx-auto mb-2 ${
                theme === "dark"
                  ? "text-gold-600 dark:text-gold-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                theme === "dark"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {t("settings.theme.dark")}
            </p>
          </button>
        </div>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader
          title={t("settings.language.title")}
          subtitle={t("settings.language.description")}
          action={
            <Globe size={18} className="text-gray-600 dark:text-gray-400" />
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLanguageChange("vi")}
            className={`p-4 rounded-xl border-2 transition-all ${
              language === "vi"
                ? "border-gold-500 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <p
              className={`text-lg font-semibold mb-1 ${
                language === "vi"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              🇻🇳
            </p>
            <p
              className={`text-sm font-medium ${
                language === "vi"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {t("settings.language.vi")}
            </p>
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className={`p-4 rounded-xl border-2 transition-all ${
              language === "en"
                ? "border-gold-500 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <p
              className={`text-lg font-semibold mb-1 ${
                language === "en"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              🇬🇧
            </p>
            <p
              className={`text-sm font-medium ${
                language === "en"
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {t("settings.language.en")}
            </p>
          </button>
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader
          title={t("settings.about.title")}
          action={
            <Info size={18} className="text-gray-600 dark:text-gray-400" />
          }
        />
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>{t("settings.about.description")}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {t("settings.about.version")}: 1.0.0
          </p>
        </div>
      </Card>
    </div>
  );
}

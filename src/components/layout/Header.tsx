import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
      </div>
    </header>
  );
}

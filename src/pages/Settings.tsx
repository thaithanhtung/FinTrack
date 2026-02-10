import {
  Moon,
  Sun,
  Globe,
  Info,
  Send,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { useThemeStore, useLanguageStore } from "@/stores";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateTelegramChatId,
} from "@/services/api/userProfileApi";
import { useState } from "react";
import i18n from "@/i18n/config";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatId, setChatId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
  });

  // Update Telegram chat ID mutation
  const updateMutation = useMutation({
    mutationFn: (newChatId: string) =>
      updateTelegramChatId(user!.id, newChatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      setShowSuccess(true);
      setChatId("");
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleLanguageChange = (lang: "vi" | "en") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleSaveChatId = async () => {
    if (!chatId.trim() || !user) return;
    try {
      await updateMutation.mutateAsync(chatId.trim());
    } catch (error) {
      console.error("Error updating chat ID:", error);
      alert("Không thể cập nhật Chat ID. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Telegram Settings - Only show if logged in */}
      {user && (
        <Card>
          <CardHeader
            title="Telegram Notifications"
            subtitle="Nhận thông báo giá vàng qua Telegram"
            action={
              <Send size={18} className="text-blue-600 dark:text-blue-400" />
            }
          />

          <div className="space-y-4">
            {profile?.telegramChatId ? (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-2">
                <CheckCircle
                  size={18}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                    Telegram đã được kết nối
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Chat ID: {profile.telegramChatId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 mb-3">
                  <Info
                    size={16}
                    className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      <strong>Cách lấy Chat ID:</strong>
                    </p>
                    <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                      <li>
                        Mở Telegram và tìm bot <strong>@userinfobot</strong>
                      </li>
                      <li>
                        Nhắn tin{" "}
                        <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                          /start
                        </code>
                      </li>
                      <li>Bot sẽ trả về Chat ID của bạn (dạng số)</li>
                      <li>Copy và paste vào ô bên dưới</li>
                    </ol>
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
                    >
                      <ExternalLink size={12} />
                      Mở @userinfobot
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telegram Chat ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder={profile?.telegramChatId || "123456789"}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <Button
                  onClick={handleSaveChatId}
                  disabled={!chatId.trim()}
                  isLoading={updateMutation.isPending}
                >
                  {profile?.telegramChatId ? "Cập nhật" : "Lưu"}
                </Button>
              </div>
            </div>

            {showSuccess && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  ✅ Đã lưu Chat ID thành công!
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

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

import { useState, FormEvent } from "react";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { useAlerts } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { formatVND, formatUSD } from "@/services/utils";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "@/services/api/userProfileApi";
import type { GoldType, AlertCondition } from "@/types";

export function AlertForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addAlert, isCreating } = useAlerts();
  const [goldType, setGoldType] = useState<GoldType | "XAU">("XAU");
  const [condition, setCondition] = useState<AlertCondition>("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");

  // Fetch user profile to check Telegram connection
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
  });

  const isWorldGold = goldType === "XAU";

  const goldTypes: { value: GoldType | "XAU"; label: string }[] = [
    { value: "XAU", label: t("price.worldGold") + " (XAU/USD)" },
    { value: "SJC", label: t("price.sjc") },
    { value: "NHAN_9999", label: t("price.nhan9999") },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    const price = parseFloat(targetPrice.replace(/,/g, ""));

    try {
      await addAlert(goldType, condition, price);
      setTargetPrice("");
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Không thể tạo alert. Vui lòng thử lại.");
    }
  };

  const formatInputPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    return numericValue;
  };

  if (!user) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
            <Bell size={28} className="text-gold-600 dark:text-gold-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
            Bạn cần đăng nhập
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Vui lòng đăng nhập để sử dụng tính năng Alerts
          </p>
          <Link
            to="/login"
            className="inline-block px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        action={<Bell size={18} className="text-gold-500 dark:text-gold-400" />}
      />

      {/* Telegram Setup Info - Show based on connection status */}
      <div className="mb-4 space-y-3">
        {profile?.telegramChatId ? (
          /* Already Connected */
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <CheckCircle
                size={18}
                className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                  ✅ Telegram đã được kết nối
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Bạn sẽ nhận thông báo alert qua Telegram • Chat ID:{" "}
                  {profile.telegramChatId}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Not Connected - Show Warning */
          <>
            {/* Important Warning */}
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
              <div className="flex items-start gap-3">
                <Info
                  size={20}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-2">
                    ⚠️ QUAN TRỌNG - Để nhận thông báo Alert qua Telegram
                  </p>
                  <div className="text-xs text-red-700 dark:text-red-300 space-y-2">
                    <p className="font-medium">Bạn PHẢI làm 2 việc sau:</p>
                    <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="font-bold mb-2">
                        🤖 Bước 1: Kết nối bot (BẮT BUỘC)
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 ml-2">
                        <li>
                          Tìm bot:{" "}
                          <a
                            href="https://t.me/fintrack_gold_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-red-800 dark:text-red-200 hover:underline"
                          >
                            @fintrack_gold_bot
                          </a>
                        </li>
                        <li>
                          Nhấn{" "}
                          <code className="bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded font-mono font-bold">
                            START
                          </code>{" "}
                          hoặc gửi{" "}
                          <code className="bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded font-mono font-bold">
                            /start
                          </code>
                        </li>
                        <li>Chờ bot trả lời</li>
                      </ol>

                      <p className="font-bold mt-3 mb-2">
                        📝 Bước 2: Cấu hình Chat ID
                      </p>
                      <p className="ml-2">
                        Vào{" "}
                        <Link
                          to="/settings"
                          className="font-bold text-red-800 dark:text-red-200 hover:underline"
                        >
                          Settings
                        </Link>{" "}
                        để nhập Telegram Chat ID của bạn
                      </p>
                    </div>
                    <p className="text-xs italic">
                      💡 <strong>Tại sao?</strong> Telegram không cho bot gửi
                      tin đầu tiên. Bạn phải /start trước để bot biết bạn đồng ý
                      nhận thông báo.
                    </p>
                    <p className="text-xs font-medium">
                      ❌ Bỏ qua bước 1 → Bot không thể gửi alert cho bạn (lỗi
                      "Forbidden")
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link to Settings */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info
                  size={16}
                  className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 text-sm">
                  <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                    📱 Hoàn tất cấu hình Telegram:
                  </p>
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs hover:underline font-medium"
                  >
                    → Đi tới Settings để nhập Chat ID
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Gold type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("alerts.selectGoldType")}
          </label>
          <select
            value={goldType}
            onChange={(e) => setGoldType(e.target.value as GoldType | "XAU")}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-gold-500 dark:focus:border-gold-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {goldTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("alerts.selectCondition")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCondition("ABOVE")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                condition === "ABOVE"
                  ? "border-up dark:border-green-400 bg-up/10 dark:bg-green-900/30 text-up dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <TrendingUp size={18} />
              <span className="font-medium">{t("alerts.above")}</span>
            </button>
            <button
              type="button"
              onClick={() => setCondition("BELOW")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                condition === "BELOW"
                  ? "border-down dark:border-red-400 bg-down/10 dark:bg-red-900/30 text-down dark:text-red-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <TrendingDown size={18} />
              <span className="font-medium">{t("alerts.below")}</span>
            </button>
          </div>
        </div>

        {/* Target price input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("alerts.targetPrice")} ({isWorldGold ? "USD" : "VNĐ"})
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetPrice}
              onChange={(e) => setTargetPrice(formatInputPrice(e.target.value))}
              placeholder={isWorldGold ? "2700" : "85000000"}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-gold-500 dark:focus:border-gold-400 text-lg font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {isWorldGold ? "USD/oz" : "VNĐ/lượng"}
            </span>
          </div>
          {targetPrice && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isWorldGold
                ? formatUSD(parseFloat(targetPrice) || 0)
                : formatVND(parseFloat(targetPrice) || 0) + " đ"}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!targetPrice}
          isLoading={isCreating}
        >
          <Bell size={18} />
          {t("alerts.createAlert")}
        </Button>
      </form>
    </Card>
  );
}

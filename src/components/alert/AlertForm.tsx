import { useState } from "react";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { useAlerts } from "@/hooks";
import { formatVND, formatUSD } from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { GoldType, AlertCondition } from "@/types";

export function AlertForm() {
  const { t } = useTranslation();
  const { addAlert } = useAlerts();
  const [goldType, setGoldType] = useState<GoldType | "XAU">("XAU");
  const [condition, setCondition] = useState<AlertCondition>("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isWorldGold = goldType === "XAU";

  const goldTypes: { value: GoldType | "XAU"; label: string }[] = [
    { value: "XAU", label: t("price.worldGold") + " (XAU/USD)" },
    { value: "SJC", label: t("price.sjc") },
    { value: "NHAN_9999", label: t("price.nhan9999") },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    setIsSubmitting(true);

    const price = parseFloat(targetPrice.replace(/,/g, ""));
    addAlert(goldType, condition, price);

    setTargetPrice("");
    setIsSubmitting(false);
  };

  const formatInputPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    return numericValue;
  };

  return (
    <Card>
      <CardHeader
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        action={<Bell size={18} className="text-gold-500 dark:text-gold-400" />}
      />

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
          isLoading={isSubmitting}
        >
          <Bell size={18} />
          {t("alerts.createAlert")}
        </Button>
      </form>
    </Card>
  );
}

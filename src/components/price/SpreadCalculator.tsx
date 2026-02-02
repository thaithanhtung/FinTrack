import {
  Card,
  CardHeader,
  SpreadCalculatorSkeleton,
} from "@/components/common";
import { useSJCPrice } from "@/hooks";
import { calculateSpread, formatVND } from "@/services/utils";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SpreadCalculator() {
  const { t } = useTranslation();
  const { data: sjcPrice, isLoading } = useSJCPrice();

  if (isLoading) {
    return <SpreadCalculatorSkeleton />;
  }

  if (!sjcPrice) return null;

  const spread = calculateSpread(sjcPrice.buyPrice, sjcPrice.sellPrice);

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800">
      <CardHeader
        title={t("price.buySellSpread")}
        subtitle={t("price.sjc")}
        action={
          <AlertTriangle
            size={18}
            className="text-rose-500 dark:text-rose-400"
          />
        }
      />

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t("price.buyPrice")}
            </p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {formatVND(spread.buyPrice / 1000000)} tr
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t("price.sellPrice")}
            </p>
            <p className="text-lg font-bold text-gold-600 dark:text-gold-400">
              {formatVND(spread.sellPrice / 1000000)} tr
            </p>
          </div>
        </div>

        <div className="bg-rose-100 dark:bg-rose-900/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("price.spreadLabel")}
            </span>
            <span className="font-semibold text-rose-700 dark:text-rose-300">
              {formatVND(spread.spread)} đ ({spread.spreadPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("price.lossIfSellNow")}
            </span>
            <span className="font-bold text-rose-700 dark:text-rose-300">
              -{formatVND(spread.lossIfSellNow)} đ/lượng
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t("price.spreadNote")}
        </p>
      </div>
    </Card>
  );
}

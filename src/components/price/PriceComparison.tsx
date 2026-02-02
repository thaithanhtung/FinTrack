import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardHeader,
  ErrorMessage,
  PriceComparisonSkeleton,
} from "@/components/common";
import { useWorldGoldPrice, useExchangeRate, useSJCPrice } from "@/hooks";
import { comparePrices, formatVND, formatUSD } from "@/services/utils";
import { useTranslation } from "react-i18next";

export function PriceComparison() {
  const { t } = useTranslation();
  const { data: worldPrice, isLoading: worldLoading } = useWorldGoldPrice();
  const { data: exchangeRate, isLoading: rateLoading } = useExchangeRate();
  const { data: sjcPrice, isLoading: sjcLoading } = useSJCPrice();

  const isLoading = worldLoading || rateLoading || sjcLoading;

  if (isLoading) {
    return <PriceComparisonSkeleton />;
  }

  if (!worldPrice || !exchangeRate || !sjcPrice) {
    return (
      <Card>
        <ErrorMessage message={t("comparison.insufficientData")} />
      </Card>
    );
  }

  const comparison = comparePrices(
    worldPrice.price,
    sjcPrice.sellPrice,
    exchangeRate.usdToVnd
  );

  const isHigher = comparison.difference > 0;
  const DiffIcon = isHigher ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader
        title={t("comparison.title")}
        subtitle={t("comparison.subtitle")}
        action={
          <ArrowRightLeft
            size={18}
            className="text-blue-500 dark:text-blue-400"
          />
        }
      />

      <div className="space-y-4">
        {/* World price converted */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t("price.worldPriceConverted")}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatVND(comparison.worldPriceVND)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("price.vndPerLuong")}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatUSD(worldPrice.price)} × {formatVND(exchangeRate.usdToVnd)}{" "}
            VNĐ/USD
          </p>
        </div>

        {/* VN price */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t("price.vnPriceSJC")}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gold-600 dark:text-gold-400">
              {formatVND(comparison.vnPrice)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("price.vndPerLuong")}
            </span>
          </div>
        </div>

        {/* Difference */}
        <div
          className={`rounded-xl p-3 ${
            isHigher
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-green-100 dark:bg-green-900/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("price.difference")}
              </p>
              <div className="flex items-center gap-2">
                <DiffIcon
                  size={20}
                  className={
                    isHigher
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-green-600 dark:text-green-400"
                  }
                />
                <span
                  className={`text-xl font-bold ${
                    isHigher
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-green-700 dark:text-green-300"
                  }`}
                >
                  {isHigher ? "+" : ""}
                  {formatVND(comparison.difference)}
                </span>
              </div>
            </div>
            <div
              className={`text-right px-3 py-1 rounded-full ${
                isHigher
                  ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                  : "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
              }`}
            >
              <span className="font-semibold">
                {isHigher ? "+" : ""}
                {comparison.differencePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {isHigher ? t("price.vnHigher") : t("price.vnLower")}
          </p>
        </div>
      </div>
    </Card>
  );
}

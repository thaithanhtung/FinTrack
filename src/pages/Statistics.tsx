import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  StatisticsCard,
  ErrorMessage,
} from "@/components/common";
import { VolatilityChart } from "@/components/volatility/VolatilityChart";
import { useStatistics, useVolatility } from "@/hooks";
import { formatUSD, formatPercent } from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { StatisticsPeriod } from "@/hooks/useStatistics";

const periods: { value: StatisticsPeriod; label: string }[] = [
  { value: "week", label: "1 Tuần" },
  { value: "month", label: "1 Tháng" },
  { value: "3months", label: "3 Tháng" },
  { value: "6months", label: "6 Tháng" },
  { value: "year", label: "1 Năm" },
];

export default function Statistics() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] =
    useState<StatisticsPeriod>("month");
  const [priceType, setPriceType] = useState<"world" | "vn">("world");

  const { statistics, direction, isLoading, dateRange } = useStatistics(
    selectedPeriod,
    priceType
  );
  const {
    volatilityData,
    averageVolatility,
    volatilityClassification,
    isLoading: isLoadingVolatility,
  } = useVolatility(selectedPeriod);

  if (isLoading || isLoadingVolatility) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              {t("common.loading")}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="space-y-4">
        <Card>
          <ErrorMessage message={t("statistics.noDataAvailable")} />
        </Card>
      </div>
    );
  }

  const upPercent = direction
    ? (direction.upDays /
        (direction.upDays + direction.downDays + direction.neutralDays)) *
      100
    : 0;
  const downPercent = direction
    ? (direction.downDays /
        (direction.upDays + direction.downDays + direction.neutralDays)) *
      100
    : 0;

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <Card>
        <CardHeader
          title={t("statistics.title")}
          subtitle={t("statistics.subtitle")}
          action={
            <BarChart3 size={18} className="text-gold-500 dark:text-gold-400" />
          }
        />
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("statistics.selectPeriod")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? "bg-gold-500 dark:bg-gold-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("statistics.selectType")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPriceType("world")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  priceType === "world"
                    ? "bg-gold-500 dark:bg-gold-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t("price.worldGold")}
              </button>
              <button
                onClick={() => setPriceType("vn")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  priceType === "vn"
                    ? "bg-gold-500 dark:bg-gold-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t("price.vnGold")}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatisticsCard
          title={t("statistics.averagePrice")}
          value={
            priceType === "world"
              ? formatUSD(statistics.average)
              : `${(statistics.average / 1000000).toFixed(2)}tr`
          }
          subtitle={t("statistics.overPeriod")}
          icon={
            <DollarSign
              size={18}
              className="text-gold-500 dark:text-gold-400"
            />
          }
        />
        <StatisticsCard
          title={t("statistics.highPrice")}
          value={
            priceType === "world"
              ? formatUSD(statistics.high)
              : `${(statistics.high / 1000000).toFixed(2)}tr`
          }
          subtitle={t("statistics.highestInPeriod")}
          trend="up"
          icon={
            <TrendingUp size={18} className="text-up dark:text-green-400" />
          }
        />
        <StatisticsCard
          title={t("statistics.lowPrice")}
          value={
            priceType === "world"
              ? formatUSD(statistics.low)
              : `${(statistics.low / 1000000).toFixed(2)}tr`
          }
          subtitle={t("statistics.lowestInPeriod")}
          trend="down"
          icon={
            <TrendingDown size={18} className="text-down dark:text-red-400" />
          }
        />
        <StatisticsCard
          title={t("statistics.volatility")}
          value={statistics.volatility.toFixed(2)}
          subtitle={
            volatilityClassification
              ? `${
                  volatilityClassification.level
                } (${volatilityClassification.percentage.toFixed(2)}%)`
              : ""
          }
          icon={
            <Activity
              size={18}
              className="text-purple-500 dark:text-purple-400"
            />
          }
          tooltip={t("statistics.volatilityTooltip")}
        />
      </div>

      {/* Price Direction */}
      {direction && (
        <Card>
          <CardHeader title={t("statistics.priceDirection")} />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-up dark:text-green-400 mb-1">
                {direction.upDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("statistics.upDays")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatPercent(upPercent)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-down dark:text-red-400 mb-1">
                {direction.downDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("statistics.downDays")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatPercent(downPercent)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-1">
                {direction.neutralDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("statistics.neutralDays")}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Volatility Chart */}
      <VolatilityChart data={volatilityData} period={selectedPeriod} />

      {/* Summary */}
      <Card>
        <CardHeader title={t("statistics.summary")} />
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>{t("statistics.totalRecords")}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {statistics.totalRecords}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("statistics.dateRange")}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {dateRange.start.toLocaleDateString("vi-VN")} -{" "}
              {dateRange.end.toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("statistics.averageVolatility")}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {averageVolatility.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

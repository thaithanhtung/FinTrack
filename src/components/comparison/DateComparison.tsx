import { useState } from "react";
import {
  Calendar,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { ComparisonChart, ComparisonTable } from "./index";
import { usePriceComparison } from "@/hooks";
import {
  formatUSD,
  formatVND,
  formatPercent,
  formatDate,
} from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { GoldType } from "@/types";

interface DateComparisonProps {
  type?: "world" | "vn";
  goldType?: GoldType;
  brand?: string;
}

export function DateComparison({
  type = "world",
  goldType,
  brand,
}: DateComparisonProps) {
  const { t } = useTranslation();
  const [date1, setDate1] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [date2, setDate2] = useState(new Date());

  const { price1, price2, changeAbsolute, changePercent, isLoading } =
    usePriceComparison(date1, date2, type, goldType, brand);

  const isUp = changePercent !== null && changePercent > 0;
  const isDown = changePercent !== null && changePercent < 0;

  return (
    <div className="space-y-4">
      {/* Date Selectors */}
      <Card>
        <CardHeader
          title={t("comparison.title")}
          subtitle={t("comparison.subtitle")}
          action={
            <ArrowRightLeft
              size={18}
              className="text-gold-500 dark:text-gold-400"
            />
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("comparison.date1")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={date1.toISOString().split("T")[0]}
                onChange={(e) => setDate1(new Date(e.target.value))}
                max={date2.toISOString().split("T")[0]}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("comparison.date2")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={date2.toISOString().split("T")[0]}
                onChange={(e) => setDate2(new Date(e.target.value))}
                min={date1.toISOString().split("T")[0]}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      {isLoading ? (
        <Card>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              {t("common.loading")}
            </div>
          </div>
        </Card>
      ) : price1 !== null && price2 !== null ? (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader title={t("comparison.result")} />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {formatDate(date1)}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {type === "world"
                      ? formatUSD(price1)
                      : formatVND(price1) + " đ"}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {formatDate(date2)}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {type === "world"
                      ? formatUSD(price2)
                      : formatVND(price2) + " đ"}
                  </p>
                </div>
              </div>

              {changeAbsolute !== null && changePercent !== null && (
                <div
                  className={`rounded-xl p-4 ${
                    isUp
                      ? "bg-green-100 dark:bg-green-900/30"
                      : isDown
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUp ? (
                        <TrendingUp
                          size={20}
                          className="text-green-600 dark:text-green-400"
                        />
                      ) : isDown ? (
                        <TrendingDown
                          size={20}
                          className="text-red-600 dark:text-red-400"
                        />
                      ) : null}
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("comparison.change")}
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isUp
                              ? "text-green-700 dark:text-green-300"
                              : isDown
                              ? "text-red-700 dark:text-red-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {type === "world"
                            ? formatUSD(changeAbsolute)
                            : formatVND(changeAbsolute) + " đ"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        isUp
                          ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                          : isDown
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <span className="font-semibold">
                        {isUp ? "+" : ""}
                        {formatPercent(changePercent)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Comparison Chart */}
          <ComparisonChart
            date1={date1}
            date2={date2}
            type={type}
            goldType={goldType}
            brand={brand}
          />

          {/* Comparison Table */}
          <ComparisonTable
            date1={date1}
            date2={date2}
            type={type}
            goldType={goldType}
            brand={brand}
          />
        </>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("comparison.noData")}
          </div>
        </Card>
      )}
    </div>
  );
}

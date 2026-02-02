import { Card, CardHeader } from "@/components/common";
import { usePriceComparison } from "@/hooks";
import {
  formatUSD,
  formatVND,
  formatPercent,
  formatDate,
} from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { GoldType } from "@/types";

interface ComparisonTableProps {
  date1: Date;
  date2: Date;
  type: "world" | "vn";
  goldType?: GoldType;
  brand?: string;
}

export function ComparisonTable({
  date1,
  date2,
  type,
  goldType,
  brand,
}: ComparisonTableProps) {
  const { t } = useTranslation();
  const { price1, price2, changeAbsolute, changePercent, isLoading } =
    usePriceComparison(date1, date2, type, goldType, brand);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title={t("comparison.details")} />
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse text-gray-400 dark:text-gray-500">
            {t("common.loading")}
          </div>
        </div>
      </Card>
    );
  }

  if (price1 === null || price2 === null) {
    return (
      <Card>
        <CardHeader title={t("comparison.details")} />
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t("comparison.noData")}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={t("comparison.details")} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                {t("comparison.metric")}
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                {formatDate(date1)}
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                {formatDate(date2)}
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                {t("comparison.change")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                {t("comparison.price")}
              </td>
              <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                {type === "world"
                  ? formatUSD(price1)
                  : formatVND(price1) + " đ"}
              </td>
              <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                {type === "world"
                  ? formatUSD(price2)
                  : formatVND(price2) + " đ"}
              </td>
              <td
                className={`py-2 px-2 text-right font-medium ${
                  changePercent && changePercent > 0
                    ? "text-green-600 dark:text-green-400"
                    : changePercent && changePercent < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {changeAbsolute !== null && changePercent !== null && (
                  <>
                    {changePercent > 0 ? "+" : ""}
                    {type === "world"
                      ? formatUSD(changeAbsolute)
                      : formatVND(changeAbsolute) + " đ"}
                    <br />
                    <span className="text-xs">
                      ({changePercent > 0 ? "+" : ""}
                      {formatPercent(changePercent)})
                    </span>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

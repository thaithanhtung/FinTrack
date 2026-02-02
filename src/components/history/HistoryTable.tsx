import { Download } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { useTranslation } from "react-i18next";
import { formatUSD, formatVND, formatDate, formatTime } from "@/services/utils";
import { exportToCSV, exportVNGoldToCSV } from "@/services/utils";
import type { PriceHistoryPoint } from "@/types";
import type { VNGoldHistoryRow } from "@/services/api/historyApi";

interface HistoryTableProps {
  worldData?: PriceHistoryPoint[];
  vnData?: VNGoldHistoryRow[];
  type: "world" | "vn";
}

export function HistoryTable({ worldData, vnData, type }: HistoryTableProps) {
  const { t } = useTranslation();

  const handleExport = () => {
    if (type === "world" && worldData) {
      exportToCSV(
        worldData,
        `world-gold-history-${new Date().toISOString().split("T")[0]}.csv`
      );
    } else if (type === "vn" && vnData) {
      const exportData = vnData.map((item) => ({
        date: new Date(item.created_at),
        goldType: item.gold_type,
        brand: item.brand,
        buyPrice: item.buy_price,
        sellPrice: item.sell_price,
      }));
      exportVNGoldToCSV(
        exportData,
        `vn-gold-history-${new Date().toISOString().split("T")[0]}.csv`
      );
    }
  };

  if (type === "world" && (!worldData || worldData.length === 0)) {
    return (
      <Card>
        <CardHeader title={t("history.worldGoldHistory")} />
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t("history.noData")}
        </div>
      </Card>
    );
  }

  if (type === "vn" && (!vnData || vnData.length === 0)) {
    return (
      <Card>
        <CardHeader title={t("history.vnGoldHistory")} />
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t("history.noData")}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          type === "world"
            ? t("history.worldGoldHistory")
            : t("history.vnGoldHistory")
        }
        action={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={16} />
            {t("history.export")}
          </Button>
        }
      />
      <div className="overflow-x-auto">
        {type === "world" && worldData ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                  {t("history.date")}
                </th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                  {t("history.time")}
                </th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                  {t("history.price")}
                </th>
                {worldData[0]?.open && (
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.open")}
                  </th>
                )}
                {worldData[0]?.high && (
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.high")}
                  </th>
                )}
                {worldData[0]?.low && (
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.low")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {worldData
                .slice()
                .reverse()
                .map((item, index) => {
                  const date = new Date(item.timestamp);
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                        {formatDate(date)}
                      </td>
                      <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                        {formatTime(date)}
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatUSD(item.price)}
                      </td>
                      {item.open && (
                        <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400">
                          {formatUSD(item.open)}
                        </td>
                      )}
                      {item.high && (
                        <td className="py-2 px-2 text-right text-green-600 dark:text-green-400">
                          {formatUSD(item.high)}
                        </td>
                      )}
                      {item.low && (
                        <td className="py-2 px-2 text-right text-red-600 dark:text-red-400">
                          {formatUSD(item.low)}
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : (
          vnData && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.date")}
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.goldType")}
                  </th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("history.brand")}
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("price.buyPrice")}
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("price.sellPrice")}
                  </th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("price.spread")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {vnData
                  .slice()
                  .reverse()
                  .map((item) => {
                    const date = new Date(item.created_at);
                    const spread = item.sell_price - item.buy_price;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                          {formatDate(date)}
                        </td>
                        <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                          {item.gold_type}
                        </td>
                        <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                          {item.brand}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatVND(item.buy_price)} đ
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-gold-600 dark:text-gold-400">
                          {formatVND(item.sell_price)} đ
                        </td>
                        <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400">
                          {formatVND(spread)} đ
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )
        )}
      </div>
    </Card>
  );
}

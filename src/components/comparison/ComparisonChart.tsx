import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader } from "@/components/common";
import { useQuery } from "@tanstack/react-query";
import { getWorldGoldHistory, getVNGoldHistory } from "@/services/api";
import { formatUSD, formatVND, formatDate } from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { GoldType } from "@/types";

interface ComparisonChartProps {
  date1: Date;
  date2: Date;
  type: "world" | "vn";
  goldType?: GoldType;
  brand?: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.date);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {formatDate(date)}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ComparisonChart({
  date1,
  date2,
  type,
  goldType,
  brand,
}: ComparisonChartProps) {
  const { t } = useTranslation();

  const startDate = date1 < date2 ? date1 : date2;
  const endDate = date1 > date2 ? date1 : date2;

  const worldHistoryQuery = useQuery({
    queryKey: [
      "comparisonWorldHistory",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getWorldGoldHistory(startDate, endDate),
    enabled: type === "world",
  });

  const vnHistoryQuery = useQuery({
    queryKey: [
      "comparisonVnHistory",
      startDate.toISOString(),
      endDate.toISOString(),
      goldType,
      brand,
    ],
    queryFn: () => getVNGoldHistory(startDate, endDate, goldType, brand),
    enabled: type === "vn",
  });

  const historyData =
    type === "world" ? worldHistoryQuery.data : vnHistoryQuery.data;
  const isLoading =
    type === "world" ? worldHistoryQuery.isLoading : vnHistoryQuery.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader title={t("comparison.chart")} />
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400 dark:text-gray-400">
            {t("common.loading")}
          </div>
        </div>
      </Card>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <Card>
        <CardHeader title={t("comparison.chart")} />
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t("comparison.noData")}
        </div>
      </Card>
    );
  }

  const chartData = historyData.map((item: any) => {
    const date = new Date(item.timestamp || item.created_at);
    const price = type === "world" ? item.price : item.sell_price;

    return {
      date: formatDate(date),
      price: type === "world" ? formatUSD(price) : formatVND(price),
      priceValue: price,
    };
  });

  return (
    <Card>
      <CardHeader title={t("comparison.chart")} />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              className="dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              className="dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="priceValue"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={t("comparison.price")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

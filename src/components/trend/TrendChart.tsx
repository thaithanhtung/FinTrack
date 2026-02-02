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
import { useTranslation } from "react-i18next";
import { formatUSD, formatDate } from "@/services/utils";
import type { PriceHistoryPoint } from "@/types";

interface TrendChartProps {
  historyData: PriceHistoryPoint[];
  sma20: number[];
  sma50: number[];
  sma200?: number[];
  supportLevel?: number;
  resistanceLevel?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  const { t } = useTranslation();

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.timestamp);

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

export function TrendChart({
  historyData,
  sma20,
  sma50,
  sma200,
  supportLevel,
  resistanceLevel,
}: TrendChartProps) {
  const { t } = useTranslation();

  if (historyData.length === 0) {
    return (
      <Card>
        <CardHeader title={t("trend.chart")} />
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t("trend.noData")}
        </div>
      </Card>
    );
  }

  const chartData = historyData.map((point, index) => ({
    timestamp: point.timestamp.getTime(),
    date: formatDate(point.timestamp),
    price: Math.round(point.price * 100) / 100,
    sma20: index >= 19 ? sma20[index - 19] : null,
    sma50: index >= 49 ? sma50[index - 49] : null,
    sma200: sma200 && index >= 199 ? sma200[index - 199] : null,
  }));

  return (
    <Card>
      <CardHeader title={t("trend.chart")} />
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
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              className="dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={t("trend.price")}
            />
            {sma20.length > 0 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="SMA 20"
              />
            )}
            {sma50.length > 0 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="SMA 50"
              />
            )}
            {sma200 && sma200.length > 0 && (
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#ec4899"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="SMA 200"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {supportLevel && resistanceLevel && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>
              {t("trend.support")}: ${supportLevel.toFixed(2)}
            </span>
            <span>
              {t("trend.resistance")}: ${resistanceLevel.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

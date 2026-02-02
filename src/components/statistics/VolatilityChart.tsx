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
import type { VolatilityData } from "@/services/utils/volatility";
import { formatDate } from "@/services/utils";

interface VolatilityChartProps {
  data: VolatilityData[];
  period: string;
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
  // data.date is already a Date object, no need to convert
  const date = data.date instanceof Date ? data.date : new Date(data.date);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {formatDate(date)}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100">
        {t("statistics.volatility")}: {data.volatility.toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("statistics.price")}: ${data.price.toFixed(2)}
      </p>
    </div>
  );
}

export function VolatilityChart({ data, period }: VolatilityChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title={t("statistics.volatilityChart")} />
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t("statistics.noData")}
        </div>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date, // Keep as Date object for tooltip ✅
    dateFormatted: formatDate(item.date), // Format for X-axis display
    volatility: Math.round(item.volatility * 100) / 100,
    price: Math.round(item.price * 100) / 100,
  }));

  return (
    <Card>
      <CardHeader
        title={t("statistics.volatilityChart")}
        subtitle={t("statistics.period", { period })}
      />
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
              dataKey="dateFormatted"
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
              dataKey="volatility"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

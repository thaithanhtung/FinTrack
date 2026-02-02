import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  Loading,
  ErrorMessage,
  ChartSkeleton,
} from "@/components/common";
import { formatUSD, formatDate, formatTime } from "@/services/utils";
import { supabase, isSupabaseConfigured } from "@/lib";
import type { TimeRange, PriceHistoryPoint } from "@/types";

const timeRanges: { value: TimeRange; label: string; days: number }[] = [
  { value: "1D", label: "1 Ngày", days: 1 },
  { value: "7D", label: "7 Ngày", days: 7 },
  { value: "1M", label: "1 Tháng", days: 30 },
  { value: "3M", label: "3 Tháng", days: 90 },
  { value: "1Y", label: "1 Năm", days: 365 },
];

// Types for Supabase responses
interface WorldGoldHistoryRow {
  id: string;
  price: number;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  close_price: number | null;
  created_at: string;
}

interface DataAvailabilityRow {
  created_at: string;
}

interface DataAvailability {
  oldestDate: Date | null;
  newestDate: Date | null;
  totalRecords: number;
  availableDays: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { timestamp: Date } }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const date = new Date(data.payload.timestamp);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {formatDate(date)} {formatTime(date)}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100">
        {formatUSD(data.value)}
      </p>
    </div>
  );
}

// Hook để kiểm tra data availability
function useDataAvailability() {
  return useQuery({
    queryKey: ["chartDataAvailability"],
    queryFn: async (): Promise<DataAvailability> => {
      if (!isSupabaseConfigured()) {
        return {
          oldestDate: null,
          newestDate: null,
          totalRecords: 0,
          availableDays: 0,
        };
      }

      const { data, error } = await supabase
        .from("world_gold_history")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        return {
          oldestDate: null,
          newestDate: null,
          totalRecords: 0,
          availableDays: 0,
        };
      }

      const rows = data as DataAvailabilityRow[];
      const oldestDate = new Date(rows[0].created_at);
      const newestDate = new Date(rows[rows.length - 1].created_at);
      const availableDays = Math.ceil(
        (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        oldestDate,
        newestDate,
        totalRecords: rows.length,
        availableDays: Math.max(availableDays, rows.length >= 2 ? 1 : 0),
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook để lấy chart data
function useChartData(range: TimeRange) {
  return useQuery({
    queryKey: ["worldGoldHistory", range],
    queryFn: async (): Promise<PriceHistoryPoint[]> => {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase chưa được cấu hình");
      }

      const now = new Date();
      let startDate: Date;

      switch (range) {
        case "1D":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7D":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1M":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "3M":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1Y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const { data, error } = await supabase
        .from("world_gold_history")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Lỗi khi lấy dữ liệu: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      const rows = data as WorldGoldHistoryRow[];

      return rows.map((item) => ({
        timestamp: new Date(item.created_at),
        price: Number(item.price),
        open: item.open_price ? Number(item.open_price) : undefined,
        high: item.high_price ? Number(item.high_price) : undefined,
        low: item.low_price ? Number(item.low_price) : undefined,
        close: item.close_price ? Number(item.close_price) : undefined,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function PriceChart() {
  const { data: availability, isLoading: isLoadingAvailability } =
    useDataAvailability();

  // Tìm range phù hợp nhất dựa trên data có sẵn
  const getDefaultRange = (): TimeRange => {
    if (!availability || availability.availableDays === 0) return "1D";
    if (availability.availableDays >= 365) return "1Y";
    if (availability.availableDays >= 90) return "3M";
    if (availability.availableDays >= 30) return "1M";
    if (availability.availableDays >= 7) return "7D";
    return "1D";
  };

  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");

  // Update selected range khi availability thay đổi
  useEffect(() => {
    if (availability && availability.totalRecords >= 2) {
      setSelectedRange(getDefaultRange());
    }
  }, [availability?.availableDays]);

  const { data, isLoading, isError, refetch } = useChartData(selectedRange);

  // Kiểm tra range có available không
  const isRangeAvailable = (days: number): boolean => {
    if (!availability || availability.totalRecords < 2) return false;
    return availability.availableDays >= days || days === 1;
  };

  // Lấy danh sách ranges có thể chọn (không dùng nhưng giữ lại cho tương lai)
  // const availableRanges = timeRanges.filter(r => isRangeAvailable(r.days))

  const chartData =
    data?.map((point) => ({
      ...point,
      timestamp: point.timestamp.getTime(),
      displayTime:
        selectedRange === "1D"
          ? formatTime(point.timestamp)
          : formatDate(point.timestamp),
    })) || [];

  // Calculate if overall trend is up or down
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const isUp = lastPrice >= firstPrice;
  const lineColor = isUp ? "#22c55e" : "#ef4444";

  // Calculate min/max for better Y axis
  const prices = chartData.map((d) => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.998 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.002 : 0;

  // Loading state
  if (isLoadingAvailability) {
    return <ChartSkeleton />;
  }

  // No data at all
  if (!availability || availability.totalRecords < 2) {
    return (
      <Card>
        <CardHeader title="Biểu đồ giá vàng" subtitle="XAU/USD" />
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Chưa có đủ dữ liệu để hiển thị biểu đồ.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              Dữ liệu sẽ được tích lũy khi Edge Function chạy định kỳ.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Hiện có: {availability?.totalRecords || 0} điểm dữ liệu (cần ít
              nhất 2)
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Biểu đồ giá vàng" subtitle="XAU/USD" />

      {/* Time range selector - chỉ hiện các range có data */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {timeRanges.map(({ value, label, days }) => {
          const isAvailable = isRangeAvailable(days);
          return (
            <button
              key={value}
              onClick={() => isAvailable && setSelectedRange(value)}
              disabled={!isAvailable}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !isAvailable
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : selectedRange === value
                  ? "bg-gold-500 dark:bg-gold-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              title={
                !isAvailable ? `Chưa có đủ dữ liệu cho ${label}` : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Data info */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        Dữ liệu từ {formatDate(availability.oldestDate!)} đến{" "}
        {formatDate(availability.newestDate!)}({availability.totalRecords} điểm)
      </p>

      {/* Chart */}
      {isLoading ? (
        <Loading size="md" text="Đang tải biểu đồ..." />
      ) : isError ? (
        <ErrorMessage
          message="Không thể tải dữ liệu biểu đồ"
          onRetry={refetch}
        />
      ) : chartData.length < 2 ? (
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Không có dữ liệu cho khoảng thời gian này.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayTime"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={firstPrice}
                stroke="#9ca3af"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: lineColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary */}
      {chartData.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mở cửa</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {formatUSD(firstPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hiện tại</p>
            <p
              className={`font-semibold ${
                isUp
                  ? "text-up dark:text-green-400"
                  : "text-down dark:text-red-400"
              }`}
            >
              {formatUSD(lastPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Thay đổi</p>
            <p
              className={`font-semibold ${
                isUp
                  ? "text-up dark:text-green-400"
                  : "text-down dark:text-red-400"
              }`}
            >
              {isUp ? "+" : ""}
              {(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

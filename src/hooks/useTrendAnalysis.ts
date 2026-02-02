import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getWorldGoldHistory } from "@/services/api";
import {
  analyzeTrend,
  predictShortTermTrend,
  calculateSMA,
} from "@/services/utils";
import type { TrendAnalysis } from "@/services/utils/trendAnalysis";
import type { PriceHistoryPoint } from "@/types";

export function useTrendAnalysis(
  period: "day" | "week" | "month" | "3months" | "year" = "day"
) {
  // Memoize date range to prevent unnecessary recalculations
  const { start, end } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "day":
        start.setDate(end.getDate() - 1); // 24 hours ago
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    // Round to start/end of day to make cache more stable
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [period]);

  const {
    data: historyData,
    isLoading,
    isError,
  } = useQuery<PriceHistoryPoint[]>({
    queryKey: ["trendAnalysis", period],
    queryFn: async () => {
      const data = await getWorldGoldHistory(start, end);
      return data.map((item) => ({
        timestamp: item.timestamp,
        price: item.price,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  const trendAnalysis: TrendAnalysis | null = historyData
    ? analyzeTrend(historyData)
    : null;

  const prediction = historyData ? predictShortTermTrend(historyData) : null;

  const sma20 = historyData ? calculateSMA(historyData, 20) : [];
  const sma50 = historyData ? calculateSMA(historyData, 50) : [];
  const sma200 =
    historyData && historyData.length >= 200
      ? calculateSMA(historyData, 200)
      : [];

  return {
    trendAnalysis,
    prediction,
    sma20,
    sma50,
    sma200,
    historyData: historyData || [],
    isLoading,
    isError,
    period,
    dateRange: { start, end },
  };
}

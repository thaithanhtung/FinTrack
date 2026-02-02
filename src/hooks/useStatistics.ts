import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getPriceStatistics, getPriceDirection } from "@/services/api";
import { calculateStatistics, countPriceDirection } from "@/services/utils";
import { useWorldGoldPrice } from "./useWorldGold";
import type { PriceHistoryPoint } from "@/types";

export type StatisticsPeriod =
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year";

export function useStatistics(
  period: StatisticsPeriod = "month",
  type: "world" | "vn" = "world"
) {
  const { data: currentPrice } = useWorldGoldPrice();

  // Memoize date range to prevent unnecessary recalculations
  const { start, end } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(end.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(end.getMonth() - 6);
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

  // Fetch statistics from database
  const { data: dbStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["statistics", period, type],
    queryFn: () => getPriceStatistics(start, end, type),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // Fetch price direction
  const { data: direction, isLoading: isLoadingDirection } = useQuery({
    queryKey: ["priceDirection", period, type],
    queryFn: () => getPriceDirection(start, end, type),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // Calculate client-side statistics from history (fallback)
  const { data: historyData, isLoading: isLoadingHistory } = useQuery<
    PriceHistoryPoint[]
  >({
    queryKey: ["worldGoldHistory", period],
    queryFn: async () => {
      // This will be implemented with actual history fetch
      return [];
    },
    enabled: false, // Disabled for now, will enable when history API is ready
  });

  const clientStats = historyData ? calculateStatistics(historyData) : null;
  const clientDirection = historyData ? countPriceDirection(historyData) : null;

  const isLoading = isLoadingStats || isLoadingDirection || isLoadingHistory;

  return {
    statistics: dbStats || clientStats,
    direction: direction || clientDirection,
    currentPrice: currentPrice?.price || null,
    period,
    isLoading,
    dateRange: { start, end },
  };
}

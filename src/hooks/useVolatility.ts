import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getWorldGoldHistory } from "@/services/api";
import {
  calculateVolatility,
  calculateAverageVolatility,
  classifyVolatility,
  calculateCoefficientOfVariation,
} from "@/services/utils";
import type { VolatilityData } from "@/services/utils/volatility";
import type { PriceHistoryPoint } from "@/types";

export function useVolatility(
  period: "week" | "month" | "3months" | "year" = "month"
) {
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
    queryKey: ["volatility", period], // Remove date strings from queryKey
    queryFn: async () => {
      const data = await getWorldGoldHistory(start, end);
      return data.map((item) => ({
        timestamp: item.timestamp,
        price: item.price,
      }));
    },
    staleTime: 10 * 60 * 1000, // Increased to 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  const volatilityData: VolatilityData[] = historyData
    ? calculateVolatility(historyData, 7)
    : [];

  const averageVolatility = historyData
    ? calculateAverageVolatility(historyData, 7)
    : 0;

  const averagePrice =
    historyData && historyData.length > 0
      ? historyData.reduce((sum, p) => sum + p.price, 0) / historyData.length
      : 0;

  const volatilityClassification =
    averagePrice > 0
      ? classifyVolatility(averageVolatility, averagePrice)
      : { level: "low" as const, percentage: 0 };

  const coefficientOfVariation = historyData
    ? calculateCoefficientOfVariation(historyData)
    : 0;

  return {
    volatilityData,
    averageVolatility,
    volatilityClassification,
    coefficientOfVariation,
    averagePrice,
    historyData: historyData || [],
    isLoading,
    isError,
    period,
    dateRange: { start, end },
  };
}

import { useQuery } from "@tanstack/react-query";
import { getWorldGoldHistory, getVNGoldHistory } from "@/services/api";
import type { GoldType } from "@/types";

export interface HistoryFilters {
  startDate: Date;
  endDate: Date;
  type: "world" | "vn";
  goldType?: GoldType;
  brand?: string;
}

export function usePriceHistory(filters: HistoryFilters) {
  const { startDate, endDate, type, goldType, brand } = filters;

  const worldHistoryQuery = useQuery({
    queryKey: [
      "worldGoldHistory",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getWorldGoldHistory(startDate, endDate),
    enabled: type === "world",
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const vnHistoryQuery = useQuery({
    queryKey: [
      "vnGoldHistory",
      startDate.toISOString(),
      endDate.toISOString(),
      goldType,
      brand,
    ],
    queryFn: () => getVNGoldHistory(startDate, endDate, goldType, brand),
    enabled: type === "vn",
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: type === "world" ? worldHistoryQuery.data : vnHistoryQuery.data,
    isLoading:
      type === "world" ? worldHistoryQuery.isLoading : vnHistoryQuery.isLoading,
    isError:
      type === "world" ? worldHistoryQuery.isError : vnHistoryQuery.isError,
    refetch:
      type === "world" ? worldHistoryQuery.refetch : vnHistoryQuery.refetch,
  };
}

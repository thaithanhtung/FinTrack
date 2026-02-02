import { useQuery } from "@tanstack/react-query";
import { fetchWorldGoldPrice, fetchWorldGoldHistory } from "@/services/api";
import type { TimeRange } from "@/types";

export function useWorldGoldPrice() {
  return useQuery({
    queryKey: ["worldGoldPrice"],
    queryFn: fetchWorldGoldPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes - Investing.com updates every 15min
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 5 * 60 * 1000, // Auto refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

export function useWorldGoldHistory(range: TimeRange) {
  return useQuery({
    queryKey: ["worldGoldHistory", range],
    queryFn: () => fetchWorldGoldHistory(range),
    staleTime: 5 * 60 * 1000, // 5 minutes for historical data
  });
}

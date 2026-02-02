import { useQuery } from "@tanstack/react-query";
import { getPriceByDate } from "@/services/api";
import {
  calculateChangePercent,
  calculateChangeAbsolute,
} from "@/services/utils";
import type { GoldType } from "@/types";

export interface ComparisonResult {
  date1: Date;
  date2: Date;
  price1: number | null;
  price2: number | null;
  changeAbsolute: number | null;
  changePercent: number | null;
}

export function usePriceComparison(
  date1: Date,
  date2: Date,
  type: "world" | "vn" = "world",
  goldType?: GoldType,
  brand?: string
) {
  const price1Query = useQuery({
    queryKey: ["priceByDate", date1.toISOString(), type, goldType, brand],
    queryFn: () => getPriceByDate(date1, type, goldType, brand),
    staleTime: 5 * 60 * 1000,
  });

  const price2Query = useQuery({
    queryKey: ["priceByDate", date2.toISOString(), type, goldType, brand],
    queryFn: () => getPriceByDate(date2, type, goldType, brand),
    staleTime: 5 * 60 * 1000,
  });

  const price1 = price1Query.data ?? null;
  const price2 = price2Query.data ?? null;

  let changeAbsolute: number | null = null;
  let changePercent: number | null = null;

  if (price1 !== null && price2 !== null) {
    changeAbsolute = calculateChangeAbsolute(price1, price2);
    changePercent = calculateChangePercent(price1, price2);
  }

  return {
    date1,
    date2,
    price1,
    price2,
    changeAbsolute,
    changePercent,
    isLoading: price1Query.isLoading || price2Query.isLoading,
    isError: price1Query.isError || price2Query.isError,
  };
}

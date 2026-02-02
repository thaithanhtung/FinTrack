import { supabase, isSupabaseConfigured } from "@/lib";
import type { TimeRange } from "@/types";

export interface StatisticsData {
  average: number;
  high: number;
  low: number;
  volatility: number;
  totalRecords: number;
}

/**
 * Lấy thống kê giá từ database
 */
export async function getPriceStatistics(
  startDate: Date,
  endDate: Date,
  type: "world" | "vn" = "world"
): Promise<StatisticsData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc("get_price_statistics", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_type: type,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    return {
      average: Number(data[0].avg_price) || 0,
      high: Number(data[0].high_price) || 0,
      low: Number(data[0].low_price) || 0,
      volatility: Number(data[0].volatility) || 0,
      totalRecords: Number(data[0].total_records) || 0,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null;
  }
}

/**
 * Lấy số ngày tăng/giảm
 */
export async function getPriceDirection(
  startDate: Date,
  endDate: Date,
  type: "world" | "vn" = "world"
): Promise<{ upDays: number; downDays: number; neutralDays: number } | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc("count_price_direction", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_type: type,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    return {
      upDays: Number(data[0].up_days) || 0,
      downDays: Number(data[0].down_days) || 0,
      neutralDays: Number(data[0].neutral_days) || 0,
    };
  } catch (error) {
    console.error("Error fetching price direction:", error);
    return null;
  }
}

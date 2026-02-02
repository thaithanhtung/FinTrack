import { supabase, isSupabaseConfigured } from "@/lib";

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
    } as any);

    if (error) throw error;

    // Type guard for data
    if (!data) return null;

    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) return null;

    const row = dataArray[0] as any;
    return {
      average: Number(row.avg_price) || 0,
      high: Number(row.high_price) || 0,
      low: Number(row.low_price) || 0,
      volatility: Number(row.volatility) || 0,
      totalRecords: Number(row.total_records) || 0,
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
    } as any);

    if (error) throw error;

    // Type guard for data
    if (!data) return null;

    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) return null;

    const row = dataArray[0] as any;
    return {
      upDays: Number(row.up_days) || 0,
      downDays: Number(row.down_days) || 0,
      neutralDays: Number(row.neutral_days) || 0,
    };
  } catch (error) {
    console.error("Error fetching price direction:", error);
    return null;
  }
}

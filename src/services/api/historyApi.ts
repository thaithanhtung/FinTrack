import { supabase, isSupabaseConfigured } from "@/lib";
import type { GoldType } from "@/types";

export interface VNGoldHistoryRow {
  id: string;
  gold_type: string;
  brand: string;
  buy_price: number;
  sell_price: number;
  region: string | null;
  created_at: string;
}

type InvestingDataPoint = [
  number, // timestamp
  number, // open
  number, // high
  number, // low
  number, // close
  number, // volume1
  number // volume2
];

// Map period to Investing.com interval config
function getIntervalConfig(startDate: Date, endDate: Date) {
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = durationMs / (1000 * 60 * 60 * 24);

  // Choose appropriate interval based on duration
  // Aim for 100-200 data points for optimal performance

  if (durationDays <= 1.66) {
    // 1-1.66 days: 15-minute intervals (max 160 points)
    // 1.66 days × 96 points/day = 159.36 ≈ 160 points (cap)
    return {
      interval: "PT15M",
      pointscount: Math.min(Math.ceil(durationDays * 96), 160),
    };
  } else if (durationDays <= 7) {
    // 2-7 days: 1-hour intervals
    // 7 days × 24 points/day = 168 points
    return {
      interval: "PT1H",
      pointscount: Math.ceil(durationDays * 24),
    };
  } else if (durationDays <= 30) {
    // 8-30 days: 4-hour intervals
    // 30 days × 6 points/day = 180 points
    return {
      interval: "PT4H",
      pointscount: Math.ceil(durationDays * 6),
    };
  } else if (durationDays <= 180) {
    // 31-180 days (6 months): daily intervals
    // 180 days = 180 points
    return {
      interval: "P1D",
      pointscount: Math.ceil(durationDays),
    };
  } else {
    // 180+ days: daily intervals, capped at 365
    // Max 1 year of data
    return {
      interval: "P1D",
      pointscount: Math.min(Math.ceil(durationDays), 365),
    };
  }
}

/**
 * Lấy lịch sử giá vàng thế giới từ Investing.com API
 * Thay thế query database bằng direct API call
 */
export async function getWorldGoldHistory(
  startDate: Date,
  endDate: Date
): Promise<Array<{ timestamp: Date; price: number }>> {
  try {
    const config = getIntervalConfig(startDate, endDate);

    const response = await fetch(
      `https://api.investing.com/api/financialdata/68/historical/chart/?interval=${config.interval}&pointscount=160`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Investing.com API error: ${response.status}`);
      return [];
    }

    const responseData = await response.json();

    // Handle both direct array and wrapped object format
    let data: InvestingDataPoint[];

    if (Array.isArray(responseData)) {
      data = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else {
      console.error("Invalid response format from Investing.com");
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Check if data needs to be reversed (newest first -> oldest first)
    const firstTimestamp = data[0][0];
    const lastTimestamp = data[data.length - 1][0];
    const normalizedData =
      firstTimestamp > lastTimestamp ? [...data].reverse() : data;

    // Convert to simple format and filter by date range
    return normalizedData
      .filter((item) => {
        const itemDate = new Date(item[0]);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .map((item) => ({
        timestamp: new Date(item[0]),
        price: item[4], // close price
      }));
  } catch (error) {
    console.error(
      "Error fetching world gold history from Investing.com:",
      error
    );
    return [];
  }
}

/**
 * Lấy lịch sử giá vàng VN
 */
export async function getVNGoldHistory(
  startDate: Date,
  endDate: Date,
  goldType?: GoldType,
  brand?: string
): Promise<VNGoldHistoryRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from("vn_gold_history")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (goldType) {
      query = query.eq("gold_type", goldType);
    }

    if (brand) {
      query = query.eq("brand", brand);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as VNGoldHistoryRow[];
  } catch (error) {
    console.error("Error fetching VN gold history:", error);
    return [];
  }
}

/**
 * Lấy giá theo ngày cụ thể
 */
export async function getPriceByDate(
  date: Date,
  type: "world" | "vn" = "world",
  goldType?: GoldType,
  brand?: string
): Promise<number | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    if (type === "world") {
      const { data, error } = await supabase
        .from("world_gold_history")
        .select("price")
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return Number((data[0] as { price: number }).price);
    } else {
      let query = supabase
        .from("vn_gold_history")
        .select("sell_price")
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      if (goldType) {
        query = query.eq("gold_type", goldType);
      }
      if (brand) {
        query = query.eq("brand", brand);
      }

      query = query.order("created_at", { ascending: false }).limit(1);

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return Number((data[0] as { sell_price: number }).sell_price);
    }
  } catch (error) {
    console.error("Error fetching price by date:", error);
    return null;
  }
}

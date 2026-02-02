import type { WorldGoldPrice, PriceHistoryPoint, TimeRange } from "@/types";

// ============================================
// Types for Investing.com API
// ============================================
type InvestingDataPoint = [
  number, // timestamp
  number, // open
  number, // high
  number, // low
  number, // close
  number, // volume1
  number // volume2
];

// Interval mapping for Investing.com API
const INTERVAL_CONFIG = {
  "1D": { interval: "PT15M", pointscount: 96 }, // 1 day: 15min × 96 = 24h
  "7D": { interval: "PT1H", pointscount: 168 }, // 7 days: 1h × 168 = 7 days
  "1M": { interval: "PT4H", pointscount: 180 }, // 1 month: 4h × 180 = 30 days
  "3M": { interval: "P1D", pointscount: 90 }, // 3 months: 1 day × 90
  "1Y": { interval: "P1D", pointscount: 365 }, // 1 year: 1 day × 365
} as const;

// ============================================
// Supabase Save Function
// ============================================

/**
 * Save world gold data to Supabase via Edge Function
 * Called after successful fetch from Investing.com
 */
async function saveWorldGoldToSupabase(data: {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
}): Promise<void> {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

    if (!SUPABASE_URL) {
      console.warn("Supabase URL not configured, skipping save");
      return;
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/save-world-gold`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: data.price,
          previousClose: data.previousClose,
          change: data.change,
          changePercent: data.changePercent,
          high24h: data.high24h,
          low24h: data.low24h,
          timestamp: data.timestamp.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Save failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ World gold data saved to Supabase:", result);
  } catch (error) {
    // Don't throw - saving is optional, shouldn't break UI
    console.error("⚠️ Failed to save world gold to Supabase:", error);
  }
}

// ============================================
// Investing.com API Functions (Client-side)
// ============================================

/**
 * Lấy giá vàng thế giới trực tiếp từ Investing.com API
 * Gọi từ client-side để tránh CORS issues
 */
export async function fetchWorldGoldPrice(): Promise<WorldGoldPrice> {
  try {
    // Fetch 160 points at 15-minute intervals = 40 hours of data
    const response = await fetch(
      "https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT15M&pointscount=160",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Investing.com API error: ${response.status}`);
    }

    const responseData = await response.json();

    // Investing.com API có thể trả về trực tiếp array hoặc wrapped trong object
    let data: InvestingDataPoint[];

    if (Array.isArray(responseData)) {
      data = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else {
      console.error("Unexpected API response format:", responseData);
      throw new Error("Invalid response format from Investing.com");
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty data from Investing.com");
    }

    console.log("Investing.com data:", {
      totalPoints: data.length,
      firstItem: data[0],
      lastItem: data[data.length - 1],
    });

    // Check if data needs to be reversed (newest first -> oldest first)
    const firstTimestamp = data[0][0];
    const lastTimestamp = data[data.length - 1][0];
    const normalizedData =
      firstTimestamp > lastTimestamp ? [...data].reverse() : data;

    console.log("Data order:", {
      firstTimestamp: new Date(firstTimestamp).toISOString(),
      lastTimestamp: new Date(lastTimestamp).toISOString(),
      reversed: firstTimestamp > lastTimestamp,
    });

    // Data format: [timestamp, open, high, low, close, volume1, volume2]
    const latestCandle = normalizedData[normalizedData.length - 1]; // Newest
    const firstCandle = normalizedData[0]; // Oldest (for previous close)

    const currentPrice = latestCandle[4]; // close price
    const currentTimestamp = latestCandle[0];
    const previousClose = firstCandle[4]; // close from 40 hours ago

    // Calculate high/low from EXACTLY last 24 hours based on timestamp
    const twentyFourHoursAgo = currentTimestamp - 24 * 60 * 60 * 1000; // 24h in milliseconds
    const last24hData = normalizedData.filter(
      (d) => d[0] >= twentyFourHoursAgo
    );

    // Extract highs and lows from the filtered data
    const highsLast24h = last24hData.map((d) => d[2]).filter((h) => h > 0);
    const lowsLast24h = last24hData.map((d) => d[3]).filter((l) => l > 0);

    const high24h =
      highsLast24h.length > 0 ? Math.max(...highsLast24h) : currentPrice;
    const low24h =
      lowsLast24h.length > 0 ? Math.min(...lowsLast24h) : currentPrice;

    // Calculate change
    const change = currentPrice - previousClose;
    const changePercent =
      previousClose > 0 ? (change / previousClose) * 100 : 0;

    console.log("Processed data:", {
      currentPrice,
      previousClose,
      change,
      changePercent,
      high24h,
      low24h,
      last24hDataPoints: last24hData.length,
      timeRange: {
        from: new Date(twentyFourHoursAgo).toISOString(),
        to: new Date(currentTimestamp).toISOString(),
      },
      // Debug timestamp
      latestCandleTimestamp: latestCandle[0],
      latestCandleDate: new Date(latestCandle[0]).toISOString(),
      nowTimestamp: Date.now(),
      nowDate: new Date().toISOString(),
      timeDiffMinutes: ((Date.now() - latestCandle[0]) / (1000 * 60)).toFixed(
        2
      ),
    });

    const goldData = {
      price: currentPrice,
      previousClose,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high24h,
      low24h,
      timestamp: new Date(latestCandle[0]), // API data timestamp
      fetchedAt: new Date(), // Client fetch timestamp
      source: "Investing.com" as const,
    };

    // Save to Supabase (async, don't block UI)
    saveWorldGoldToSupabase({
      price: goldData.price,
      previousClose: goldData.previousClose,
      change: goldData.change,
      changePercent: goldData.changePercent,
      high24h: goldData.high24h,
      low24h: goldData.low24h,
      timestamp: goldData.timestamp,
    }).catch((error) => {
      // Already logged in saveWorldGoldToSupabase
      console.error("Save to Supabase failed (non-blocking):", error);
    });

    return goldData;
  } catch (error) {
    console.error("Error fetching world gold price from Investing.com:", error);
    throw error;
  }
}

/**
 * Lấy lịch sử giá vàng thế giới cho biểu đồ
 * Gọi trực tiếp từ Investing.com API với interval phù hợp
 */
export async function fetchWorldGoldHistory(
  range: TimeRange
): Promise<PriceHistoryPoint[]> {
  try {
    const config = INTERVAL_CONFIG[range];

    const response = await fetch(
      `https://api.investing.com/api/financialdata/68/historical/chart/?interval=${config.interval}&pointscount=160`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Investing.com API error: ${response.status}`);
    }

    const responseData = await response.json();

    // Handle both direct array and wrapped object format
    let data: InvestingDataPoint[];

    if (Array.isArray(responseData)) {
      data = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else {
      throw new Error("Invalid response format from Investing.com");
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty data from Investing.com");
    }

    // Check if data needs to be reversed (newest first -> oldest first)
    const firstTimestamp = data[0][0];
    const lastTimestamp = data[data.length - 1][0];
    const normalizedData =
      firstTimestamp > lastTimestamp ? [...data].reverse() : data;

    // Convert to PriceHistoryPoint format
    return normalizedData.map((item) => ({
      timestamp: new Date(item[0]),
      price: item[4], // close price
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
    }));
  } catch (error) {
    console.error(`Error fetching world gold history for ${range}:`, error);
    throw error;
  }
}

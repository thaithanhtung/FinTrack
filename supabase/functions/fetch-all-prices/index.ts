// Supabase Edge Function: Fetch All Gold Prices (World + VN + Exchange Rate)
// This function is called by cron job every 5 minutes
// Deploy: supabase functions deploy fetch-all-prices

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============================================
// Fetch World Gold Price from Investing.com
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

interface WorldGoldData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
}

async function fetchWorldGoldFromInvesting(
  supabase: ReturnType<typeof createClient>
): Promise<WorldGoldData> {
  // Fetch 60 points (15 hours of data at 15-minute intervals)
  const response = await fetch(
    "https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT1M&pointscount=60",
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; FinTrack/1.0)",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Investing.com API error: ${response.status}`);
  }

  const data: InvestingDataPoint[] = await response.json();

  console.log("Investing.com data (fetch-all-prices):", data);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid or empty data from Investing.com");
  }

  // Data format: [timestamp, open, high, low, close, volume1, volume2]
  // Data is ordered oldest to newest
  const latestCandle = data[data.length - 1]; // Newest data point
  const firstCandle = data[0]; // Oldest data point (for previous close)

  const currentPrice = latestCandle[4]; // close price
  const openPrice = latestCandle[1];
  const highPrice = latestCandle[2];
  const lowPrice = latestCandle[3];

  // Use first candle's close as previous close (15 hours ago)
  const previousClose = firstCandle[4];

  // Calculate high/low from all data points
  const allHighs = data.map((d) => d[2]);
  const allLows = data.map((d) => d[3]);
  const high24h = Math.max(...allHighs);
  const low24h = Math.min(...allLows);

  // Calculate change
  const change = currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  console.log("Investing.com data (fetch-all-prices):", {
    totalPoints: data.length,
    currentPrice,
    previousClose,
    change,
    changePercent,
    high24h,
    low24h,
    timestamp: new Date(latestCandle[0]).toISOString(),
  });

  return {
    price: currentPrice,
    previousClose,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    high24h,
    low24h,
  };
}

// ============================================
// VNAppMob Types and Functions
// ============================================
interface VNAppMobGoldItem {
  // SJC prices
  buy_1c?: string;
  sell_1c?: string;
  buy_1l?: string;
  sell_1l?: string;
  buy_5c?: string;
  sell_5c?: string;
  // Nhẫn prices
  buy_nhan1c?: string;
  sell_nhan1c?: string;
  // Nữ trang prices
  buy_nutrang_75?: string;
  sell_nutrang_75?: string;
  buy_nutrang_99?: string;
  sell_nutrang_99?: string;
  buy_nutrang_9999?: string;
  sell_nutrang_9999?: string;
  // Timestamp
  datetime?: string;
}

interface VNAppMobResponse {
  results?: VNAppMobGoldItem[];
}

function parsePrice(priceStr: string | number | undefined | null): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr || typeof priceStr !== "string") return 0;
  // Remove commas, dots (except decimal), and parse
  const cleaned = priceStr.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

async function fetchVNGold(brand: "sjc" | "doji" | "pnj", apiKey: string) {
  try {
    const response = await fetch(
      `https://vapi.vnappmob.com/api/v2/gold/${brand}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching ${brand}: ${response.status}`);
      return [];
    }

    const data: VNAppMobResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching ${brand}:`, error);
    return [];
  }
}

// Process VNAppMob data với cấu trúc mới
function processVNGoldItem(
  item: VNAppMobGoldItem,
  brand: string
): Array<{
  gold_type: string;
  brand: string;
  buy_price: number;
  sell_price: number;
  region: string | null;
  source: string;
}> {
  const records: Array<{
    gold_type: string;
    brand: string;
    buy_price: number;
    sell_price: number;
    region: string | null;
    source: string;
  }> = [];

  // SJC 1 lượng
  if (item.buy_1l && item.sell_1l) {
    const buyPrice = parsePrice(item.buy_1l);
    const sellPrice = parsePrice(item.sell_1l);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "SJC",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: "1L",
        source: "VNAppMob",
      });
    }
  }

  // SJC 1 chỉ
  if (item.buy_1c && item.sell_1c) {
    const buyPrice = parsePrice(item.buy_1c);
    const sellPrice = parsePrice(item.sell_1c);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "SJC",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: "1C",
        source: "VNAppMob",
      });
    }
  }

  // SJC 5 chỉ
  if (item.buy_5c && item.sell_5c) {
    const buyPrice = parsePrice(item.buy_5c);
    const sellPrice = parsePrice(item.sell_5c);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "SJC",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: "5C",
        source: "VNAppMob",
      });
    }
  }

  // Nhẫn 1 chỉ
  if (item.buy_nhan1c && item.sell_nhan1c) {
    const buyPrice = parsePrice(item.buy_nhan1c);
    const sellPrice = parsePrice(item.sell_nhan1c);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "NHAN_9999",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: null,
        source: "VNAppMob",
      });
    }
  }

  // Nữ trang 99.99
  if (item.buy_nutrang_9999 && item.sell_nutrang_9999) {
    const buyPrice = parsePrice(item.buy_nutrang_9999);
    const sellPrice = parsePrice(item.sell_nutrang_9999);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "NUTRANG_9999",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: null,
        source: "VNAppMob",
      });
    }
  }

  // Nữ trang 99
  if (item.buy_nutrang_99 && item.sell_nutrang_99) {
    const buyPrice = parsePrice(item.buy_nutrang_99);
    const sellPrice = parsePrice(item.sell_nutrang_99);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "NUTRANG_99",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: null,
        source: "VNAppMob",
      });
    }
  }

  // Nữ trang 75 (18K)
  if (item.buy_nutrang_75 && item.sell_nutrang_75) {
    const buyPrice = parsePrice(item.buy_nutrang_75);
    const sellPrice = parsePrice(item.sell_nutrang_75);
    if (buyPrice > 0 && sellPrice > 0) {
      records.push({
        gold_type: "NUTRANG_75",
        brand,
        buy_price: buyPrice,
        sell_price: sellPrice,
        region: null,
        source: "VNAppMob",
      });
    }
  }

  return records;
}

// ============================================
// Exchange Rate (using free API)
// ============================================
async function fetchExchangeRate(): Promise<number> {
  try {
    // Using exchangerate-api.com free tier
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    if (!response.ok) {
      throw new Error("Exchange rate API error");
    }
    const data = await response.json();
    return data.rates.VND || 24500; // Fallback to approximate rate
  } catch (error) {
    console.error("Exchange rate error:", error);
    return 24500; // Fallback
  }
}

// ============================================
// Main Handler
// ============================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const results = {
    worldGold: {
      success: false,
      error: null as string | null,
      price: null as number | null,
    },
    vnGold: {
      success: false,
      recordsInserted: 0,
      error: null as string | null,
      debug: null as unknown,
    },
    exchangeRate: { success: false, error: null as string | null },
  };

  try {
    const VN_GOLD_API_KEY = Deno.env.get("VN_GOLD_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not set");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============================================
    // 1. Fetch World Gold Price (from Investing.com)
    // ============================================
    try {
      const worldData = await fetchWorldGoldFromInvesting(supabase);

      const { error } = await supabase.from("world_gold_prices").insert({
        price: worldData.price,
        previous_close: worldData.previousClose,
        change: worldData.change,
        change_percent: worldData.changePercent,
        high_24h: worldData.high24h,
        low_24h: worldData.low24h,
        source: "Investing.com",
      });

      if (error) throw error;

      // Insert to history
      await supabase.from("world_gold_history").insert({
        price: worldData.price,
        open_price: worldData.previousClose,
        high_price: worldData.high24h,
        low_price: worldData.low24h,
        close_price: worldData.price,
      });

      results.worldGold.success = true;
      results.worldGold.price = worldData.price;
    } catch (error) {
      results.worldGold.error = error.message;
      console.error("World gold error:", error);
    }

    // ============================================
    // 2. Fetch VN Gold Prices
    // ============================================
    if (VN_GOLD_API_KEY) {
      try {
        const [sjcItems, dojiItems, pnjItems] = await Promise.all([
          fetchVNGold("sjc", VN_GOLD_API_KEY),
          fetchVNGold("doji", VN_GOLD_API_KEY),
          fetchVNGold("pnj", VN_GOLD_API_KEY),
        ]);

        // Debug: log raw data từ API
        results.vnGold.debug = {
          sjcCount: sjcItems.length,
          dojiCount: dojiItems.length,
          pnjCount: pnjItems.length,
          sjcSample: sjcItems.slice(0, 1),
        };

        const insertRecords: Array<{
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region: string | null;
          source: string;
        }> = [];

        // Process từng brand
        for (const item of sjcItems) {
          insertRecords.push(...processVNGoldItem(item, "SJC"));
        }
        for (const item of dojiItems) {
          insertRecords.push(...processVNGoldItem(item, "DOJI"));
        }
        for (const item of pnjItems) {
          insertRecords.push(...processVNGoldItem(item, "PNJ"));
        }

        if (insertRecords.length > 0) {
          const { error } = await supabase
            .from("vn_gold_prices")
            .insert(insertRecords);
          if (error) throw error;

          // Also insert to history table
          await supabase.from("vn_gold_history").insert(insertRecords);
        }

        results.vnGold.success = true;
        results.vnGold.recordsInserted = insertRecords.length;
      } catch (error) {
        results.vnGold.error = error.message;
        console.error("VN gold error:", error);
      }
    } else {
      results.vnGold.error = "VN_GOLD_API_KEY not set";
    }

    // ============================================
    // 3. Fetch Exchange Rate
    // ============================================
    try {
      const rate = await fetchExchangeRate();

      const { error } = await supabase.from("exchange_rates").insert({
        usd_to_vnd: rate,
        source: "exchangerate-api.com",
      });

      if (error) throw error;
      results.exchangeRate.success = true;
    } catch (error) {
      results.exchangeRate.error = error.message;
      console.error("Exchange rate error:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Fatal error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

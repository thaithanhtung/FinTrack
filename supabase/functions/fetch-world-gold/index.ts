// Supabase Edge Function: Fetch World Gold Price from Investing.com
// Real-time OHLC data with 15-minute intervals
// Deploy: supabase functions deploy fetch-world-gold

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

  console.log("Investing.com data:", data);

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

  console.log("Investing.com data:", {
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
// Main Handler
// ============================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not set");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch world gold price from Investing.com
    const worldData = await fetchWorldGoldFromInvesting(supabase);

    // Insert to world_gold_prices
    const { error: priceError } = await supabase
      .from("world_gold_prices")
      .insert({
        price: worldData.price,
        previous_close: worldData.previousClose,
        change: worldData.change,
        change_percent: worldData.changePercent,
        high_24h: worldData.high24h,
        low_24h: worldData.low24h,
        source: "Investing.com",
      });

    if (priceError) {
      throw priceError;
    }

    // Insert to history
    const { error: historyError } = await supabase
      .from("world_gold_history")
      .insert({
        price: worldData.price,
        open_price: worldData.previousClose,
        high_price: worldData.high24h,
        low_price: worldData.low24h,
        close_price: worldData.price,
      });

    if (historyError) {
      console.error("History insert error:", historyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: worldData,
        source: "Investing.com",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

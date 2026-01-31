// Supabase Edge Function: Fetch World Gold Price from Gold-API.com
// FREE API - No API key required, no rate limits
// Deploy: supabase functions deploy fetch-world-gold

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Fetch World Gold Price from Gold-API.com
// ============================================
interface GoldApiComResponse {
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

interface WorldGoldData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
}

async function fetchWorldGoldFromGoldApiCom(
  supabase: ReturnType<typeof createClient>
): Promise<WorldGoldData> {
  const response = await fetch('https://api.gold-api.com/price/XAU', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gold-API.com error: ${response.status}`);
  }

  const data: GoldApiComResponse = await response.json();

  if (!data.price || data.price <= 0) {
    throw new Error('Invalid price from Gold-API.com');
  }

  const currentPrice = data.price;

  // Lấy giá trước đó từ database để tính change
  let previousClose = currentPrice;
  let high24h = currentPrice;
  let low24h = currentPrice;

  try {
    // Lấy giá cũ nhất trong 24h để làm previous close
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: oldPrices } = await supabase
      .from('world_gold_prices')
      .select('price')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: true })
      .limit(1);

    if (oldPrices && oldPrices.length > 0) {
      previousClose = Number(oldPrices[0].price);
    }

    // Lấy high/low trong 24h
    const { data: priceRange } = await supabase
      .from('world_gold_prices')
      .select('price')
      .gte('created_at', oneDayAgo);

    if (priceRange && priceRange.length > 0) {
      const prices = priceRange.map((p) => Number(p.price));
      high24h = Math.max(...prices, currentPrice);
      low24h = Math.min(...prices, currentPrice);
    }
  } catch (err) {
    console.error('Error fetching previous prices:', err);
  }

  const change = currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not set');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch world gold price from Gold-API.com
    const worldData = await fetchWorldGoldFromGoldApiCom(supabase);

    // Insert to world_gold_prices
    const { error: priceError } = await supabase
      .from('world_gold_prices')
      .insert({
        price: worldData.price,
        previous_close: worldData.previousClose,
        change: worldData.change,
        change_percent: worldData.changePercent,
        high_24h: worldData.high24h,
        low_24h: worldData.low24h,
        source: 'Gold-API.com',
      });

    if (priceError) {
      throw priceError;
    }

    // Insert to history
    const { error: historyError } = await supabase
      .from('world_gold_history')
      .insert({
        price: worldData.price,
        open_price: worldData.previousClose,
        high_price: worldData.high24h,
        low_price: worldData.low24h,
        close_price: worldData.price,
      });

    if (historyError) {
      console.error('History insert error:', historyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: worldData,
        source: 'Gold-API.com',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

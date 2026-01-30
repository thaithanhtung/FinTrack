// Supabase Edge Function: Fetch Vietnam Gold Prices from VNAppMob
// Deploy: supabase functions deploy fetch-vn-gold

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface VNAppMobGoldItem {
  type: string;
  buy: string;
  sell: string;
  buy_hcm?: string;
  sell_hcm?: string;
  buy_hn?: string;
  sell_hn?: string;
  updated: string;
}

interface VNAppMobResponse {
  results: VNAppMobGoldItem[];
}

// Map VNAppMob gold types to our types
function mapGoldType(type: string): string {
  const typeMap: Record<string, string> = {
    'SJC 1L, 10L, 1KG': 'SJC',
    'SJC 5c': 'SJC',
    'SJC 2c, 1c, 5 phân': 'SJC',
    'Nữ trang 99.99%': 'NHAN_9999',
    'Nữ trang 99%': 'NHAN_999',
    'Nhẫn tròn trơn 1-5 chỉ': 'NHAN_9999',
    'Vàng nhẫn SJC 99,99 1 chỉ, 2 chỉ, 5 chỉ': 'NHAN_9999',
    'Vàng nữ trang 99,99%': 'NHAN_9999',
    'Vàng nữ trang 99%': 'NHAN_999',
    'Vàng miếng SJC': 'SJC',
  };

  // Try exact match first
  if (typeMap[type]) return typeMap[type];

  // Try partial match
  const lowerType = type.toLowerCase();
  if (lowerType.includes('sjc') && lowerType.includes('miếng')) return 'SJC';
  if (lowerType.includes('sjc')) return 'SJC';
  if (lowerType.includes('nhẫn') || lowerType.includes('nữ trang')) {
    if (
      lowerType.includes('99.99') ||
      lowerType.includes('99,99') ||
      lowerType.includes('9999')
    ) {
      return 'NHAN_9999';
    }
    return 'NHAN_999';
  }

  return 'OTHER';
}

// Parse price string to number
function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  // Remove commas and convert to number, multiply by 1000 (prices are in thousands)
  const cleaned = priceStr.replace(/,/g, '').replace(/\./g, '');
  return parseInt(cleaned, 10) * 1000;
}

async function fetchFromBrand(
  brand: 'sjc' | 'doji' | 'pnj',
  apiKey: string
): Promise<{ brand: string; items: VNAppMobGoldItem[] }> {
  const response = await fetch(
    `https://vapi.vnappmob.com/api/v2/gold/${brand}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error(`Error fetching ${brand}: ${response.status}`);
    return { brand: brand.toUpperCase(), items: [] };
  }

  const data: VNAppMobResponse = await response.json();
  return { brand: brand.toUpperCase(), items: data.results || [] };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const VN_GOLD_API_KEY = Deno.env.get('VN_GOLD_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!VN_GOLD_API_KEY) {
      throw new Error('VN_GOLD_API_KEY is not set');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not set');
    }

    // Fetch from all brands in parallel
    const [sjcData, dojiData, pnjData] = await Promise.all([
      fetchFromBrand('sjc', VN_GOLD_API_KEY),
      fetchFromBrand('doji', VN_GOLD_API_KEY),
      fetchFromBrand('pnj', VN_GOLD_API_KEY),
    ]);

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Process and insert data
    const allData = [sjcData, dojiData, pnjData];
    const insertRecords: Array<{
      gold_type: string;
      brand: string;
      buy_price: number;
      sell_price: number;
      region: string | null;
      source: string;
    }> = [];

    for (const { brand, items } of allData) {
      for (const item of items) {
        const goldType = mapGoldType(item.type);

        // Skip if we can't determine the type
        if (goldType === 'OTHER') continue;

        // Handle different price formats
        if (item.buy_hcm && item.sell_hcm) {
          // DOJI format with regional prices
          insertRecords.push({
            gold_type: goldType,
            brand,
            buy_price: parsePrice(item.buy_hcm),
            sell_price: parsePrice(item.sell_hcm),
            region: 'HCM',
            source: 'VNAppMob',
          });

          if (item.buy_hn && item.sell_hn) {
            insertRecords.push({
              gold_type: goldType,
              brand,
              buy_price: parsePrice(item.buy_hn),
              sell_price: parsePrice(item.sell_hn),
              region: 'HN',
              source: 'VNAppMob',
            });
          }
        } else if (item.buy && item.sell) {
          // Standard format
          insertRecords.push({
            gold_type: goldType,
            brand,
            buy_price: parsePrice(item.buy),
            sell_price: parsePrice(item.sell),
            region: null,
            source: 'VNAppMob',
          });
        }
      }
    }

    // Insert all records
    if (insertRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('vn_gold_prices')
        .insert(insertRecords);

      if (insertError) {
        throw new Error(`Database insert error: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          recordsInserted: insertRecords.length,
          brands: ['SJC', 'DOJI', 'PNJ'],
          timestamp: new Date().toISOString(),
        },
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

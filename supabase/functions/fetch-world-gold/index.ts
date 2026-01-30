// Supabase Edge Function: Fetch World Gold Price from GoldAPI.io
// Deploy: supabase functions deploy fetch-world-gold

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoldAPIResponse {
  timestamp: number
  metal: string
  currency: string
  exchange: string
  symbol: string
  prev_close_price: number
  open_price: number
  low_price: number
  high_price: number
  open_time: number
  price: number
  ch: number
  chp: number
  ask: number
  bid: number
  price_gram_24k: number
  price_gram_22k: number
  price_gram_21k: number
  price_gram_20k: number
  price_gram_18k: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOLD_API_KEY = Deno.env.get('GOLD_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!GOLD_API_KEY) {
      throw new Error('GOLD_API_KEY is not set')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not set')
    }

    // Fetch from GoldAPI.io
    const goldApiResponse = await fetch('https://www.goldapi.io/api/XAU/USD', {
      headers: {
        'x-access-token': GOLD_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!goldApiResponse.ok) {
      throw new Error(`GoldAPI error: ${goldApiResponse.status} ${goldApiResponse.statusText}`)
    }

    const data: GoldAPIResponse = await goldApiResponse.json()

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Insert into database
    const { error: insertError } = await supabase
      .from('world_gold_prices')
      .insert({
        price: data.price,
        previous_close: data.prev_close_price,
        change: data.ch,
        change_percent: data.chp,
        high_24h: data.high_price,
        low_24h: data.low_price,
        source: 'GoldAPI.io',
      })

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`)
    }

    // Also insert into history for charts
    const { error: historyError } = await supabase
      .from('world_gold_history')
      .insert({
        price: data.price,
        open_price: data.open_price,
        high_price: data.high_price,
        low_price: data.low_price,
        close_price: data.price,
      })

    if (historyError) {
      console.error('History insert error:', historyError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          price: data.price,
          change: data.ch,
          changePercent: data.chp,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

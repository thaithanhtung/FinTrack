// Supabase Edge Function: Save World Gold Price from Client
// Receives gold data from client and saves to Supabase database
// Deploy: supabase functions deploy save-world-gold

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============================================
// Input Schema
// ============================================
interface WorldGoldInput {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  timestamp: string; // ISO 8601
}

// ============================================
// Validation
// ============================================
function validateInput(data: any): data is WorldGoldInput {
  if (!data) return false;

  const requiredFields = [
    "price",
    "previousClose",
    "change",
    "changePercent",
    "high24h",
    "low24h",
    "timestamp",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate numeric fields
  const numericFields = [
    "price",
    "previousClose",
    "change",
    "changePercent",
    "high24h",
    "low24h",
  ];
  for (const field of numericFields) {
    if (typeof data[field] !== "number" || isNaN(data[field])) {
      console.error(`Invalid ${field}: must be a number`);
      return false;
    }
  }

  // Validate timestamp
  if (typeof data.timestamp !== "string" || isNaN(Date.parse(data.timestamp))) {
    console.error("Invalid timestamp: must be ISO 8601 string");
    return false;
  }

  return true;
}

// ============================================
// Main Handler
// ============================================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed. Use POST.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        }
      );
    }

    // Get Supabase credentials
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not set");
    }

    // Parse request body
    const data = await req.json();

    // Validate input
    if (!validateInput(data)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid input data. Check required fields.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Received world gold data:", {
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      timestamp: data.timestamp,
    });

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert to world_gold_prices table
    const { error: priceError } = await supabase
      .from("world_gold_prices")
      .insert({
        price: data.price,
        previous_close: data.previousClose,
        change: data.change,
        change_percent: data.changePercent,
        high_24h: data.high24h,
        low_24h: data.low24h,
        source: "Investing.com",
        created_at: data.timestamp,
      });

    if (priceError) {
      console.error("Error inserting to world_gold_prices:", priceError);
      throw priceError;
    }

    console.log("✅ Inserted to world_gold_prices");

    // Insert to world_gold_history table
    const { error: historyError } = await supabase
      .from("world_gold_history")
      .insert({
        price: data.price,
        open_price: data.previousClose,
        high_price: data.high24h,
        low_price: data.low24h,
        close_price: data.price,
        created_at: data.timestamp,
      });

    if (historyError) {
      console.error("Error inserting to world_gold_history:", historyError);
      // Don't throw - price insert already succeeded
    } else {
      console.log("✅ Inserted to world_gold_history");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "World gold data saved successfully",
        data: {
          price: data.price,
          timestamp: data.timestamp,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in save-world-gold:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PriceAlertDB {
  id: string;
  user_id: string;
  telegram_chat_id?: string;
  gold_type: string;
  brand?: string;
  condition: "ABOVE" | "BELOW";
  target_price: number;
  is_active: boolean;
  created_at: string;
}

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode: string;
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format timestamp to Vietnam timezone
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

// Get current gold prices from database
async function getCurrentPrices(supabase: any) {
  const prices: { [key: string]: number } = {};

  // Get world gold price (XAU)
  const { data: worldGold } = await supabase
    .from("world_gold_prices")
    .select("price")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (worldGold) {
    prices["XAU"] = worldGold.price;
  }

  // Get VN gold prices
  const { data: vnGold } = await supabase
    .from("vn_gold_prices")
    .select("gold_type, sell_price")
    .order("created_at", { ascending: false })
    .limit(10);

  if (vnGold && vnGold.length > 0) {
    // Group by gold_type and get latest
    const latestPrices = vnGold.reduce((acc: any, item: any) => {
      if (!acc[item.gold_type]) {
        acc[item.gold_type] = item.sell_price;
      }
      return acc;
    }, {});

    Object.assign(prices, latestPrices);
  }

  return prices;
}

// Send message to Telegram
async function sendTelegramMessage(botToken: string, message: TelegramMessage) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}

// Format alert message
function formatAlertMessage(
  alert: PriceAlertDB,
  currentPrice: number,
  isWorldGold: boolean
): string {
  const currency = isWorldGold ? "USD/oz" : "VNĐ/lượng";
  const goldTypeName =
    alert.gold_type === "XAU"
      ? "Vàng Thế Giới (XAU)"
      : alert.gold_type === "SJC"
      ? "Vàng SJC"
      : alert.gold_type === "NHAN_9999"
      ? "Vàng Nhẫn 9999"
      : alert.gold_type;

  const conditionText = alert.condition === "ABOVE" ? "cao hơn" : "thấp hơn";
  const emoji = alert.condition === "ABOVE" ? "📈" : "📉";

  return `🔔 *Cảnh báo giá vàng!*

${emoji} *${goldTypeName}*

💰 *Giá hiện tại:* ${formatNumber(currentPrice)} ${currency}
🎯 *Ngưỡng đặt:* ${formatNumber(alert.target_price)} ${currency}
📊 *Điều kiện:* Giá ${conditionText} ngưỡng

⏰ *Thời gian:* ${formatTime(new Date())}

✅ Alert đã được tắt tự động. Bạn có thể tạo alert mới trên ứng dụng FinTrack.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!telegramBotToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsError) {
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active alerts to check",
          triggered: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get current prices
    const currentPrices = await getCurrentPrices(supabase);

    console.log("Current prices:", currentPrices);
    console.log("Checking", alerts.length, "alerts");

    let triggeredCount = 0;
    const results = [];

    // Check each alert
    for (const alert of alerts as PriceAlertDB[]) {
      const price = currentPrices[alert.gold_type];

      if (!price) {
        console.log(
          `No price data for ${alert.gold_type}, skipping alert ${alert.id}`
        );
        continue;
      }

      // Skip if no telegram_chat_id (user hasn't set it up yet)
      if (!alert.telegram_chat_id) {
        console.log(`Alert ${alert.id} has no telegram_chat_id, skipping`);
        continue;
      }

      const shouldTrigger =
        (alert.condition === "ABOVE" && price >= alert.target_price) ||
        (alert.condition === "BELOW" && price <= alert.target_price);

      if (shouldTrigger) {
        console.log(
          `Alert ${alert.id} triggered: ${alert.gold_type} ${alert.condition} ${alert.target_price}, current: ${price}`
        );

        try {
          // Send Telegram message
          const isWorldGold = alert.gold_type === "XAU";
          const message = formatAlertMessage(alert, price, isWorldGold);

          await sendTelegramMessage(telegramBotToken, {
            chat_id: alert.telegram_chat_id,
            text: message,
            parse_mode: "Markdown",
          });

          // Update alert status
          const { error: updateError } = await supabase
            .from("price_alerts")
            .update({
              is_active: false,
              triggered_at: new Date().toISOString(),
            })
            .eq("id", alert.id);

          if (updateError) {
            console.error(`Error updating alert ${alert.id}:`, updateError);
            results.push({
              alertId: alert.id,
              success: false,
              error: updateError.message,
            });
          } else {
            triggeredCount++;
            results.push({
              alertId: alert.id,
              goldType: alert.gold_type,
              success: true,
              currentPrice: price,
              targetPrice: alert.target_price,
            });
          }
        } catch (error) {
          console.error(`Error processing alert ${alert.id}:`, error);
          results.push({
            alertId: alert.id,
            success: false,
            error: error.message,
          });
        }
      }
    }

    console.log(`Triggered ${triggeredCount} alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${alerts.length} alerts, triggered ${triggeredCount}`,
        triggered: triggeredCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-price-alerts function:", error);
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

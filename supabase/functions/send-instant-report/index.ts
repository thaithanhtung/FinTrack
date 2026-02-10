import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  userId: string;
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString("vi-VN");
}

/**
 * Format VND currency
 */
function formatVND(amount: number): string {
  return `${formatNumber(amount)} đ`;
}

/**
 * Get arrow indicator based on change
 */
function getArrow(change: number): string {
  if (change > 0) return "↗️";
  if (change < 0) return "↘️";
  return "→";
}

/**
 * Get trend emoji
 */
function getTrendEmoji(change: number): string {
  if (change > 0) return "📈";
  if (change < 0) return "📉";
  return "📊";
}

/**
 * Send Telegram message
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Telegram API error:", error);
    throw new Error(error.description || "Failed to send Telegram message");
  }
}

/**
 * Generate gold price report
 */
async function generateReport(supabase: any): Promise<string> {
  const vietnamTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayName = dayNames[vietnamTime.getDay()];
  const dateStr = vietnamTime.toLocaleDateString("vi-VN");
  const timeStr = vietnamTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fetch world gold price
  const { data: worldGold } = await supabase
    .from("world_gold_prices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch VN gold prices
  const { data: vnGold } = await supabase.rpc("get_latest_vn_gold");

  // Fetch exchange rate
  const { data: exchangeRate } = await supabase.rpc("get_latest_exchange_rate");

  let report = `📊 *BÁO CÁO GIÁ VÀNG NGAY LẬP TỨC*\n`;
  report += `🕐 ${dayName}, ${dateStr} ${timeStr}\n\n`;

  // World gold section
  if (worldGold) {
    report += `🌍 *VÀNG THẾ GIỚI (XAU/USD):*\n`;
    report += `💰 Giá hiện tại: $${formatNumber(worldGold.price)}/oz\n`;

    if (worldGold.change !== null) {
      const changeStr =
        worldGold.change >= 0
          ? `+$${formatNumber(worldGold.change)}`
          : `-$${formatNumber(Math.abs(worldGold.change))}`;
      const percentStr =
        worldGold.change_percent >= 0
          ? `+${worldGold.change_percent.toFixed(2)}%`
          : `${worldGold.change_percent.toFixed(2)}%`;
      report += `${getTrendEmoji(
        worldGold.change
      )} Thay đổi: ${changeStr} (${percentStr}) ${getArrow(
        worldGold.change
      )}\n`;
    }

    if (worldGold.high_24h !== null) {
      report += `📊 Cao nhất 24h: $${formatNumber(worldGold.high_24h)}\n`;
    }
    if (worldGold.low_24h !== null) {
      report += `📊 Thấp nhất 24h: $${formatNumber(worldGold.low_24h)}\n`;
    }

    if (exchangeRate && exchangeRate.length > 0) {
      const rate = exchangeRate[0].usd_to_vnd;
      const vnPrice = worldGold.price * rate * 31.1035; // Convert to VND per lượng
      report += `💵 Quy đổi: ${formatVND(vnPrice)}/lượng\n`;
    }

    report += `\n`;
  }

  // VN gold section
  if (vnGold && vnGold.length > 0) {
    report += `🇻🇳 *VÀNG VIỆT NAM:*\n\n`;

    const sjcGold = vnGold.find(
      (g: any) => g.gold_type === "SJC" && g.brand === "SJC"
    );
    if (sjcGold) {
      report += `🔶 *Vàng SJC:*\n`;
      report += `💰 Mua vào: ${formatVND(sjcGold.buy_price)}/lượng\n`;
      report += `💰 Bán ra: ${formatVND(sjcGold.sell_price)}/lượng\n\n`;
    }

    const ring9999 = vnGold.find(
      (g: any) => g.gold_type === "Nhẫn 9999" && g.brand === "SJC"
    );
    if (ring9999) {
      report += `💍 *Vàng Nhẫn 9999:*\n`;
      report += `💰 Mua vào: ${formatVND(ring9999.buy_price)}/lượng\n`;
      report += `💰 Bán ra: ${formatVND(ring9999.sell_price)}/lượng\n\n`;
    }
  }

  // Trend analysis
  if (worldGold && worldGold.change !== null) {
    if (worldGold.change > 0) {
      report += `💡 *Xu hướng:* Giá vàng đang tăng ${getArrow(
        worldGold.change
      )}\n`;
    } else if (worldGold.change < 0) {
      report += `💡 *Xu hướng:* Giá vàng đang giảm ${getArrow(
        worldGold.change
      )}\n`;
    } else {
      report += `💡 *Xu hướng:* Giá vàng ổn định ${getArrow(0)}\n`;
    }
  }

  report += `\n📱 _Cập nhật từ FinTrack Gold App_`;

  return report;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!telegramBotToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { userId }: RequestBody = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("telegram_chat_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    if (!profile.telegram_chat_id) {
      throw new Error("Telegram Chat ID not configured for this user");
    }

    // Generate report
    const report = await generateReport(supabase);

    // Send to Telegram
    await sendTelegramMessage(
      telegramBotToken,
      profile.telegram_chat_id,
      report
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Report sent successfully",
        userId,
        chatId: profile.telegram_chat_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending instant report:", error);

    let errorMessage = "Failed to send report";
    let statusCode = 500;

    if (error.message?.includes("TELEGRAM_BOT_TOKEN")) {
      errorMessage = "Bot chưa được cấu hình. Vui lòng liên hệ admin.";
      statusCode = 503;
    } else if (error.message?.includes("chat not found")) {
      errorMessage = "Chat ID không tồn tại. Vui lòng kiểm tra lại.";
      statusCode = 404;
    } else if (error.message?.includes("bot was blocked")) {
      errorMessage =
        "Bot đã bị chặn bởi người dùng. Vui lòng bỏ chặn và thử lại.";
      statusCode = 403;
    } else if (error.message?.includes("User profile not found")) {
      errorMessage = "Không tìm thấy thông tin người dùng.";
      statusCode = 404;
    } else if (error.message?.includes("Telegram Chat ID not configured")) {
      errorMessage = "Chưa cấu hình Telegram Chat ID.";
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});

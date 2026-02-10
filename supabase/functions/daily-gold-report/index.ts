import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PriceData {
  current: number;
  yesterday: number;
  change: number;
  changePercent: number;
}

interface GoldPrices {
  xau?: PriceData;
  sjc?: {
    buy: PriceData;
    sell: PriceData;
  };
  nhan9999?: {
    buy: PriceData;
    sell: PriceData;
  };
}

// Format number with thousand separators
function formatNumber(num: number): string {
  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Format price change with arrow
function formatChange(change: number, changePercent: number): string {
  const arrow = change > 0 ? "↗️" : change < 0 ? "↘️" : "➡️";
  const sign = change > 0 ? "+" : "";
  return `${sign}${formatNumber(change)} (${sign}${changePercent.toFixed(
    2
  )}%) ${arrow}`;
}

// Get current time in Vietnam timezone
function getVietnamTime(): string {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
}

// Get current gold prices
async function getCurrentPrices(supabase: any): Promise<any> {
  const prices: any = {};

  // World gold (XAU)
  const { data: worldGold } = await supabase
    .from("world_gold_prices")
    .select("price, change, change_percent, high_24h, low_24h")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (worldGold) {
    prices.xau = {
      price: worldGold.price,
      change: worldGold.change || 0,
      changePercent: worldGold.change_percent || 0,
      high: worldGold.high_24h,
      low: worldGold.low_24h,
    };
  }

  // VN Gold prices
  const { data: vnGold } = await supabase
    .from("vn_gold_prices")
    .select("gold_type, buy_price, sell_price")
    .order("created_at", { ascending: false })
    .limit(20);

  if (vnGold && vnGold.length > 0) {
    // Get latest price for each gold type
    const sjc = vnGold.find((g: any) => g.gold_type === "SJC");
    const nhan9999 = vnGold.find((g: any) => g.gold_type === "NHAN_9999");

    if (sjc) {
      prices.sjc = {
        buy: sjc.buy_price,
        sell: sjc.sell_price,
      };
    }

    if (nhan9999) {
      prices.nhan9999 = {
        buy: nhan9999.buy_price,
        sell: nhan9999.sell_price,
      };
    }
  }

  return prices;
}

// Get yesterday's prices for comparison
async function getYesterdayPrices(supabase: any): Promise<any> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const prices: any = {};

  // World gold
  const { data: worldGold } = await supabase
    .from("world_gold_prices")
    .select("price")
    .gte("created_at", yesterday.toISOString())
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (worldGold) {
    prices.xau = worldGold.price;
  }

  // VN Gold
  const { data: vnGold } = await supabase
    .from("vn_gold_prices")
    .select("gold_type, buy_price, sell_price")
    .gte("created_at", yesterday.toISOString())
    .order("created_at", { ascending: true })
    .limit(20);

  if (vnGold && vnGold.length > 0) {
    const sjc = vnGold.find((g: any) => g.gold_type === "SJC");
    const nhan9999 = vnGold.find((g: any) => g.gold_type === "NHAN_9999");

    if (sjc) {
      prices.sjc = {
        buy: sjc.buy_price,
        sell: sjc.sell_price,
      };
    }

    if (nhan9999) {
      prices.nhan9999 = {
        buy: nhan9999.buy_price,
        sell: nhan9999.sell_price,
      };
    }
  }

  return prices;
}

// Calculate price changes
function calculateChanges(current: any, yesterday: any): GoldPrices {
  const result: any = {};

  // XAU changes
  if (current.xau && yesterday.xau) {
    const change = current.xau.price - yesterday.xau;
    result.xau = {
      current: current.xau.price,
      yesterday: yesterday.xau,
      change,
      changePercent: (change / yesterday.xau) * 100,
    };
  } else if (current.xau) {
    result.xau = {
      current: current.xau.price,
      yesterday: current.xau.price,
      change: current.xau.change || 0,
      changePercent: current.xau.changePercent || 0,
    };
  }

  // SJC changes
  if (current.sjc && yesterday.sjc) {
    const buyChange = current.sjc.buy - yesterday.sjc.buy;
    const sellChange = current.sjc.sell - yesterday.sjc.sell;

    result.sjc = {
      buy: {
        current: current.sjc.buy,
        yesterday: yesterday.sjc.buy,
        change: buyChange,
        changePercent: (buyChange / yesterday.sjc.buy) * 100,
      },
      sell: {
        current: current.sjc.sell,
        yesterday: yesterday.sjc.sell,
        change: sellChange,
        changePercent: (sellChange / yesterday.sjc.sell) * 100,
      },
    };
  }

  // Nhẫn 9999 changes
  if (current.nhan9999 && yesterday.nhan9999) {
    const buyChange = current.nhan9999.buy - yesterday.nhan9999.buy;
    const sellChange = current.nhan9999.sell - yesterday.nhan9999.sell;

    result.nhan9999 = {
      buy: {
        current: current.nhan9999.buy,
        yesterday: yesterday.nhan9999.buy,
        change: buyChange,
        changePercent: (buyChange / yesterday.nhan9999.buy) * 100,
      },
      sell: {
        current: current.nhan9999.sell,
        yesterday: yesterday.nhan9999.sell,
        change: sellChange,
        changePercent: (sellChange / yesterday.nhan9999.sell) * 100,
      },
    };
  }

  return result;
}

// Format daily report message
function formatDailyReport(prices: GoldPrices, currentPrices: any): string {
  const time = getVietnamTime();

  let report = `📊 *BÁO CÁO GIÁ VÀNG HÀNG NGÀY*\n`;
  report += `🕐 ${time}\n\n`;

  // World Gold
  if (prices.xau) {
    report += `🌍 *VÀNG THẾ GIỚI (XAU/USD):*\n`;
    report += `💰 Giá hiện tại: $${formatNumber(prices.xau.current)}/oz\n`;
    report += `📈 Thay đổi: ${formatChange(
      prices.xau.change,
      prices.xau.changePercent
    )}\n`;

    if (currentPrices.xau?.high && currentPrices.xau?.low) {
      report += `📊 Cao nhất 24h: $${formatNumber(currentPrices.xau.high)}\n`;
      report += `📊 Thấp nhất 24h: $${formatNumber(currentPrices.xau.low)}\n`;
    }
    report += `\n`;
  }

  report += `🇻🇳 *VÀNG VIỆT NAM:*\n\n`;

  // SJC Gold
  if (prices.sjc) {
    report += `🔶 *Vàng SJC:*\n`;
    report += `💰 Mua vào: ${formatNumber(prices.sjc.buy.current)} đ/lượng\n`;
    report += `   ↳ ${formatChange(
      prices.sjc.buy.change,
      prices.sjc.buy.changePercent
    )}\n`;
    report += `💰 Bán ra: ${formatNumber(prices.sjc.sell.current)} đ/lượng\n`;
    report += `   ↳ ${formatChange(
      prices.sjc.sell.change,
      prices.sjc.sell.changePercent
    )}\n\n`;
  }

  // Nhẫn 9999
  if (prices.nhan9999) {
    report += `💍 *Vàng Nhẫn 9999:*\n`;
    report += `💰 Mua vào: ${formatNumber(
      prices.nhan9999.buy.current
    )} đ/lượng\n`;
    report += `   ↳ ${formatChange(
      prices.nhan9999.buy.change,
      prices.nhan9999.buy.changePercent
    )}\n`;
    report += `💰 Bán ra: ${formatNumber(
      prices.nhan9999.sell.current
    )} đ/lượng\n`;
    report += `   ↳ ${formatChange(
      prices.nhan9999.sell.change,
      prices.nhan9999.sell.changePercent
    )}\n\n`;
  }

  // Market trend summary
  const overallTrend = prices.xau
    ? prices.xau.change > 0
      ? "tăng"
      : prices.xau.change < 0
      ? "giảm"
      : "đi ngang"
    : "ổn định";

  report += `💡 *Xu hướng:* Giá vàng ${overallTrend} so với hôm qua\n`;
  report += `\n📱 _Cập nhật từ FinTrack Gold App_`;

  return report;
}

// Send Telegram message
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight
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

    console.log("📊 Starting daily gold report generation...");

    // Get current time in Vietnam
    const now = new Date();
    const vietnamTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const currentHour = vietnamTime.getHours();
    const currentMinute = vietnamTime.getMinutes();
    const currentTimeString = `${String(currentHour).padStart(2, "0")}:${String(
      currentMinute
    ).padStart(2, "0")}:00`;

    console.log(`🕐 Current Vietnam time: ${currentTimeString}`);

    // Get all users with telegram_chat_id and daily report enabled
    // Filter by report_time (allow 1 hour window for flexibility)
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("id, telegram_chat_id, report_time, daily_report_enabled")
      .not("telegram_chat_id", "is", null)
      .eq("daily_report_enabled", true);

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users with telegram_chat_id and enabled reports found",
          sent: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`👥 Found ${users.length} users with daily reports enabled`);

    // Get price data
    const currentPrices = await getCurrentPrices(supabase);
    const yesterdayPrices = await getYesterdayPrices(supabase);

    console.log("📈 Current prices:", currentPrices);
    console.log("📉 Yesterday prices:", yesterdayPrices);

    // Calculate changes
    const priceChanges = calculateChanges(currentPrices, yesterdayPrices);

    // Format report
    const report = formatDailyReport(priceChanges, currentPrices);

    console.log("📝 Generated report:\n", report);

    // Send to all users
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const user of users) {
      try {
        // Check if it's time to send for this user
        // Allow 1-hour window (e.g., if report_time is 07:00, send between 07:00-07:59)
        const userReportTime = user.report_time || "07:00:00";
        const [userHour] = userReportTime.split(":");

        if (parseInt(userHour) !== currentHour) {
          // Not the right time for this user
          skippedCount++;
          results.push({
            userId: user.id,
            chatId: user.telegram_chat_id,
            success: false,
            skipped: true,
            reason: `Not scheduled time (wants ${userReportTime}, current ${currentTimeString})`,
          });
          console.log(
            `⏭️ Skipped user ${user.id} - scheduled for ${userReportTime}, current time ${currentTimeString}`
          );
          continue;
        }

        await sendTelegramMessage(
          telegramBotToken,
          user.telegram_chat_id,
          report
        );
        successCount++;
        results.push({
          userId: user.id,
          chatId: user.telegram_chat_id,
          success: true,
        });
        console.log(`✅ Sent to user ${user.id} at ${currentTimeString}`);
      } catch (error) {
        failCount++;
        results.push({
          userId: user.id,
          chatId: user.telegram_chat_id,
          success: false,
          error: error.message,
        });
        console.error(`❌ Failed to send to user ${user.id}:`, error.message);
      }
    }

    console.log(
      `📊 Report sent: ${successCount} success, ${failCount} failed, ${skippedCount} skipped (wrong time)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Daily report sent to ${successCount}/${users.length} users (${skippedCount} skipped due to time)`,
        sent: successCount,
        failed: failCount,
        skipped: skippedCount,
        currentTime: currentTimeString,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in daily-gold-report function:", error);
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

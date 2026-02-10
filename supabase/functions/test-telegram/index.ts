import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  chatId: string;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.description || `Telegram API error: ${response.status}`
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!telegramBotToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    // Parse request body
    const { chatId }: RequestBody = await req.json();

    if (!chatId) {
      throw new Error("Chat ID is required");
    }

    console.log(`📤 Sending test message to Chat ID: ${chatId}`);

    // Test message
    const testMessage = `
🧪 **TEST THÔNG BÁO - FinTrack**

✅ Kết nối thành công!

Chat ID của bạn đã được xác nhận: \`${chatId}\`

Bạn sẽ nhận được báo cáo giá vàng hàng ngày tại đây.

📱 Cảm ơn bạn đã sử dụng FinTrack Gold App!
`;

    // Send test message
    await sendTelegramMessage(telegramBotToken, chatId, testMessage);

    console.log(`✅ Test message sent successfully to ${chatId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test message sent successfully",
        chatId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in test-telegram function:", error);

    // Specific error messages
    let errorMessage = error.message;
    if (error.message?.includes("chat not found")) {
      errorMessage =
        "Chat ID không hợp lệ. Vui lòng kiểm tra lại hoặc nhắn /start cho bot trước.";
    } else if (error.message?.includes("bot was blocked")) {
      errorMessage = "Bot đã bị block. Vui lòng bỏ block bot và thử lại.";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

# Hướng dẫn Setup Telegram Bot cho Price Alerts

Tài liệu này hướng dẫn cách thiết lập Telegram Bot để nhận thông báo giá vàng tự động từ FinTrack.

## 🤖 Bước 1: Tạo Telegram Bot

1. Mở Telegram và tìm bot **@BotFather**
2. Nhắn tin `/newbot` để tạo bot mới
3. Làm theo hướng dẫn:
   - Nhập tên hiển thị cho bot (ví dụ: "FinTrack Gold Alert")
   - Nhập username cho bot (phải kết thúc bằng `bot`, ví dụ: "fintrack_gold_alert_bot")
4. BotFather sẽ trả về **Bot Token** (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. **LƯU LẠI TOKEN NÀY** - bạn sẽ cần nó ở bước tiếp theo

## 🔑 Bước 2: Cấu hình Bot Token trong Supabase

### Option 1: Qua Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Settings** → **Edge Functions**
4. Trong phần **Environment Variables**, thêm biến mới:
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** Token bạn nhận được từ BotFather
5. Click **Save**

### Option 2: Qua Supabase CLI

```bash
# Set environment variable
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## 👤 Bước 3: Lấy Telegram Chat ID

Người dùng cần Chat ID của họ để nhận thông báo:

### Cách 1: Sử dụng @userinfobot (Dễ nhất)

1. Mở Telegram
2. Tìm và mở chat với **@userinfobot**
3. Nhắn tin `/start`
4. Bot sẽ trả về thông tin, trong đó có **Chat ID** (dạng số, ví dụ: `123456789`)
5. Copy Chat ID này và paste vào ứng dụng FinTrack

### Cách 2: Sử dụng bot của bạn

1. Mở bot vừa tạo (tìm theo username)
2. Nhắn tin `/start` hoặc bất kỳ tin nhắn nào
3. Truy cập URL: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Tìm giá trị `"chat":{"id":123456789}` trong response
5. Số `123456789` là Chat ID của bạn

## 🚀 Bước 4: Deploy Edge Function

### Deploy function lên Supabase

```bash
# Navigate to project root
cd /Users/tungthai/Desktop/FinTrack

# Deploy the function
supabase functions deploy check-price-alerts
```

### Test function manually

```bash
# Test với curl
curl -X POST \
  'https://<your-project-ref>.supabase.co/functions/v1/check-price-alerts' \
  -H 'Authorization: Bearer <your-anon-key>' \
  -H 'Content-Type: application/json'
```

## ⏰ Bước 5: Setup Cron Job

Có 3 cách để schedule Edge Function chạy định kỳ:

### Option 1: GitHub Actions (Khuyến nghị - Miễn phí)

Tạo file `.github/workflows/check-alerts.yml`:

```yaml
name: Check Price Alerts
on:
  schedule:
    # Chạy mỗi 15 phút
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Supabase Edge Function
        run: |
          curl -X POST \
            '${{ secrets.SUPABASE_URL }}/functions/v1/check-price-alerts' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}'
```

Thêm secrets trong GitHub repository:
- `SUPABASE_URL`: URL Supabase của bạn
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key từ Supabase

### Option 2: cron-job.org (Dễ setup)

1. Đăng ký tài khoản tại [cron-job.org](https://cron-job.org)
2. Tạo cronjob mới:
   - **URL:** `https://<your-project-ref>.supabase.co/functions/v1/check-price-alerts`
   - **Schedule:** Mỗi 15 phút
   - **Method:** POST
   - **Headers:** 
     - `Authorization: Bearer <your-service-role-key>`
     - `Content-Type: application/json`

### Option 3: Supabase Cron (Nếu available)

Nếu project của bạn có Supabase Cron extension:

```sql
-- Tạo cron job trong database
SELECT cron.schedule(
  'check-price-alerts',
  '*/15 * * * *', -- Mỗi 15 phút
  $$
  SELECT
    net.http_post(
      url:='https://<your-project-ref>.supabase.co/functions/v1/check-price-alerts',
      headers:='{"Authorization": "Bearer <service-role-key>"}'::jsonb
    ) as request_id;
  $$
);
```

## 📱 Bước 6: Test End-to-End

1. **Tạo Alert trên ứng dụng:**
   - Mở FinTrack → Alerts
   - Nhập Telegram Chat ID của bạn
   - Tạo một alert với ngưỡng dễ đạt (ví dụ: giá hiện tại ± 1%)

2. **Trigger function manually:**
   ```bash
   curl -X POST \
     'https://<your-project-ref>.supabase.co/functions/v1/check-price-alerts' \
     -H 'Authorization: Bearer <service-role-key>'
   ```

3. **Kiểm tra Telegram:**
   - Bạn sẽ nhận được tin nhắn từ bot
   - Tin nhắn chứa thông tin về giá vàng và ngưỡng đã đặt
   - Alert sẽ tự động tắt sau khi trigger

## 🔍 Monitoring & Debugging

### Xem logs của Edge Function

```bash
# View function logs
supabase functions logs check-price-alerts

# View function logs (streaming)
supabase functions logs check-price-alerts --follow
```

### Check alerts trong database

```sql
-- Xem tất cả active alerts
SELECT * FROM price_alerts WHERE is_active = true;

-- Xem alerts đã trigger
SELECT * FROM price_alerts WHERE triggered_at IS NOT NULL;

-- Xem alerts của một user cụ thể
SELECT * FROM price_alerts WHERE telegram_chat_id = 'YOUR_CHAT_ID';
```

### Test Telegram Bot connectivity

```bash
# Test bot token
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe

# Test send message
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage \
  -H 'Content-Type: application/json' \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "Test message from FinTrack"
  }'
```

## 🔒 Security Best Practices

1. **Không commit Bot Token vào Git**
   - Token chỉ lưu trong Supabase Environment Variables
   - Không hardcode trong code

2. **Sử dụng Service Role Key**
   - Cron job phải dùng Service Role Key, không dùng Anon Key
   - Service Role Key bypass RLS policies

3. **Rate Limiting**
   - Cân nhắc thêm rate limiting cho Edge Function
   - Tránh spam Telegram API

4. **Validate Chat ID**
   - Chat ID phải là numeric string
   - Validate trước khi lưu vào database

## 🐛 Troubleshooting

### Alert không trigger

- Kiểm tra Edge Function có chạy không (check logs)
- Verify giá hiện tại trong database: `SELECT * FROM world_gold_prices ORDER BY created_at DESC LIMIT 1`
- Kiểm tra điều kiện alert: ABOVE/BELOW và target_price

### Không nhận được tin nhắn Telegram

- Verify Bot Token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- Kiểm tra Chat ID đúng chưa
- User đã bắt đầu chat với bot chưa (phải nhắn `/start` ít nhất 1 lần)

### Edge Function timeout

- Function có 60s timeout mặc định
- Nếu có quá nhiều alerts, cân nhắc batch processing
- Optimize database queries

## 📊 Message Format

Alert message được gửi theo format sau:

```
🔔 Cảnh báo giá vàng!

📈 Vàng Thế Giới (XAU)

💰 Giá hiện tại: 2,750.50 USD/oz
🎯 Ngưỡng đặt: 2,750.00 USD/oz
📊 Điều kiện: Giá cao hơn ngưỡng

⏰ Thời gian: 03/02/2026, 10:30

✅ Alert đã được tắt tự động.
```

## 🎯 Next Steps

- [ ] Setup cron job
- [ ] Test với alerts thật
- [ ] Monitor logs trong vài ngày
- [ ] Adjust frequency nếu cần
- [ ] Consider adding notification preferences (email, SMS, etc.)

## 📚 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)

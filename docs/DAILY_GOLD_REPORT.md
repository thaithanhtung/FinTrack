# Daily Gold Report - Thông báo giá vàng hàng ngày

## Tổng quan

Tính năng gửi thông báo hàng ngày về biến động giá vàng qua Telegram cho tất cả users đã đăng ký.

## 📊 Nội dung báo cáo

### Report mẫu:

```
📊 BÁO CÁO GIÁ VÀNG HÀNG NGÀY
🕐 Thứ Hai, 03/02/2026 07:00

🌍 VÀNG THẾ GIỚI (XAU/USD):
💰 Giá hiện tại: $2,685.50/oz
📈 Thay đổi: +$15.30 (+0.57%) ↗️
📊 Cao nhất 24h: $2,695.00
📊 Thấp nhất 24h: $2,670.00

🇻🇳 VÀNG VIỆT NAM:

🔶 Vàng SJC:
💰 Mua vào: 84,500,000 đ/lượng
   ↳ +200,000 (+0.24%) ↗️
💰 Bán ra: 86,500,000 đ/lượng
   ↳ +250,000 (+0.29%) ↗️

💍 Vàng Nhẫn 9999:
💰 Mua vào: 82,300,000 đ/lượng
   ↳ -150,000 (-0.18%) ↘️
💰 Bán ra: 83,500,000 đ/lượng
   ↳ -100,000 (-0.12%) ↘️

💡 Xu hướng: Giá vàng tăng so với hôm qua

📱 Cập nhật từ FinTrack Gold App
```

## 🚀 Setup Instructions

### Bước 1: Deploy Edge Function

```bash
# Navigate to project root
cd /Users/tungthai/Desktop/FinTrack

# Deploy the new function
supabase functions deploy daily-gold-report

# Test the function
supabase functions invoke daily-gold-report
```

### Bước 2: Test Manual

```bash
# Test với curl
curl -X POST \
  'https://your-project.supabase.co/functions/v1/daily-gold-report' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

### Bước 3: Verify GitHub Actions

GitHub Actions workflow đã được tạo tại:
`.github/workflows/daily-gold-report.yml`

**Schedule mặc định:**
- **7:00 sáng mỗi ngày** (giờ Việt Nam)
- Cron expression: `0 0 * * *` (00:00 UTC = 07:00 VN)

**Test manual trigger:**
1. Vào GitHub repo → Actions tab
2. Chọn "Daily Gold Report" workflow
3. Click "Run workflow" → "Run workflow"

## ⏰ Tùy chỉnh giờ gửi

Edit file `.github/workflows/daily-gold-report.yml`:

### Các giờ phổ biến:

```yaml
# 6:00 sáng (23:00 UTC ngày trước)
- cron: '0 23 * * *'

# 7:00 sáng (00:00 UTC)
- cron: '0 0 * * *'

# 8:00 sáng (01:00 UTC)
- cron: '0 1 * * *'

# 9:00 sáng (02:00 UTC)
- cron: '0 2 * * *'

# 12:00 trưa (05:00 UTC)
- cron: '0 5 * * *'
```

### Gửi nhiều lần trong ngày:

```yaml
schedule:
  - cron: '0 0 * * *'   # 7:00 sáng
  - cron: '0 5 * * *'   # 12:00 trưa
  - cron: '0 9 * * *'   # 4:00 chiều
```

### Chỉ gửi ngày trong tuần:

```yaml
schedule:
  # Chỉ thứ 2-6 (Monday to Friday)
  - cron: '0 0 * * 1-5'
```

### Chỉ cuối tuần:

```yaml
schedule:
  # Chỉ thứ 7 và Chủ nhật
  - cron: '0 0 * * 6,0'
```

## 📋 Requirements

### User phải có:
1. ✅ Tài khoản đã đăng ký (user_id)
2. ✅ Đã liên kết Telegram (telegram_chat_id trong user_profiles)

### Cách liên kết Telegram:
1. User đăng nhập vào app
2. Vào Settings page
3. Nhập Telegram Chat ID (lấy từ @userinfobot)
4. Click "Lưu"

## 🔍 Monitoring

### Check logs trong Supabase:

```bash
# View function logs
supabase functions logs daily-gold-report

# View recent logs
supabase functions logs daily-gold-report --tail
```

### Check GitHub Actions:

1. Vào GitHub repo → Actions tab
2. Xem workflow runs
3. Check logs nếu có lỗi

### Verify Telegram:

- User sẽ nhận message mỗi sáng
- Message có format như mẫu ở trên
- Nếu không nhận được:
  - Check telegram_chat_id đúng chưa
  - User đã nhắn `/start` cho bot chưa
  - Check function logs

## 📊 Data Flow

```
┌─────────────────────────────────────────────┐
│  GitHub Actions Cron (7:00 AM daily)        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Trigger Edge Function:                     │
│  daily-gold-report                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  1. Get all users with telegram_chat_id     │
│  2. Fetch current gold prices               │
│  3. Fetch yesterday's prices                │
│  4. Calculate changes & percentages         │
│  5. Format beautiful report                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Send report to each user via Telegram      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Users receive notification on Telegram     │
└─────────────────────────────────────────────┘
```

## 🎯 Features

### Hiện tại:
- ✅ Gửi báo cáo mỗi sáng tự động
- ✅ So sánh giá với ngày hôm qua
- ✅ Tính % thay đổi
- ✅ Hiển thị cao/thấp 24h
- ✅ Format đẹp với emoji
- ✅ Gửi cho tất cả users đã đăng ký

### Tương lai (Optional):
- [ ] User tự chọn giờ nhận report
- [ ] User chọn loại vàng quan tâm
- [ ] Thêm chart/graph vào message
- [ ] Weekly summary report
- [ ] Monthly analysis report
- [ ] Push notification on app

## 🐛 Troubleshooting

### Users không nhận được report:

**1. Check user có telegram_chat_id chưa:**
```sql
SELECT id, email, telegram_chat_id 
FROM user_profiles 
WHERE telegram_chat_id IS NOT NULL;
```

**2. Test function manually:**
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/daily-gold-report' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY'
```

**3. Check function logs:**
```bash
supabase functions logs daily-gold-report
```

**4. Verify bot token:**
```bash
# Test bot token
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
```

### GitHub Actions không chạy:

1. Check workflow enabled (Actions tab → Enable workflow)
2. Verify secrets đã set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Check cron syntax đúng chưa
4. Free GitHub accounts có giới hạn Actions minutes

### Report sai số liệu:

1. Check database có data không:
```sql
-- Check recent prices
SELECT * FROM world_gold_prices 
ORDER BY created_at DESC LIMIT 5;

SELECT * FROM vn_gold_prices 
ORDER BY created_at DESC LIMIT 10;
```

2. Verify Edge Functions đang fetch data đúng:
- `fetch-world-gold`
- `fetch-vn-gold`

## 📈 Metrics

### Theo dõi:
- Số users nhận report mỗi ngày
- Delivery success rate
- Function execution time
- Error rate

### Query metrics:
```sql
-- Check users with telegram
SELECT COUNT(*) as total_users,
       COUNT(telegram_chat_id) as users_with_telegram
FROM user_profiles;
```

## 🔐 Security

- ✅ Service role key stored in GitHub Secrets
- ✅ Bot token stored in Supabase Secrets
- ✅ RLS policies protect user data
- ✅ CORS properly configured

## 📝 Notes

1. **Timezone:** Tất cả times đều theo giờ Việt Nam (GMT+7)
2. **Cron:** GitHub Actions sử dụng UTC timezone
3. **Rate limits:** Telegram API có limit ~30 messages/second
4. **Data retention:** Prices older than 7 days auto-deleted

## 🎉 Done!

Daily gold report is now active and will send every morning at 7:00 AM Vietnam time!

Users will receive beautiful formatted reports with:
- Current gold prices
- Price changes vs yesterday
- Percentage changes
- 24h high/low
- Market trend summary

---

**Need help?** Check:
- Function logs: `supabase functions logs daily-gold-report`
- GitHub Actions logs: Repo → Actions tab
- Telegram bot status: https://t.me/YourBotUsername

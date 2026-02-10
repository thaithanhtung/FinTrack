# Quick Start - Daily Gold Report

## 🚀 3 Bước để kích hoạt báo cáo hàng ngày

### Bước 1: Deploy Edge Function

```bash
cd /Users/tungthai/Desktop/FinTrack
supabase functions deploy daily-gold-report
```

### Bước 2: Test thử

```bash
# Test manual
supabase functions invoke daily-gold-report

# Hoặc qua curl
curl -X POST \
  'https://bjdwukzwysxtrltgnlsx.supabase.co/functions/v1/daily-gold-report' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

### Bước 3: Verify GitHub Actions

1. Commit và push code lên GitHub
2. Vào repo → Actions tab
3. Enable workflow "Daily Gold Report"
4. Test manual: Click "Run workflow"

## ✅ Done!

Report sẽ tự động gửi lúc **7:00 sáng mỗi ngày**

---

## 📱 User cần làm gì?

Users cần liên kết Telegram để nhận báo cáo:

1. Đăng nhập vào FinTrack app
2. Vào Settings page
3. Tìm bot @userinfobot trên Telegram
4. Nhắn `/start` và lấy Chat ID
5. Paste Chat ID vào Settings và click "Lưu"

## 📊 Báo cáo bao gồm:

- 🌍 Giá vàng thế giới (XAU/USD)
- 🇻🇳 Giá vàng VN (SJC, Nhẫn 9999)
- 📈 % thay đổi so với hôm qua
- 📊 Cao/thấp nhất 24h
- 💡 Xu hướng thị trường

## ⏰ Tùy chỉnh giờ gửi

Edit file `.github/workflows/daily-gold-report.yml`:

```yaml
schedule:
  - cron: '0 0 * * *'   # 7:00 AM
  - cron: '0 1 * * *'   # 8:00 AM  
  - cron: '0 2 * * *'   # 9:00 AM
```

## 🐛 Troubleshooting

**Không nhận được report?**

1. Check telegram_chat_id:
```sql
SELECT * FROM user_profiles WHERE telegram_chat_id IS NOT NULL;
```

2. Check function logs:
```bash
supabase functions logs daily-gold-report
```

3. Test Telegram bot:
```bash
curl https://api.telegram.org/bot<TOKEN>/getMe
```

---

**Full docs:** `docs/DAILY_GOLD_REPORT.md`

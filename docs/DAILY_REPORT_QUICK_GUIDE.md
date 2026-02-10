# Quick Start: Daily Report Management

## 🚀 3 bước để bắt đầu

### 1️⃣ Apply Database Migration

```bash
cd /Users/tungthai/Desktop/FinTrack
supabase db push
```

### 2️⃣ Deploy Edge Function

```bash
supabase functions deploy daily-gold-report --no-verify-jwt
```

### 3️⃣ Start App

```bash
npm run dev
```

Mở http://localhost:5173/daily-report

## 📱 User Guide

### Để nhận báo cáo hàng ngày:

1. **Đăng nhập** vào app
2. Vào trang **"Báo cáo"** (Daily Report) ở bottom nav
3. **Lấy Chat ID**:
   - Mở Telegram
   - Tìm bot [@userinfobot](https://t.me/userinfobot)
   - Gửi `/start`
   - Copy Chat ID (dạng số)
4. **Nhập Chat ID** vào form
5. **Chọn giờ** muốn nhận báo cáo (6-18h)
6. **Bật** toggle "Nhận báo cáo hàng ngày"
7. Click **"Lưu lịch trình"**

✅ **Done!** Bạn sẽ nhận báo cáo vào giờ đã chọn mỗi ngày.

## 🧪 Test Ngay

```bash
# Test Edge Function
supabase functions invoke daily-gold-report --remote
```

Check Telegram xem có nhận message không!

## 📊 Features

- ✅ Add/Update Chat ID dễ dàng
- ✅ Chọn giờ nhận (6h, 7h, 8h, 9h, 12h, 16h, 18h)
- ✅ Bật/tắt tính năng
- ✅ Preview mẫu báo cáo
- ✅ Instructions chi tiết

## 🔗 Related Docs

- **Full Setup Guide**: [DAILY_REPORT_UI_SETUP.md](./DAILY_REPORT_UI_SETUP.md)
- **Previous Setup**: [DAILY_GOLD_REPORT.md](./DAILY_GOLD_REPORT.md)

---

**Need help?** Check logs: `supabase functions logs daily-gold-report --remote`

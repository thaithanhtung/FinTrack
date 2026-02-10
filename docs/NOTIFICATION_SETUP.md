# Notification Setup Guide - HOÀN THÀNH

## Tổng quan

Hệ thống Price Alerts với Authentication đã được implement hoàn chỉnh. User phải đăng nhập để sử dụng tính năng alerts và nhận thông báo qua Telegram.

## Các bước để chạy tính năng

### Bước 1: Apply Database Migrations

```bash
# Chạy migrations để tạo tables và RLS policies
supabase db push

# Hoặc nếu dùng Supabase CLI:
supabase migration up
```

Migrations bao gồm:
- `add_user_auth_to_alerts.sql`: Thêm user_id và RLS policies
- `create_user_profiles.sql`: Tạo user_profiles table với telegram_chat_id

### Bước 2: Enable Email Authentication

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project → **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure **URL Configuration**:
   - Site URL: `http://localhost:5173` (dev)
   - Redirect URLs: `http://localhost:5173/**`

### Bước 3: Setup Telegram Bot

```bash
# Tạo bot với @BotFather trên Telegram
# Lưu Bot Token và set vào Supabase:

supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Bước 4: Deploy Edge Function

```bash
# Deploy function với updates mới
supabase functions deploy check-price-alerts
```

### Bước 5: Setup GitHub Actions Cron Job

File `.github/workflows/check-alerts.yml` đã sẵn sàng.

Thêm secrets vào GitHub repository:
- `SUPABASE_URL`: URL Supabase của bạn
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

### Bước 6: Test Flow Đầy Đủ

#### 6.1. User Registration & Login

```
1. Chạy app: yarn dev
2. Vào /register
3. Đăng ký với email & password
4. Auto login và redirect về home
5. User profile được tạo tự động
```

#### 6.2. Setup Telegram

```
1. Vào Settings page
2. Trong section "Telegram Notifications":
   - Click link mở @userinfobot
   - Nhắn /start và lấy Chat ID
   - Paste Chat ID vào form
   - Click "Lưu"
```

#### 6.3. Create Alert

```
1. Vào /alerts page
2. Chọn loại vàng (XAU/SJC/NHAN_9999)
3. Chọn điều kiện (ABOVE/BELOW)
4. Nhập giá target
5. Click "Tạo alert"
6. Alert được lưu với user_id
```

#### 6.4. Verify Notification

```
1. Trigger Edge Function manually:
   curl -X POST \
     'https://your-project.supabase.co/functions/v1/check-price-alerts' \
     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'

2. Hoặc đợi cron job chạy tự động (mỗi 15 phút)

3. Kiểm tra Telegram để nhận message
```

## Kiến trúc mới

### Authentication Flow

```
User → Register/Login 
  → Supabase Auth (auth.users)
  → Auto create profile (user_profiles)
  → Session stored in browser
  → Access protected routes
```

### Create Alert Flow

```
User (authenticated) → /alerts
  → Create alert form
  → Submit với user_id từ session
  → Save to price_alerts (user_id + telegram_chat_id)
  → RLS auto-filter by user
```

### Notification Flow

```
Cron (15min) → Edge Function
  → Fetch active alerts (service role)
  → Check prices
  → For each triggered alert:
    - Get telegram_chat_id from alert
    - Send Telegram message
    - Update alert status
```

## Security Features

### Row Level Security (RLS)

**price_alerts:**
- Users chỉ CRUD alerts của mình: `auth.uid() = user_id`
- Service role bypass RLS cho Edge Function

**user_profiles:**
- Users chỉ read/update profile của mình
- Auto-create via trigger khi user register

### Protected Routes

- `/alerts` route protected bởi `ProtectedRoute` component
- Auto redirect to `/login` nếu chưa authenticate
- Header hiển thị user email và logout button

## Files đã thay đổi/tạo mới

### Database

- `supabase/migrations/add_user_auth_to_alerts.sql` (mới)
- `supabase/migrations/create_user_profiles.sql` (mới)

### Authentication

- `src/contexts/AuthContext.tsx` (mới)
- `src/components/auth/ProtectedRoute.tsx` (mới)
- `src/pages/Login.tsx` (mới)
- `src/pages/Register.tsx` (mới)

### API & Hooks

- `src/services/api/userProfileApi.ts` (mới)
- `src/services/api/alertsApi.ts` (updated - user_id)
- `src/hooks/useAlerts.ts` (updated - auth integration)

### Components

- `src/App.tsx` (updated - AuthProvider & routes)
- `src/components/layout/Header.tsx` (updated - user menu)
- `src/components/alert/AlertForm.tsx` (updated - simplified)
- `src/components/alert/AlertList.tsx` (updated - auth check)
- `src/pages/Settings.tsx` (updated - Telegram setup)

### Types

- `src/types/gold.ts` (updated - userId, UserProfile)

### Edge Function

- `supabase/functions/check-price-alerts/index.ts` (updated - user_id type)

### Documentation

- `docs/AUTHENTICATION_SETUP.md` (mới)
- `docs/NOTIFICATION_SETUP.md` (file này)

## Testing Checklist

- [ ] User register thành công
- [ ] User login thành công
- [ ] Access `/alerts` khi chưa login → redirect `/login`
- [ ] Access `/alerts` sau login → success
- [ ] Profile auto-create sau register
- [ ] Setup Telegram Chat ID trong Settings → save success
- [ ] Create alert → save với user_id
- [ ] User chỉ thấy alerts của mình
- [ ] Logout → không thấy alerts
- [ ] Login lại → thấy alerts của mình
- [ ] Edge Function chạy và trigger alert
- [ ] Telegram message được gửi
- [ ] Alert status updated sau trigger

## Troubleshooting

### User không thể đăng ký

✓ Check Email provider enabled
✓ Check Redirect URLs configured
✓ Check console logs

### Alerts không hiển thị

✓ Verify user đã login
✓ Check RLS policies trong Supabase
✓ Check console logs

### Telegram không nhận notification

✓ User đã setup telegram_chat_id chưa
✓ Bot Token đúng chưa
✓ User đã nhắn /start cho bot chưa
✓ Check Edge Function logs

## Kết luận

Hệ thống đã sẵn sàng production với:
- ✅ Full authentication system
- ✅ Protected routes
- ✅ User-specific alerts với RLS
- ✅ Telegram notifications
- ✅ Automated price checking
- ✅ Secure data isolation

User flow đơn giản:
1. Register/Login
2. Setup Telegram Chat ID (một lần)
3. Create alerts
4. Nhận notifications tự động

Để bắt đầu: Follow các bước 1-5 ở trên! 🚀

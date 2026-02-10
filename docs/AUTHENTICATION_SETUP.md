# Authentication Setup Guide

## Tổng quan

FinTrack đã được tích hợp Supabase Authentication. User phải đăng nhập để sử dụng tính năng Price Alerts và nhận thông báo qua Telegram.

## Các bước Setup

### 1. Enable Email Authentication trong Supabase

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Authentication** → **Providers**
4. Enable **Email** provider
5. Configure các settings:
   - **Enable Email Confirmations**: Bật nếu muốn verify email (khuyến nghị cho production)
   - **Secure Email Change**: Bật để bảo vệ tài khoản
   - **Email Templates**: Customize email templates nếu cần

### 2. Apply Database Migrations

Chạy các migrations để tạo tables và RLS policies:

```bash
# Apply all migrations
supabase db push

# Hoặc nếu dùng Supabase CLI local:
supabase migration up
```

Migrations đã tạo:
- `add_user_auth_to_alerts.sql`: Thêm user_id vào price_alerts và RLS policies
- `create_user_profiles.sql`: Tạo user_profiles table để lưu telegram_chat_id

### 3. Configure Redirect URLs

1. Vào **Authentication** → **URL Configuration**
2. Thêm Site URL: `http://localhost:5173` (dev) hoặc production URL
3. Thêm Redirect URLs:
   - `http://localhost:5173/**` (dev)
   - `https://yourdomain.com/**` (production)

### 4. Test Authentication Flow

#### Register User Mới

1. Chạy app: `yarn dev`
2. Vào trang `/register`
3. Nhập email và password (tối thiểu 6 ký tự)
4. Click "Đăng ký"
5. User sẽ được tạo trong Supabase Auth
6. Auto login và redirect về home page

#### Login

1. Vào trang `/login`
2. Nhập email và password
3. Click "Đăng nhập"
4. Redirect về home page

#### Access Protected Route

1. Khi chưa login, truy cập `/alerts` sẽ redirect về `/login`
2. Sau khi login, có thể truy cập `/alerts` bình thường

### 5. Setup Telegram Notifications

#### Cho Admin/Developer:

1. Tạo Telegram Bot (nếu chưa có):
   - Chat với @BotFather trên Telegram
   - Nhắn `/newbot`
   - Làm theo hướng dẫn
   - Lưu Bot Token

2. Set Bot Token vào Supabase:
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

#### Cho Users:

1. User đăng nhập vào app
2. Vào trang Settings
3. Trong section "Telegram Notifications":
   - Click link mở @userinfobot
   - Nhắn `/start` cho bot
   - Copy Chat ID nhận được
   - Paste vào ô input và click "Lưu"
4. Bây giờ user có thể tạo alerts và sẽ nhận notifications qua Telegram

### 6. Verify Edge Function

Edge Function `check-price-alerts` đã được update để làm việc với user authentication:

```bash
# Deploy function
supabase functions deploy check-price-alerts

# Test function
curl -X POST \
  'https://your-project.supabase.co/functions/v1/check-price-alerts' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

### 7. Environment Variables

Đảm bảo có các env variables sau trong `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Flow hoạt động

### User Registration & Login

```
User → /register 
  → Supabase Auth tạo user trong auth.users
  → Trigger tự động tạo record trong user_profiles
  → Auto login
  → Redirect to home
```

### Create Alert

```
User login → /alerts
  → Check authentication (ProtectedRoute)
  → Create alert form
  → Submit alert
  → alertsApi.createAlert() + user_id từ auth session
  → Save to price_alerts table với user_id
  → RLS policies auto-filter alerts theo user
```

### Notification Flow

```
Cron job (15 phút)
  → Trigger Edge Function
  → Fetch active alerts (service role bypass RLS)
  → Get current prices
  → Check conditions
  → For each triggered alert:
    - Get telegram_chat_id from alert hoặc user_profiles
    - Send Telegram message
    - Update alert status
```

## Security Features

### Row Level Security (RLS)

Tất cả tables đều có RLS enabled:

**price_alerts table:**
- Users chỉ thấy/edit/delete alerts của mình
- Service role có full access cho Edge Function

**user_profiles table:**
- Users chỉ thấy/edit profile của mình
- Service role có full access

### Authentication Check

- Protected routes check authentication với `ProtectedRoute` component
- API calls tự động include user session
- RLS policies enforce user isolation ở database level

## Troubleshooting

### User không thể đăng ký

- Check email provider đã enable chưa
- Check redirect URLs configured đúng chưa
- Check console logs for errors

### User không thấy alerts

- Verify user đã login chưa
- Check RLS policies: `SELECT * FROM price_alerts WHERE user_id = 'user-uuid'`
- Check console logs for API errors

### Telegram notifications không hoạt động

- Verify user đã setup telegram_chat_id trong Settings chưa
- Check Edge Function có đúng Bot Token chưa
- Test Bot Token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- User phải nhắn `/start` cho bot ít nhất 1 lần

### Edge Function timeout

- Check function logs: `supabase functions logs check-price-alerts`
- Verify service role key đúng chưa
- Check database connection

## Testing Checklist

- [ ] Register user mới
- [ ] Login với user vừa tạo
- [ ] Access /alerts khi chưa login → redirect to /login
- [ ] Access /alerts sau khi login → success
- [ ] User profile được tạo tự động sau register
- [ ] Setup Telegram Chat ID trong Settings
- [ ] Tạo alert mới
- [ ] Verify alert có đúng user_id trong database
- [ ] User chỉ thấy alerts của mình
- [ ] Test Edge Function trigger alert
- [ ] Verify Telegram notification được gửi
- [ ] Logout và verify không thấy alerts
- [ ] Login lại và verify thấy alerts của mình

## Database Queries cho Testing

```sql
-- Check users
SELECT id, email, created_at FROM auth.users;

-- Check user profiles
SELECT * FROM user_profiles;

-- Check alerts by user
SELECT * FROM price_alerts WHERE user_id = 'user-uuid-here';

-- Check active alerts
SELECT * FROM price_alerts WHERE is_active = true;

-- Manual trigger alert
UPDATE price_alerts 
SET is_active = false, triggered_at = NOW() 
WHERE id = 'alert-uuid-here';
```

## Next Steps

- [ ] Setup email templates trong Supabase
- [ ] Configure email verification (production)
- [ ] Add password reset functionality
- [ ] Add social login (Google, GitHub, etc.)
- [ ] Add user profile avatar
- [ ] Add email preferences (opt-out notifications)
- [ ] Add 2FA (two-factor authentication)

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Telegram Bot API](https://core.telegram.org/bots/api)

# Daily Report Management UI - Setup Guide

## 📋 Tổng quan

Đã thêm trang quản lý Daily Report với UI đẹp, cho phép users:
- ✅ Add/Update Telegram Chat ID dễ dàng
- ✅ Chọn giờ nhận báo cáo hàng ngày (6h-18h)
- ✅ Bật/tắt tính năng nhận báo cáo
- ✅ Preview mẫu báo cáo
- ✅ Xem thông tin cấu hình hiện tại

## 🆕 Files đã tạo/chỉnh sửa

### 1. **New Page: `/src/pages/DailyReport.tsx`**
- Full UI component với form nhập Chat ID
- Time picker cho giờ nhận báo cáo
- Toggle enable/disable
- Instructions để lấy Chat ID từ @userinfobot
- Preview báo cáo mẫu

### 2. **Database Migration: `/supabase/migrations/add_daily_report_settings.sql`**
```sql
ALTER TABLE user_profiles 
ADD COLUMN daily_report_enabled BOOLEAN DEFAULT true,
ADD COLUMN report_time TIME DEFAULT '07:00:00';
```

### 3. **Updated API: `/src/services/api/userProfileApi.ts`**
- Thêm function `updateDailyReportSettings()` để update preferences
- Transform function bao gồm `dailyReportEnabled` và `reportTime`

### 4. **Updated Types: `/src/types/gold.ts`**
```typescript
export interface UserProfile {
  // ... existing fields
  dailyReportEnabled: boolean;
  reportTime: string; // Format: "HH:MM:SS"
}
```

### 5. **Updated Edge Function: `/supabase/functions/daily-gold-report/index.ts`**
- Check `daily_report_enabled = true` trước khi gửi
- So sánh `report_time` với giờ hiện tại (Vietnam timezone)
- Chỉ gửi khi đúng giờ user đã chọn (allow 1 hour window)
- Log thêm `skippedCount` cho users không đúng giờ

### 6. **Routing**
- `/src/App.tsx`: Added route `/daily-report`
- `/src/pages/index.ts`: Export `DailyReport`
- `/src/components/layout/BottomNav.tsx`: Added "Báo cáo" item với icon `Calendar`

### 7. **i18n**
- `vi.json`: `"daily_report": "Báo cáo"`
- `en.json`: `"daily_report": "Daily Report"`

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

```bash
cd /Users/tungthai/Desktop/FinTrack

# Apply migration
supabase db push

# Or manually run SQL in Supabase Dashboard:
# Go to SQL Editor > New Query > Paste content from add_daily_report_settings.sql > Run
```

**Verify migration:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('daily_report_enabled', 'report_time');
```

Should return:
```
daily_report_enabled | boolean | true
report_time          | time    | 07:00:00
```

### Step 2: Deploy Updated Edge Function

```bash
# Deploy function
supabase functions deploy daily-gold-report --no-verify-jwt

# Verify deployment
supabase functions list
```

### Step 3: Update GitHub Actions Workflow (Optional)

Hiện tại workflow chạy lúc **7:00 AM** (00:00 UTC). Nếu muốn chạy mỗi giờ để support nhiều users với giờ khác nhau:

**File: `.github/workflows/daily-gold-report.yml`**

```yaml
# Current (once per day at 7 AM)
- cron: '0 0 * * *'  # 7:00 AM Vietnam time

# Change to hourly (from 6 AM to 6 PM Vietnam time)
- cron: '0 23,0-11 * * *'  # Every hour from 6 AM to 6 PM Vietnam time
```

**Hoặc giữ nguyên** và để users chọn trong khoảng 7:00-7:59 AM (current setup).

## 📱 User Flow

### 1. **First Time Setup**

User vào page `/daily-report`:

1. **Nếu chưa login**: Hiển thị UI yêu cầu đăng nhập
2. **Nếu đã login**:
   - Section 1: **Telegram Setup**
     - Instructions để lấy Chat ID từ @userinfobot
     - Input field để nhập Chat ID
     - Button "Lưu" để save
   
   - Section 2: **Schedule Setup** (disabled nếu chưa có Chat ID)
     - Dropdown chọn giờ: 6:00, 7:00, 8:00, 9:00, 12:00, 16:00, 18:00
     - Toggle bật/tắt daily report
     - Button "Lưu lịch trình"
   
   - Section 3: **Preview**
     - Hiển thị status, Chat ID, report time
   
   - Section 4: **Sample Report**
     - Preview báo cáo mẫu sẽ nhận

### 2. **Update Settings**

Users có thể quay lại bất cứ lúc nào để:
- Đổi Chat ID
- Chọn giờ khác
- Tắt/bật tính năng

## 🧪 Testing

### Test 1: UI Testing

```bash
# Start dev server
npm run dev

# Navigate to:
http://localhost:5173/daily-report
```

**Test cases:**
- [ ] Login required check (redirect to login if not authenticated)
- [ ] Chat ID input and save
- [ ] Time selection dropdown
- [ ] Enable/disable toggle
- [ ] Preview section shows correct data
- [ ] Success message after save

### Test 2: Database Testing

```sql
-- Check if user profile has settings
SELECT 
  id, 
  telegram_chat_id, 
  daily_report_enabled, 
  report_time 
FROM user_profiles 
WHERE id = 'YOUR_USER_ID';

-- Should return:
-- telegram_chat_id: "123456789"
-- daily_report_enabled: true
-- report_time: "07:00:00" (or whatever user chose)
```

### Test 3: Edge Function Testing

```bash
# Test function (it will check current hour and skip if not matching)
supabase functions invoke daily-gold-report --remote

# Expected response:
{
  "success": true,
  "message": "Daily report sent to 1/1 users (0 skipped due to time)",
  "sent": 1,
  "failed": 0,
  "skipped": 0,
  "currentTime": "07:15:00",
  "results": [...]
}
```

**Or if not the right time:**
```json
{
  "success": true,
  "sent": 0,
  "skipped": 1,
  "currentTime": "14:30:00",
  "results": [{
    "skipped": true,
    "reason": "Not scheduled time (wants 07:00:00, current 14:30:00)"
  }]
}
```

## 🎯 How Edge Function Works Now

### Logic Flow:

1. **Get current Vietnam time**: `14:30:00`
2. **Query users**:
   ```sql
   WHERE telegram_chat_id IS NOT NULL 
   AND daily_report_enabled = true
   ```
3. **For each user**:
   - Get `report_time` (e.g., `"07:00:00"`)
   - Extract hour: `7`
   - Compare with current hour: `14`
   - **If match**: Send report ✅
   - **If not match**: Skip and log ⏭️
4. **Return summary**:
   - `sent`: Number of reports sent
   - `skipped`: Number of users skipped (wrong time)
   - `failed`: Number of errors

### Example Scenarios:

**Scenario 1: Single user wants 7 AM**
- Current time: `07:15 AM`
- User report_time: `07:00:00`
- Result: ✅ **SENT** (hour matches)

**Scenario 2: Multiple users, different times**
- Current time: `12:30 PM`
- User A: `07:00:00` → ⏭️ **SKIPPED**
- User B: `12:00:00` → ✅ **SENT**
- User C: `16:00:00` → ⏭️ **SKIPPED**

**Scenario 3: User disabled reports**
- User daily_report_enabled: `false`
- Result: ⏭️ **NOT QUERIED** (filtered in SQL)

## 🔄 GitHub Actions Workflow Options

### Option 1: Keep Current (Once Daily at 7 AM)
```yaml
- cron: '0 0 * * *'  # 7:00 AM Vietnam time
```
- **Pros**: Simple, low cost
- **Cons**: Chỉ users chọn 7:00-7:59 mới nhận được

### Option 2: Hourly (6 AM - 6 PM)
```yaml
- cron: '0 23,0-11 * * *'  # Every hour 6 AM - 6 PM Vietnam
```
- **Pros**: Support tất cả time slots
- **Cons**: 13 invocations/day (vẫn trong free tier)

### Option 3: Manual (Current Best)
- Keep `- cron: '0 0 * * *'`
- Users chọn giờ nào cũng được trong UI
- **Chỉ gửi khi giờ hiện tại khớp với user's preference**
- Free tier friendly

**Recommendation**: Giữ Option 3 (current), hoặc nâng lên Option 2 nếu muốn support nhiều giờ hơn.

## 📊 Monitoring

### Check Function Logs

```bash
# View recent logs
supabase functions logs daily-gold-report --remote

# Look for:
# ✅ "Sent to user XXX at 07:15:00"
# ⏭️ "Skipped user XXX - scheduled for 12:00:00, current time 07:15:00"
```

### Check Database

```sql
-- See all users and their settings
SELECT 
  id,
  email,
  telegram_chat_id,
  daily_report_enabled,
  report_time,
  updated_at
FROM user_profiles
ORDER BY updated_at DESC;
```

## 🐛 Troubleshooting

### Issue 1: User không nhận được báo cáo

**Check:**
1. `daily_report_enabled = true`?
2. `telegram_chat_id` đúng?
3. Giờ hiện tại khớp với `report_time`?
4. GitHub Action đã chạy? (Check Actions tab)

**Solution:**
```sql
UPDATE user_profiles 
SET daily_report_enabled = true 
WHERE id = 'USER_ID';
```

### Issue 2: Migration lỗi

**Error**: `column already exists`

**Solution:**
```sql
-- Drop existing columns first
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS daily_report_enabled,
DROP COLUMN IF EXISTS report_time;

-- Then re-run migration
```

### Issue 3: TypeScript errors

**Run:**
```bash
npm run build
```

If errors, check:
- `UserProfile` interface in `types/gold.ts`
- Import statements in `DailyReport.tsx`

## ✅ Checklist

### Deployment:
- [ ] Run database migration (`supabase db push`)
- [ ] Verify columns exist in `user_profiles`
- [ ] Deploy Edge Function (`supabase functions deploy daily-gold-report`)
- [ ] Test UI in dev (`npm run dev`)
- [ ] Build production (`npm run build`)
- [ ] Deploy frontend (Vercel/Netlify)

### Testing:
- [ ] Navigate to `/daily-report` page
- [ ] Add Telegram Chat ID
- [ ] Select report time
- [ ] Toggle enable/disable
- [ ] Save settings
- [ ] Trigger function manually (`supabase functions invoke`)
- [ ] Check Telegram for message

### Monitoring:
- [ ] Check GitHub Actions runs daily
- [ ] Review function logs
- [ ] Verify users receiving reports at correct time

## 🎉 Done!

Users giờ đây có thể:
- ✅ Tự quản lý Telegram Chat ID
- ✅ Chọn giờ nhận báo cáo (6-18h)
- ✅ Bật/tắt tính năng bất cứ lúc nào
- ✅ Xem preview báo cáo trước khi nhận

Edge Function giờ:
- ✅ Chỉ gửi cho users có `daily_report_enabled = true`
- ✅ Chỉ gửi đúng giờ user đã chọn
- ✅ Log rõ ràng: sent, skipped, failed

## 📸 Screenshots

### Daily Report Page
- Header với icon Calendar
- Telegram setup section
- Schedule picker
- Preview section
- Sample report

### Bottom Navigation
- Added "Báo cáo" button với icon Calendar
- Vị trí: giữa History và Converter

## 🚀 Next Steps (Optional)

1. **Test button**: Thêm button "Gửi báo cáo thử" để test ngay lập tức
2. **History**: Lưu lịch sử các lần gửi báo cáo
3. **Customization**: Cho phép users chọn loại vàng muốn nhận thông báo
4. **Email reports**: Thêm option gửi qua email
5. **Report stats**: Dashboard hiển thị số lượng reports đã gửi

---

**Last updated**: Feb 3, 2026
**Version**: 1.0.0

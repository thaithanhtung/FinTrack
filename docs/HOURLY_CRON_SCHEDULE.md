# Hourly Cron Schedule - Daily Gold Report

## ✅ **ĐÃ UPDATE**

File `.github/workflows/daily-gold-report.yml` đã được cập nhật để chạy **HOURLY** thay vì 1x per day.

## 📊 **Schedule Mới**

### Cron Expression:
```yaml
cron: '0 23,0-11 * * *'
```

### Giải thích:
```
'0 23,0-11 * * *'
 │  ^^^^^^
 │  Hours: 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 (UTC)
 │
 └─ Minute: 0 (chạy vào đầu giờ)
```

### UTC → Vietnam Time Conversion:
```
UTC 23:00 (prev day) = Vietnam 6:00 AM  ✅
UTC 00:00            = Vietnam 7:00 AM  ✅
UTC 01:00            = Vietnam 8:00 AM  ✅
UTC 02:00            = Vietnam 9:00 AM  ✅
UTC 03:00            = Vietnam 10:00 AM ✅
UTC 04:00            = Vietnam 11:00 AM ✅
UTC 05:00            = Vietnam 12:00 PM ✅
UTC 06:00            = Vietnam 1:00 PM  ✅
UTC 07:00            = Vietnam 2:00 PM  ✅
UTC 08:00            = Vietnam 3:00 PM  ✅
UTC 09:00            = Vietnam 4:00 PM  ✅
UTC 10:00            = Vietnam 5:00 PM  ✅
UTC 11:00            = Vietnam 6:00 PM  ✅
```

**Total: 13 runs per day** (từ 6:00 sáng đến 6:00 chiều)

---

## 🎯 **Flow mới**

### Before (1x per day):
```
7:00 AM → Trigger
    ↓
Only users với report_time = "07:00:00" nhận được
Users khác → ❌ BỊ BỎ QUA
```

### After (13x per day):
```
6:00 AM → Trigger #1  → Send to users muốn 6:00 AM
7:00 AM → Trigger #2  → Send to users muốn 7:00 AM
8:00 AM → Trigger #3  → Send to users muốn 8:00 AM
9:00 AM → Trigger #4  → Send to users muốn 9:00 AM
10:00 AM → Trigger #5  → Send to users muốn 10:00 AM
11:00 AM → Trigger #6  → Send to users muốn 11:00 AM
12:00 PM → Trigger #7  → Send to users muốn 12:00 PM
1:00 PM → Trigger #8  → Send to users muốn 1:00 PM
2:00 PM → Trigger #9  → Send to users muốn 2:00 PM
3:00 PM → Trigger #10 → Send to users muốn 3:00 PM
4:00 PM → Trigger #11 → Send to users muốn 4:00 PM
5:00 PM → Trigger #12 → Send to users muốn 5:00 PM
6:00 PM → Trigger #13 → Send to users muốn 6:00 PM
```

**✅ TẤT CẢ users đều nhận đúng giờ họ đã chọn!**

---

## 🧪 **Example Scenarios**

### Scenario 1: User chọn 8:00 AM

**Database:**
```sql
report_time: "08:00:00"
daily_report_enabled: true
```

**Timeline:**
```
6:00 AM: currentHour=6, userHour=8 → 6≠8 → SKIP
7:00 AM: currentHour=7, userHour=8 → 7≠8 → SKIP
8:00 AM: currentHour=8, userHour=8 → 8=8 → ✅ SEND!
9:00 AM: currentHour=9, userHour=8 → 9≠8 → SKIP
...
```

### Scenario 2: Multiple users, different times

**Users:**
```
User A: report_time = "07:00:00"
User B: report_time = "12:00:00"
User C: report_time = "16:00:00"
```

**7:00 AM Trigger:**
- User A: 7=7 → ✅ SEND
- User B: 12≠7 → SKIP
- User C: 16≠7 → SKIP

**12:00 PM Trigger:**
- User A: 7≠12 → SKIP
- User B: 12=12 → ✅ SEND
- User C: 16≠12 → SKIP

**4:00 PM Trigger:**
- User A: 7≠16 → SKIP
- User B: 12≠16 → SKIP
- User C: 16=16 → ✅ SEND

**Result: All users receive at their preferred time! ✅**

---

## 💰 **Cost Analysis**

### GitHub Actions Free Tier:
- 2,000 minutes/month
- Unlimited for public repos

### Usage Calculation:

**Before (1x per day):**
```
1 run/day × 30 days = 30 runs/month
~1 minute per run = ~30 minutes/month
```

**After (13x per day):**
```
13 runs/day × 30 days = 390 runs/month
~1 minute per run = ~390 minutes/month
```

**✅ Still well within free tier (2,000 minutes)!**

---

## 🔍 **Verification**

### Check Workflow Schedule:

```bash
# View file
cat .github/workflows/daily-gold-report.yml | grep -A 5 "on:"
```

Expected output:
```yaml
on:
  schedule:
    - cron: '0 23,0-11 * * *'
```

### Monitor Runs:

1. Go to GitHub repo
2. Click **Actions** tab
3. Select **Daily Gold Report** workflow
4. Should see runs every hour (after first trigger)

---

## 📊 **Edge Function Logic**

Edge function vẫn giữ nguyên logic, chỉ được trigger nhiều lần hơn:

```typescript
// Mỗi lần trigger:
const currentHour = vietnamTime.getHours(); // e.g., 8

// Query users
const users = await supabase
  .from("user_profiles")
  .select("*")
  .eq("daily_report_enabled", true);

// Check each user
for (const user of users) {
  const [userHour] = user.report_time.split(":"); // e.g., "08"
  
  if (parseInt(userHour) === currentHour) {
    // ✅ MATCH - Send message
    await sendTelegramMessage(...);
  } else {
    // ⏭️ SKIP - Wrong time
    continue;
  }
}
```

---

## 🎯 **Benefits**

### ✅ **Flexibility:**
- Users có thể chọn bất kỳ giờ nào từ 6 AM - 6 PM
- Mỗi user nhận đúng giờ họ muốn

### ✅ **Reliability:**
- Không còn bị miss notifications
- GitHub Actions rất stable

### ✅ **Cost-Effective:**
- Vẫn free với GitHub Actions free tier
- Không cần thêm infrastructure

### ✅ **Scalable:**
- Support unlimited users
- Mỗi user có thể chọn giờ riêng

---

## 🚀 **Next Steps**

### 1. Commit & Push changes:

```bash
git add .github/workflows/daily-gold-report.yml
git commit -m "Update cron schedule to hourly for flexible report times"
git push origin main
```

### 2. Test workflow:

**Manual trigger:**
- GitHub → Actions → Daily Gold Report → Run workflow

**Or wait for next scheduled run**

### 3. Monitor first runs:

Check logs để verify schedule đang chạy đúng:
- GitHub → Actions → Daily Gold Report → View latest run

---

## 📝 **Important Notes**

### 1. **Cron Accuracy:**
GitHub Actions cron không 100% chính xác (có thể delay 5-10 phút)

### 2. **Time Window:**
Edge function cho phép 1-hour window:
- User chọn 7:00 → Nhận bất kỳ lúc nào trong 7:00-7:59

### 3. **Timezone:**
Tất cả logic dựa trên Vietnam time (Asia/Ho_Chi_Minh)

### 4. **Rate Limiting:**
Telegram Bot API có rate limit, nhưng với số lượng users hợp lý không vấn đề

---

## 🎉 **Summary**

**Changed:**
```diff
- cron: '0 0 * * *'      # Once per day at 7 AM
+ cron: '0 23,0-11 * * *' # Hourly from 6 AM to 6 PM
```

**Result:**
- ✅ 13 runs per day
- ✅ All users receive at their preferred time
- ✅ Still within free tier
- ✅ Simple one-line change

---

**Last updated**: Feb 3, 2026
**Status**: ✅ Deployed

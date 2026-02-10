# ✅ Deployment Checklist - Daily Gold Report

## Pre-deployment

- [x] ✅ Edge Function created: `supabase/functions/daily-gold-report/index.ts`
- [x] ✅ GitHub workflow created: `.github/workflows/daily-gold-report.yml`
- [x] ✅ Documentation written
- [x] ✅ No TypeScript errors

## Deployment Steps

### 1. Deploy Edge Function

```bash
cd /Users/tungthai/Desktop/FinTrack

# Deploy function
supabase functions deploy daily-gold-report

# Expected output:
# Deploying Function: daily-gold-report
# ✓ Deployed Function daily-gold-report
```

**Status:** ⏳ Chưa deploy

---

### 2. Test Function

```bash
# Test với Supabase CLI
supabase functions invoke daily-gold-report

# Hoặc test với curl
curl -X POST \
  'https://bjdwukzwysxtrltgnlsx.supabase.co/functions/v1/daily-gold-report' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Daily report sent to X/Y users",
  "sent": 5,
  "failed": 0,
  "results": [...]
}
```

**Status:** ⏳ Chưa test

---

### 3. Commit & Push to GitHub

```bash
# Add new files
git add .github/workflows/daily-gold-report.yml
git add supabase/functions/daily-gold-report/
git add docs/DAILY_*.md

# Commit
git commit -m "feat: Add daily gold report via Telegram

- Add Edge Function: daily-gold-report
- Add GitHub Actions workflow for 7AM daily reports
- Add comprehensive documentation
- Support comparison with yesterday prices
- Beautiful formatted reports with emoji"

# Push
git push origin main
```

**Status:** ⏳ Chưa push

---

### 4. Enable GitHub Actions Workflow

1. Vào GitHub repo: https://github.com/YOUR_USERNAME/FinTrack
2. Click tab **Actions**
3. Tìm workflow: **"Daily Gold Report"**
4. Click **"Enable workflow"** (nếu disabled)

**Status:** ⏳ Chưa enable

---

### 5. Verify GitHub Secrets

Đảm bảo có 2 secrets sau:

1. **`SUPABASE_URL`**
   - Value: `https://bjdwukzwysxtrltgnlsx.supabase.co`

2. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Value: Service role key từ Supabase Dashboard

**Check:** Settings → Secrets and variables → Actions

**Status:** ⏳ Chưa verify

---

### 6. Test Manual Trigger

1. Vào Actions tab
2. Select "Daily Gold Report" workflow
3. Click **"Run workflow"** dropdown
4. Click **"Run workflow"** button
5. Wait for completion (~30 seconds)
6. Check run logs

**Expected:**
- ✅ Green checkmark
- ✅ "Daily gold report sent successfully!"
- ✅ Reports sent: X

**Status:** ⏳ Chưa test

---

### 7. Verify Users Received Report

**Check Telegram:**
- Users với telegram_chat_id đã setup sẽ nhận message
- Message format như trong docs

**Query database:**
```sql
-- Check users with telegram
SELECT id, email, telegram_chat_id 
FROM user_profiles 
WHERE telegram_chat_id IS NOT NULL;
```

**Status:** ⏳ Chưa verify

---

### 8. Monitor First Automatic Run

**Next scheduled run:** 7:00 AM tomorrow (Vietnam time)

**Check:**
1. Vào Actions tab lúc ~7:05 AM
2. Xem workflow có run không
3. Check logs
4. Verify users nhận được

**Status:** ⏳ Đợi ngày mai

---

## Post-deployment Monitoring

### Daily checks:

- [ ] Check GitHub Actions runs (Actions tab)
- [ ] Verify success rate
- [ ] Monitor Supabase function logs
- [ ] Check user feedback

### Weekly:

- [ ] Review delivery metrics
- [ ] Check error logs
- [ ] User satisfaction survey

---

## Troubleshooting Guide

### Function fails?

```bash
# Check logs
supabase functions logs daily-gold-report

# Common issues:
1. TELEGRAM_BOT_TOKEN not set
2. No users with telegram_chat_id
3. Database connection error
4. Price data not available
```

### Workflow doesn't run?

1. Check workflow enabled
2. Verify secrets set correctly
3. Check cron syntax: `0 0 * * *`
4. GitHub Actions minutes quota

### Users don't receive?

1. Check telegram_chat_id correct
2. User blocked bot?
3. Bot token valid?
4. Check function logs

---

## Configuration

### Change send time:

Edit `.github/workflows/daily-gold-report.yml`:

```yaml
schedule:
  - cron: '0 0 * * *'  # Current: 7AM
```

### Change report format:

Edit `supabase/functions/daily-gold-report/index.ts`:
- Function: `formatDailyReport()`

### Add more gold types:

Edit function to include:
- BTMC gold
- PNJ gold
- Regional prices

---

## Success Metrics

### Target KPIs:

- **Delivery rate:** >95%
- **User engagement:** >80% open rate
- **Error rate:** <5%
- **Function execution:** <10 seconds

### Track:

```sql
-- User growth with telegram
SELECT DATE(created_at) as date,
       COUNT(*) as users_with_telegram
FROM user_profiles
WHERE telegram_chat_id IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Done! ✅

Sau khi hoàn thành tất cả các bước trên, tính năng sẽ hoạt động tự động mỗi ngày!

**Next steps:**
- [ ] Deploy function
- [ ] Test manual
- [ ] Push to GitHub
- [ ] Enable workflow
- [ ] Test manual trigger
- [ ] Wait for automatic run tomorrow
- [ ] Monitor & improve

---

**Questions?**
- Check: `docs/DAILY_GOLD_REPORT.md`
- Or: `docs/DAILY_REPORT_QUICK_START.md`

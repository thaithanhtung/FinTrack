# Test Edge Function Locally

## 🧪 Test fetch-world-gold function

### Method 1: Test với curl

```bash
# Deploy function first
supabase functions deploy fetch-world-gold

# Get your service role key from Supabase Dashboard
# Settings > API > service_role key (keep secret!)

# Test the function
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/fetch-world-gold' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

### Method 2: Test locally với Supabase CLI

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve fetch-world-gold --no-verify-jwt

# In another terminal, test it
curl http://localhost:54321/functions/v1/fetch-world-gold
```

### Method 3: Check logs

```bash
# View function logs
supabase functions logs fetch-world-gold

# Follow logs in real-time
supabase functions logs fetch-world-gold --follow
```

## 📊 Expected Response

```json
{
  "success": true,
  "data": {
    "price": 5050.25,
    "previousClose": 5030.10,
    "change": 20.15,
    "changePercent": 0.40,
    "high24h": 5095.50,
    "low24h": 4980.00
  },
  "source": "Investing.com",
  "timestamp": "2026-02-01T04:45:00.000Z"
}
```

## ✅ Verify in Database

```sql
-- Check latest world gold price
SELECT * FROM world_gold_prices 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if history is being saved
SELECT * FROM world_gold_history 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if data is updating every 5 minutes
SELECT 
  created_at,
  price,
  change_percent,
  source
FROM world_gold_prices 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔄 Setup Cron Job

After verifying function works, setup cron:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule function to run every 5 minutes
SELECT cron.schedule(
  'fetch-world-gold-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/fetch-world-gold',
    headers := jsonb_build_object(
      'Authorization', 
      'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 
      'application/json'
    )
  ) AS request_id;
  $$
);

-- Check cron jobs
SELECT * FROM cron.job;

-- View cron job runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

## 🐛 Troubleshooting

### Issue: Function returns error

```bash
# Check function logs
supabase functions logs fetch-world-gold --follow

# Common errors:
# 1. Investing.com API blocked → Use VPN or wait
# 2. Invalid response → Check API endpoint still works
# 3. Database error → Check table schema matches
```

### Issue: Data not updating

```sql
-- Check last update time
SELECT MAX(created_at) as last_update 
FROM world_gold_prices;

-- Check cron job status
SELECT * FROM cron.job 
WHERE jobname LIKE '%world-gold%';

-- Check cron job errors
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Issue: Investing.com API changes

If API format changes:
1. Check console logs in function
2. Update InvestingDataPoint type
3. Adjust data parsing logic
4. Redeploy function

## 📝 Notes

- **API Source**: Investing.com (commodity ID: 68)
- **Update Interval**: Every 5 minutes
- **Data Points**: 60 candles × 15min = 15 hours history
- **Fallback**: If API fails, old data remains (no crash)
- **Cost**: Free (no API key required)

## 🚀 Quick Deploy Checklist

- [ ] Update function code
- [ ] Test locally with `supabase functions serve`
- [ ] Deploy with `supabase functions deploy fetch-world-gold`
- [ ] Test deployed function with curl
- [ ] Check database for new data
- [ ] Setup/update cron job
- [ ] Monitor logs for first few runs
- [ ] Verify data updating every 5 minutes

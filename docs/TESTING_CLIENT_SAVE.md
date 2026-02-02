# Testing Guide: Client → Edge Function → Database Flow

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Local Supabase running: `supabase start`
3. Environment variables configured in `.env.local`

## Local Testing Steps

### 1. Start Supabase Local Instance

```bash
cd /Users/tungthai/Desktop/FinTrack
supabase start
```

Expected output:
```
Started supabase local development setup.
API URL: http://localhost:54321
...
```

### 2. Deploy Edge Function Locally

```bash
supabase functions deploy save-world-gold --no-verify-jwt
```

Expected output:
```
Deploying save-world-gold function...
Deployed save-world-gold function successfully
```

### 3. Start Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 4. Test the Flow

#### Open Browser Console

Navigate to: `http://localhost:5173`

Watch for console logs:

**Step 1: Investing.com API Fetch**
```
Investing.com data: {totalPoints: 160, firstItem: [...], lastItem: [...]}
Data order: {firstTimestamp: "...", lastTimestamp: "...", reversed: false}
Processed data: {currentPrice: 2790.50, ...}
```

**Step 2: Save to Supabase**
```
✅ World gold data saved to Supabase: {success: true, ...}
```

#### Check Database

**Option A: Supabase Studio**
1. Open: `http://localhost:54323`
2. Navigate to Table Editor
3. Check `world_gold_prices` table - should have new record
4. Check `world_gold_history` table - should have new record

**Option B: SQL Query**
```bash
supabase db query "SELECT * FROM world_gold_prices ORDER BY created_at DESC LIMIT 1;"
supabase db query "SELECT * FROM world_gold_history ORDER BY created_at DESC LIMIT 1;"
```

Expected output:
```
 id | price | previous_close | change | change_percent | high_24h | low_24h | source | created_at
----+-------+----------------+--------+----------------+----------+---------+--------+------------
 .. | 2790.50 | 2785.20 | 5.30 | 0.19 | 2795.00 | 2775.00 | Investing.com | 2026-02-02...
```

### 5. Test Auto-Refresh

Wait 5 minutes (or trigger manually by refreshing page).

**Expected Behavior:**
1. Client fetches from Investing.com
2. Client saves to Edge Function
3. Edge Function saves to database
4. New records appear in tables

### 6. Test Error Handling

**Scenario A: Edge Function Down**
1. Stop Supabase: `supabase stop`
2. Refresh page
3. Check console: Should see error but UI still works

Expected console:
```
⚠️ Failed to save world gold to Supabase: fetch failed
```

**Scenario B: Invalid Data**
1. Modify `worldGoldApi.ts` temporarily to send invalid data
2. Check console for validation error

## Production Testing

### 1. Deploy Edge Function

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref <your-project-ref>

# Deploy function
supabase functions deploy save-world-gold
```

### 2. Verify Deployment

```bash
# Test the endpoint directly
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/save-world-gold \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2790.50,
    "previousClose": 2785.20,
    "change": 5.30,
    "changePercent": 0.19,
    "high24h": 2795.00,
    "low24h": 2775.00,
    "timestamp": "2026-02-02T10:00:00.000Z"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "World gold data saved successfully",
  "data": {
    "price": 2790.50,
    "timestamp": "2026-02-02T10:00:00.000Z"
  }
}
```

### 3. Monitor Production Logs

**Supabase Dashboard:**
1. Navigate to Functions → save-world-gold
2. Check Logs tab for incoming requests
3. Monitor for errors

**Client Console:**
1. Open production site
2. Open browser console
3. Watch for save success/errors

### 4. Database Verification

**Query Recent Records:**
```sql
-- Check latest world gold prices
SELECT * FROM world_gold_prices 
WHERE source = 'Investing.com'
ORDER BY created_at DESC 
LIMIT 10;

-- Check latest history
SELECT * FROM world_gold_history 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify save frequency (should be ~5 minutes)
SELECT 
  created_at,
  created_at - LAG(created_at) OVER (ORDER BY created_at) as time_diff
FROM world_gold_prices 
WHERE source = 'Investing.com'
ORDER BY created_at DESC 
LIMIT 20;
```

## Troubleshooting

### Issue: "Supabase URL not configured"

**Console Error:**
```
Supabase URL not configured, skipping save
```

**Solution:**
Check `.env.local` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### Issue: 403 Error from Edge Function

**Console Error:**
```
Save failed: 403 Forbidden
```

**Solution:**
1. Check RLS policies on tables
2. Verify Edge Function has service role access
3. Check CORS headers

### Issue: Data Not Saving

**Console:**
```
✅ World gold data saved to Supabase: {success: true}
```

**But no data in database:**

**Solution:**
1. Check Edge Function logs in Supabase Dashboard
2. Verify table column names match
3. Check for validation errors

### Issue: Duplicate Records

**Too many records in short time:**

**Solution:**
1. Check TanStack Query `refetchInterval` setting (should be 5 minutes)
2. Verify `staleTime` configuration
3. Check for multiple instances of the app running

## Success Criteria

✅ Client fetches from Investing.com successfully
✅ Console shows "World gold data saved to Supabase"
✅ New records appear in `world_gold_prices` table
✅ New records appear in `world_gold_history` table
✅ Records created every ~5 minutes
✅ UI displays fresh data immediately
✅ No blocking errors if save fails

## Monitoring Checklist (24 hours)

- [ ] Check database for new records every hour
- [ ] Verify save frequency (~5 minutes)
- [ ] Monitor Edge Function logs for errors
- [ ] Check client console for save failures
- [ ] Verify data accuracy vs Investing.com
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify auto-refresh works when tab unfocused

## Rollback Plan

If issues occur:

1. **Disable client-side save:**
   ```typescript
   // In worldGoldApi.ts - comment out save call
   // saveWorldGoldToSupabase({...}).catch(...);
   ```

2. **Revert to old Edge Function:**
   ```bash
   # Re-enable fetch-world-gold cron job
   # (if not already deleted)
   ```

3. **Monitor for 24h before permanent changes**

## Next Steps After Successful Testing

1. Document the new architecture
2. Update README with new data flow
3. (Optional) Remove old `fetch-world-gold` Edge Function
4. (Optional) Add monitoring alerts for save failures
5. (Optional) Implement retry logic for failed saves

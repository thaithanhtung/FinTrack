# Deployment Guide: save-world-gold Edge Function

## Prerequisites

- Supabase CLI installed
- Logged into Supabase CLI
- Project linked to Supabase

## Deployment Steps

### 1. Login to Supabase

```bash
supabase login
```

Follow the browser prompt to authenticate.

### 2. Link to Your Project

```bash
cd /Users/tungthai/Desktop/FinTrack
supabase link --project-ref <your-project-ref>
```

To find your project ref:
- Go to Supabase Dashboard
- Settings → General → Reference ID

### 3. Deploy Edge Function

```bash
supabase functions deploy save-world-gold
```

Expected output:
```
Deploying Function save-world-gold...
Deployed Function save-world-gold successfully.
```

### 4. Verify Deployment

#### Test with curl:

```bash
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

### 5. Deploy Frontend Changes

```bash
# If using Vercel
vercel --prod

# If using Netlify
netlify deploy --prod

# Or your deployment method
```

### 6. Monitor Initial Saves

**Check Supabase Dashboard:**
1. Navigate to Functions → save-world-gold
2. Click on "Logs" tab
3. Watch for incoming requests

**Expected logs:**
```
Received world gold data: { price: 2790.50, ... }
✅ Inserted to world_gold_prices
✅ Inserted to world_gold_history
```

### 7. Verify Database Records

Open Supabase Dashboard → Table Editor:

**world_gold_prices:**
- Check for new records with source = 'Investing.com'
- Verify timestamps are recent
- Confirm data accuracy

**world_gold_history:**
- Check for corresponding history records
- Verify OHLC data

## Post-Deployment Verification

### Hour 1: Immediate Checks

- [ ] Edge Function deployed successfully
- [ ] Test curl request works
- [ ] Frontend deployed successfully
- [ ] Check browser console for save success
- [ ] Verify first record in database

### Hour 2-24: Monitoring

- [ ] Records created every ~5 minutes
- [ ] No errors in Edge Function logs
- [ ] No errors in client console
- [ ] Data accuracy matches Investing.com
- [ ] Auto-refresh works (5 min interval)

### Week 1: Long-term Monitoring

- [ ] Consistent save frequency
- [ ] No memory leaks
- [ ] Database size growth acceptable
- [ ] Edge Function performance stable

## Troubleshooting

### Deployment Failed

**Error: "Function not found"**

Solution:
```bash
# Check function exists
ls supabase/functions/save-world-gold/

# Ensure index.ts is present
cat supabase/functions/save-world-gold/index.ts

# Try deploying again
supabase functions deploy save-world-gold --debug
```

### CORS Errors in Production

**Error: "CORS policy blocked"**

Solution: CORS headers already configured in Edge Function. If still blocked:
1. Check browser console for exact error
2. Verify Supabase URL in .env matches production
3. Check if request goes to correct endpoint

### No Records Saved

**Logs show success but no database records:**

Check:
1. RLS policies allow INSERT
2. Service role key is correct
3. Table column names match exactly
4. Timestamp format is valid

### High Failure Rate

**Many saves failing:**

Check:
1. Supabase project quota/limits
2. Edge Function timeout settings
3. Database connection pool
4. Network issues

## Rollback Procedure

If critical issues occur:

### Immediate Rollback (Frontend Only)

```typescript
// In worldGoldApi.ts - comment out save call
export async function fetchWorldGoldPrice(): Promise<WorldGoldPrice> {
  // ... fetch logic
  
  // TEMPORARILY DISABLED
  // saveWorldGoldToSupabase({...}).catch(...);
  
  return goldData;
}
```

Redeploy frontend immediately.

### Full Rollback (Edge Function)

```bash
# Delete the function
supabase functions delete save-world-gold

# Revert code changes
git revert <commit-hash>
```

## Success Metrics

After 24 hours, verify:

- ✅ **Uptime:** Edge Function available >99.9%
- ✅ **Success Rate:** >95% of saves succeed
- ✅ **Data Accuracy:** Matches Investing.com within acceptable margin
- ✅ **Performance:** Save latency <500ms
- ✅ **Frequency:** Records created every 5 minutes (±30 seconds)
- ✅ **No Errors:** Zero critical errors in logs

## Monitoring Dashboard

Set up monitoring for:

1. **Edge Function Invocations:**
   - Total calls per hour
   - Success/failure rate
   - Average response time

2. **Database:**
   - Record count growth
   - Storage usage
   - Query performance

3. **Client Errors:**
   - Save failure rate
   - Network errors
   - Timeout errors

## Next Steps

After successful 24h monitoring:

1. ✅ Document the new architecture
2. ✅ Update README with data flow
3. ⚠️ Consider removing old `fetch-world-gold` cron
4. 💡 Add monitoring alerts
5. 💡 Implement automatic retry logic

## Support

If issues persist:

1. Check Supabase status page
2. Review Edge Function logs in detail
3. Test with different browsers
4. Verify Investing.com API availability
5. Check network connectivity

## Deployment Checklist

Pre-deployment:
- [ ] Code reviewed and tested locally
- [ ] Environment variables configured
- [ ] Supabase project linked
- [ ] Database schema up to date

Deployment:
- [ ] Edge Function deployed
- [ ] Frontend deployed
- [ ] Initial test passed
- [ ] First save verified in database

Post-deployment:
- [ ] Monitoring enabled
- [ ] Error alerts configured
- [ ] Documentation updated
- [ ] Team notified

## Conclusion

The new architecture bypasses Investing.com's 403 block by fetching from client and saving via Edge Function. This maintains database storage for historical charts while avoiding server-side API restrictions.

Monitor for 24-48 hours before marking as stable.

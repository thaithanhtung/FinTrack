# Test Investing.com API Intervals

## Quick Test

Open browser console and run:

```javascript
// Test PT4H with 192 points
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT4H&pointscount=192')
  .then(r => r.json())
  .then(data => {
    console.log('PT4H with 192 points:', {
      totalPoints: Array.isArray(data) ? data.length : 'not array',
      firstItem: Array.isArray(data) ? data[0] : null,
      lastItem: Array.isArray(data) ? data[data.length - 1] : null,
      coverage: '192 × 4h = 768h = 32 days',
    });
  });

// Test other intervals
const tests = [
  { interval: 'PT15M', points: 96, label: '24h' },
  { interval: 'PT1H', points: 168, label: '7 days' },
  { interval: 'PT4H', points: 180, label: '30 days' },
  { interval: 'PT4H', points: 192, label: '32 days' },
  { interval: 'P1D', points: 90, label: '90 days' },
];

tests.forEach(async (test) => {
  try {
    const response = await fetch(
      `https://api.investing.com/api/financialdata/68/historical/chart/?interval=${test.interval}&pointscount=${test.points}`
    );
    const data = await response.json();
    console.log(`${test.label} (${test.interval} × ${test.points}):`, {
      success: response.ok,
      dataLength: Array.isArray(data) ? data.length : 'error',
      expectedPoints: test.points,
      actualPoints: Array.isArray(data) ? data.length : 0,
      match: Array.isArray(data) && data.length === test.points,
    });
  } catch (error) {
    console.error(`${test.label} failed:`, error);
  }
});
```

## Possible Issues with PT4H + 192

### Issue 1: Data Availability
Investing.com might not have 192 × 4h = 768 hours (32 days) of data available.

**Solution:** Reduce pointscount
```typescript
// Instead of 192, use 180 (30 days)
interval: 'PT4H',
pointscount: 180 // 180 × 4h = 720h = 30 days
```

### Issue 2: API Limits
API might have a maximum pointscount limit (e.g., 200 or 180).

**Solution:** Check response
```javascript
if (!data || data.length < expectedPoints) {
  console.warn(`Only got ${data.length} points, expected ${expectedPoints}`);
}
```

### Issue 3: Wrong Calculation
Maybe the calculation for 3months is wrong?

**Current logic:**
```typescript
else if (durationDays <= 90) {
  // 3 months: 4-hour intervals
  return {
    interval: 'PT4H',
    pointscount: Math.min(Math.ceil(durationDays * 6), 540),
  };
}
```

**For 90 days:**
- `90 * 6 = 540 candles` ✅
- `540 × 4h = 2,160h = 90 days` ✅

**For 30 days:**
- Falls into previous branch (PT1H)
- `30 * 24 = 720 candles`
- But if someone calculates manually: `30 * 6 = 180` for PT4H

### Issue 4: Response Format Changed
Check if API is returning data in different format.

## Recommended Fix

Update `getIntervalConfig` with better bounds:

```typescript
function getIntervalConfig(startDate: Date, endDate: Date) {
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = durationMs / (1000 * 60 * 60 * 24);

  if (durationDays <= 2) {
    // 2 days or less: 15-minute intervals
    return { interval: 'PT15M', pointscount: Math.ceil(durationDays * 96) };
  } else if (durationDays <= 7) {
    // Week: 1-hour intervals
    return { interval: 'PT1H', pointscount: Math.ceil(durationDays * 24) };
  } else if (durationDays <= 30) {
    // Month: 4-hour intervals (better than 1h for 30 days)
    return { interval: 'PT4H', pointscount: Math.ceil(durationDays * 6) };
  } else if (durationDays <= 90) {
    // 3 months: 1-day intervals (cleaner than 4h)
    return { interval: 'P1D', pointscount: Math.ceil(durationDays) };
  } else {
    // Year+: daily intervals
    return { interval: 'P1D', pointscount: Math.min(Math.ceil(durationDays), 365) };
  }
}
```

## Debug Current Issue

Add detailed logging:

```typescript
export async function getWorldGoldHistory(
  startDate: Date,
  endDate: Date
) {
  try {
    const config = getIntervalConfig(startDate, endDate);
    
    console.log('Fetching history:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      interval: config.interval,
      pointscount: config.pointscount,
      url: `https://api.investing.com/api/financialdata/68/historical/chart/?interval=${config.interval}&pointscount=${config.pointscount}`,
    });

    const response = await fetch(...);
    const data = await response.json();
    
    console.log('API Response:', {
      expectedPoints: config.pointscount,
      actualPoints: Array.isArray(data) ? data.length : 'not array',
      dataType: typeof data,
      isArray: Array.isArray(data),
    });
    
    // ... rest of code
  }
}
```

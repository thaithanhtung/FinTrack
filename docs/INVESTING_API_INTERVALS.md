# Investing.com API Intervals - FinTrack

## 📊 ISO 8601 Duration Format

Investing.com API sử dụng **ISO 8601 duration format** cho interval parameter:

### Format Structure
```
P[n]Y[n]M[n]DT[n]H[n]M[n]S
│ │ │ │ │ │ │ │ │ │ │ │ │
│ └─┴─┴─┴─┴─┘ └─┴─┴─┴─┴─┘
│   Date part    Time part
P (Period prefix)
```

- **P** = Period (required prefix)
- **T** = Time separator (separates date from time)
- **Y** = Years
- **M** = Months (before T) or Minutes (after T)
- **D** = Days
- **H** = Hours
- **S** = Seconds

## 🕐 Common Intervals

### Minutes
| Code | Meaning | Example Usage |
|------|---------|---------------|
| `PT1M` | 1 minute | High-frequency trading |
| `PT5M` | 5 minutes | Intraday analysis |
| `PT15M` | 15 minutes | Standard intraday (✅ Default for FinTrack) |
| `PT30M` | 30 minutes | Half-hour candles |

### Hours
| Code | Meaning | Example Usage |
|------|---------|---------------|
| `PT1H` | 1 hour | Hourly charts |
| `PT4H` | 4 hours | Short-term trends |
| `PT12H` | 12 hours | Half-day view |

### Days
| Code | Meaning | Example Usage |
|------|---------|---------------|
| `P1D` | 1 day | Daily candles (✅ Used for 3M, 1Y) |
| `P7D` | 7 days | Weekly view |
| `P1M` | 1 month | Monthly candles |

## 📈 FinTrack Configuration

### Current Price Card (Home Page)
```typescript
// Fixed configuration for WorldGoldCard
interval: PT15M
pointscount: 160
= 160 candles × 15 minutes = 40 hours of data
```

**Purpose:**
- Display current price (latest candle close)
- Calculate 24h high/low (last 96 candles)
- Calculate change from 40h ago (long-term trend)

### Chart View (History Page)
```typescript
const INTERVAL_CONFIG = {
  '1D': { interval: 'PT15M', pointscount: 96 },   // 24 hours
  '7D': { interval: 'PT1H', pointscount: 168 },   // 7 days
  '1M': { interval: 'PT4H', pointscount: 180 },   // 30 days
  '3M': { interval: 'P1D', pointscount: 90 },     // 90 days
  '1Y': { interval: 'P1D', pointscount: 365 },    // 365 days
}
```

### Breakdown by TimeRange

#### 1D (1 Day)
```
Interval: PT15M (15 minutes)
Points: 96
Coverage: 96 × 15min = 1,440 minutes = 24 hours
Candles: Every 15 minutes
```

**Perfect for:**
- Intraday trading
- Short-term price movements
- High-resolution view

#### 7D (7 Days)
```
Interval: PT1H (1 hour)
Points: 168
Coverage: 168 × 1h = 168 hours = 7 days
Candles: Every hour
```

**Perfect for:**
- Weekly trends
- Medium-term analysis
- Work week patterns

#### 1M (1 Month)
```
Interval: PT4H (4 hours)
Points: 180
Coverage: 180 × 4h = 720 hours = 30 days
Candles: Every 4 hours (6 per day)
```

**Perfect for:**
- Monthly patterns
- Mid-term trends
- Reduced noise vs hourly

#### 3M (3 Months)
```
Interval: P1D (1 day)
Points: 90
Coverage: 90 × 1 day = 90 days ≈ 3 months
Candles: Daily
```

**Perfect for:**
- Quarterly trends
- Seasonal patterns
- Long-term support/resistance

#### 1Y (1 Year)
```
Interval: P1D (1 day)
Points: 365
Coverage: 365 × 1 day = 365 days = 1 year
Candles: Daily
```

**Perfect for:**
- Yearly trends
- Annual patterns
- Historical comparison

## 🎯 Optimization Strategy

### Why Different Intervals?

1. **Data Volume Management**
   - Too many points = slow loading
   - Too few points = loss of detail
   - Balance between resolution and performance

2. **Visual Clarity**
   - 1 day: Need minute-level detail → 15min
   - 1 year: Daily is sufficient → 1 day
   - More points on short timeframes, fewer on long

3. **API Efficiency**
   - Investing.com likely has limits on `pointscount`
   - Using appropriate intervals reduces data transfer
   - Faster response times

### Point Count Guidelines

| Timeframe | Recommended Points | Min | Max |
|-----------|-------------------|-----|-----|
| Intraday (1D) | 96-288 | 48 | 480 |
| Short-term (7D) | 84-336 | 42 | 504 |
| Medium-term (1M-3M) | 60-180 | 30 | 360 |
| Long-term (1Y+) | 365-730 | 180 | 1095 |

**FinTrack uses middle-high range for better detail**

## 🔧 Implementation

### API Call Example

```typescript
// 1D - 15-minute intervals
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT15M&pointscount=96')

// 7D - 1-hour intervals
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT1H&pointscount=168')

// 1M - 4-hour intervals
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT4H&pointscount=180')

// 3M - daily intervals
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=P1D&pointscount=90')

// 1Y - daily intervals
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=P1D&pointscount=365')
```

### Response Format

```json
[
  [1738372800000, 2750.50, 2755.00, 2748.00, 2752.00, 1234, 5678],
  [1738373700000, 2752.00, 2758.50, 2751.00, 2756.50, 2345, 6789],
  ...
]
```

Each array: `[timestamp, open, high, low, close, volume1, volume2]`

## 📊 Data Processing

### Calculate Points Needed

```javascript
// Formula: pointscount = coverage_duration / interval_duration

// Example 1: 24 hours with 15-minute candles
pointscount = (24 * 60) / 15 = 96

// Example 2: 7 days with 1-hour candles
pointscount = (7 * 24) / 1 = 168

// Example 3: 30 days with 4-hour candles
pointscount = (30 * 24) / 4 = 180
```

### Timestamp Calculation

```typescript
// Start time (for 1D with 15min intervals)
const now = Date.now();
const startTime = now - (96 * 15 * 60 * 1000);
// = now - 86,400,000 ms
// = now - 24 hours

// End time
const endTime = now;
```

## ⚠️ Common Mistakes

### ❌ Wrong: Using minutes for long timeframes
```typescript
// BAD: 365 days with 15-minute intervals
// Would need 35,040 points! (too many)
interval: 'PT15M',
pointscount: 35040
```

### ❌ Wrong: Using days for intraday
```typescript
// BAD: 1 day with daily intervals
// Would only have 1 data point!
interval: 'P1D',
pointscount: 1
```

### ✅ Correct: Match interval to timeframe
```typescript
// GOOD: 1 day = 15-minute intervals
{ interval: 'PT15M', pointscount: 96 }

// GOOD: 1 year = daily intervals
{ interval: 'P1D', pointscount: 365 }
```

## 🚀 Future Enhancements

### Dynamic Interval Selection

```typescript
function getOptimalInterval(timeRange: TimeRange) {
  const targetPoints = 200; // Aim for ~200 data points
  
  const durations = {
    '1D': 24 * 60,      // minutes
    '7D': 7 * 24 * 60,
    '1M': 30 * 24 * 60,
    // ...
  };
  
  const intervalMinutes = Math.ceil(durations[timeRange] / targetPoints);
  
  // Convert to ISO 8601
  if (intervalMinutes < 60) return `PT${intervalMinutes}M`;
  if (intervalMinutes < 1440) return `PT${Math.ceil(intervalMinutes / 60)}H`;
  return `P${Math.ceil(intervalMinutes / 1440)}D`;
}
```

### Custom Range Support

```typescript
function getIntervalForCustomRange(startDate: Date, endDate: Date) {
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  if (durationHours <= 24) return 'PT15M';
  if (durationHours <= 168) return 'PT1H';
  if (durationHours <= 720) return 'PT4H';
  return 'P1D';
}
```

## 📚 References

- [ISO 8601 Duration Format](https://en.wikipedia.org/wiki/ISO_8601#Durations)
- [Investing.com API Documentation](https://www.investing.com/)
- [TradingView Chart Intervals](https://www.tradingview.com/support/solutions/43000474997-chart-timeframes/)

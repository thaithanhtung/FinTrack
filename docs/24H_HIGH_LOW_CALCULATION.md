# 24h High/Low Calculation - FinTrack

## 📊 Overview

FinTrack tính toán **Cao nhất 24h** và **Thấp nhất 24h** từ Investing.com API data với logic timestamp-based chính xác.

## 🎯 Requirements

- **Cao nhất 24h**: Giá HIGH cao nhất trong 24 giờ qua
- **Thấp nhất 24h**: Giá LOW thấp nhất trong 24 giờ qua
- **24 giờ**: Tính từ timestamp hiện tại lùi lại đúng 24 giờ (86,400,000 milliseconds)

## 🔧 Implementation

### Data Source

```typescript
// API call
fetch('https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT15M&pointscount=160')

// Response format
[
  [timestamp, open, high, low, close, volume1, volume2],
  [1738372800000, 2750.50, 2755.00, 2748.00, 2752.00, 1234, 5678],
  ...160 candles
]
```

**Data coverage:**
- 160 points × 15 minutes = 2,400 minutes = **40 hours**
- More than enough to calculate 24h high/low

### Logic Flow

#### Step 1: Get Current Timestamp
```typescript
const latestCandle = normalizedData[normalizedData.length - 1];
const currentTimestamp = latestCandle[0]; // e.g., 1738420800000
```

#### Step 2: Calculate 24h Cutoff
```typescript
const twentyFourHoursAgo = currentTimestamp - (24 * 60 * 60 * 1000);
// = currentTimestamp - 86,400,000 ms
// = currentTimestamp - 24 hours

// Example:
// currentTimestamp = 1738420800000 (2024-02-01 14:00:00)
// twentyFourHoursAgo = 1738334400000 (2024-01-31 14:00:00)
```

#### Step 3: Filter Data by Timestamp
```typescript
const last24hData = normalizedData.filter((d) => d[0] >= twentyFourHoursAgo);

// Only includes candles from last 24 hours
// Ignores candles older than 24h
```

#### Step 4: Extract High/Low Values
```typescript
// Get all HIGH values (index 2) from last 24h
const highsLast24h = last24hData
  .map((d) => d[2])
  .filter((h) => h > 0); // Remove invalid/zero values

// Get all LOW values (index 3) from last 24h
const lowsLast24h = last24hData
  .map((d) => d[3])
  .filter((l) => l > 0); // Remove invalid/zero values
```

#### Step 5: Calculate Max/Min
```typescript
const high24h = highsLast24h.length > 0 
  ? Math.max(...highsLast24h) 
  : currentPrice; // Fallback to current if no data

const low24h = lowsLast24h.length > 0 
  ? Math.min(...lowsLast24h) 
  : currentPrice; // Fallback to current if no data
```

## 📈 Example Calculation

### Sample Data
```typescript
normalizedData = [
  [1738334400000, 2750, 2755, 2748, 2752, 1234, 5678], // 31/1 14:00 ✅ Included
  [1738335300000, 2752, 2758, 2751, 2756, 2345, 6789], // 31/1 14:15 ✅ Included
  [1738336200000, 2756, 2762, 2754, 2760, 3456, 7890], // 31/1 14:30 ✅ Included
  // ... 94 more candles ...
  [1738420800000, 2788, 2792, 2785, 2790, 4567, 8901], // 1/2 14:00 ✅ Current
]

currentTimestamp = 1738420800000 (Feb 1, 14:00)
twentyFourHoursAgo = 1738334400000 (Jan 31, 14:00)
```

### Filter Process
```typescript
last24hData = normalizedData.filter(d => d[0] >= 1738334400000)
// Returns all candles from 31/1 14:00 onwards
// Approximately 96 candles (24h ÷ 15min)
```

### Extract Values
```typescript
highsLast24h = [2755, 2758, 2762, ..., 2792] // All HIGH values
lowsLast24h = [2748, 2751, 2754, ..., 2785]  // All LOW values
```

### Result
```typescript
high24h = Math.max(2755, 2758, 2762, ..., 2792) = 2792 ✅
low24h = Math.min(2748, 2751, 2754, ..., 2785) = 2748 ✅
```

## ✨ Improvements Over Previous Version

### Old Approach (Array Slice)
```typescript
// ❌ PROBLEM: Assumes exactly 96 candles = 24h
const last24hData = normalizedData.slice(-96);
```

**Issues:**
- What if API returns 95 or 97 candles?
- What if some candles are missing?
- Not based on actual timestamp

### New Approach (Timestamp Filter)
```typescript
// ✅ SOLUTION: Filter by actual timestamp
const twentyFourHoursAgo = currentTimestamp - (24 * 60 * 60 * 1000);
const last24hData = normalizedData.filter((d) => d[0] >= twentyFourHoursAgo);
```

**Benefits:**
- ✅ Accurate regardless of number of candles
- ✅ Based on real time, not assumptions
- ✅ Handles missing candles gracefully
- ✅ Works even if interval changes

## 🛡️ Error Handling

### Invalid/Zero Values
```typescript
// Filter out invalid prices
const highsLast24h = last24hData
  .map((d) => d[2])
  .filter((h) => h > 0); // Remove zeros and negatives
```

### Fallback to Current Price
```typescript
const high24h = highsLast24h.length > 0 
  ? Math.max(...highsLast24h)
  : currentPrice; // Safe fallback
```

### No Data Scenario
```typescript
if (last24hData.length === 0) {
  // Use current price as both high and low
  high24h = currentPrice;
  low24h = currentPrice;
}
```

## 🔍 Debugging

### Console Output
```typescript
console.log("Processed data:", {
  currentPrice: 2790.25,
  previousClose: 2752.00,
  change: 38.25,
  changePercent: 1.39,
  high24h: 2792.50,
  low24h: 2748.00,
  last24hDataPoints: 96, // Number of candles used
  timeRange: {
    from: '2024-01-31T14:00:00.000Z',
    to: '2024-02-01T14:00:00.000Z',
  },
});
```

### Validation Checks
```typescript
// High should be >= current price or close to it
console.assert(high24h >= currentPrice * 0.95, "High too low");

// Low should be <= current price or close to it
console.assert(low24h <= currentPrice * 1.05, "Low too high");

// High should be > Low (unless no data)
console.assert(high24h >= low24h, "High < Low!");
```

## 📊 Visual Representation

```
Timeline: ←─────────────── 24 hours ────────────────→
         |                                            |
    24h ago                                      Current
  (Cutoff)                                      (Latest)
     
Data:   [─────── Included in calculation ────────]
        │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
        96 candles × 15min = 24 hours (approximately)

HIGH:   Find maximum of all HIGH values (index 2)
LOW:    Find minimum of all LOW values (index 3)
```

## 🎯 Testing

### Test Cases

```typescript
// Test 1: Normal scenario
const normalData = [...]; // 160 candles
const result = calculateHighLow(normalData);
expect(result.high24h).toBeGreaterThan(result.low24h);

// Test 2: All candles same price
const flatData = Array(160).fill([Date.now(), 2750, 2750, 2750, 2750, 0, 0]);
const result2 = calculateHighLow(flatData);
expect(result2.high24h).toBe(result2.low24h);

// Test 3: Missing data (< 96 candles)
const sparseData = [...]; // Only 50 candles
const result3 = calculateHighLow(sparseData);
expect(result3.high24h).toBeGreaterThan(0); // Should still work

// Test 4: Empty array
const emptyData = [];
const result4 = calculateHighLow(emptyData);
expect(result4.high24h).toBe(currentPrice); // Fallback
```

## 🚀 Performance

### Time Complexity
- Filter: O(n) where n = 160 (max candles)
- Map: O(m) where m ≈ 96 (24h candles)
- Max/Min: O(m)
- **Total: O(n) = O(160) = constant time** ✅

### Memory
- Additional arrays: ~96 × 2 (highs + lows) = 192 numbers
- **Memory: ~1.5 KB** (negligible) ✅

## 📚 Related

- [API_ARCHITECTURE.md](./API_ARCHITECTURE.md) - Client-side API strategy
- [INVESTING_API_INTERVALS.md](./INVESTING_API_INTERVALS.md) - Interval formats
- [worldGoldApi.ts](../src/services/api/worldGoldApi.ts) - Implementation

## 🔮 Future Enhancements

1. **Rolling High/Low Window**
   ```typescript
   // Calculate high/low for custom windows
   getHighLow(hours: number)
   ```

2. **Intraday High/Low**
   ```typescript
   // High/low since market open today
   getIntradayHighLow()
   ```

3. **All-Time High/Low**
   ```typescript
   // Need to query larger dataset or keep track separately
   getAllTimeHighLow()
   ```

4. **Weekly/Monthly High/Low**
   ```typescript
   // Aggregate from longer timeframes
   getWeeklyHighLow()
   getMonthlyHighLow()
   ```

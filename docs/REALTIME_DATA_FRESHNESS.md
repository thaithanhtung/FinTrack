# Real-time Data Freshness Tracking

## Feature

Hiển thị thời gian lấy data thực tế và cảnh báo khi data cũ > 2 phút.

## Implementation

### 1. Dual Timestamp System

```typescript
export interface WorldGoldPrice {
  // ... other fields
  timestamp: Date;   // API data timestamp (từ Investing.com)
  fetchedAt: Date;   // Khi nào fetch data (client-side) ✅
}
```

**2 timestamps khác nhau:**

| Field | Source | Purpose |
|-------|--------|---------|
| `timestamp` | API data | Thời gian candle từ Investing.com |
| `fetchedAt` | Client-side `new Date()` | Khi nào user fetch data này |

### 2. API Layer

```typescript
// src/services/api/worldGoldApi.ts

export async function fetchWorldGoldPrice(): Promise<WorldGoldPrice> {
  const response = await fetch(investingApiUrl);
  const data = await response.json();
  
  return {
    price: currentPrice,
    // ... other fields
    timestamp: new Date(latestCandle[0]),  // API timestamp
    fetchedAt: new Date(),                 // Client timestamp ✅
    source: "Investing.com",
  };
}
```

### 3. LastUpdated Component

```tsx
// src/components/common/LastUpdated.tsx

export function LastUpdated({
  timestamp,      // API timestamp (not used for staleness)
  fetchedAt,      // Client fetch timestamp (used for staleness) ✅
  warningThresholdMinutes = 2,  // 2 phút threshold
}: LastUpdatedProps) {
  const [now, setNow] = useState(new Date());
  
  // Update every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Check staleness based on fetchedAt
  const checkTime = fetchedAt || timestamp;
  const diffMinutes = (now.getTime() - checkTime.getTime()) / (1000 * 60);
  const isStale = diffMinutes > warningThresholdMinutes;
  
  return (
    <div>
      {isStale ? (
        // ⚠️ Dữ liệu trễ - 3 phút trước (17:00:00)
        <span>Dữ liệu trễ - {Math.floor(diffMinutes)} phút trước</span>
      ) : (
        // 🕐 Dữ liệu Thời Gian Thực: 17:03:45 (VN)
        <span>Dữ liệu Thời Gian Thực: {formatTime(checkTime)}</span>
      )}
    </div>
  );
}
```

### 4. Auto-refresh Integration

```typescript
// src/hooks/useWorldGold.ts

export function useWorldGoldPrice() {
  return useQuery({
    queryKey: ["worldGoldPrice"],
    queryFn: fetchWorldGoldPrice,
    refetchInterval: 5 * 60 * 1000,  // Auto-refresh mỗi 5 phút ✅
    refetchOnWindowFocus: true,      // Refresh khi quay lại tab
  });
}
```

## User Flow

### Scenario 1: Fresh Data (< 2 phút)

```
Time: 17:00:00
User action: Load page
→ API call → fetchedAt = 17:00:00

Display:
🕐 Dữ liệu Thời Gian Thực: 17:00:00 (VN)

Time: 17:01:30 (90 seconds later)
Display:
🕐 Dữ liệu Thời Gian Thực: 17:00:00 (VN)  ✅ Still fresh
```

### Scenario 2: Stale Data (> 2 phút)

```
Time: 17:00:00
User action: Load page
→ API call → fetchedAt = 17:00:00

Time: 17:03:00 (3 minutes later, user hasn't refreshed)
Display:
⚠️ Dữ liệu trễ - 3 phút trước (17:00:00)  ⚠️

User can:
1. Click refresh button → New API call → fetchedAt = 17:03:00
2. Wait for auto-refresh (5 min) → fetchedAt = 17:05:00
```

### Scenario 3: Auto-refresh (5 phút)

```
Time: 17:00:00
fetchedAt: 17:00:00
Display: 🕐 Fresh

Time: 17:02:00
Display: 🕐 Fresh (still < 2 min)

Time: 17:03:00
Display: ⚠️ Trễ 3 phút

Time: 17:05:00 (auto-refresh triggered)
→ New API call → fetchedAt = 17:05:00
Display: 🕐 Fresh (reset) ✅
```

## Timeline Visualization

```
17:00:00  User loads page
          fetchedAt = 17:00:00
          🕐 Fresh
          ↓
17:01:00  (1 min later)
          🕐 Fresh
          ↓
17:02:00  (2 min later)
          🕐 Fresh (threshold = 2 min)
          ↓
17:02:01  (2 min 1 sec later)
          ⚠️ Trễ 2 phút ← Warning appears!
          ↓
17:03:00  (3 min later)
          ⚠️ Trễ 3 phút
          ↓
17:04:00  (4 min later)
          ⚠️ Trễ 4 phút
          ↓
17:05:00  Auto-refresh triggered!
          fetchedAt = 17:05:00
          🕐 Fresh (reset) ✅
```

## Component Usage

### WorldGoldCard

```tsx
export function WorldGoldCard() {
  const { data } = useWorldGoldPrice();
  
  return (
    <Card>
      <p>Giá: ${data.price}</p>
      
      <LastUpdated 
        timestamp={data.timestamp}    // API timestamp
        fetchedAt={data.fetchedAt}    // Fetch timestamp ✅
        warningThresholdMinutes={2}   // 2 phút
      />
    </Card>
  );
}
```

### Other Cards (VN Gold)

```tsx
// For VN Gold, only have timestamp
<LastUpdated 
  timestamp={data.timestamp}
  // fetchedAt not provided → fallback to timestamp
  warningThresholdMinutes={5}
/>
```

## Real-time Countdown

Component tự động update mỗi giây:

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setNow(new Date());  // Update "now" every second
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

**Kết quả:**

```
17:02:00 → ⚠️ Trễ 2 phút
(wait 1 second)
17:02:01 → ⚠️ Trễ 2 phút
(wait 30 seconds)
17:02:30 → ⚠️ Trễ 2 phút
(wait 30 seconds)
17:03:00 → ⚠️ Trễ 3 phút  ← Updates in real-time!
```

## Benefits

### ✅ Before (Old System):
```
timestamp = API candle time (09:45 UTC)
Browser time = 10:07 UTC
Diff = 22 minutes → Always shows warning ❌
```

### ✅ After (New System):
```
fetchedAt = Client fetch time (10:05)
Browser time = 10:07
Diff = 2 minutes → Shows fresh ✅

After 5 min auto-refresh:
fetchedAt = 10:10
Browser time = 10:12
Diff = 2 minutes → Shows fresh ✅
```

## Threshold Comparison

| Threshold | Use Case |
|-----------|----------|
| 2 phút | World Gold (user should see fresh) ✅ |
| 5 phút | VN Gold (manual update, less frequent) |
| 20 phút | Historical data (doesn't need real-time) |

## Debug

Console logs:

```javascript
LastUpdated debug: {
  now: "2026-02-02T10:03:00.000Z"
  timestamp: "2026-02-02T10:00:00.000Z"     // API candle
  fetchedAt: "2026-02-02T10:01:00.000Z"     // Client fetch
  checkTime: "2026-02-02T10:01:00.000Z"     // Using fetchedAt ✅
  diffMinutes: "2.00"
  isStale: false
  threshold: 2
}

(wait 1 minute)

LastUpdated debug: {
  now: "2026-02-02T10:04:00.000Z"
  fetchedAt: "2026-02-02T10:01:00.000Z"
  diffMinutes: "3.00"
  isStale: true  ← Shows warning now!
  threshold: 2
}
```

## Summary

| Feature | Implementation |
|---------|----------------|
| Track fetch time | `fetchedAt: new Date()` in API ✅ |
| Real-time countdown | `setInterval` every 1 second ✅ |
| 2-minute threshold | `warningThresholdMinutes={2}` ✅ |
| Auto-refresh | TanStack Query `refetchInterval: 5min` ✅ |
| Display format | "Trễ X phút trước (HH:mm:ss)" ✅ |

Perfect! 🎯⏰

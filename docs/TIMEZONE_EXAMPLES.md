# Ví dụ sử dụng toVietnamTime()

## Import

```typescript
import { toVietnamTime, formatTime, formatDate, formatDateTime } from "@/services/utils";
```

## 1. Convert API Timestamp

```typescript
// API trả về timestamp UTC
const apiResponse = {
  price: 2790.50,
  timestamp: "2026-02-02T07:30:00Z", // UTC time
};

// Convert sang Date
const date = new Date(apiResponse.timestamp);
console.log("Original (UTC):", date.toISOString());
// Output: "2026-02-02T07:30:00.000Z"

// Convert sang giờ VN
const vnDate = toVietnamTime(date);
console.log("Vietnam time:", vnDate.toISOString());
// Output: "2026-02-02T14:30:00.000Z" (UTC+7)
```

## 2. Format thời gian hiển thị

```typescript
const timestamp = new Date("2026-02-02T07:30:00Z");

// Format giờ (tự động convert)
formatTime(timestamp);
// Output: "14:30:00"

// Format ngày (tự động convert)
formatDate(timestamp);
// Output: "02/02/2026"

// Format đầy đủ (tự động convert)
formatDateTime(timestamp);
// Output: "14:30:00 02/02/2026"
```

## 3. Trong React Component

```tsx
import { formatTime, formatDate } from "@/services/utils";

function PriceCard({ data }) {
  return (
    <div>
      <p>Giá: ${data.price}</p>
      <p>Cập nhật: {formatTime(data.timestamp)} (VN)</p>
      <p>Ngày: {formatDate(data.timestamp)}</p>
    </div>
  );
}

// UI hiển thị:
// Giá: $2790.50
// Cập nhật: 14:30:00 (VN)
// Ngày: 02/02/2026
```

## 4. Chart Tooltip

```tsx
import { formatDateTime } from "@/services/utils";

function CustomTooltip({ payload }) {
  if (!payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="tooltip">
      <p>Thời gian: {formatDateTime(data.timestamp)}</p>
      <p>Giá: ${data.price}</p>
    </div>
  );
}

// Tooltip shows:
// Thời gian: 14:30:00 02/02/2026
// Giá: $2790.50
```

## 5. Comparing Times

```typescript
// Kiểm tra dữ liệu có cũ không (stale data)
const now = new Date();
const dataTimestamp = new Date(data.timestamp);

const diffMinutes = (now.getTime() - dataTimestamp.getTime()) / (1000 * 60);

if (diffMinutes > 5) {
  console.log(`Dữ liệu cũ ${diffMinutes.toFixed(0)} phút`);
  console.log(`Cập nhật lúc: ${formatTime(dataTimestamp)} (VN)`);
}
```

## 6. LastUpdated Component Usage

```tsx
import { LastUpdated } from "@/components/common";

function PriceCard({ price, timestamp }) {
  return (
    <Card>
      <p>Giá: ${price}</p>
      <LastUpdated 
        timestamp={timestamp}
        showWarning={true}
        warningThresholdMinutes={5}
      />
    </Card>
  );
}

// UI shows:
// Fresh data (< 5 mins):
// 🕐 Dữ liệu Thời Gian Thực: 14:30:22 (VN)

// Stale data (> 5 mins):
// ⚠️ Dữ liệu cũ - 14:20:15 (VN)
```

## 7. Working with Investing.com API

```typescript
// Investing.com API returns timestamps in milliseconds
const apiData = [
  [1706860800000, 2780.50, 2795.20, 2775.30, 2790.50, 0, 0],
  // [timestamp, open, high, low, close, vol1, vol2]
];

// Convert to Date objects with VN timezone
const chartData = apiData.map(([ts, open, high, low, close]) => ({
  timestamp: new Date(ts), // Store as Date
  open,
  high,
  low,
  close,
  
  // For display
  displayTime: formatTime(new Date(ts)), // "14:30:00"
  displayDate: formatDate(new Date(ts)), // "02/02/2026"
}));
```

## 8. Date Range Filter

```tsx
function HistoryFilter() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  return (
    <div>
      <input
        type="date"
        value={startDate.toISOString().split('T')[0]}
        onChange={(e) => setStartDate(new Date(e.target.value))}
      />
      
      <p>
        Từ: {formatDate(startDate)} đến {formatDate(endDate)}
      </p>
    </div>
  );
}
```

## 9. Time-based Calculations

```typescript
// Calculate 24h ago from current VN time
const now = new Date();
const vnNow = toVietnamTime(now);
const twentyFourHoursAgo = new Date(vnNow.getTime() - 24 * 60 * 60 * 1000);

console.log("Hiện tại (VN):", formatDateTime(vnNow));
console.log("24h trước (VN):", formatDateTime(twentyFourHoursAgo));

// Filter data in last 24h
const recentData = allData.filter(item => {
  const itemTime = toVietnamTime(item.timestamp);
  return itemTime >= twentyFourHoursAgo;
});
```

## 10. Debug & Console Logging

```typescript
// Log để debug timezone issues
console.log("=== Timezone Debug ===");
console.log("Browser timezone offset:", new Date().getTimezoneOffset());
console.log("API timestamp (raw):", apiTimestamp);
console.log("API timestamp (ISO):", new Date(apiTimestamp).toISOString());
console.log("VN timestamp:", toVietnamTime(apiTimestamp).toISOString());
console.log("Display:", formatDateTime(new Date(apiTimestamp)));
console.log("====================");

// Expected output:
// === Timezone Debug ===
// Browser timezone offset: -420 (if in UTC-7)
// API timestamp (raw): 1706860800000
// API timestamp (ISO): 2026-02-02T07:30:00.000Z
// VN timestamp: 2026-02-02T14:30:00.000Z
// Display: 14:30:00 02/02/2026
// ====================
```

## Common Patterns

### Pattern 1: API Response → Display

```typescript
// 1. Fetch API
const response = await fetch(apiUrl);
const data = await response.json();

// 2. Convert timestamp
const timestamp = new Date(data.timestamp);

// 3. Display (formatters auto-convert to VN)
<p>{formatDateTime(timestamp)}</p>
```

### Pattern 2: User Input → API

```typescript
// User picks date
const userDate = new Date("2026-02-02");

// Send to API (convert back to UTC if needed)
const utcDate = new Date(userDate.getTime() - 7 * 60 * 60 * 1000);
await api.fetchHistory(utcDate.toISOString());
```

### Pattern 3: Real-time Clock

```tsx
function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div>
      Giờ Việt Nam: {formatTime(time)} (VN)
    </div>
  );
}
```

## Best Practices

### ✅ DO:
```typescript
// Store as Date objects
const data = { timestamp: new Date(apiResponse.timestamp) };

// Use formatters for display
<p>{formatTime(data.timestamp)}</p>

// Add "(VN)" indicator
<p>{formatTime(timestamp)} (VN)</p>
```

### ❌ DON'T:
```typescript
// Don't store as formatted strings
const data = { time: "14:30:00" }; // ❌

// Don't manually add hours
const vnTime = new Date(utc.getTime() + 7*60*60*1000); // ❌ Use toVietnamTime()

// Don't forget timezone indicator
<p>{formatTime(timestamp)}</p> // ❌ Ambiguous
```

Perfect! 🇻🇳⏰

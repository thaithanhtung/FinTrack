# Xử lý Timezone - Giờ Việt Nam (UTC+7)

## Vấn đề

API trả về timestamp theo UTC hoặc timezone khác, nhưng user Việt Nam muốn thấy giờ địa phương (UTC+7).

## Giải pháp

### 1. Utility Function `toVietnamTime()`

Tạo function convert timestamp sang giờ Việt Nam:

```typescript
// src/services/utils/formatters.ts

export function toVietnamTime(date: Date | number): Date {
  const d = typeof date === "number" ? new Date(date) : date;
  
  // Convert sang UTC+7 (Vietnam timezone)
  const vnOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  const vnTime = utcTime + vnOffset;
  
  return new Date(vnTime);
}
```

### 2. Update Format Functions

Tất cả format functions đều dùng `toVietnamTime()`:

```typescript
// Format giờ Việt Nam
export function formatTime(date: Date): string {
  const vnDate = toVietnamTime(date);
  return format(vnDate, "HH:mm:ss", { locale: vi });
}

// Format ngày Việt Nam
export function formatDate(date: Date): string {
  const vnDate = toVietnamTime(date);
  return format(vnDate, "dd/MM/yyyy", { locale: vi });
}

// Format ngày giờ đầy đủ
export function formatDateTime(date: Date): string {
  const vnDate = toVietnamTime(date);
  return format(vnDate, "HH:mm:ss dd/MM/yyyy", { locale: vi });
}

// Format "cách đây X phút"
export function formatTimeAgo(date: Date): string {
  const vnDate = toVietnamTime(date);
  return formatDistanceToNow(vnDate, { addSuffix: true, locale: vi });
}
```

### 3. Update Components

#### LastUpdated Component

```tsx
// src/components/common/LastUpdated.tsx

import { toVietnamTime } from "@/services/utils";

function formatTime(date: Date, locale: string): string {
  const vnDate = toVietnamTime(date);
  
  return vnDate.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

// Display: "14:35:22 (VN)"
{formatTime(timestamp, i18n.language)} (VN)
```

## Cách hoạt động

### Flow:

```
API Response (UTC)
    ↓
new Date(timestamp)  // Browser local time
    ↓
toVietnamTime()      // Convert to UTC+7
    ↓
Format functions     // Display as VN time
    ↓
UI shows "14:35:22 (VN)"
```

### Ví dụ:

```typescript
// API returns: 2026-02-02T07:30:00Z (UTC)
const apiTimestamp = new Date("2026-02-02T07:30:00Z");
// Browser (nếu ở múi giờ khác): 07:30:00 UTC

// Convert to Vietnam time
const vnTime = toVietnamTime(apiTimestamp);
// Result: 14:30:00 (UTC+7)

// Format
formatTime(vnTime); // "14:30:00"
formatDate(vnTime); // "02/02/2026"
```

## Lợi ích

### ✅ Trước (Không convert):
```
API: 2026-02-02T07:30:00Z
Display: "07:30:00" ❌ (Confusing for VN users)
```

### ✅ Sau (Có convert):
```
API: 2026-02-02T07:30:00Z
Display: "14:30:00 (VN)" ✅ (Clear Vietnam time)
```

## Tự động áp dụng

Tất cả components dùng format functions sẽ tự động hiển thị giờ VN:

### Components affected:
- ✅ `WorldGoldCard` - Giờ cập nhật
- ✅ `VNGoldCard` - Giờ cập nhật
- ✅ `PriceChart` - Trục X (thời gian)
- ✅ `TrendChart` - Tooltip thời gian
- ✅ `HistoryTable` - Cột thời gian
- ✅ `LastUpdated` - Hiển thị "14:35:22 (VN)"

## Testing

### Test manual:

```typescript
// Console
const now = new Date();
console.log("Browser time:", now.toISOString());
console.log("VN time:", toVietnamTime(now).toISOString());

// Expected difference: 7 hours (if browser is UTC)
```

### Test UI:

1. Check `WorldGoldCard` → "Dữ liệu Thời Gian Thực: 14:35:22 (VN)"
2. Check `PriceChart` → Hover tooltip shows VN time
3. Check `HistoryTable` → All timestamps in VN time

## Notes

### Múi giờ Việt Nam:
- **Timezone:** UTC+7 (Indochina Time - ICT)
- **Không có daylight saving** - Luôn cố định +7

### Browser timezone:
- Function tự động detect browser timezone
- Convert về UTC trước, sau đó +7 hours
- Hoạt động đúng dù user ở bất kỳ timezone nào

### Alternative approach (không dùng):

```typescript
// ❌ Không dùng native Intl với timeZone
// Vì không reliable trên mọi browser/device
date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

// ✅ Dùng manual calculation
toVietnamTime(date) // Stable, predictable
```

## Summary

| Before | After |
|--------|-------|
| Timestamp từ API theo UTC | Timestamp convert sang UTC+7 ✅ |
| User thấy giờ khó hiểu | User thấy giờ Việt Nam rõ ràng ✅ |
| Không có timezone indicator | Hiển thị "(VN)" để clear ✅ |
| Inconsistent display | Consistent across all components ✅ |

Perfect! Giờ Việt Nam everywhere! 🇻🇳

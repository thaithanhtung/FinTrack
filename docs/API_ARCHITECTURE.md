# API Architecture - FinTrack

## 📊 Tổng quan

FinTrack sử dụng kiến trúc hybrid API:
- **World Gold**: Client-side API (Investing.com) - Gọi trực tiếp từ browser
- **VN Gold**: Server-side API (VNAppMob) - Qua Supabase Edge Functions
- **Exchange Rate**: Server-side API (ExchangeRate-API) - Qua Supabase Edge Functions

## 🌍 World Gold Price - Client-side Architecture

### Tại sao Client-side?

1. **Bypass CORS Issues**: Investing.com API chặn requests từ server (Edge Functions) với lỗi 403
2. **Real-time Updates**: Browser có thể gọi trực tiếp, nhanh hơn qua proxy
3. **No Rate Limits**: Investing.com không có rate limit cho client-side calls
4. **Cost Efficient**: Không tốn Supabase Edge Function invocations

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │            React App (FinTrack)                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │   WorldGoldCard Component                     │  │     │
│  │  │   ├─ useWorldGoldPrice() hook                │  │     │
│  │  │   └─ fetchWorldGoldPrice()                   │  │     │
│  │  └──────────────────┬───────────────────────────┘  │     │
│  └─────────────────────┼──────────────────────────────┘     │
└────────────────────────┼───────────────────────────────────┘
                         │
                         │ Direct HTTP Request
                         │ (No CORS, from browser)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Investing.com Public API                        │
│  https://api.investing.com/api/financialdata/68/            │
│  historical/chart/?interval=PT15M&pointscount=160           │
│                                                              │
│  Returns: [[timestamp, open, high, low, close, vol1, vol2]] │
│  160 candles × 15 minutes = 40 hours of OHLC data          │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. API Call (worldGoldApi.ts)

```typescript
export async function fetchWorldGoldPrice(): Promise<WorldGoldPrice> {
  const response = await fetch(
    'https://api.investing.com/api/financialdata/68/historical/chart/?interval=PT15M&pointscount=160',
    { headers: { 'Accept': 'application/json' } }
  );

  const data: InvestingDataPoint[] = await response.json();
  
  // Process OHLC data
  const latestCandle = data[data.length - 1];
  const currentPrice = latestCandle[4]; // close price
  
  return { price, change, changePercent, high24h, low24h, ... };
}
```

#### 2. React Hook (useWorldGold.ts)

```typescript
export function useWorldGoldPrice() {
  return useQuery({
    queryKey: ['worldGoldPrice'],
    queryFn: fetchWorldGoldPrice,
    staleTime: 5 * 60 * 1000,        // 5 minutes cache
    refetchInterval: 5 * 60 * 1000,   // Auto refetch every 5 min
    refetchOnWindowFocus: true,       // Refetch when tab active
  })
}
```

#### 3. Component Usage (WorldGoldCard.tsx)

```typescript
export function WorldGoldCard() {
  const { data, isLoading, isError } = useWorldGoldPrice();
  
  return (
    <Card>
      <p>{formatUSD(data.price)}</p>
      <PriceChange change={data.change} changePercent={data.changePercent} />
    </Card>
  );
}
```

### Data Processing

#### API Response Format

```json
[
  [1738372800000, 2750.50, 2755.00, 2748.00, 2752.00, 1234, 5678],
  [1738373700000, 2752.00, 2758.50, 2751.00, 2756.50, 2345, 6789],
  ...160 candles
]
```

Each candle: `[timestamp, open, high, low, close, volume1, volume2]`

#### Data Normalization

1. **Check order**: Compare first & last timestamps
2. **Reverse if needed**: Ensure oldest → newest order
3. **Extract latest**: `latestCandle = data[data.length - 1]`
4. **Calculate metrics**:
   - Current price = `latestCandle[4]` (close)
   - Previous close = `firstCandle[4]` (40 hours ago)
   - High = `Math.max(...allHighs)`
   - Low = `Math.min(...allLows)`
   - Change = `current - previous`
   - Change% = `(change / previous) * 100`

### Caching Strategy

| Setting | Value | Reason |
|---------|-------|--------|
| `staleTime` | 5 minutes | Investing.com updates every 15 min |
| `gcTime` | 10 minutes | Keep in memory longer |
| `refetchInterval` | 5 minutes | Auto update UI |
| `refetchOnWindowFocus` | true | Fresh data when user returns |

### Error Handling

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error(`Investing.com API error: ${response.status}`);
  }
  // Process data
} catch (error) {
  console.error('Error fetching world gold price:', error);
  throw error; // React Query will handle retry
}
```

React Query automatic retry:
- 3 retries with exponential backoff
- Shows error state in UI
- User can manually retry

## 🇻🇳 VN Gold Price - Server-side Architecture

### Tại sao Server-side?

1. **API Key Protection**: VNAppMob yêu cầu API key (không expose trên client)
2. **Data Aggregation**: Fetch từ 3 brands (SJC, DOJI, PNJ) cùng lúc
3. **Database Storage**: Lưu vào Supabase để có history
4. **Cron Job**: Tự động fetch mỗi 5 phút

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │            React App (FinTrack)                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │   VNGoldCard Component                        │  │     │
│  │  │   ├─ useVNGoldPrice() hook                   │  │     │
│  │  │   └─ fetchVNGoldPrice()                      │  │     │
│  │  └──────────────────┬───────────────────────────┘  │     │
│  └─────────────────────┼──────────────────────────────┘     │
└────────────────────────┼───────────────────────────────────┘
                         │
                         │ Supabase Client Query
                         │ (Read from database)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL Database                         │   │
│  │           • vn_gold_prices (latest)                  │   │
│  │           • vn_gold_history (historical)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ▲                                    │
│                         │ Insert data every 5 minutes        │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Edge Function: fetch-vn-gold                   │   │
│  │        (Triggered by Cron Job)                       │   │
│  └──────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                         │
                         │ Fetch with API Key
                         │ (Hidden from client)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 VNAppMob API (Private)                       │
│  https://vapi.vnappmob.com/api/v2/gold/{brand}              │
│  Requires: Bearer Token (API Key)                           │
│                                                              │
│  Returns: Gold prices for SJC, DOJI, PNJ                   │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Exchange Rate - Server-side Architecture

Similar to VN Gold, fetched via Edge Functions and cached in database.

```
Browser → Supabase DB (exchange_rates) ← Edge Function ← ExchangeRate-API
```

## 🔄 Combined Fetch Function

`fetch-all-prices` Edge Function combines all 3 APIs:
- World Gold (Investing.com) - **Now fails with 403, use client-side instead**
- VN Gold (VNAppMob)
- Exchange Rate (ExchangeRate-API)

**Note**: Since Investing.com blocks server requests, this function now only successfully fetches VN Gold and Exchange Rate.

## 📊 Comparison Table

| Feature | World Gold (Client) | VN Gold (Server) | Exchange Rate (Server) |
|---------|-------------------|------------------|----------------------|
| **API Source** | Investing.com | VNAppMob | ExchangeRate-API |
| **Where Called** | Browser | Edge Function | Edge Function |
| **API Key Required** | ❌ No | ✅ Yes | ❌ No |
| **CORS Issues** | ❌ None | N/A (server) | N/A (server) |
| **Rate Limit** | ❌ None | ⚠️ Yes | ⚠️ Yes (free tier) |
| **Update Frequency** | 5 min (client) | 5 min (cron) | 5 min (cron) |
| **Data Storage** | ❌ Cache only | ✅ Database | ✅ Database |
| **Historical Data** | Via Supabase | ✅ Yes | ✅ Yes |
| **Real-time** | ✅ Direct | ⏱️ 5-min delay | ⏱️ 5-min delay |

## 🚀 Performance Optimizations

### 1. Client-side Caching (TanStack Query)

- **World Gold**: 5-min stale time, auto refetch
- **VN Gold**: 2-min stale time (from DB)
- **Exchange Rate**: 30-min stale time (rarely changes)

### 2. Server-side Caching (Supabase)

- Edge Functions cache data in PostgreSQL
- Client reads from DB (fast, no external API calls)
- Cron jobs update data every 5 minutes

### 3. Lazy Loading

- Charts: Load on demand when user navigates
- Historical data: Fetch only for selected time range

## 🐛 Error Handling & Fallbacks

### Client-side (World Gold)

```typescript
// React Query automatic retry
retry: 3,
retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)

// UI fallback
if (isError) {
  return <ErrorMessage onRetry={refetch} />;
}
```

### Server-side (VN Gold)

```typescript
// Edge Function error handling
try {
  const data = await fetchVNGold();
  await supabase.insert(data);
} catch (error) {
  console.error(error);
  // Continue with other APIs (don't fail entire request)
}
```

## 📝 Best Practices

1. **Always check CORS** before choosing client vs server
2. **Protect API keys** - Never expose in client code
3. **Use database caching** for expensive API calls
4. **Implement retry logic** for network failures
5. **Monitor API usage** to avoid rate limits
6. **Add loading states** for better UX
7. **Cache aggressively** but refresh appropriately

## 🔮 Future Improvements

1. **WebSocket for World Gold**: Real-time updates instead of polling
2. **Service Worker**: Offline support with cached data
3. **GraphQL Layer**: Unify all data fetching
4. **Redis Caching**: Faster than PostgreSQL for hot data
5. **CDN Edge Cache**: Serve static price data from CDN

## 📚 Related Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - API keys configuration
- [TEST_EDGE_FUNCTIONS.md](./TEST_EDGE_FUNCTIONS.md) - Testing guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

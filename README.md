# FinTrack - Ứng dụng theo dõi giá vàng

Ứng dụng theo dõi giá vàng Việt Nam và thế giới, thiết kế mobile-first, dễ sử dụng cho người Việt.

## Tính năng

### 1. Giá vàng thế giới (XAU/USD)
- Hiển thị giá real-time từ GoldAPI.io
- % thay đổi trong ngày
- Giá cao/thấp 24h
- Thời gian cập nhật

### 2. Giá vàng Việt Nam
- Vàng SJC
- Nhẫn 9999
- Giá mua/bán từ nhiều nguồn (SJC, DOJI, PNJ)
- Dữ liệu từ VNAppMob API

### 3. So sánh giá
- Quy đổi giá thế giới sang VNĐ/lượng
- So sánh với giá VN
- Hiển thị chênh lệch %

### 4. Biểu đồ giá
- Trong ngày, 7 ngày, 1 tháng, 3 tháng, 1 năm
- Màu xanh (tăng) / đỏ (giảm)

### 5. Công cụ quy đổi
- USD/oz ↔ VNĐ/lượng
- Hiển thị công thức quy đổi

### 6. Cảnh báo giá
- Đặt cảnh báo khi giá vượt/dưới mức
- Lưu trữ trong LocalStorage

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     External APIs                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GoldAPI.io  │  │  VNAppMob   │  │ ExchangeRate-API    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Edge Functions (Cron)                   │    │
│  │  • fetch-world-gold (GoldAPI.io)                    │    │
│  │  • fetch-vn-gold (VNAppMob)                         │    │
│  │  • fetch-all-prices (Combined)                      │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                     │    │
│  │  • world_gold_prices                                │    │
│  │  • vn_gold_prices                                   │    │
│  │  • exchange_rates                                   │    │
│  │  • world_gold_history                               │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Client                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Supabase Client                         │    │
│  │  • Query cached data from database                  │    │
│  │  • No direct API calls to external services         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Công nghệ

- **React 18** + **TypeScript**
- **TailwindCSS** - Styling
- **TanStack Query** - Data fetching & caching
- **Supabase** - Backend (Database + Edge Functions)
- **Recharts** - Biểu đồ
- **Vite** - Build tool
- **Lucide React** - Icons

## Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd FinTrack

# Cài đặt dependencies
npm install

# Cấu hình environment variables
# Xem docs/ENV_SETUP.md để biết chi tiết

# Chạy development server
npm run dev

# Build production
npm run build
```

## Cấu hình Supabase

### 1. Tạo Project
1. Đăng ký tại [supabase.com](https://supabase.com)
2. Tạo project mới, chọn region Singapore
3. Lấy `SUPABASE_URL` và `SUPABASE_ANON_KEY`

### 2. Tạo Database
Chạy SQL trong file `supabase/schema.sql` trong SQL Editor của Supabase.

### 3. Deploy Edge Functions
```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Login và link project
supabase login
supabase link --project-ref your-project-id

# Set secrets
supabase secrets set GOLD_API_KEY=your-goldapi-key
supabase secrets set VN_GOLD_API_KEY=your-vnappmob-key

# Deploy functions
supabase functions deploy fetch-world-gold
supabase functions deploy fetch-vn-gold
supabase functions deploy fetch-all-prices
```

### 4. Cấu hình Cron Job
Trong Supabase Dashboard > Database > Extensions, enable `pg_cron` và `pg_net`.

Sau đó chạy SQL:
```sql
SELECT cron.schedule(
  'fetch-gold-prices',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/fetch-all-prices',
    headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
  )$$
);
```

## Cấu trúc thư mục

```
├── src/
│   ├── components/
│   │   ├── common/       # Button, Card, Loading...
│   │   ├── price/        # WorldGoldCard, VNGoldCard...
│   │   ├── chart/        # PriceChart
│   │   ├── alert/        # AlertForm, AlertList
│   │   └── layout/       # Header, BottomNav, Layout
│   ├── hooks/            # Custom hooks với TanStack Query
│   ├── lib/              # Supabase client, database types
│   ├── services/
│   │   ├── api/          # API calls (query từ Supabase)
│   │   └── utils/        # Formatters, converters
│   ├── types/            # TypeScript interfaces
│   └── pages/            # Home, Charts, Converter, Alerts
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── fetch-world-gold/
│   │   ├── fetch-vn-gold/
│   │   └── fetch-all-prices/
│   └── schema.sql        # Database schema
└── docs/
    └── ENV_SETUP.md      # Environment setup guide
```

## API Sources

### Giá vàng thế giới
- **GoldAPI.io**: https://www.goldapi.io
- Free plan: 100 requests/tháng
- Endpoint: `GET /api/XAU/USD`

### Giá vàng Việt Nam
- **VNAppMob**: https://vapi.vnappmob.com
- Đăng ký: https://vapi.vnappmob.com/api/request_api_key?scope=gold
- Key hết hạn sau 15 ngày
- Endpoints: `/api/v2/gold/sjc`, `/api/v2/gold/doji`, `/api/v2/gold/pnj`

### Tỷ giá
- **ExchangeRate-API**: https://api.exchangerate-api.com/v4/latest/USD
- Free, không cần API key

## Công thức quy đổi

```
Giá VNĐ/lượng = (XAU/USD × Tỷ giá USD/VND × 37.5) ÷ 31.1035
```

- 1 lượng = 37.5 gram
- 1 troy oz = 31.1035 gram

## Fallback

Khi Supabase chưa được cấu hình hoặc API lỗi, ứng dụng sẽ tự động sử dụng mock data để đảm bảo trải nghiệm người dùng.

## License

MIT

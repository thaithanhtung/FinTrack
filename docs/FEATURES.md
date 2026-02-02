# Tài liệu Tính năng - FinTrack

## 📱 Tổng quan

FinTrack là ứng dụng theo dõi giá vàng toàn diện, thiết kế mobile-first, dễ sử dụng cho người Việt Nam.

---

## 🎯 Tính năng chính

### 1. 📊 Hiển thị Giá Vàng Real-time

#### Giá vàng thế giới (XAU/USD)
- **Nguồn dữ liệu**: Gold-API.com (miễn phí, không giới hạn)
- **Cập nhật**: Mỗi 5 phút qua Supabase Edge Functions
- **Hiển thị**:
  - Giá hiện tại (USD/oz)
  - % thay đổi trong ngày
  - Giá cao/thấp 24h
  - Thời gian cập nhật gần nhất
- **Màu sắc**: 
  - Xanh lá = Tăng giá
  - Đỏ = Giảm giá

#### Giá vàng Việt Nam
- **Nguồn dữ liệu**: VNAppMob API
- **Loại vàng**:
  - Vàng SJC (SJC, DOJI, PNJ)
  - Nhẫn 9999 (SJC, DOJI, PNJ)
- **Hiển thị**:
  - Giá mua/bán
  - Chênh lệch (spread)
  - Region filter (HN, HCM, DN)
  - So sánh giữa các nguồn

---

### 2. 🔄 So sánh & Quy đổi Giá

#### So sánh giá thế giới vs Việt Nam
- Tự động quy đổi XAU/USD sang VNĐ/lượng
- Hiển thị chênh lệch % giữa giá thế giới và VN
- Công thức: `(XAU/USD × USD/VND × 37.5) ÷ 31.1035`

#### Spread Calculator
- Tính lỗ/lãi nếu mua rồi bán ngay
- Hiển thị % spread giữa giá mua/bán

#### Công cụ quy đổi
- USD/oz ↔ VNĐ/lượng
- USD/oz ↔ VNĐ/gram
- Tự động cập nhật tỷ giá USD/VND

---

### 3. 📈 Biểu đồ & Phân tích Giá

#### Biểu đồ lịch sử
- **Khoảng thời gian**: 1 ngày, 7 ngày, 1 tháng, 3 tháng, 6 tháng, 1 năm
- **Loại biểu đồ**: Line chart với Recharts
- **Tính năng**:
  - Zoom in/out
  - Tooltip hiển thị chi tiết
  - Responsive trên mọi màn hình

#### So sánh theo ngày
- Chọn 2 ngày bất kỳ để so sánh
- Hiển thị % thay đổi
- Biểu đồ cột so sánh trực quan
- Bảng chi tiết giá theo từng loại vàng

---

### 4. 📊 Phân tích Thống kê

#### Statistics Dashboard
- **Metrics**:
  - Giá trung bình (Average)
  - Giá cao nhất (High)
  - Giá thấp nhất (Low)
  - Độ biến động (Volatility)
- **Period filter**: Tuần, tháng, 3 tháng, 6 tháng, năm
- **Price Direction**: Số ngày tăng/giảm/không đổi

#### Trend Analysis
- **Xu hướng giá**: Uptrend/Downtrend/Sideways
- **Độ mạnh**: Strong/Moderate/Weak
- **Moving Averages**:
  - SMA 7 ngày
  - SMA 30 ngày
- **Support/Resistance levels**
- **Dự đoán xu hướng**: Bullish/Bearish/Neutral

#### Volatility Report
- Biểu đồ độ biến động theo thời gian
- Phân loại: Low/Moderate/High/Very High
- Insight về rủi ro đầu tư

---

### 5. 📜 Lịch sử Giá

#### Price History Table
- **Dữ liệu**: Lưu trữ trong `vn_gold_history` và `world_gold_history`
- **Filter**:
  - Khoảng thời gian (Start/End date)
  - Loại (World/VN)
  - Loại vàng (SJC/9999)
  - Thương hiệu (SJC/DOJI/PNJ)
- **Export**: 
  - CSV format
  - Sẵn sàng cho Excel/Google Sheets

---

### 6. 🤖 AI Chatbot & Analysis

#### AI Market Analysis
- **Model**: OpenAI GPT-3.5-turbo
- **Tự động phân tích**:
  - Xu hướng thị trường
  - Các yếu tố ảnh hưởng (USD, lãi suất, địa chính trị)
  - Khuyến nghị: Buy/Hold/Sell
  - Confidence score
- **Cache**: 30 phút để tiết kiệm chi phí API

#### AI Chatbot
- **Tính năng**:
  - Trả lời câu hỏi về giá vàng
  - Giải thích xu hướng
  - Tư vấn mua/bán
  - Phân tích yếu tố kinh tế
- **UI**: Floating button + Modal
- **Lịch sử chat**: Lưu trong session

---

### 7. 🔔 Cảnh báo Giá (Price Alerts)

#### Tạo Alert
- **Điều kiện**:
  - Giá vượt ngưỡng (above)
  - Giá giảm xuống (below)
- **Loại vàng**: World gold hoặc VN gold cụ thể
- **Lưu trữ**: LocalStorage (client-side)

#### Quản lý Alert
- Danh sách alerts
- Bật/tắt alert
- Xóa alert
- Hiển thị trạng thái: Active/Triggered

---

### 8. 🎨 Giao diện & UX

#### Dark/Light Mode
- Toggle trong Settings
- Auto-save preference với Zustand
- Áp dụng cho toàn bộ app
- Smooth transition

#### Multi-language (i18n)
- **Ngôn ngữ**: Tiếng Việt, English
- **Tự động phát hiện**: Browser language
- **Lưu preference**: Zustand persist
- **Coverage**: 100% UI text

#### Responsive Design
- **Mobile-first**: 375px+
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Navigation**: Bottom nav (mobile), Sidebar (desktop)

#### Loading States
- **Skeleton loading**: Realistic placeholder
- **Smooth animations**: Fade-in, slide-in, scale
- **Error handling**: User-friendly messages

---

### 9. ⚙️ Settings

#### User Preferences
- Theme selection (Light/Dark/System)
- Language selection (Vi/En)
- Notification preferences (coming soon)
- Data refresh interval (coming soon)

---

## 🔧 Công nghệ & Kiến trúc

### Frontend Stack
- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Navigation
- **Recharts** - Charting
- **i18next** - Internationalization

### Backend Stack
- **Supabase**:
  - PostgreSQL Database
  - Edge Functions (Deno)
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Cron Jobs**: `pg_cron` extension
- **APIs**: Gold-API.com, VNAppMob, ExchangeRate-API, OpenAI

### Data Flow
```
External APIs → Supabase Edge Functions → PostgreSQL Database → React App
     ↓                    ↓                        ↓                ↓
GoldAPI.io       fetch-world-gold          world_gold_prices    useWorldGold
VNAppMob         fetch-vn-gold             vn_gold_prices       useVNGold  
ExchangeRate     fetch-all-prices          exchange_rates       useExchangeRate
OpenAI           ai-analysis               ai_analysis_cache    useAIAnalysis
```

---

## 📊 Database Schema

### Tables

#### `world_gold_prices`
```sql
- id (UUID)
- price (DECIMAL)
- high_24h (DECIMAL)
- low_24h (DECIMAL)
- change_24h (DECIMAL)
- change_percent (DECIMAL)
- currency (VARCHAR) - 'USD'
- source (VARCHAR) - 'Gold-API'
- created_at (TIMESTAMPTZ)
```

#### `vn_gold_prices`
```sql
- id (UUID)
- gold_type (VARCHAR) - 'sjc' | 'nhan_9999'
- brand (VARCHAR) - 'sjc' | 'doji' | 'pnj'
- buy_price (BIGINT)
- sell_price (BIGINT)
- region (VARCHAR) - 'HN' | 'HCM' | 'DN'
- source (VARCHAR)
- created_at (TIMESTAMPTZ)
```

#### `vn_gold_history`
```sql
- id (UUID)
- gold_type (VARCHAR)
- brand (VARCHAR)
- buy_price (BIGINT)
- sell_price (BIGINT)
- region (VARCHAR)
- source (VARCHAR)
- created_at (TIMESTAMPTZ)
```

#### `exchange_rates`
```sql
- id (UUID)
- base_currency (VARCHAR) - 'USD'
- target_currency (VARCHAR) - 'VND'
- rate (DECIMAL)
- source (VARCHAR)
- created_at (TIMESTAMPTZ)
```

#### `ai_analysis_cache`
```sql
- id (UUID)
- analysis_type (VARCHAR)
- content (TEXT)
- recommendation (VARCHAR) - 'buy' | 'hold' | 'sell'
- confidence (INTEGER) - 0-100
- price_snapshot (JSONB)
- created_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
```

### RPC Functions

#### Statistics
- `get_average_price(start, end, type)`
- `get_price_range(start, end, type)`
- `calculate_volatility(start, end, type)`
- `count_price_direction(start, end, type)`
- `get_price_statistics(start, end, type)`

---

## 🚀 Performance

### Optimizations
- **Data Caching**: TanStack Query với staleTime 5 phút
- **AI Cache**: 30 phút cache cho AI analysis
- **Image Optimization**: SVG icons (Lucide React)
- **Code Splitting**: React.lazy cho routes
- **Memoization**: useMemo, useCallback cho expensive operations

### Metrics
- **First Load**: < 2s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)

---

## 🔐 Security

### Frontend
- Environment variables cho sensitive keys
- Input validation với TypeScript
- XSS protection với React's built-in escaping

### Backend
- **Row Level Security (RLS)** cho tất cả tables
- **API secrets** lưu trong Supabase Vault
- **CORS configuration** trong Edge Functions
- **Rate limiting** (planned)

---

## 🧪 Testing (Planned)

### Unit Tests
- Custom hooks
- Utility functions
- Type safety

### Integration Tests
- API calls
- Database queries
- State management

### E2E Tests
- Critical user flows
- Cross-browser testing

---

## 📱 PWA Support (Coming Soon)

### Features
- **Installable**: Thêm icon vào home screen
- **Offline mode**: Service Worker caching
- **Push notifications**: Alert khi giá đạt ngưỡng
- **Background sync**: Cập nhật data khi offline

---

## 🌐 Deployment

### Recommended Platforms
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Supabase (đã setup)
- **Domain**: Custom domain support

### Environment
- **Production**: `.env.production`
- **Staging**: `.env.staging`
- **Development**: `.env.local`

---

## 📝 Roadmap

### Phase 1 ✅ (Completed)
- [x] Giá vàng real-time
- [x] Biểu đồ giá
- [x] So sánh & quy đổi
- [x] Cảnh báo giá
- [x] Dark/Light mode
- [x] Multi-language
- [x] AI Analysis & Chatbot
- [x] Statistics & Analytics
- [x] Price History

### Phase 2 🚧 (In Progress)
- [ ] PWA support
- [ ] Push notifications
- [ ] Offline mode
- [ ] Performance optimization

### Phase 3 📅 (Planned)
- [ ] User accounts & sync
- [ ] Portfolio tracking
- [ ] Price predictions ML model
- [ ] Social features (share insights)
- [ ] News integration
- [ ] Advanced charting (candlestick, indicators)

### Phase 4 🔮 (Future)
- [ ] Thêm bạc (Silver tracking)
- [ ] Thêm cổ phiếu (Stock tracking)
- [ ] Crypto tracking
- [ ] Multi-currency support

---

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details.

## 📄 License

MIT License - see LICENSE file for details.

## 💬 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@fintrack.vn (planned)

---

**Cập nhật lần cuối**: 1 tháng 2, 2026

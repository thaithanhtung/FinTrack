# Changelog

Tất cả các thay đổi quan trọng của dự án FinTrack sẽ được ghi lại ở đây.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và dự án tuân theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- PWA support (installable app)
- Push notifications cho price alerts
- Offline mode với Service Worker
- Error Boundary component
- User authentication & sync

---

## [1.0.0] - 2026-02-01

### Added - Core Features

#### Giá vàng Real-time
- Hiển thị giá vàng thế giới (XAU/USD) từ Gold-API.com
- Hiển thị giá vàng Việt Nam (SJC, Nhẫn 9999) từ VNAppMob
- Auto-refresh mỗi 5 phút qua Supabase Edge Functions
- High/Low 24h và % change

#### Biểu đồ & Phân tích
- Biểu đồ giá lịch sử với Recharts (1D, 7D, 1M, 3M, 6M, 1Y)
- Price comparison giữa 2 ngày bất kỳ
- Trend analysis với SMA 7/30 ngày
- Volatility analysis và classification
- Statistics dashboard (Average, High, Low, Volatility)

#### AI Features
- AI Market Analysis với OpenAI GPT-3.5-turbo
- AI Chatbot để tư vấn và trả lời câu hỏi
- Auto-generated insights về xu hướng thị trường
- Buy/Hold/Sell recommendations với confidence score
- 30 phút cache để tiết kiệm chi phí API

#### Price History
- Lưu trữ lịch sử giá trong database
- Filter theo date range, type, gold type, brand
- Export to CSV
- Responsive table với pagination (planned)

#### So sánh & Quy đổi
- So sánh giá thế giới vs Việt Nam
- Spread calculator (mua/bán)
- Currency converter (USD/oz ↔ VNĐ/lượng)
- Auto-update tỷ giá USD/VND

#### Price Alerts
- Tạo alerts cho giá vượt/dưới ngưỡng
- LocalStorage persistence
- Manage alerts (bật/tắt/xóa)
- Visual indicators

#### Giao diện & UX
- Dark/Light mode với smooth transition
- Multi-language support (Tiếng Việt, English)
- Responsive design (mobile-first)
- Skeleton loading states
- Smooth animations (fade-in, slide-in, scale)
- Bottom navigation (mobile) + Header (desktop)

#### Backend & Database
- Supabase PostgreSQL database
- Row Level Security (RLS) policies
- Edge Functions (Deno) cho data fetching
- Cron jobs với pg_cron
- Optimized queries với indexes

### Technical Stack
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- TanStack Query (server state)
- Zustand (client state)
- React Router v6
- Recharts (charts)
- i18next (i18n)
- Supabase (backend)

---

## [0.3.0] - 2026-01-28

### Added
- Statistics Dashboard với metrics chi tiết
- Trend Analysis với SMA indicators
- Volatility Report và classification
- Price History page với export CSV
- Date Comparison tool
- Enhanced Error Messages

### Changed
- Improved chart performance
- Optimized database queries
- Better responsive design cho tables
- Updated translations (Vi/En)

### Fixed
- Import path issues trong useStatistics hook
- Chart rendering trên mobile
- Dark mode contrast issues

---

## [0.2.0] - 2026-01-25

### Added
- AI Chatbot với floating button
- AI Market Analysis với auto-refresh
- OpenAI integration
- AI Analysis caching (30 min)
- Chat history trong session

### Changed
- Moved AI features to separate components
- Improved AI response formatting
- Better error handling cho AI calls

---

## [0.1.0] - 2026-01-20

### Added
- Dark/Light mode toggle
- Multi-language support (Vi/En)
- i18next configuration
- Zustand stores cho theme & language
- Settings page
- Smooth theme transitions
- Language auto-detection

### Changed
- Updated all components với i18n
- Applied dark mode classes to all UI
- Improved component structure

---

## [0.0.5] - 2026-01-15

### Added
- Skeleton loading components
- CSS animations (fade-in, slide-in, scale, shimmer)
- Loading states cho tất cả data fetching
- Smooth page transitions

### Changed
- Replaced Loading spinner với Skeleton
- Improved UX during data loading
- Better visual feedback

---

## [0.0.4] - 2026-01-12

### Added
- Price Alerts feature
- AlertForm component
- AlertList component
- LocalStorage persistence
- Alerts page trong navigation

### Fixed
- Alert triggering logic
- LocalStorage sync issues

---

## [0.0.3] - 2026-01-10

### Added
- Price Charts với Recharts
- Multiple timeframes (1D-1Y)
- Price Comparison component
- Spread Calculator
- Converter tool

### Changed
- Improved chart colors
- Better responsive charts
- Optimized chart rendering

---

## [0.0.2] - 2026-01-08

### Added
- Supabase integration
- Database schema
- Edge Functions (fetch-world-gold, fetch-vn-gold, fetch-all-prices)
- TanStack Query setup
- Custom hooks (useWorldGold, useVNGold, useExchangeRate)

### Changed
- Migrated từ direct API calls sang Supabase
- Data caching với TanStack Query
- Better error handling

---

## [0.0.1] - 2026-01-05

### Added - Initial Release
- Project setup với Vite + React + TypeScript
- TailwindCSS configuration
- Basic components (Button, Card, Loading, ErrorMessage)
- Layout structure (Header, BottomNav, Layout)
- WorldGoldCard component
- VNGoldCard component
- Home page
- Basic routing với React Router

### Technical
- TypeScript strict mode
- ESLint configuration
- Vite build setup
- Path aliases (@/ for src/)

---

## Versioning

Format: `[MAJOR.MINOR.PATCH]`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## Links

- [GitHub Repository](https://github.com/yourusername/fintrack)
- [Live Demo](https://fintrack.vercel.app) (planned)
- [Documentation](./docs/FEATURES.md)

---

**Maintained by**: FinTrack Team  
**Last Updated**: 2026-02-01

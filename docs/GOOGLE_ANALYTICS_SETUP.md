# Google Analytics Setup Guide

## Tổng quan

Dự án FinTrack đã được tích hợp Google Analytics 4 (GA4) để theo dõi user behavior và app performance.

## 🚀 Các bước Setup

### Bước 1: Tạo Google Analytics Property

1. Truy cập [Google Analytics](https://analytics.google.com/)
2. Đăng nhập với Google Account
3. Click **Admin** (⚙️) ở góc dưới bên trái
4. Trong cột **Account**, chọn account hoặc tạo mới
5. Click **Create Property**
6. Nhập thông tin:
   - **Property name**: FinTrack
   - **Reporting time zone**: (GMT+07:00) Bangkok, Hanoi, Jakarta
   - **Currency**: Vietnamese dong (₫)
7. Click **Next** → Chọn industry category và business size
8. Click **Create** và chấp nhận Terms of Service

### Bước 2: Tạo Web Data Stream

1. Sau khi tạo property, bạn sẽ thấy màn hình "Choose a platform"
2. Click **Web**
3. Nhập thông tin:
   - **Website URL**: `https://yourdomain.com` (production) hoặc `http://localhost:5173` (development)
   - **Stream name**: FinTrack Web
4. Click **Create stream**

### Bước 3: Lấy Measurement ID

Sau khi tạo stream, bạn sẽ thấy:

```
Measurement ID: G-XXXXXXXXXX
```

**Copy Measurement ID này!**

### Bước 4: Thêm vào Environment Variables

1. Mở file `.env.local` trong project root
2. Thêm hoặc cập nhật dòng:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Replace `G-XXXXXXXXXX` bằng Measurement ID thực của bạn

### Bước 5: Restart Dev Server

```bash
# Stop server hiện tại (Ctrl+C)
# Restart server
npm run dev
```

## ✅ Verify Integration

### Check Console Log

Khi app khởi động, bạn sẽ thấy log:

```
✅ Google Analytics initialized
```

Nếu không có Measurement ID:

```
⚠️ GA_MEASUREMENT_ID not found. Analytics disabled.
```

### Test trong GA Real-time

1. Vào Google Analytics Dashboard
2. Click **Reports** → **Realtime**
3. Mở app trong browser
4. Navigate qua các pages
5. Bạn sẽ thấy real-time users và events trong dashboard

## 📊 Events được Track

### Automatic Events

- **Page Views**: Tự động track mỗi khi route thay đổi
- **First Visit**: Track lần đầu user visit
- **Session Start**: Track session mới

### Custom Events

**User Authentication:**
- `login` - User đăng nhập
- `register` - User đăng ký
- `logout` - User đăng xuất

**Alert Actions:**
- `create_alert` - Tạo alert mới
- `delete_alert` - Xóa alert
- `toggle_alert` - Bật/tắt alert

**Telegram Integration:**
- `link_telegram` - Liên kết Telegram
- `unlink_telegram` - Gỡ liên kết Telegram

**Settings:**
- `change_theme` - Đổi theme (dark/light)
- `change_language` - Đổi ngôn ngữ (vi/en)

**Data Interactions:**
- `refresh_data` - Refresh giá vàng
- `export_data` - Export data

**Price Comparisons:**
- `view_comparison` - Xem so sánh giá
- `calculate_spread` - Tính chênh lệch

**Charts & Statistics:**
- `view_chart` - Xem biểu đồ
- `change_time_range` - Đổi khoảng thời gian

**Converter:**
- `convert_currency` - Quy đổi tiền tệ

## 🎯 Custom Tracking Examples

Bạn có thể thêm custom tracking vào bất kỳ component nào:

```tsx
import { analytics } from '@/lib/analytics'

// Track button click
const handleClick = () => {
  analytics.trackEvent('Button', 'Click', 'Premium Upgrade')
}

// Track form submission
const handleSubmit = () => {
  analytics.trackEvent('Form', 'Submit', 'Contact Form')
}

// Track specific user action
const handlePurchase = () => {
  analytics.trackEvent('Ecommerce', 'Purchase', 'Gold Alert Premium', 99)
}
```

## 🔧 Configuration

### Disable Analytics in Development

Nếu bạn không muốn track trong development:

```tsx
// src/lib/analytics.ts
const GA_MEASUREMENT_ID = 
  import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_GA_MEASUREMENT_ID 
    : undefined
```

### GDPR Compliance

Analytics đã được config với:

```tsx
gaOptions: {
  anonymizeIp: true, // Anonymize IP addresses
}
```

Nếu cần cookie consent, thêm:

```tsx
ReactGA.initialize(GA_MEASUREMENT_ID, {
  gaOptions: {
    anonymizeIp: true,
    cookieFlags: 'SameSite=None;Secure',
  },
  gtagOptions: {
    anonymize_ip: true,
  },
})
```

## 📈 Viewing Reports

### Real-time Reports

**Reports** → **Realtime**
- Active users now
- Views per minute
- Top events
- User locations

### Engagement Reports

**Reports** → **Engagement**
- Page views and screens
- Events
- Conversions

### User Reports

**Reports** → **User**
- User demographics
- Tech (browser, device, OS)
- Locations

### Custom Reports

Tạo custom reports trong **Explore** section.

## 🐛 Troubleshooting

### Events không hiển thị

**Kiểm tra:**
1. Measurement ID đúng chưa?
2. Dev server đã restart sau khi thêm env?
3. Ad blocker có đang chặn GA không?
4. Check browser console có errors không?

**Test:**
```tsx
// Thêm vào component
useEffect(() => {
  console.log('GA Measurement ID:', import.meta.env.VITE_GA_MEASUREMENT_ID)
}, [])
```

### Real-time không cập nhật

- Real-time data có thể delay 1-2 phút
- Refresh GA dashboard
- Đảm bảo bạn đang test trên đúng property

### Development vs Production

**Development:**
```env
# .env.local
VITE_GA_MEASUREMENT_ID=G-DEV123456
```

**Production:**
```env
# Set in hosting platform (Vercel, Netlify, etc.)
VITE_GA_MEASUREMENT_ID=G-PROD123456
```

## 🔐 Security Best Practices

1. **Never commit** `.env.local` to git
2. Use different Measurement IDs for dev/prod
3. Enable IP anonymization (đã config)
4. Set up data retention policies in GA
5. Exclude internal traffic (GA settings)

## 📚 Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [react-ga4 Package](https://github.com/codler/react-ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)

## 🎉 You're Done!

Analytics is now tracking:
- ✅ All page views
- ✅ User authentication
- ✅ Alert management
- ✅ Settings changes
- ✅ Data interactions
- ✅ And more...

View your data at: https://analytics.google.com/

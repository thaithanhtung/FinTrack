# 📊 Instant Gold Price Report Feature

## Tổng quan

Feature **Gửi báo cáo ngay** cho phép người dùng nhận báo cáo giá vàng **thực tế ngay lập tức** qua Telegram, thay vì chỉ test message.

## 🎯 Chức năng

### Button "Gửi báo cáo ngay"
- **Vị trí**: Trong card "Thông tin báo cáo" (sau khi đã lưu Chat ID)
- **Chức năng**: Gửi báo cáo giá vàng với dữ liệu thực tế hiện tại
- **Icon**: ⚡ Zap
- **Màu**: Gradient vàng (gold-500 → gold-600)
- **Text**: "Gửi báo cáo ngay"

### Nội dung báo cáo

Báo cáo bao gồm:
- 📊 Tiêu đề và thời gian hiện tại (Vietnam timezone)
- 🌍 Giá vàng thế giới (XAU/USD)
  - Giá hiện tại
  - Thay đổi (số tiền và %)
  - Cao/Thấp nhất 24h
  - Quy đổi sang VND/lượng
- 🇻🇳 Giá vàng Việt Nam
  - Vàng SJC (mua/bán)
  - Vàng Nhẫn 9999 (mua/bán)
- 💡 Phân tích xu hướng
- 📱 Branding

## 🔧 Cài đặt

### 1. Deploy Edge Function

```bash
# Deploy function mới
supabase functions deploy send-instant-report --no-verify-jwt
```

### 2. Cấu hình Environment Variables

Function này sử dụng các biến môi trường:
- `TELEGRAM_BOT_TOKEN` (required)
- `SUPABASE_URL` (auto)
- `SUPABASE_SERVICE_ROLE_KEY` (auto)

### 3. Test Function

```bash
# Test với curl
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-instant-report' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{"userId": "YOUR_USER_ID"}'
```

## 📁 Files Changed

### New Files
- `supabase/functions/send-instant-report/index.ts` - Edge Function gửi báo cáo

### Modified Files
- `src/pages/DailyReport.tsx`:
  - Added `sendInstantReportMutation`
  - Updated button trong card "Thông tin báo cáo"
  - Enhanced error handling

## 🎨 UI/UX

### Button Design
```tsx
<Button
  onClick={() => sendInstantReportMutation.mutate()}
  isLoading={sendInstantReportMutation.isPending}
  disabled={!profile?.telegramChatId}
  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 border-0 text-white"
>
  <Zap size={18} />
  Gửi báo cáo ngay
</Button>
```

### States
1. **Normal**: Màu vàng gradient, ready to click
2. **Loading**: Spinner, disabled
3. **Success**: Green alert "✅ Đã gửi báo cáo giá vàng!"
4. **Error**: Red alert với message cụ thể

## ⚡ Flow

```mermaid
graph TD
    A[User clicks "Gửi báo cáo ngay"] --> B{Có Chat ID?}
    B -->|No| C[Show error: Chưa cấu hình Chat ID]
    B -->|Yes| D[Call send-instant-report function]
    D --> E{Function success?}
    E -->|No| F[Show error message]
    E -->|Yes| G[Fetch real-time gold prices]
    G --> H[Generate report with current data]
    H --> I[Send to Telegram]
    I --> J[Show success: Kiểm tra Telegram]
```

## 🔍 Error Handling

### Common Errors
1. **TELEGRAM_BOT_TOKEN not configured**
   - Message: "❌ Bot chưa được cấu hình. Vui lòng liên hệ admin."
   - Action: Contact admin to set up bot token

2. **Chat ID invalid**
   - Message: "❌ Chat ID không hợp lệ. Vui lòng nhắn /start cho bot trước."
   - Action: User should message `/start` to bot first

3. **Bot was blocked**
   - Message: "❌ Bot đã bị chặn. Vui lòng bỏ chặn bot và thử lại."
   - Action: User should unblock bot in Telegram

4. **Telegram Chat ID not configured**
   - Message: "❌ Chưa cấu hình Telegram Chat ID."
   - Action: User should save Chat ID first

5. **Function not found**
   - Message: "❌ Tính năng gửi báo cáo chưa sẵn sàng. Vui lòng thử lại sau."
   - Action: Deploy the function

## 🆚 So sánh với Test Button

| Feature | Test Button | Instant Report Button |
|---------|-------------|----------------------|
| **Vị trí** | Telegram Setup (Chat ID input) | Thông tin báo cáo |
| **Chức năng** | Test message đơn giản | Báo cáo giá vàng thực tế |
| **Dữ liệu** | Static test message | Real-time gold prices |
| **Use case** | Kiểm tra Chat ID hợp lệ | Nhận báo cáo ngay |
| **Màu sắc** | Purple | Gold gradient |

## 📝 Usage Example

### Frontend
```tsx
// In DailyReport.tsx
const sendInstantReportMutation = useMutation({
  mutationFn: async () => {
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase.functions.invoke("send-instant-report", {
      body: { userId: user.id },
    });
    
    if (error || !data.success) {
      throw new Error(data?.error || "Gửi báo cáo thất bại");
    }
    
    return data;
  },
  onSuccess: () => {
    setTestResult({
      type: "success",
      message: "✅ Đã gửi báo cáo giá vàng! Kiểm tra Telegram của bạn.",
    });
  },
});
```

### Backend (Edge Function)
```typescript
// Send instant report
const report = await generateReport(supabase);
await sendTelegramMessage(telegramBotToken, chatId, report);
```

## 🚀 Deployment Checklist

- [x] Create `send-instant-report` Edge Function
- [x] Update `DailyReport.tsx` with new mutation
- [x] Update button UI in "Thông tin báo cáo" card
- [ ] Deploy Edge Function to Supabase
- [ ] Test with real Telegram bot
- [ ] Verify error handling
- [ ] Update user documentation

## 💡 Future Enhancements

1. **Schedule options**: Cho phép schedule report cho thời gian cụ thể
2. **Custom report**: Cho phép user chọn loại vàng muốn nhận
3. **Report history**: Lưu lịch sử các báo cáo đã gửi
4. **Multiple recipients**: Gửi đến nhiều Chat ID
5. **Report templates**: Nhiều mẫu báo cáo khác nhau

## 📚 Related Documentation

- [Daily Gold Report Setup](./DAILY_GOLD_REPORT.md)
- [Telegram Test Feature](./TEST_TELEGRAM_FEATURE.md)
- [Authentication Setup](./AUTHENTICATION_SETUP.md)

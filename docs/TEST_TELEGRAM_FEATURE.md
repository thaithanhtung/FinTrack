# Test Telegram Feature - Setup Guide

## 📋 Tổng quan

Đã thêm button **"Test"** để users có thể kiểm tra Chat ID Telegram ngay lập tức trước khi lưu.

## ✨ Features

### 1. **Test Button**
- 🔘 Button màu tím nằm giữa input và button "Lưu"
- ⚡ Icon: Zap (chớp)
- 🎯 Gửi tin nhắn test đến Telegram ngay lập tức

### 2. **Test Message**
Khi click Test, user sẽ nhận message:

```
🧪 TEST THÔNG BÁO - FinTrack

✅ Kết nối thành công!

Chat ID của bạn đã được xác nhận: `123456789`

Bạn sẽ nhận được báo cáo giá vàng hàng ngày tại đây.

📱 Cảm ơn bạn đã sử dụng FinTrack Gold App!
```

### 3. **Feedback Messages**

**Success:**
```
✅ Gửi tin nhắn thử thành công! Kiểm tra Telegram của bạn.
```

**Error Cases:**
- **Chat ID trống**: "Vui lòng nhập Chat ID trước khi test"
- **Chat không tồn tại**: "Chat ID không hợp lệ. Vui lòng kiểm tra lại hoặc nhắn /start cho bot trước."
- **Bot bị block**: "Bot đã bị block. Vui lòng bỏ block bot và thử lại."

## 🆕 Files Created/Modified

### 1. **New Edge Function: `/supabase/functions/test-telegram/index.ts`**
```typescript
// Lightweight function to send test message
// Input: { chatId: string }
// Output: { success: boolean, message: string }
```

### 2. **Updated: `/src/pages/DailyReport.tsx`**
- ✅ Added `testTelegramMutation`
- ✅ Added `handleTestTelegram()`
- ✅ Added Test button
- ✅ Added test result state & UI

## 🚀 Deployment

### Step 1: Deploy Edge Function

```bash
cd /Users/tungthai/Desktop/FinTrack

# Deploy test-telegram function
supabase functions deploy test-telegram --no-verify-jwt

# Verify deployment
supabase functions list
```

**Expected output:**
```
test-telegram (deployed)
daily-gold-report (deployed)
```

### Step 2: Verify TELEGRAM_BOT_TOKEN

Edge function cần `TELEGRAM_BOT_TOKEN`. Nếu chưa set:

```bash
# Set secret
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here

# Verify
supabase secrets list
```

### Step 3: Test UI

```bash
# App đang chạy
npm run dev

# Navigate to:
http://localhost:5173/daily-report
```

## 🧪 Testing Flow

### User Flow:

1. **Mở page** `/daily-report`
2. **Nhập Chat ID** vào input (VD: `123456789`)
3. **Click "Test"** button
4. **Chờ** loading spinner
5. **Kết quả**:
   - ✅ **Success**: Hiển thị message xanh, check Telegram
   - ❌ **Error**: Hiển thị message đỏ với lý do

### Test Cases:

#### ✅ Test Case 1: Valid Chat ID
```
Input: Valid Chat ID from @userinfobot
Expected: 
  - ✅ Green success message
  - 📱 Message appears in Telegram
```

#### ❌ Test Case 2: Invalid Chat ID
```
Input: "999999999" (không tồn tại)
Expected:
  - ❌ Red error message
  - Message: "Chat ID không hợp lệ..."
```

#### ❌ Test Case 3: Empty Chat ID
```
Input: "" (empty)
Expected:
  - ❌ Red error message
  - Message: "Vui lòng nhập Chat ID..."
```

#### ❌ Test Case 4: Bot Blocked
```
Input: Chat ID của user đã block bot
Expected:
  - ❌ Red error message
  - Message: "Bot đã bị block..."
```

## 🎨 UI Components

### Button Layout:
```
┌─────────────────────────────────────────────────────┐
│ Telegram Chat ID                                    │
│ ┌────────────────────┬────────┬────────┐            │
│ │ [Input: 123456789] │ [Test] │ [Lưu]  │            │
│ └────────────────────┴────────┴────────┘            │
│ 💡 Click "Test" để kiểm tra...                     │
└─────────────────────────────────────────────────────┘
```

### Test Button Styling:
- **Color**: Purple (`bg-purple-500`)
- **Icon**: Zap (⚡)
- **Text**: "Test"
- **Loading**: Spinner when pending

### Success Message:
```
┌─────────────────────────────────────────────────────┐
│ ✅ Gửi tin nhắn thử thành công! Kiểm tra Telegram  │
└─────────────────────────────────────────────────────┘
```

### Error Message:
```
┌─────────────────────────────────────────────────────┐
│ ❌ Không thể gửi tin nhắn. Vui lòng kiểm tra...    │
└─────────────────────────────────────────────────────┘
```

## 🔧 Technical Implementation

### Frontend (DailyReport.tsx):

```typescript
// Test mutation
const testTelegramMutation = useMutation({
  mutationFn: async (testChatId: string) => {
    const { data, error } = await supabase.functions.invoke(
      "test-telegram",
      { body: { chatId: testChatId } }
    );
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    setTestResult({ type: "success", message: "..." });
  },
  onError: (error) => {
    setTestResult({ type: "error", message: error.message });
  },
});

// Handler
const handleTestTelegram = async () => {
  if (!chatId.trim()) return;
  await testTelegramMutation.mutateAsync(chatId.trim());
};
```

### Backend (test-telegram/index.ts):

```typescript
serve(async (req) => {
  const { chatId } = await req.json();
  
  // Send test message via Telegram API
  await sendTelegramMessage(
    telegramBotToken,
    chatId,
    "🧪 TEST THÔNG BÁO - FinTrack..."
  );
  
  return { success: true };
});
```

## 🐛 Troubleshooting

### Issue 1: Function not found

**Error**: `Function test-telegram not found`

**Solution:**
```bash
supabase functions deploy test-telegram --no-verify-jwt
```

### Issue 2: Bot Token not configured

**Error**: `TELEGRAM_BOT_TOKEN not configured`

**Solution:**
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
```

### Issue 3: Chat not found

**Error**: `chat not found`

**Reason**: User chưa nhắn `/start` cho bot

**Solution**: Hướng dẫn user:
1. Mở Telegram
2. Tìm bot của bạn
3. Click Start hoặc gửi `/start`
4. Thử lại

## 📊 Monitoring

### Check Function Logs:

```bash
# View test-telegram logs
supabase functions logs test-telegram --remote

# Look for:
# ✅ "Test message sent successfully to 123456789"
# ❌ "chat not found"
```

### Test via CLI:

```bash
# Test function directly
supabase functions invoke test-telegram --remote \
  --body '{"chatId":"123456789"}'

# Expected response:
{
  "success": true,
  "message": "Test message sent successfully",
  "chatId": "123456789"
}
```

## ✅ Checklist

### Deployment:
- [ ] Deploy `test-telegram` function
- [ ] Verify `TELEGRAM_BOT_TOKEN` secret exists
- [ ] Test function via CLI
- [ ] Test via UI

### Testing:
- [ ] Test with valid Chat ID
- [ ] Test with invalid Chat ID
- [ ] Test with empty input
- [ ] Verify message appears in Telegram
- [ ] Check error handling

### User Experience:
- [ ] Button is visible and styled correctly
- [ ] Loading state works
- [ ] Success message shows
- [ ] Error messages are clear
- [ ] Auto-dismiss after 5 seconds

## 🎉 Benefits

1. **Instant Verification**: User biết ngay Chat ID có đúng không
2. **Reduce Errors**: Tránh lưu Chat ID sai
3. **Better UX**: Feedback ngay lập tức
4. **Debug Friendly**: Dễ phát hiện vấn đề (bot blocked, chat not found, etc.)

---

**Last updated**: Feb 3, 2026
**Feature**: Test Telegram Button
**Status**: ✅ Ready to deploy

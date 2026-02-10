import { useState, useEffect } from "react";
import { Card, CardHeader, Button, Loading } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateTelegramChatId,
  updateDailyReportSettings,
} from "@/services/api/userProfileApi";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  User,
  Calendar,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DailyReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chatId, setChatId] = useState("");
  const [reportTime, setReportTime] = useState("07:00");
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
  });

  // Set initial values from profile
  useEffect(() => {
    if (profile) {
      setChatId(profile.telegramChatId || "");
      setReportTime(profile.reportTime?.substring(0, 5) || "07:00"); // Extract HH:MM from HH:MM:SS
      setIsEnabled(profile.dailyReportEnabled);
    }
  }, [profile]);

  // Update Chat ID mutation
  const updateChatIdMutation = useMutation({
    mutationFn: async (newChatId: string) => {
      if (!user) throw new Error("Not authenticated");
      await updateTelegramChatId(user.id, newChatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Update daily report settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: {
      enabled?: boolean;
      reportTime?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      await updateDailyReportSettings(user.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Test Telegram message mutation
  const testTelegramMutation = useMutation({
    mutationFn: async (testChatId: string) => {
      const { data, error } = await supabase.functions.invoke("test-telegram", {
        body: { chatId: testChatId },
      });

      // Handle Supabase function invocation error
      if (error) {
        console.error("Function invocation error:", error);
        throw new Error(error.message || "Không thể kết nối tới server");
      }

      // Handle API response error
      if (!data.success) {
        throw new Error(data.error || "Test thất bại");
      }

      return data;
    },
    onSuccess: () => {
      setTestResult({
        type: "success",
        message: "✅ Gửi tin nhắn thử thành công! Kiểm tra Telegram của bạn.",
      });
      setTimeout(() => setTestResult(null), 5000);
    },
    onError: (error: any) => {
      console.error("Test Telegram error:", error);

      // Extract error message
      let errorMsg = error.message || "❌ Không thể gửi tin nhắn";

      // Friendly error messages for common cases
      if (errorMsg.includes("TELEGRAM_BOT_TOKEN")) {
        errorMsg = "❌ Bot chưa được cấu hình. Vui lòng liên hệ admin.";
      } else if (errorMsg.includes("chat not found")) {
        errorMsg =
          "❌ Chat ID không hợp lệ. Vui lòng nhắn /start cho bot trước.";
      } else if (errorMsg.includes("bot was blocked")) {
        errorMsg = "❌ Bot đã bị chặn. Vui lòng bỏ chặn bot và thử lại.";
      } else if (errorMsg.includes("Function not found")) {
        errorMsg = "❌ Tính năng test chưa sẵn sàng. Vui lòng thử lại sau.";
      } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
        errorMsg = "❌ Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.";
      }

      setTestResult({
        type: "error",
        message: errorMsg,
      });
      setTimeout(() => setTestResult(null), 8000); // Longer timeout for error messages
    },
  });

  // Send instant report mutation
  const sendInstantReportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "send-instant-report",
        {
          body: { userId: user.id },
        }
      );

      // Handle Supabase function invocation error
      if (error) {
        console.error("Function invocation error:", error);
        throw new Error(error.message || "Không thể kết nối tới server");
      }

      // Handle API response error
      if (!data.success) {
        throw new Error(data.error || "Gửi báo cáo thất bại");
      }

      return data;
    },
    onSuccess: () => {
      setTestResult({
        type: "success",
        message: "🎉 Đã gửi báo cáo giá vàng thành công!",
      });
      setTimeout(() => setTestResult(null), 8000); // Longer for success
    },
    onError: (error: any) => {
      console.error("Send instant report error:", error);

      // Extract error message
      let errorMsg = error.message || "❌ Không thể gửi báo cáo";

      // Friendly error messages for common cases
      if (errorMsg.includes("TELEGRAM_BOT_TOKEN")) {
        errorMsg = "❌ Bot chưa được cấu hình. Vui lòng liên hệ admin.";
      } else if (errorMsg.includes("chat not found")) {
        errorMsg =
          "❌ Chat ID không hợp lệ. Vui lòng nhắn /start cho bot trước.";
      } else if (errorMsg.includes("bot was blocked")) {
        errorMsg = "❌ Bot đã bị chặn. Vui lòng bỏ chặn bot và thử lại.";
      } else if (errorMsg.includes("Telegram Chat ID not configured")) {
        errorMsg = "❌ Chưa cấu hình Telegram Chat ID.";
      } else if (errorMsg.includes("Function not found")) {
        errorMsg =
          "❌ Tính năng gửi báo cáo chưa sẵn sàng. Vui lòng thử lại sau.";
      } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
        errorMsg = "❌ Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.";
      }

      setTestResult({
        type: "error",
        message: errorMsg,
      });
      setTimeout(() => setTestResult(null), 8000);
    },
  });

  const handleSaveChatId = async () => {
    if (!chatId.trim()) return;
    await updateChatIdMutation.mutateAsync(chatId.trim());
  };

  const handleSaveSchedule = async () => {
    await updateSettingsMutation.mutateAsync({
      reportTime: `${reportTime}:00`, // Add seconds
      enabled: isEnabled,
    });
  };

  const handleTestTelegram = async (testChatId?: string) => {
    const idToTest = testChatId || chatId.trim() || profile?.telegramChatId;

    if (!idToTest) {
      setTestResult({
        type: "error",
        message: "Vui lòng nhập Chat ID trước khi test",
      });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }
    await testTelegramMutation.mutateAsync(idToTest);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <div className="text-center py-8 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
              <Calendar
                size={36}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Báo cáo giá vàng hàng ngày
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Nhận báo cáo giá vàng chi tiết mỗi sáng qua Telegram
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vui lòng đăng nhập để sử dụng tính năng này
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <User size={20} />
              Đăng nhập ngay
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Báo cáo giá vàng hàng ngày
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nhận thông báo tự động về giá vàng và biến động thị trường mỗi
              sáng qua Telegram
            </p>
          </div>
        </div>
      </Card>

      {/* Telegram Setup */}
      <Card>
        <CardHeader
          title="Cấu hình Telegram"
          subtitle="Liên kết tài khoản Telegram để nhận thông báo"
          action={
            <User size={18} className="text-blue-600 dark:text-blue-400" />
          }
        />

        <div className="space-y-4">
          {/* Success message */}
          {showSuccess && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-2">
              <CheckCircle
                size={18}
                className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-green-700 dark:text-green-300">
                Cài đặt đã được lưu thành công!
              </p>
            </div>
          )}

          {/* Test result message */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                testResult.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              {testResult.type === "success" ? (
                <CheckCircle
                  size={20}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
              ) : (
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    testResult.type === "success"
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {testResult.message}
                </p>
                {testResult.type === "error" && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Nếu vẫn gặp lỗi, vui lòng kiểm tra Chat ID hoặc liên hệ hỗ
                    trợ.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Current status */}
          {profile?.telegramChatId ? (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={18}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                    Telegram đã được kết nối
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Chat ID: {profile.telegramChatId}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info
                    size={18}
                    className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                      📱 Hướng dẫn lấy Telegram Chat ID
                    </p>

                    {/* Method 1 */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        ✅ Phương pháp 1: Dùng Bot (Khuyến nghị)
                      </p>
                      <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5 list-decimal list-inside ml-2">
                        <li>
                          Mở Telegram và tìm bot{" "}
                          <strong className="font-semibold">
                            @userinfobot
                          </strong>{" "}
                          hoặc{" "}
                          <strong className="font-semibold">
                            @getmyid_bot
                          </strong>
                        </li>
                        <li>
                          Nhấn{" "}
                          <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">
                            Start
                          </code>{" "}
                          hoặc gửi tin nhắn{" "}
                          <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">
                            /start
                          </code>
                        </li>
                        <li>
                          Bot sẽ tự động trả về Chat ID của bạn (dạng số, ví dụ:{" "}
                          <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">
                            123456789
                          </code>
                          )
                        </li>
                        <li>Copy số Chat ID và paste vào ô bên dưới</li>
                      </ol>
                      <div className="flex gap-2 mt-2">
                        <a
                          href="https://t.me/userinfobot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink size={12} />
                          Mở @userinfobot
                        </a>
                        <span className="text-xs text-blue-400 dark:text-blue-500">
                          |
                        </span>
                        <a
                          href="https://t.me/getmyid_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink size={12} />
                          Mở @getmyid_bot
                        </a>
                      </div>
                    </div>

                    {/* Method 2 */}
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        🔧 Phương pháp 2: Dùng Telegram Web
                      </p>
                      <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5 list-decimal list-inside ml-2">
                        <li>
                          Mở{" "}
                          <a
                            href="https://web.telegram.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            web.telegram.org
                          </a>{" "}
                          và đăng nhập
                        </li>
                        <li>Nhắn tin cho chính bạn (Saved Messages)</li>
                        <li>
                          Xem URL trên thanh địa chỉ, Chat ID sẽ nằm sau{" "}
                          <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">
                            #
                          </code>
                        </li>
                        <li>
                          Ví dụ:{" "}
                          <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            web.telegram.org/#123456789
                          </code>{" "}
                          → Chat ID là <strong>123456789</strong>
                        </li>
                      </ol>
                    </div>

                    {/* Important Note */}
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        <strong>⚠️ Lưu ý:</strong> Chat ID là một dãy số (có thể
                        âm hoặc dương). Không nhầm lẫn với username Telegram
                        (bắt đầu bằng @).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telegram Chat ID
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTestTelegram()}
                  disabled={!chatId.trim()}
                  isLoading={testTelegramMutation.isPending}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 border-0"
                >
                  <Zap size={18} />
                  Test thử
                </Button>
                <Button
                  onClick={handleSaveChatId}
                  disabled={!chatId.trim()}
                  isLoading={updateChatIdMutation.isPending}
                  className="flex-1"
                >
                  {profile?.telegramChatId ? "Cập nhật" : "Lưu"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Click "Test thử" để kiểm tra Chat ID có hoạt động không trước
              khi lưu
            </p>
          </div>
        </div>
      </Card>

      {/* Report Schedule */}
      <Card>
        <CardHeader
          title="Lịch trình báo cáo"
          subtitle="Chọn giờ nhận báo cáo hàng ngày"
          action={
            <Clock size={18} className="text-gold-600 dark:text-gold-400" />
          }
        />

        <div className="space-y-4">
          {/* Time selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giờ nhận báo cáo
            </label>
            <select
              value={reportTime}
              onChange={(e) => setReportTime(e.target.value)}
              disabled={!profile?.telegramChatId}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="06:00">6:00 sáng</option>
              <option value="07:00">7:00 sáng</option>
              <option value="08:00">8:00 sáng</option>
              <option value="09:00">9:00 sáng</option>
              <option value="12:00">12:00 trưa</option>
              <option value="16:00">4:00 chiều</option>
              <option value="18:00">6:00 chiều</option>
            </select>
          </div>

          {/* Enable/Disable toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Nhận báo cáo hàng ngày
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gửi báo cáo giá vàng mỗi ngày lúc {reportTime}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                disabled={!profile?.telegramChatId}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {!profile?.telegramChatId && (
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Vui lòng nhập Chat ID ở trên trước khi cấu hình lịch trình
                </p>
              </div>
            </div>
          )}

          {profile?.telegramChatId && (
            <Button
              onClick={handleSaveSchedule}
              isLoading={updateSettingsMutation.isPending}
              className="w-full"
            >
              Lưu lịch trình
            </Button>
          )}
        </div>
      </Card>

      {/* Preview */}
      {profile?.telegramChatId && (
        <Card>
          <CardHeader
            title="Thông tin báo cáo"
            action={
              <Info size={18} className="text-gray-600 dark:text-gray-400" />
            }
          />

          <div className="space-y-3">
            {/* Test Result Message - Show in Preview section too */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  testResult.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                {testResult.type === "success" ? (
                  <CheckCircle
                    size={20}
                    className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  />
                ) : (
                  <AlertCircle
                    size={20}
                    className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      testResult.type === "success"
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {testResult.message}
                  </p>
                  {testResult.type === "success" && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Mở ứng dụng Telegram để xem báo cáo chi tiết
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trạng thái
              </span>
              <span
                className={`text-sm font-medium ${
                  isEnabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isEnabled ? "✅ Đang bật" : "⏸️ Đang tắt"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Telegram Chat ID
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {profile.telegramChatId}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Giờ nhận báo cáo
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportTime} hàng ngày
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Email thông báo
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.email}
              </span>
            </div>
          </div>

          {/* Send Instant Report Button */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nhận báo cáo giá vàng ngay lập tức
              </p>
              <Button
                onClick={() => sendInstantReportMutation.mutate()}
                isLoading={sendInstantReportMutation.isPending}
                disabled={!profile?.telegramChatId}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 border-0 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Zap size={18} />
                {sendInstantReportMutation.isPending
                  ? "Đang gửi..."
                  : "Gửi báo cáo ngay"}
              </Button>

              {/* Quick tip */}
              {!sendInstantReportMutation.isPending && !testResult && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  💡 Báo cáo sẽ được gửi với dữ liệu giá vàng mới nhất
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Sample Report Preview */}
      <Card>
        <CardHeader
          title="Mẫu báo cáo"
          subtitle="Bạn sẽ nhận được báo cáo như sau"
        />

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
            {`📊 BÁO CÁO GIÁ VÀNG HÀNG NGÀY
🕐 Thứ Ba, 04/02/2026 ${reportTime}

🌍 VÀNG THẾ GIỚI (XAU/USD):
💰 Giá hiện tại: $2,685.50/oz
📈 Thay đổi: +$15.30 (+0.57%) ↗️
📊 Cao nhất 24h: $2,695.00
📊 Thấp nhất 24h: $2,670.00

🇻🇳 VÀNG VIỆT NAM:

🔶 Vàng SJC:
💰 Mua vào: 84,500,000 đ/lượng
   ↳ +200,000 (+0.24%) ↗️
💰 Bán ra: 86,500,000 đ/lượng
   ↳ +250,000 (+0.29%) ↗️

💍 Vàng Nhẫn 9999:
💰 Mua vào: 82,300,000 đ/lượng
   ↳ -150,000 (-0.18%) ↘️
💰 Bán ra: 83,500,000 đ/lượng
   ↳ -100,000 (-0.12%) ↘️

💡 Xu hướng: Giá vàng tăng so với hôm qua

📱 Cập nhật từ FinTrack Gold App`}
          </pre>
        </div>
      </Card>

      {/* Help */}
      <Card>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info
              size={16}
              className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">💡 Lưu ý:</p>
              <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <li>• Báo cáo sẽ được gửi tự động mỗi ngày vào giờ bạn chọn</li>
                <li>
                  • Đảm bảo bạn đã nhắn{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    /start
                  </code>{" "}
                  cho bot trước
                </li>
                <li>• Bạn có thể thay đổi giờ nhận bất cứ lúc nào</li>
                <li>• Tắt/bật tính năng khi cần thiết</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

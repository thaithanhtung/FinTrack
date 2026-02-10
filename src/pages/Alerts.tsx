import { AlertForm, AlertList } from "@/components/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/common";
import { LogIn, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hiển thị UI yêu cầu đăng nhập nếu chưa login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <div className="text-center py-8 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/30 dark:to-gold-800/30 flex items-center justify-center">
              <Bell size={36} className="text-gold-600 dark:text-gold-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Tính năng Price Alerts
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Nhận thông báo tự động khi giá vàng đạt mức bạn mong muốn
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vui lòng đăng nhập để sử dụng tính năng này
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-medium transition-colors"
              >
                <LogIn size={20} />
                Đăng nhập ngay
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-gold-600 dark:text-gold-400 font-medium hover:underline"
                >
                  Đăng ký tại đây
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Nếu đã login, hiển thị form và list bình thường
  return (
    <div className="space-y-4">
      <AlertForm />
      <AlertList />
    </div>
  );
}

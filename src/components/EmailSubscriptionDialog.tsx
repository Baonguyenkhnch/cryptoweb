import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Bell, Mail, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";

interface EmailSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  onSubscribe: (email: string) => Promise<void>;
}

export function EmailSubscriptionDialog({
  open,
  onOpenChange,
  walletAddress,
  onSubscribe,
}: EmailSubscriptionDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes("@")) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubscribe(email);
      setShowSuccess(true);
      // Đóng dialog sau 2 giây
      setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setEmail("");
    setShowSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-400/30">
                    <Bell className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
              </div>
              
              <DialogTitle className="text-center text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Nhận Cập Nhật Định Kỳ?
              </DialogTitle>
              
              <DialogDescription className="text-center text-gray-300 mt-2">
                Bạn có muốn nhận thông tin cập nhật định kỳ cho ví này không?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Benefits list */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-cyan-500/20">
                  <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">Báo Cáo Điểm Số</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Nhận thông báo khi điểm tín dụng của bạn thay đổi
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">Biến Động Token</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Theo dõi sự thay đổi trong danh mục tài sản của bạn
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-teal-500/20">
                  <Mail className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">Dashboard Link</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Truy cập nhanh để xem phân tích chi tiết
                    </div>
                  </div>
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-3">
                <Label htmlFor="subscribe-email" className="text-gray-300">
                  Địa Chỉ Email
                </Label>
                <Input
                  id="subscribe-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email.trim() && email.includes("@")) {
                      handleSubscribe();
                    }
                  }}
                />
                <p className="text-xs text-gray-400">
                  Ví của bạn: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
              </div>

              {/* Frequency options */}
              <div className="p-4 bg-slate-700/20 rounded-lg border border-cyan-500/10">
                <div className="text-sm text-gray-300 mb-2">Tần Suất Gửi Email:</div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-cyan-500/20 rounded-lg border border-cyan-400/30 text-xs text-cyan-300">
                    Hàng Tuần
                  </div>
                  <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-400/30 text-xs text-blue-300">
                    Hàng Tháng
                  </div>
                  <div className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-400/30 text-xs text-purple-300">
                    Khi Có Thay Đổi
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                Không, Cảm Ơn
              </Button>
              
              <Button
                onClick={handleSubscribe}
                disabled={!email.trim() || !email.includes("@") || isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang Đăng Ký...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Đăng Ký Ngay
                  </div>
                )}
              </Button>
            </div>
          </>
        ) : (
          // Success state
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-16 h-16 text-green-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl text-white mb-2">Đăng Ký Thành Công!</h3>
              <p className="text-gray-300">
                Bạn sẽ nhận được cập nhật định kỳ tại
              </p>
              <p className="text-cyan-400 mt-1">{email}</p>
            </div>
            
            <div className="text-sm text-gray-400 pt-4">
              Đóng tự động sau giây lát...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

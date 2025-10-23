import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Lightbulb, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface FeatureFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureFeedbackDialog({
  open,
  onOpenChange,
}: FeatureFeedbackDialogProps) {
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!featureName.trim()) {
      setError("Vui lòng nhập tên tính năng");
      return;
    }
    if (!description.trim()) {
      setError("Vui lòng mô tả chi tiết tính năng");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      // TODO: Gọi API POST /feedback/submit
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const feedback = {
        featureName,
        description,
        email: email || null,
        timestamp: new Date().toISOString(),
      };
      console.log("Gửi feedback:", feedback);
      
      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFeatureName("");
    setDescription("");
    setEmail("");
    setError("");
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                    <Lightbulb className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>
              
              <DialogTitle className="text-center text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Đề Xuất Tính Năng Mới
              </DialogTitle>
              
              <DialogDescription className="text-center text-gray-300 mt-2">
                Ý tưởng của bạn giúp chúng tôi phát triển tốt hơn
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Feature Name */}
              <div className="space-y-3">
                <Label htmlFor="feature-name" className="text-gray-300">
                  Tên Tính Năng <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="feature-name"
                  placeholder="VD: Tích hợp với MetaMask"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-300">
                  Mô Tả Chi Tiết <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về tính năng bạn muốn đề xuất..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
                  rows={5}
                />
                <p className="text-xs text-gray-400">
                  {description.length} / 500 ký tự
                </p>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-3">
                <Label htmlFor="feedback-email" className="text-gray-300">
                  📧 Email Nhận Phản Hồi <span className="text-gray-500">(Không bắt buộc)</span>
                </Label>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  Chúng tôi sẽ liên hệ nếu cần thêm thông tin
                </p>
              </div>

              {/* Benefits Info */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <div className="mb-1">Đề xuất của bạn sẽ được:</div>
                    <ul className="ml-4 space-y-1 text-gray-400 text-xs">
                      <li>✓ Xem xét bởi đội ngũ phát triển</li>
                      <li>✓ Ưu tiên phát triển nếu phù hợp</li>
                      <li>✓ Nhận thông báo khi tính năng ra mắt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                Hủy
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!featureName.trim() || !description.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang Gửi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Gửi Đề Xuất
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
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-16 h-16 text-purple-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl text-white mb-2">Cảm Ơn Bạn!</h3>
              <p className="text-gray-300">
                Đề xuất của bạn đã được ghi nhận
              </p>
              <p className="text-purple-400 mt-1">
                Chúng tôi sẽ xem xét và phản hồi sớm nhất
              </p>
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

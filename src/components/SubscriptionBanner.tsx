import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, X, Sparkles } from "lucide-react";

interface SubscriptionBannerProps {
  onSubscribeClick: () => void;
  show?: boolean;
}

export function SubscriptionBanner({ onSubscribeClick, show = true }: SubscriptionBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (show && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setIsDismissed(true), 300);
  };

  if (!show || isDismissed) return null;

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 backdrop-blur-sm p-5">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200 z-10"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-lg animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full border border-cyan-400/40">
                <Bell className="w-6 h-6 text-cyan-300" />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <h4 className="text-white">
                Bạn muốn nhận thông tin biến động ví này mỗi tuần qua email không?
              </h4>
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-gray-300 text-sm">
              Nhận cập nhật về thay đổi điểm số, biến động token và link dashboard chi tiết
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onSubscribeClick}
            className="flex-shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 rounded-xl group"
          >
            <Bell className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Đăng Ký Nhận
          </Button>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50" />
      </div>
    </div>
  );
}

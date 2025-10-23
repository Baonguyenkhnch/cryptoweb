import { Button } from "./ui/button";
import { Bell, Lightbulb, RefreshCw, Mail, CheckCircle2 } from "lucide-react";

interface ActionButtonsProps {
  onSubscribe: () => void;
  onFeedback: () => void;
  onRecalculate: () => void;
  onSendReport?: () => void;
  isSubscribed?: boolean;
  isRecalculating?: boolean;
}

export function ActionButtons({
  onSubscribe,
  onFeedback,
  onRecalculate,
  onSendReport,
  isSubscribed = false,
  isRecalculating = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {/* Subscribe / Subscribed Button */}
      <Button
        onClick={onSubscribe}
        className={`${
          isSubscribed
            ? "bg-green-600/20 border-green-500/40 text-green-400 hover:bg-green-600/30"
            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
        } border transition-all duration-300 px-6 py-6 rounded-xl group`}
      >
        {isSubscribed ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Đang Nhận Cập Nhật Hàng Tuần</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 group-hover:animate-pulse" />
            <span>Nhận Cập Nhật Mới Cho Ví Này</span>
          </div>
        )}
      </Button>

      {/* Feedback Button */}
      <Button
        onClick={onFeedback}
        variant="outline"
        className="bg-purple-600/20 border-purple-500/40 text-purple-400 hover:bg-purple-600/30 hover:border-purple-400/50 transition-all duration-300 px-6 py-6 rounded-xl group"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 group-hover:animate-bounce" />
          <span>Đề Xuất Tính Năng Mới</span>
        </div>
      </Button>

      {/* Recalculate Button */}
      <Button
        onClick={onRecalculate}
        disabled={isRecalculating}
        variant="outline"
        className="bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400/50 transition-all duration-300 px-6 py-6 rounded-xl group"
      >
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 ${isRecalculating ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} />
          <span>{isRecalculating ? "Đang Tính..." : "Tính Điểm Mới Nhất"}</span>
        </div>
      </Button>

      {/* Send Report Button (only if subscribed) */}
      {isSubscribed && onSendReport && (
        <Button
          onClick={onSendReport}
          variant="outline"
          className="bg-teal-600/20 border-teal-500/40 text-teal-400 hover:bg-teal-600/30 hover:border-teal-400/50 transition-all duration-300 px-6 py-6 rounded-xl group"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <span>Gửi Báo Cáo Tuần Qua</span>
          </div>
        </Button>
      )}
    </div>
  );
}

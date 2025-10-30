import { useState } from "react";
import { Button } from "./ui/button";
import { MessageCircle, Lightbulb } from "lucide-react";

interface FloatingFeedbackButtonProps {
  onClick: () => void;
}

export function FloatingFeedbackButton({ onClick }: FloatingFeedbackButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-2 md:gap-3">
      {/* Tooltip hint */}
      {isHovered && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 hidden md:block">
          <div className="bg-gradient-to-r from-cyan-900/95 to-blue-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-xl px-4 py-2 shadow-xl">
            <p className="text-white text-sm whitespace-nowrap">
              💡 Chia sẻ ý tưởng của bạn
            </p>
          </div>
        </div>
      )}

      {/* Main button */}
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group h-14 w-14 md:h-16 md:w-16 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 rounded-full p-0 hover:scale-110"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />

        <div className="relative flex items-center justify-center">
          <Lightbulb className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 ${isHovered ? "scale-110 rotate-12" : ""}`} />
        </div>

        {/* Pulse animation */}
        <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/30 animate-ping" />
      </Button>

      {/* Badge notification (optional) */}
      <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
        <span className="text-white text-[10px] md:text-xs">✨</span>
      </div>
    </div>
  );
}
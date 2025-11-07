/**
 * ============================================
 * LANGUAGE SWITCHER COMPONENT
 * ============================================
 * Nút chuyển đổi ngôn ngữ Việt/Anh
 */

import { Languages } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LanguageSwitcher({
  variant = "outline",
  size = "default",
  className = ""
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 rounded-lg ${className}`}
      title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Languages className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-400" />
      <div className="font-mono flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs">
        <button
          onClick={() => setLanguage("vi")}
          className={`px-1 md:px-1.5 py-0.5 rounded transition-all duration-300 hover:bg-cyan-500/20 ${language === "vi"
              ? "text-cyan-300 bg-cyan-500/10 scale-110 font-bold"
              : "text-gray-500 hover:text-gray-400"
            }`}
        >
          VI
        </button>
        <span className="text-gray-600 text-[10px]">|</span>
        <button
          onClick={() => setLanguage("en")}
          className={`px-1 md:px-1.5 py-0.5 rounded transition-all duration-300 hover:bg-cyan-500/20 ${language === "en"
              ? "text-cyan-300 bg-cyan-500/10 scale-110 font-bold"
              : "text-gray-500 hover:text-gray-400"
            }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}

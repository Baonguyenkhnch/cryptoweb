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
      className={`inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 rounded-lg ${className}`}
      title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Languages className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
      <div className="font-mono flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
        <button
          onClick={() => setLanguage("vi")}
          className={`px-1.5 md:px-2 py-0.5 rounded transition-all duration-300 hover:bg-cyan-500/20 ${language === "vi"
              ? "text-cyan-300 bg-cyan-500/10 scale-110 font-bold"
              : "text-gray-500 hover:text-gray-400"
            }`}
        >
          VI
        </button>
        <span className="text-gray-600 text-xs">|</span>
        <button
          onClick={() => setLanguage("en")}
          className={`px-1.5 md:px-2 py-0.5 rounded transition-all duration-300 hover:bg-cyan-500/20 ${language === "en"
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

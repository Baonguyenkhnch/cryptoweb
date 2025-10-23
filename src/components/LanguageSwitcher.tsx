/**
 * ============================================
 * LANGUAGE SWITCHER COMPONENT
 * ============================================
 * Nút chuyển đổi ngôn ngữ Việt/Anh
 */

import { Button } from "./ui/button";
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

  const handleToggle = () => {
    const newLang = language === "vi" ? "en" : "vi";
    setLanguage(newLang);
  };

  return (
    <Button
      onClick={handleToggle}
      variant={variant}
      size={size}
      className={`bg-slate-800/80 backdrop-blur-sm border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 ${className}`}
      title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Languages className="w-4 h-4 mr-2 text-cyan-400" />
      <span className="font-mono flex items-center gap-1.5">
        <span className={`transition-all duration-300 ${
          language === "vi" 
            ? "text-cyan-300 scale-110" 
            : "text-gray-500 hover:text-gray-400"
        }`}>
          VI
        </span>
        <span className="text-gray-600 text-xs">|</span>
        <span className={`transition-all duration-300 ${
          language === "en" 
            ? "text-cyan-300 scale-110" 
            : "text-gray-500 hover:text-gray-400"
        }`}>
          EN
        </span>
      </span>
    </Button>
  );
}

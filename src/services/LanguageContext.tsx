/**
 * ============================================
 * LANGUAGE CONTEXT
 * ============================================
 * Context để quản lý ngôn ngữ toàn ứng dụng
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

// Khởi tạo với giá trị mặc định để tránh undefined
const defaultContext: LanguageContextType = {
  language: "vi",
  setLanguage: () => { },
  t: translations.vi,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lấy ngôn ngữ từ localStorage hoặc mặc định là "vi"
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("language");
        return (saved === "en" || saved === "vi") ? saved : "vi";
      } catch {
        return "vi";
      }
    }
    return "vi";
  });

  // Lưu ngôn ngữ vào localStorage khi thay đổi
  const setLanguage = (lang: Language) => {
    console.log('🌐 Language changing from', language, 'to', lang);
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", lang);
        console.log('✅ Language saved to localStorage:', lang);
      } catch (error) {
        console.error("Failed to save language to localStorage:", error);
      }
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook để sử dụng language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./services/LanguageContext"; // 👈 phải có dòng này
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>       {/* 👈 bắt buộc phải bọc */}
    <App />
  </LanguageProvider>
);

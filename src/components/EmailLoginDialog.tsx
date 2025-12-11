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
import { Mail, Send, CheckCircle2, AlertCircle, Lock, Shield, UserPlus } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";
import { sendMagicLink } from "../services/api-real";

interface EmailLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onMagicLinkSuccess?: (email: string) => void;
  walletAddress?: string; // Wallet address để gắn với email
  onRegisterClick?: (email: string) => void; // ✅ DEPRECATED: Dùng onNavigateToRegister thay thế
  onNavigateToRegister?: (email: string) => void; // ✅ NEW: Navigate to auth page with register tab
}

export function EmailLoginDialog({
  open,
  onOpenChange,
  onSuccess,
  onMagicLinkSuccess,
  walletAddress = "",
  onRegisterClick,
  onNavigateToRegister,
}: EmailLoginDialogProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailNotFound, setEmailNotFound] = useState(false); // ✅ NEW: Track nếu email chưa được đăng ký

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(t.emailLogin.errors.enterEmail);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.emailLogin.errors.invalidEmail);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // ✅ GỌI API THẬT - Gửi Magic Link
      // Backend endpoint: POST /api/auth/send-magic-link
      const result = await sendMagicLink(email, walletAddress);

      if (result.success) {
        console.log("✅ Magic link đã gửi:", result.message);
        setShowSuccess(true);

        // Tự động đóng sau 5s
        setTimeout(() => {
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 5000);
      } else {
        throw new Error(result.message || "Gửi email thất bại");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t.emailLogin.errors.generalError;
      console.error("❌ Lỗi gửi magic link:", errorMsg);

      // ✅ FIX: Đổi thứ tự check - Ưu tiên check "not found" trước
      // Check for email not found (chưa được đăng ký)
      if (errorMsg.includes("not found") ||
        errorMsg.includes("not registered") ||
        errorMsg.includes("chưa được đăng ký") ||
        errorMsg.includes("không tồn tại") ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("404") ||
        errorMsg.includes("401")) {
        setEmailNotFound(true);
        setError("📧 Email này chưa được đăng ký. Vui lòng đăng ký.");
      }
      // Check for email already exists (đã đăng ký)
      else if (errorMsg.includes("already exists") ||
        errorMsg.includes("đã tồn tại") ||
        errorMsg.includes("already registered")) {
        setEmailNotFound(false);
        setError("📧 Email này đã được đăng ký. Vui lòng đăng nhập.");
      }
      // Nếu backend offline, hiển thị demo mode
      else if (errorMsg.includes('DEMO')) {
        setShowSuccess(true);
      }
      // ✅ FIX: Default case - Giả định email chưa được đăng ký
      else {
        // Nếu không match pattern nào, giả định email chưa được đăng ký
        console.warn("⚠️ Unknown error pattern, assuming email not found:", errorMsg);
        setEmailNotFound(true);
        setError("📧 Email này chưa được đăng ký. Vui lòng đăng ký.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setShowSuccess(false);
    setEmailNotFound(false); // ✅ Reset email not found state
    onOpenChange(false);
  };

  const handleMagicLinkClick = () => {
    // Giả lập việc click vào magic link trong email
    if (onMagicLinkSuccess) {
      onMagicLinkSuccess(email);
    }
    handleClose();
  };

  const handleRegisterClick = () => {
    // ✅ NEW: Chuyển sang QuickRegisterDialog khi email chưa được đăng ký
    if (onRegisterClick) {
      onRegisterClick(email);
      handleClose();
    }
  };

  const handleNavigateToRegister = () => {
    // ✅ NEW: Navigate to auth page with register tab
    if (onNavigateToRegister) {
      onNavigateToRegister(email);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl rounded-xl">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                  <div className="relative p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </div>

              <DialogTitle className="text-center text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t.emailLogin.title}
              </DialogTitle>

              <DialogDescription className="text-center text-gray-300 mt-1 text-sm">
                {t.emailLogin.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Security Info */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <div className="text-purple-400 mb-1 text-sm">🔐 {t.emailLogin.security.title}</div>
                    <ul className="space-y-0.5 text-xs text-gray-400">
                      <li>✓ {t.emailLogin.security.noPassword}</li>
                      <li>✓ {t.emailLogin.security.oneTime}</li>
                      <li>✓ {t.emailLogin.security.noStorage}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-gray-300 flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {t.emailLogin.emailLabel}
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t.emailLogin.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email.trim() && validateEmail(email)) {
                      handleSubmit();
                    }
                  }}
                  className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500 h-10"
                  autoFocus
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {t.emailLogin.encryptedProtected}
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-1.5">
                <div className="text-sm text-gray-400">{t.emailLogin.howItWorks.title}</div>
                <div className="space-y-1.5">
                  {[
                    { step: "1", text: t.emailLogin.howItWorks.step1 },
                    { step: "2", text: t.emailLogin.howItWorks.step2 },
                    { step: "3", text: t.emailLogin.howItWorks.step3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs">
                        {item.step}
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
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
            <div className="flex gap-2 pt-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white h-10"
              >
                {t.emailLogin.cancel}
              </Button>

              {/* ✅ NEW: Đổi button thành "Đăng ký" nếu email chưa được đăng ký */}
              {emailNotFound ? (
                <Button
                  onClick={handleNavigateToRegister}
                  disabled={!email.trim() || !validateEmail(email)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 h-10"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Đăng ký
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!email.trim() || !validateEmail(email) || isLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 h-10"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.emailLogin.sending}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t.emailLogin.sendButton}
                    </div>
                  )}
                </Button>
              )}
            </div>
          </>
        ) : (
          // Success state
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <div>
              <h3 className="text-xl text-white mb-2">{t.emailLogin.success.title}</h3>
              <p className="text-gray-300 mb-1 text-sm">
                {t.emailLogin.success.sentTo}
              </p>
              <p className="text-cyan-400 mb-3 text-sm">{email}</p>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg inline-block">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{t.emailLogin.success.checkEmail}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t.emailLogin.success.checkSpam}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-sm text-gray-400">
                {t.emailLogin.success.validFor} <span className="text-cyan-400">{t.emailLogin.success.minutes}</span>
              </div>
              <div className="text-xs text-gray-500">
                {t.emailLogin.success.autoClose}
              </div>
            </div>

            {/* Close button only */}
            <div className="pt-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full h-10 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50"
              >
                {t.emailLogin.success.close}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
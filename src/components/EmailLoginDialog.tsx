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
import { Mail, Send, CheckCircle2, AlertCircle, Lock, Shield } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface EmailLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onMagicLinkSuccess?: (email: string) => void;
}

export function EmailLoginDialog({
  open,
  onOpenChange,
  onSuccess,
  onMagicLinkSuccess,
}: EmailLoginDialogProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

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
      // TODO: Gọi API POST /auth/send-magic-link
      // Backend sẽ gửi email chứa link xác thực
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Gửi magic link đến:", email);

      setShowSuccess(true);

      // Tự động đóng sau 5s
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 5000);
    } catch (err) {
      setError(t.emailLogin.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setShowSuccess(false);
    onOpenChange(false);
  };

  const handleMagicLinkClick = () => {
    // Giả lập việc click vào magic link trong email
    if (onMagicLinkSuccess) {
      onMagicLinkSuccess(email);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl rounded-2xl">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-400/30">
                    <Mail className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
              </div>

              <DialogTitle className="text-center text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t.emailLogin.title}
              </DialogTitle>

              <DialogDescription className="text-center text-gray-300 mt-2">
                {t.emailLogin.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Security Info */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <div className="text-purple-400 mb-1">🔐 {t.emailLogin.security.title}</div>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>✓ {t.emailLogin.security.noPassword}</li>
                      <li>✓ {t.emailLogin.security.oneTime}</li>
                      <li>✓ {t.emailLogin.security.noStorage}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-gray-300 flex items-center gap-2">
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
                  className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500 h-12 text-base"
                  autoFocus
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {t.emailLogin.encryptedProtected}
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">{t.emailLogin.howItWorks.title}</div>
                <div className="space-y-2">
                  {[
                    { step: "1", text: t.emailLogin.howItWorks.step1 },
                    { step: "2", text: t.emailLogin.howItWorks.step2 },
                    { step: "3", text: t.emailLogin.howItWorks.step3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
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
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white h-12"
              >
                {t.emailLogin.cancel}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!email.trim() || !validateEmail(email) || isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 h-12"
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
            </div>
          </>
        ) : (
          // Success state
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-16 h-16 text-cyan-400" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl text-white mb-3">{t.emailLogin.success.title}</h3>
              <p className="text-gray-300 mb-2">
                {t.emailLogin.success.sentTo}
              </p>
              <p className="text-cyan-400 mb-4">{email}</p>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg inline-block">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <span>{t.emailLogin.success.checkEmail}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t.emailLogin.success.checkSpam}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="text-sm text-gray-400">
                {t.emailLogin.success.validFor} <span className="text-cyan-400">{t.emailLogin.success.minutes}</span>
              </div>
              <div className="text-xs text-gray-500">
                {t.emailLogin.success.autoClose}
              </div>
            </div>

            {/* DEMO: Simulate magic link click */}
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-400 mb-1">
                  <span className="text-lg">⚡</span>
                  <span>{t.emailLogin.success.demoMode}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {t.emailLogin.success.demoDescription}
                </p>
              </div>

              <Button
                onClick={handleMagicLinkClick}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.emailLogin.success.simulateClick}</span>
                </div>
              </Button>

              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50"
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

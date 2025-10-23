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
import { Checkbox } from "./ui/checkbox";
import { Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface OTPVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  onSuccess: (email: string) => void;
}

export function OTPVerificationDialog({
  open,
  onOpenChange,
  walletAddress,
  onSuccess,
}: OTPVerificationDialogProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError(t.otpVerification.errors.enterEmail);
      return;
    }
    if (!agreed) {
      setError(t.otpVerification.errors.agreeTerms);
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      // TODO: Gọi API /auth/request-otp
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Gửi OTP đến:", email);
      setStep("otp");
    } catch (err) {
      setError(t.otpVerification.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError(t.otpVerification.errors.invalidOTP);
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      // TODO: Gọi API /auth/verify-otp
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Xác thực OTP:", otp);
      
      // Success - backend lưu { wallet, email, verified: true }
      setStep("success");
      setTimeout(() => {
        onSuccess(email);
        handleClose();
      }, 2000);
    } catch (err) {
      setError(t.otpVerification.errors.wrongOTP);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setOtp("");
    setAgreed(false);
    setStep("email");
    setError("");
    onOpenChange(false);
  };

  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Gửi lại OTP đến:", email);
      setError(t.otpVerification.errors.resent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
        {step === "email" && (
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
                {t.otpVerification.title}
              </DialogTitle>
              
              <DialogDescription className="text-center text-gray-300 mt-2">
                {t.otpVerification.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-300">
                  {t.otpVerification.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailLogin.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email.trim() && agreed) {
                      handleRequestOTP();
                    }
                  }}
                />
              </div>

              {/* Wallet Address Display */}
              <div className="p-4 bg-slate-700/30 rounded-lg border border-cyan-500/20">
                <div className="text-sm text-gray-400 mb-1">{t.otpVerification.walletAddress}</div>
                <div className="text-cyan-400 text-sm font-mono">
                  {walletAddress.slice(0, 20)}...{walletAddress.slice(-20)}
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg border border-cyan-500/10">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="agree"
                  className="text-sm text-gray-300 cursor-pointer leading-relaxed"
                >
                  {t.otpVerification.agreement.text}
                  <ul className="mt-2 ml-4 space-y-1 text-gray-400 text-xs">
                    <li>• {t.otpVerification.agreement.scoreChanges}</li>
                    <li>• {t.otpVerification.agreement.tokenChanges}</li>
                    <li>• {t.otpVerification.agreement.dashboardLink}</li>
                  </ul>
                </label>
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
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                {t.otpVerification.cancel}
              </Button>
              
              <Button
                onClick={handleRequestOTP}
                disabled={!email.trim() || !agreed || isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.otpVerification.sending}
                  </div>
                ) : (
                  t.otpVerification.sendCode
                )}
              </Button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-400/30">
                    <Shield className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>
              
              <DialogTitle className="text-center text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t.otpVerification.otpTitle}
              </DialogTitle>
              
              <DialogDescription className="text-center text-gray-300 mt-2">
                {t.otpVerification.otpDescription}<br />
                <span className="text-cyan-400">{email}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-gray-300">
                  {t.otpVerification.otpLabel}
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder={t.otpVerification.otpPlaceholder}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6) {
                      handleVerifyOTP();
                    }
                  }}
                />
                <p className="text-xs text-gray-400 text-center">
                  {t.otpVerification.otpHint}
                </p>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <Button
                  onClick={handleResendOTP}
                  variant="link"
                  className="text-cyan-400 hover:text-cyan-300"
                  disabled={isLoading}
                >
                  {t.otpVerification.resendOTP}
                </Button>
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
                onClick={() => setStep("email")}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                {t.otpVerification.back}
              </Button>
              
              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.otpVerification.verifying}
                  </div>
                ) : (
                  t.otpVerification.verify
                )}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-16 h-16 text-green-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl text-white mb-2">{t.otpVerification.success.title}</h3>
              <p className="text-gray-300">
                {t.otpVerification.success.description}
              </p>
              <p className="text-cyan-400 mt-1">{email}</p>
            </div>
            
            <div className="text-sm text-gray-400 pt-4">
              {t.otpVerification.success.walletSaved}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

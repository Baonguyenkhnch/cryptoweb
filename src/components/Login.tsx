import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, Mail, Wallet, ArrowRight, Copy, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { type UserProfile } from "../services/api-real";
import { useLanguage } from "../services/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import logoIcon from "../components/images/logonhap.jpg";

// Helper function để tạo địa chỉ ví Ethereum ngẫu nhiên
const generateRandomWallet = (): string => {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

interface LoginProps {
  onRegisterSuccess?: (user: UserProfile) => void;
  onBackToCalculator?: () => void;
}

export function Login({ onRegisterSuccess, onBackToCalculator }: LoginProps) {
  const { t } = useLanguage();

  // State quản lý form đăng ký
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerWallet, setRegisterWallet] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // ✨ Validation states - CHỈ HIỂN THỊ SAU KHI SUBMIT
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // ✨ Ref để cleanup timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✨ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✨ Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidWallet = (wallet: string) => wallet.startsWith("0x") && wallet.length === 42;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHasAttemptedSubmit(true);

    if (!registerEmail || !registerWallet) {
      setError(t.auth.validationErrors.fillAll);
      return;
    }

    if (!isValidEmail(registerEmail)) {
      setError(t.auth.validationErrors.invalidEmail);
      return;
    }

    if (!registerWallet.startsWith("0x") || registerWallet.length !== 42) {
      setError(t.auth.validationErrors.invalidWalletFormat);
      return;
    }

    setIsLoading(true);

    try {
      const { sendMagicLink } = await import("../services/api-real");

      const result = await sendMagicLink(registerEmail, registerWallet);

      if (result.success) {
        setShowEmailSent(true);
        setVerificationToken(result.verificationToken || "");
        setError("");
      } else {
        setError(result.message || t.auth.errors.sendFailed);
      }
    } catch (err) {
      setError(t.auth.errors.general);
      console.error("Send magic link error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDemo = async () => {
    setIsLoading(true);
    try {
      const { verifyMagicLink } = await import("../services/api-real");

      const result = await verifyMagicLink(verificationToken);

      if (result.success && result.user) {
        // Lưu auth token
        if (result.authToken) {
          localStorage.setItem("authToken", result.authToken);
          localStorage.setItem("currentUser", JSON.stringify(result.user));
        }

        // Show success briefly then redirect
        timeoutRef.current = setTimeout(() => {
          onRegisterSuccess?.(result.user);
        }, 1000);
      } else {
        setError(result.message || t.auth.errors.verifyFailed);
      }
    } catch (err) {
      setError(t.auth.errors.verifyError);
      console.error("Verify error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowEmailSent(false);
    setError("");
    setHasAttemptedSubmit(false);
  };

  // ============================================
  // RENDER UI - PASSWORDLESS FLOW
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419] flex items-center justify-center p-2 md:p-3">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Top Bar with Back Button & Language Switcher */}
      <div className="absolute top-2 md:top-3 left-2 md:left-3 right-2 md:right-3 z-20 flex items-center justify-between">
        <Button
          onClick={onBackToCalculator}
          variant="outline"
          className="bg-slate-800/80 backdrop-blur-sm border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 rounded-lg h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs"
        >
          ← {t.auth.backToCalculator}
        </Button>
        <LanguageSwitcher size="sm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-2 py-14 md:py-16">
        {!showEmailSent ? (
          <>
            {/* Header - Compact */}
            <div className="text-center mb-2.5">
              <div className="flex items-center justify-center mb-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={logoIcon}
                      alt="ScorePage Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-lg md:text-xl mb-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                {t.auth.registerTitle}
              </h1>
              <p className="text-gray-400 text-[10px] md:text-xs">
                {t.auth.passwordlessSubtitle}
              </p>
            </div>

            {/* Register Card - Super Compact */}
            <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg opacity-50" />

              <div className="relative">
                <CardHeader className="pb-1.5 pt-2.5 px-3">
                  <CardTitle className="text-sm md:text-base text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    {t.auth.createAccount}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 pb-2.5 px-3">
                  {/* Alert */}
                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/30 text-red-400 py-1.5 px-2.5">
                      <AlertDescription className="text-[10px]">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Info Banner - Compact */}
                  <div className="p-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-[10px] text-purple-300 mb-0.5">
                      {t.auth.benefits}
                    </div>
                    <ul className="space-y-0 text-[9px] md:text-[10px] text-gray-300">
                      <li className="flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{t.auth.benefitNoPassword}</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{t.auth.benefit1}</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{t.auth.benefit3}</span>
                      </li>
                    </ul>
                  </div>

                  <form onSubmit={handleSendMagicLink} className="space-y-2">
                    {/* Email */}
                    <div className="space-y-1">
                      <Label htmlFor="register-email" className="text-gray-300 flex items-center gap-1 text-[10px] md:text-xs">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        {t.auth.email}
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={t.auth.placeholders.email}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className={`bg-slate-900/50 border h-9 md:h-10 text-xs transition-colors ${hasAttemptedSubmit && !isValidEmail(registerEmail)
                          ? 'border-red-500/50 focus:border-red-400'
                          : 'border-cyan-500/30 focus:border-cyan-400'
                          } text-white placeholder:text-gray-500`}
                      />
                      {hasAttemptedSubmit && !isValidEmail(registerEmail) && (
                        <p className="text-[9px] text-red-400">{t.auth.validationErrors.validEmail}</p>
                      )}
                    </div>

                    {/* Wallet */}
                    <div className="space-y-1">
                      <Label htmlFor="register-wallet" className="text-gray-300 flex items-center gap-1 text-[10px] md:text-xs">
                        <Wallet className="w-3.5 h-3.5 text-teal-400" />
                        {t.auth.walletAddress}
                      </Label>
                      <div className="flex gap-1.5">
                        <Input
                          id="register-wallet"
                          type="text"
                          name="wallet"
                          autoComplete="off"
                          placeholder={t.auth.placeholders.walletShort}
                          value={registerWallet}
                          onChange={(e) => setRegisterWallet(e.target.value)}
                          className={`flex-1 bg-slate-900/50 border h-9 md:h-10 text-[10px] transition-colors ${hasAttemptedSubmit && !isValidWallet(registerWallet)
                            ? 'border-red-500/50 focus:border-red-400'
                            : 'border-cyan-500/30 focus:border-cyan-400'
                            } text-white font-mono placeholder:text-gray-600`}
                        />
                        <Button
                          type="button"
                          onClick={() => setRegisterWallet(generateRandomWallet())}
                          variant="outline"
                          className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-teal-500/40 text-teal-400 hover:bg-teal-500/30 px-2.5 h-9 md:h-10"
                          title={t.auth.generateTest}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[9px] text-gray-500">
                        {t.auth.noWalletHintShort} <Copy className="w-2.5 h-2.5 inline" /> {t.auth.generateTest}
                      </p>
                    </div>

                    {/* How it works - Compact */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                      <div className="text-[10px] text-blue-300">
                        <div className="mb-0.5">{t.auth.howItWorks}</div>
                        <ol className="space-y-0 text-[9px] md:text-[10px] text-gray-300 ml-3 list-decimal">
                          <li>{t.auth.howItWorksSteps.step1}</li>
                          <li>{t.auth.howItWorksSteps.step2}</li>
                          <li>{t.auth.howItWorksSteps.step3}</li>
                          <li>{t.auth.howItWorksSteps.step4}</li>
                        </ol>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white h-10 md:h-11 text-xs md:text-sm shadow-lg shadow-purple-500/30"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t.auth.sending}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          {t.auth.sendMagicLink}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </Button>

                    {/* Demo Note */}
                    <p className="text-center text-[9px] text-gray-500">
                      {t.auth.decentralizedFooter}
                    </p>
                  </form>
                </CardContent>
              </div>
            </Card>
          </>
        ) : (
          /* Email Sent State */
          <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-green-500/20 shadow-2xl rounded-xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-50" />

            <div className="relative">
              <CardContent className="py-5 px-4 text-center space-y-3">
                <div className="flex items-center justify-center mb-1">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                    <div className="relative p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                      <CheckCircle2 className="w-11 h-11 text-green-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg md:text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1.5">
                    {t.auth.emailSent.title}
                  </h2>
                  <p className="text-gray-300 text-xs mb-1">
                    {t.auth.emailSent.sentTo}
                  </p>
                  <p className="text-cyan-400 text-sm">{registerEmail}</p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-left">
                  <div className="text-xs text-blue-300 space-y-1">
                    <div className="mb-1.5">{t.auth.emailSent.nextSteps}</div>
                    <ol className="space-y-0.5 ml-3 list-decimal text-gray-300 text-[10px]">
                      <li>{t.auth.emailSent.openEmail} <span className="text-cyan-400">{registerEmail}</span></li>
                      <li>{t.auth.emailSent.findEmail} <span className="text-orange-400">ScorePage</span></li>
                      <li>{t.auth.emailSent.clickButton} <span className="text-green-400">{t.auth.emailSent.confirmButton}</span></li>
                      <li>{t.auth.emailSent.autoRedirect}</li>
                    </ol>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/30 text-red-400 py-2 px-2.5">
                    <AlertDescription className="text-[10px]">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Demo Button */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-2.5">
                  <p className="text-xs text-purple-300 mb-2">
                    {t.auth.emailSent.demoMode} <span className="">{t.auth.emailSent.demoLabel}</span> {t.auth.emailSent.demoDescription}
                  </p>
                  <Button
                    onClick={handleVerifyDemo}
                    disabled={isLoading}
                    className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t.auth.emailSent.verifying}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.auth.emailSent.simulateClick}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-10 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700 text-xs"
                  >
                    ← {t.auth.emailSent.backButton}
                  </Button>
                  <Button
                    onClick={handleSendMagicLink}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1 h-10 bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 text-xs"
                  >
                    <Clock className="w-4 h-4 mr-1.5" />
                    {t.auth.emailSent.resend}
                  </Button>
                </div>

                <p className="text-[10px] text-gray-500">
                  {t.auth.emailSent.noEmail}
                </p>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-3 text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          {t.auth.decentralizedFooter}
        </div>
      </div>
    </div>
  );
}

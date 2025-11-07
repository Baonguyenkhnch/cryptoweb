import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, Mail, Lock, Wallet, ArrowRight, Eye, EyeOff, Shuffle, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { register, type AuthResponse, type UserProfile } from "../services/api-real";
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
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerWallet, setRegisterWallet] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✨ Validation states - CHỈ HIỂN THỊ SAU KHI SUBMIT
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // ✨ Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidWallet = (wallet: string) => wallet.startsWith("0x") && wallet.length === 42;
  const isValidPassword = (password: string) => password.length >= 6;
  const passwordsMatch = registerPassword && registerConfirmPassword && registerPassword === registerConfirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setHasAttemptedSubmit(true); // ✨ Mark that user tried to submit

    if (!registerEmail || !registerPassword || !registerWallet) {
      setError(t.auth.errors.fillAll);
      return;
    }

    if (!isValidEmail(registerEmail)) {
      setError("Email không hợp l���");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError(t.auth.errors.passwordMismatch);
      return;
    }

    if (registerPassword.length < 6) {
      setError(t.auth.errors.passwordLength);
      return;
    }

    if (!registerWallet.startsWith("0x") || registerWallet.length !== 42) {
      setError(t.auth.errors.invalidWallet);
      return;
    }

    setIsLoading(true);

    try {
      const response: AuthResponse = await register({
        email: registerEmail,
        password: registerPassword,
        walletAddress: registerWallet,
      });

      if (response.success && response.user) {
        setSuccess(t.auth.success.registerSuccess);

        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }

        // Tự động chuyển sang Dashboard sau 1 giây
        setTimeout(() => {
          onRegisterSuccess?.(response.user);
        }, 1000);
      } else {
        setError(response.message || t.auth.errors.registerFailed);
      }
    } catch (err) {
      setError(t.auth.errors.general);
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER UI - COMPACT & CLEAN
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419] flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Top Bar with Back Button & Language Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <Button
          onClick={onBackToCalculator}
          variant="outline"
          className="bg-slate-800/80 backdrop-blur-sm border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 rounded-lg h-9 px-4 text-sm"
        >
          ← {t.auth.backToCalculator}
        </Button>
        <LanguageSwitcher size="sm" />
      </div>

      {/* Main Content - COMPACT */}
      <div className="relative z-10 w-full max-w-md px-2">
        {/* Header - COMPACT */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center">
                <img
                  src={logoIcon}
                  alt="ScorePage Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <h1 className="text-xl mb-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
            {t.auth.registerTitle}
          </h1>
          <p className="text-gray-400 text-xs">{t.auth.registerSubtitle}</p>
        </div>

        {/* Register Card - COMPACT */}
        <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg opacity-50" />

          <div className="relative">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                {t.auth.createAccount}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 pb-3">
              {/* Alert - COMPACT */}
              {error && (
                <Alert className="bg-red-500/10 border-red-500/30 text-red-400 py-2 px-3">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-400 py-2 px-3">
                  <AlertDescription className="text-xs">{success}</AlertDescription>
                </Alert>
              )}

              {/* Info Banner - COMPACT & COLLAPSIBLE */}
              <div className="p-2.5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-[11px] text-purple-300 mb-1 font-medium">
                  {t.auth.benefits}
                </div>
                <ul className="space-y-0.5 text-[10px] text-gray-300">
                  <li className="flex items-center gap-1">
                    <span className="text-green-400">✓</span>
                    {t.auth.benefit1}
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-green-400">✓</span>
                    {t.auth.benefit3}
                  </li>
                </ul>
              </div>

              <form onSubmit={handleRegister} className="space-y-2.5">
                {/* Email - INLINE ERROR */}
                <div className="space-y-1">
                  <Label htmlFor="register-email" className="text-gray-300 flex items-center gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className={`bg-slate-900/50 border h-9 text-sm transition-colors ${hasAttemptedSubmit && !isValidEmail(registerEmail)
                      ? 'border-red-500/50 focus:border-red-400'
                      : 'border-cyan-500/30 focus:border-cyan-400'
                      } text-white placeholder:text-gray-500`}
                  />
                  {hasAttemptedSubmit && !isValidEmail(registerEmail) && (
                    <p className="text-[10px] text-red-400">Vui lòng nhập email hợp lệ</p>
                  )}
                </div>

                {/* Wallet - INLINE ERROR */}
                <div className="space-y-1">
                  <Label htmlFor="register-wallet" className="text-gray-300 flex items-center gap-1.5 text-xs">
                    <Wallet className="w-3.5 h-3.5 text-teal-400" />
                    Địa Chỉ Ví
                  </Label>
                  <div className="flex gap-1.5">
                    <Input
                      id="register-wallet"
                      type="text"
                      name="wallet"
                      autoComplete="off"
                      value={registerWallet}
                      onChange={(e) => setRegisterWallet(e.target.value)}
                      className={`flex-1 bg-slate-900/50 border h-9 text-sm transition-colors ${hasAttemptedSubmit && !isValidWallet(registerWallet)
                        ? 'border-red-500/50 focus:border-red-400'
                        : 'border-cyan-500/30 focus:border-cyan-400'
                        } text-white font-mono text-[11px] placeholder:text-gray-600`}
                    />
                    <Button
                      type="button"
                      onClick={() => setRegisterWallet(generateRandomWallet())}
                      variant="outline"
                      className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-teal-500/40 text-teal-400 hover:bg-teal-500/30 px-2.5 h-9"
                      title="Tạo ví test"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-[9px] text-gray-500">
                    💡 Không có ví? Bấm để tạo test
                  </p>
                </div>

                {/* Password - INLINE ERROR */}
                <div className="space-y-1">
                  <Label htmlFor="register-password" className="text-gray-300 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    Mật Khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={`bg-slate-900/50 border pr-9 h-9 text-sm transition-colors ${hasAttemptedSubmit && !isValidPassword(registerPassword)
                        ? 'border-red-500/50 focus:border-red-400'
                        : 'border-cyan-500/30 focus:border-cyan-400'
                        } text-white placeholder:text-gray-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                    >
                      {showRegisterPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {hasAttemptedSubmit && !isValidPassword(registerPassword) && (
                    <p className="text-[10px] text-red-400">Mật khẩu phải có ít nhất 6 ký tự</p>
                  )}
                </div>

                {/* Confirm Password - INLINE ERROR */}
                <div className="space-y-1">
                  <Label htmlFor="register-confirm" className="text-gray-300 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    Xác Nhận Mật Khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className={`bg-slate-900/50 border pr-9 h-9 text-sm transition-colors ${hasAttemptedSubmit && registerConfirmPassword && !passwordsMatch
                        ? 'border-red-500/50 focus:border-red-400'
                        : hasAttemptedSubmit && passwordsMatch
                          ? 'border-green-500/50 focus:border-green-400'
                          : 'border-cyan-500/30 focus:border-cyan-400'
                        } text-white placeholder:text-gray-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                    >
                      {showConfirmPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {hasAttemptedSubmit && registerConfirmPassword && !passwordsMatch && (
                    <p className="text-[10px] text-red-400">Mật khẩu không khớp</p>
                  )}
                  {hasAttemptedSubmit && passwordsMatch && (
                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Khớp!
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white h-10 mt-3 text-sm font-medium shadow-lg shadow-purple-500/30"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      Tạo Tài Khoản
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </Button>

                {/* Demo Note */}
                <p className="text-center text-[10px] text-gray-500 mt-2">
                  Demo: Bất kỳ email/mật khẩu nào cũng được chấp nhận
                </p>
              </form>
            </CardContent>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-3 text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-cyan-400" />
          Bảo mật bằng blockchain
        </div>
      </div>
    </div>
  );
}
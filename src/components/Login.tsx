import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, Mail, Lock, Wallet, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { login, register, type AuthResponse, type UserProfile } from "../services/api";
import { useLanguage } from "../services/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LoginProps {
  onLoginSuccess?: (user: UserProfile) => void;
  onRegisterSuccess?: (user: UserProfile) => void;
}

export function Login({ onLoginSuccess, onRegisterSuccess }: LoginProps) {
  const { t } = useLanguage();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // State quản lý form đăng ký
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerWallet, setRegisterWallet] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail || !loginPassword) {
      setError(t.auth.errors.fillAll);
      return;
    }

    setIsLoading(true);

    try {
      const response: AuthResponse = await login({
        email: loginEmail,
        password: loginPassword,
      });

      if (response.success && response.user) {
        setSuccess(t.auth.success.loginSuccess);
        
        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }
        
        onLoginSuccess?.(response.user);
      } else {
        setError(response.message || t.auth.errors.loginFailed);
      }
    } catch (err) {
      setError(t.auth.errors.general);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!registerEmail || !registerPassword || !registerWallet) {
      setError(t.auth.errors.fillAll);
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
      // Gọi API đăng ký
      const response: AuthResponse = await register({
        email: registerEmail,
        password: registerPassword,
        walletAddress: registerWallet,
      });

      if (response.success && response.user) {
        setSuccess(t.auth.success.registerSuccess);
        
        // Lưu token
        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }
        
        // Callback khi đăng ký thành công
        onRegisterSuccess?.(response.user);
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
  // RENDER UI
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419] flex items-center justify-center p-4">
      {/* Animated Background - giống trang calculator */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher size="sm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-white/30 to-white/20 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
            {t.auth.title}
          </h1>
          <p className="text-gray-400">{t.auth.subtitle}</p>
        </div>

        {/* Login/Register Card */}
        <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-3xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative">
            <Tabs defaultValue="login" className="w-full">
              {/* Tabs Header */}
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-cyan-500/20">
                    {t.auth.login}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-blue-500/20">
                    {t.auth.register}
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Alert hiển thị lỗi/thành công */}
                {error && (
                  <Alert className="mb-4 bg-red-500/10 border-red-500/30 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-500/10 border-green-500/30 text-green-400">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* ====== TAB ĐĂNG NHẬP ====== */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {t.auth.email}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t.auth.placeholders.email}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-400" />
                        {t.auth.password}
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder={t.auth.placeholders.password}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white h-12 mt-6"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t.auth.processing}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {t.auth.loginButton}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-400 mt-4">
                      {t.auth.demoNote}
                    </p>
                  </form>
                </TabsContent>

                {/* ====== TAB ĐĂNG KÝ ====== */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {t.auth.email}
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t.auth.placeholders.email}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-wallet" className="text-gray-300 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-teal-400" />
                        {t.auth.walletAddress}
                      </Label>
                      <Input
                        id="register-wallet"
                        type="text"
                        placeholder={t.auth.placeholders.wallet}
                        value={registerWallet}
                        onChange={(e) => setRegisterWallet(e.target.value)}
                        className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-400" />
                        {t.auth.password}
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder={t.auth.placeholders.password}
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm" className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-400" />
                        {t.auth.confirmPassword}
                      </Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder={t.auth.placeholders.password}
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white h-12 mt-6"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t.auth.processing}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {t.auth.registerButton}
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t.auth.securityFooter}
        </p>
      </div>
    </div>
  );
}

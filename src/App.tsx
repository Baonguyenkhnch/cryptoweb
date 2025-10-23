import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { ScoreResult } from "./components/ScoreResult";
import { ResultsSummary } from "./components/ResultsSummary";
import { RatingGuide } from "./components/RatingGuide";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ProfilePage } from "./components/ProfilePage";
import { Navigation } from "./components/Navigation";
import { OTPVerificationDialog } from "./components/OTPVerificationDialog";
import { EmailLoginDialog } from "./components/EmailLoginDialog";
import { FeatureFeedbackDialog } from "./components/FeatureFeedbackDialog";
import { FloatingFeedbackButton } from "./components/FloatingFeedbackButton";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useLanguage } from "./services/LanguageContext";
import { Wallet, TrendingUp, Shield, Sparkles, Star, Mail, Lock, Info } from "lucide-react";
import type { UserProfile, WalletAnalysis, EmailSubscription } from "./services/api";
import { 
  analyzeWallet, 
  subscribeToUpdates, 
  checkSubscriptionStatus,
  unsubscribe,
  sendWeeklyReport 
} from "./services/api";

type Page = "login" | "calculator" | "dashboard" | "profile";

export default function App() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>("calculator");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletAnalysis | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showEmailLoginDialog, setShowEmailLoginDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<EmailSubscription | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // check xem có login chưa khi vào trang
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentPage("dashboard");
      } catch (error) {
        console.error("Lỗi khi đọc user:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    // Tự động lưu wallet address hiện tại vào user profile
    const updatedUser = {
      ...user,
      walletAddress: walletAddress || user.walletAddress || ""
    };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentPage("dashboard");
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    // Tự động lưu wallet address hiện tại vào user profile
    const updatedUser = {
      ...user,
      walletAddress: walletAddress || user.walletAddress || ""
    };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentPage("calculator"); // Về trang calculator thay vì login
  };

  const handleGoToCalculator = () => {
    setCurrentPage("calculator");
    setShowResults(false);
    setWalletAddress("");
  };

  const handleGoToDashboard = () => {
    if (currentUser) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  };

  const handleGoToProfile = () => {
    if (currentUser) {
      setCurrentPage("profile");
    } else {
      setCurrentPage("login");
    }
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  const handleCalculateScore = async () => {
    if (!walletAddress.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      // Gọi API phân tích ví
      const data = await analyzeWallet(walletAddress);
      setWalletData(data);
      setShowResults(true);
      
      // Kiểm tra subscription status
      const status = await checkSubscriptionStatus(walletAddress);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Lỗi khi phân tích ví:", error);
      alert(t.calculator.buttons.analyzing + " - Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setWalletAddress("");
    setWalletData(null);
    setShowOTPDialog(false);
    setShowEmailLoginDialog(false);
    setShowFeedbackDialog(false);
    setSubscriptionStatus(null);
  };

  const handleSubscribeClick = () => {
    if (subscriptionStatus?.verified) {
      // Nếu đã subscribe, hiển th option để unsubscribe
      handleUnsubscribe();
    } else {
      // M dialog OTP verification
      setShowOTPDialog(true);
    }
  };

  const handleOTPSuccess = async (email: string) => {
    // Cập nhật subscription status
    const status = await checkSubscriptionStatus(walletAddress);
    setSubscriptionStatus(status);
  };

  const handleUnsubscribe = async () => {
    if (confirm("Bạn có chắc muốn hủy nhận cập nhật cho ví này?")) {
      await unsubscribe(walletAddress);
      setSubscriptionStatus(null);
    }
  };

  const handleRecalculate = async () => {
    if (!walletAddress.trim()) return;
    
    setIsRecalculating(true);
    try {
      const data = await analyzeWallet(walletAddress);
      setWalletData(data);
    } catch (error) {
      console.error("Lỗi khi tính lại điểm:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSendReport = async () => {
    if (subscriptionStatus?.email) {
      try {
        await sendWeeklyReport(subscriptionStatus.email, walletAddress);
        alert("Báo cáo đã được gửi đến email của bạn!");
      } catch (error) {
        console.error("Lỗi khi gửi báo cáo:", error);
      }
    }
  };

  const handleNavigate = (page: Page) => {
    if (page === "dashboard") handleGoToDashboard();
    else if (page === "calculator") handleGoToCalculator();
    else if (page === "profile") handleGoToProfile();
  };

  const handleMagicLinkLogin = (email: string) => {
    // DEMO: Giả lập đăng nhập qua magic link
    // Trong thực tế, backend s verify JWT token từ link
    
    // Tạo mock user từ email và tự động lưu wallet address hiện tại
    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(7),
      email: email,
      name: email.split('@')[0], // Lấy phần trước @ làm tên
      walletAddress: walletAddress || "", // Tự động lưu wallet đã nhập
      createdAt: new Date().toISOString(), // Ngày tạo tài khoản
      lastLogin: new Date().toISOString(), // Đăng nhập lần cuối
    };

    // Tạo mock auth token
    const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36)}`;
    
    // Lưu vào localStorage
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
    
    // Set state và chuyển đến dashboard
    setCurrentUser(mockUser);
    setCurrentPage("dashboard");
    
    console.log("✅ Đăng nhập thành công qua Magic Link:", email);
    console.log("📍 Wallet Address:", walletAddress);
  };

  // trang calculator chính
  const renderCalculatorPage = () => (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-teal-500/12 to-blue-500/12 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Top Right - Login Button & Language Switcher (if not logged in) */}
      {!currentUser && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <LanguageSwitcher size="sm" />
          <Button
            onClick={() => setShowEmailLoginDialog(true)}
            variant="outline"
            className="bg-slate-800/80 backdrop-blur-sm border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 rounded-xl"
          >
            <Mail className="w-4 h-4 mr-2" />
            {t.nav.login}
          </Button>
        </div>
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header - Simplified */}
        <div className="text-center mb-8 animate-in fade-in-0 duration-1000">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          <div className="relative mb-4 px-4">
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight leading-[1.15] pb-2">
              {t.calculator.title}
            </h1>
          </div>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-3">
            {t.calculator.description}
          </p>
          <p className="text-sm text-cyan-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            <span>{t.calculator.privacy.decentralized}</span> • 
            <Lock className="w-4 h-4 ml-2" />
            <span>{t.calculator.privacy.noIdentity}</span> • 
            <Info className="w-4 h-4 ml-2" />
            <span>{t.calculator.privacy.transparent}</span>
          </p>
        </div>

        {!showResults ? (
          /* Input Form */
          <div className="max-w-3xl mx-auto">
            <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-10 duration-1000 rounded-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-slate-500/15 rounded-3xl blur-xl opacity-50" />
              
              <div className="relative">
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-2xl text-white flex items-center justify-center gap-3 mb-2">
                    <div className="relative">
                      <Wallet className="w-8 h-8 text-cyan-400" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    {t.calculator.input.title}
                  </CardTitle>
                  <p className="text-gray-400 mt-2">{t.calculator.input.subtitle}</p>
                </CardHeader>
                
                <CardContent className="space-y-6 p-8 pb-10">
                  <div className="space-y-4">
                    <Label htmlFor="wallet" className="text-gray-300 text-lg">
                      {t.calculator.input.label}
                    </Label>
                    <div className="relative">
                      <Input
                        id="wallet"
                        placeholder={t.calculator.input.placeholder}
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="h-14 bg-slate-900/50 border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 text-base rounded-xl transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleCalculateScore}
                      disabled={!walletAddress.trim() || isLoading}
                      className="relative flex-1 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-base shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 disabled:opacity-50 rounded-xl group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t.calculator.buttons.analyzing}</span>
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5" />
                          <span>{t.calculator.buttons.calculate}</span>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </Button>

                    {/* Quick Feedback Button */}
                    <Button
                      onClick={() => setShowFeedbackDialog(true)}
                      variant="outline"
                      className="h-14 px-6 bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 hover:text-white transition-all duration-300 rounded-xl group"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 transition-transform duration-300" />
                        <span className="hidden sm:inline">{t.calculator.buttons.feedback}</span>
                      </div>
                    </Button>
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-500/20">
                    <div className="text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30 group-hover:scale-110 transition-transform duration-300">
                        <Lock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-purple-400 text-xs">{t.calculator.features.noStore}</div>
                      <div className="text-gray-500 text-xs">{t.calculator.features.identity}</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-cyan-400 text-xs">{t.calculator.features.decentralized}</div>
                      <div className="text-gray-500 text-xs">{t.calculator.features.security}</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30 group-hover:scale-110 transition-transform duration-300">
                        <Info className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-blue-400 text-xs">{t.calculator.features.transparent}</div>
                      <div className="text-gray-500 text-xs">{t.calculator.features.algorithm}</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="text-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="mb-4 bg-cyan-500/20 backdrop-blur-sm border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 hover:text-cyan-200 hover:border-cyan-400/50 transition-all duration-300 rounded-xl px-6 py-3"
              >
                ← {t.calculator.buttons.tryAnother}
              </Button>
            </div>
            
            {walletData ? (
              <>
                {/* Section 1: Results Summary - Thông tin tóm tắt dạng bảng/số với CTA đăng nhập */}
                <ResultsSummary 
                  data={walletData} 
                  onLoginClick={!currentUser ? () => setShowEmailLoginDialog(true) : undefined}
                />

                {/* Section 2: Rating Guide */}
                <div className="pt-4">
                  <RatingGuide />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">{t.common.loading}</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );

  // xử lý render theo page
  if (currentPage === "login") {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  if (currentPage === "dashboard") {
    if (!currentUser) {
      setCurrentPage("login");
      return null;
    }
    return (
      <>
        <Navigation 
          currentPage={currentPage}
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <Dashboard 
          user={currentUser}
          onCalculateScore={handleGoToCalculator}
          onViewProfile={handleGoToProfile}
          onRecalculate={async () => {
            // Recalculate với wallet hiện tại
            if (currentUser?.walletAddress) {
              setIsRecalculating(true);
              try {
                const data = await analyzeWallet(currentUser.walletAddress);
                setWalletData(data);
                setWalletAddress(currentUser.walletAddress);
              } catch (error) {
                console.error("Lỗi khi tính lại điểm:", error);
              } finally {
                setIsRecalculating(false);
              }
            }
          }}
        />
      </>
    );
  }

  if (currentPage === "profile") {
    if (!currentUser) {
      setCurrentPage("login");
      return null;
    }
    return (
      <>
        <Navigation 
          currentPage={currentPage}
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <ProfilePage 
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onBack={handleGoToDashboard}
        />
      </>
    );
  }

  // calculator page - ai cũng vào được
  return (
    <>
      {currentUser && (
        <Navigation 
          currentPage={currentPage}
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {renderCalculatorPage()}
      
      {/* Email Login Dialog (Passwordless) */}
      <EmailLoginDialog
        open={showEmailLoginDialog}
        onOpenChange={setShowEmailLoginDialog}
        onSuccess={() => {
          // Sau khi gửi email thành công, có thể hiển thị thông báo
          console.log("Magic link đã được gi!");
        }}
        onMagicLinkSuccess={handleMagicLinkLogin}
      />

      {/* OTP Verification Dialog */}
      {walletAddress && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={setShowOTPDialog}
          walletAddress={walletAddress}
          onSuccess={handleOTPSuccess}
        />
      )}

      {/* Feature Feedback Dialog */}
      <FeatureFeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      {/* Floating Feedback Button */}
      {currentPage === "calculator" && (
        <FloatingFeedbackButton onClick={() => setShowFeedbackDialog(true)} />
      )}
    </>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Navigation } from "./components/Navigation";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ProfilePage } from "./components/ProfilePage";
import { ScoreResult } from "./components/ScoreResult";
import { ResultsSummary } from "./components/ResultsSummary";
import { OTPVerificationDialog } from "./components/OTPVerificationDialog";
import { EmailLoginDialog } from "./components/EmailLoginDialog";
import { FloatingFeedbackButton } from "./components/FloatingFeedbackButton";
import { FeatureFeedbackDialog } from "./components/FeatureFeedbackDialog";
import { QuickRegisterDialog } from "./components/QuickRegisterDialog";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoadingProgress } from "./components/LoadingProgress";
import { ErrorDialog } from "./components/ErrorDialog";
import { QuotaWarningBanner } from "./components/QuotaWarningBanner";
import { VerifyPage } from "./pages/Verify"; // ✅ Import VerifyPage
import { CaptchaDialog } from "./components/CaptchaDialog"; // ✅ Import CaptchaDialog
import { ConnectWalletModal } from "./components/ConnectWalletModal"; // ✅ Import ConnectWalletModal
import { useLanguage } from "./services/LanguageContext";
import { ImageWithFallback } from "./components/ImageProcessing/ImageWithFallback";
import { Toaster } from "./components/ui/sonner";
import logoImage from "../src/components/images/logonhap.jpg";
import {
  Wallet,
  TrendingUp,
  Shield,
  Star,
  Mail,
  Lock,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  UserProfile,
  WalletAnalysis,
  EmailSubscription,
} from "./services/api-real";
import {
  analyzeWallet,
  subscribeToUpdates,
  checkSubscriptionStatus,
  unsubscribe,
  sendWeeklyReport,
  isValidEmail,
  isValidWalletAddress,
  getWalletByEmail,
} from "./services/api-real";
import { generateMockWalletData } from "./services/mock-data";

type Page = "login" | "calculator" | "dashboard" | "profile";

// Helper function to get rating from score
const getRatingFromScore = (score: number): string => {
  if (score === 0) return "N/A"; // ✅ No score = No rating
  if (score >= 750) return "AAA";
  if (score >= 700) return "AA";
  if (score >= 650) return "A";
  if (score >= 600) return "BBB";
  if (score >= 550) return "BB";
  if (score >= 500) return "B";
  return "C";
};

export default function App() {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] =
    useState<Page>("calculator");
  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [showWalletAddress, setShowWalletAddress] = useState(false); // Show/hide wallet
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] =
    useState<WalletAnalysis | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showEmailLoginDialog, setShowEmailLoginDialog] =
    useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] =
    useState(false);
  const [showQuickRegisterDialog, setShowQuickRegisterDialog] =
    useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<EmailSubscription | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [loginTab, setLoginTab] = useState<"login" | "register">("login");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorType, setErrorType] = useState<"quota" | "network" | "general">("general");
  const [errorMessage, setErrorMessage] = useState("");
  // ✅ REMOVED: useDemoMode state - No demo mode anymore
  const [showQuotaWarning, setShowQuotaWarning] = useState(false); // Quota warning banner
  const [showVerifyPage, setShowVerifyPage] = useState(false); // ✅ Verify page state
  const [showCaptchaCalculator, setShowCaptchaCalculator] = useState(false); // ✅ CAPTCHA for calculator
  const [prefilledEmail, setPrefilledEmail] = useState(""); // ✅ NEW: Email pre-filled from EmailLoginDialog
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // ✅ NEW: Connect Wallet Modal state

  // ✅ Check URL hash for verify page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      // ✅ IMPORTANT: Don't show verify page if user is already logged in
      const token = localStorage.getItem("authToken");
      if (token) {
        // User is already authenticated, don't show verify page even if hash contains /verify
        console.log("🔒 User already authenticated, skipping verify page");
        setShowVerifyPage(false);
        return;
      }

      // ✅ SUPPORT BOTH /verify AND /verify-registration
      if (hash.startsWith("#/verify-registration") || hash.startsWith("#/verify")) {
        setShowVerifyPage(true);
      } else {
        setShowVerifyPage(false);
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // check xem có login chưa khi vào trang
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("currentUser");

      console.log("🔍 Checking auth on mount:");
      console.log("  - authToken:", token ? token.substring(0, 20) + "..." : "null");
      console.log("  - currentUser:", savedUser ? "exists" : "null");

      if (!token) {
        console.log("⚠️ No auth found in localStorage");
        return;
      }

      // Prefer saved user if present
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setCurrentPage("dashboard");
          console.log("✅ Auth restored from localStorage, redirecting to dashboard");
          return;
        } catch (error) {
          console.error("❌ Lỗi khi parse user:", error);
          localStorage.removeItem("currentUser");
        }
      }

      // Token-only auth (e.g., MetaMask SIWE) - fetch profile safely
      try {
        const { getUserInfo } = await import("./services/api-real");
        const userInfoResult = await getUserInfo();

        if (userInfoResult?.success && userInfoResult?.user) {
          const u = userInfoResult.user;
          const minimalUser = {
            id: u.id || `wallet_${Date.now()}`,
            email: u.email,
            name: u.name,
            walletAddress: u.wallet_address,
            createdAt: u.created_at,
            lastLogin: u.last_login,
          };

          localStorage.setItem("currentUser", JSON.stringify(minimalUser));
          setCurrentUser(minimalUser as any);
          setCurrentPage("dashboard");
          console.log("✅ Auth restored from token via getUserInfo(), redirecting to dashboard");
        } else {
          console.warn("⚠️ Token exists but failed to fetch user profile; clearing auth");
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("❌ Failed to restore auth from token:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
      }
    };

    restoreAuth();
  }, []);

  // Auto-load wallet data khi vào Dashboard lần đầu
  useEffect(() => {
    const loadWalletDataForDashboard = async () => {
      if (
        currentPage === "dashboard" &&
        currentUser?.walletAddress
        // ✅ REMOVED: !walletData check - Always load fresh data when entering dashboard
      ) {
        // Loading wallet data for dashboard
        console.log("🔄 Loading wallet data for Dashboard...");
        console.log("📍 Current walletData:", walletData);

        setIsLoading(true);
        try {
          // ✅ CHECK CACHE FIRST - Same logic as Calculator
          const cacheKey = `wallet_cache_${currentUser.walletAddress.toLowerCase()}`;
          const cachedDataStr = localStorage.getItem(cacheKey);

          if (cachedDataStr) {
            try {
              const cachedData = JSON.parse(cachedDataStr);
              const cacheAge = Date.now() - cachedData.timestamp;
              const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

              if (cacheAge < CACHE_EXPIRY) {
                console.log(`💾 Dashboard: Using cached data (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
                setWalletData(cachedData.data);
                setWalletAddress(currentUser.walletAddress);

                // Still check subscription status
                const status = await checkSubscriptionStatus(currentUser.walletAddress);
                setSubscriptionStatus(status);

                setIsLoading(false);
                return; // ← EXIT early, don't call API
              } else {
                console.log(`⏰ Dashboard: Cache expired, fetching fresh data...`);
              }
            } catch (e) {
              console.warn("⚠️ Dashboard: Failed to parse cache:", e);
            }
          }

          // ✅ NO CACHE or EXPIRED - Call API
          console.log("🌐 Dashboard: Fetching fresh data from API...");
          const data = await analyzeWallet(
            currentUser.walletAddress,
          );
          console.log("✅ Wallet data loaded:", data);

          // ✅ SAVE TO CACHE
          const cacheData = {
            data: data,
            timestamp: Date.now(),
          };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`💾 Dashboard: Saved fresh data to cache`);
          } catch (e) {
            console.warn("⚠️ Dashboard: Failed to save cache:", e);
          }

          setWalletData(data);
          setWalletAddress(currentUser.walletAddress);

          // Kiểm tra subscription status
          const status = await checkSubscriptionStatus(
            currentUser.walletAddress,
          );
          setSubscriptionStatus(status);
        } catch (error) {
          console.error("❌ Lỗi khi load wallet data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWalletDataForDashboard();
  }, [currentPage, currentUser]); // ✅ REMOVED: walletData dependency to allow reload

  const handleLogin = async (user: UserProfile) => {
    setCurrentUser(user);

    // ✅ FIX: Check if user is already authenticated from Verify.tsx
    // If authToken already exists in localStorage, it means Verify.tsx already saved everything
    // We should NOT overwrite it!
    const existingToken = localStorage.getItem("authToken");
    const existingUser = localStorage.getItem("currentUser");

    if (existingToken && existingUser) {
      console.log("🔒 User already authenticated from Verify.tsx - skipping localStorage overwrite");
      console.log("  - authToken exists:", existingToken.substring(0, 20) + "...");
      console.log("  - currentUser exists:", existingUser.substring(0, 50) + "...");

      // Parse existing user to use it (don't overwrite with potentially incomplete data)
      try {
        const savedUser = JSON.parse(existingUser);
        setCurrentUser(savedUser); // Use the saved user data instead
        console.log("✅ Using saved user data from Verify.tsx");
      } catch (e) {
        console.warn("⚠️ Failed to parse existing user, using new user data");
      }
    } else {
      // ✅ NEW LOGIN (not from Verify.tsx) - Save to localStorage
      console.log("🆕 New login - saving to localStorage");

      // Save minimal user data
      const minimalUser = {
        id: user?.id || `user_${Date.now()}`,
        email: user?.email,
        name: user?.name,
        walletAddress: user?.walletAddress,
        createdAt: user?.createdAt,
        lastLogin: user?.lastLogin,
      };
      localStorage.setItem("currentUser", JSON.stringify(minimalUser));

      // ✅ ALSO SAVE authToken if not from Verify.tsx (for backward compatibility with old flows)
      if (!existingToken) {
        const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36)}`;
        localStorage.setItem("authToken", mockToken);
        console.log("💾 Saved mockToken for backward compatibility");
      }
    }

    // ✅ CHECK lastLogin - Backend sets lastLogin immediately, so we check if it's recent
    try {
      setIsLoading(true);

      console.log("👤 User Info:", user);
      console.log("🕐 Last Login:", user.lastLogin);
      console.log("📍 Type of lastLogin:", typeof user.lastLogin);

      // ✅ NEW LOGIC: Check if last_login was set within the last 2 minutes (first login)
      const isFirstLogin = user.lastLogin &&
        (Date.now() - new Date(user.lastLogin).getTime()) < 120000; // 2 minutes = 120000ms

      console.log("🔍 Is First Login (within 2 min)?:", isFirstLogin);
      console.log("⏰ Time since last login (ms):", user.lastLogin ? Date.now() - new Date(user.lastLogin).getTime() : 'N/A');

      // ✅ FIX: If lastLogin is null, skip getUserInfo() and go directly to Dashboard
      // This fixes the 401 error from getUserInfo() when logging in via magic link
      if (!user.lastLogin) {
        console.log("🎉 First time login detected (lastLogin = null)! Skipping getUserInfo() - going directly to Dashboard.");
        setIsLoading(false);
        setCurrentPage("dashboard");
        return;
      }

      if (isFirstLogin) {
        // ✅ BƯỚC 3: First login - Kích hoạt tính điểm onchain
        console.log("🎉 First time login! Triggering credit score calculation...");

        if (user.walletAddress) {
          try {
            // 🧪 TEST: Uncomment dòng dưới để test error handling
            // throw new Error("Moralis API error: Rate limit exceeded - quota consumed");

            const { analyzeWallet } = await import("./services/api-real");

            // ✅ GỌI API TÍNH ĐIỂM (Backend sẽ crawl blockchain)
            const onchainData = await analyzeWallet(user.walletAddress);

            // ✅ FIX: Validate data before using - Skip if score = 0 (invalid cache)
            if (!onchainData || onchainData.score === 0) {
              console.warn("⚠️ Received invalid data (score = 0), retrying without cache...");

              // Clear cache and retry
              const cacheKey = `wallet_cache_${user.walletAddress.toLowerCase()}`;
              localStorage.removeItem(cacheKey);

              // Retry with force_refresh
              const freshData = await analyzeWallet(user.walletAddress, { force_refresh: true });

              // ✅ FIX: Don't throw error - Allow score = 0 but warn user
              if (!freshData || freshData.score === 0) {
                console.warn("⚠️ API still returns score = 0 after retry. This may be correct for a new wallet.");

                // Show warning but allow user to continue
                alert(
                  `⚠️ Cảnh báo: Điểm tín dụng = 0\n\n` +
                  `Nguyên nhân có thể:\n` +
                  `1. Ví mới chưa có giao dịch\n` +
                  `2. Backend đang tính toán dữ liệu\n` +
                  `3. Lỗi kết nối với blockchain\n\n` +
                  `Bạn vẫn có thể vào Dashboard và thử lại sau.`
                );

                // Set data with score = 0 (allow user to see dashboard)
                setWalletData(freshData || onchainData);
              } else {
                setWalletData(freshData);
                console.log("✅ Fresh data loaded after retry:", freshData);
              }
            } else {
              setWalletData(onchainData);
              console.log("✅ Onchain data loaded:", onchainData);
            }

            // ✅ SAVE TO WALLET CACHE for public Calculator
            const cacheKey = `wallet_cache_${user.walletAddress.toLowerCase()}`;
            const cacheData = {
              data: onchainData,
              timestamp: Date.now(),
            };

            try {
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              console.log(`💾 Saved onchain data to wallet cache: ${cacheKey}`);
            } catch (e) {
              console.warn("⚠️ Failed to save wallet cache:", e);
            }

            // ✅ SUCCESS - Show success message
            console.log("✅ First login complete, credit score:", onchainData.score);
          } catch (apiError: any) {
            // ❌ API FAILED - Show clear error message
            console.error("🚫 Failed to fetch onchain data for first login:", apiError.message);

            //  FIX: Show alert to user so they know what happened
            const errorMsg = apiError.message || "Lỗi kết nối";
            const isQuotaError = errorMsg.includes('quota') || errorMsg.includes('rate limit') ||
              errorMsg.includes('401') || errorMsg.includes('500');

            alert(
              `⚠️ Không thể tải dữ liệu blockchain cho ví này!\n\n` +
              `Lý do: ${errorMsg}\n\n` +
              (isQuotaError
                ? `Backend đang hết quota Moralis. Vui lòng:\n` +
                `1. Thử lại sau 1-2 giờ\n` +
                `2. Hoặc liên hệ admin@migofin.com`
                : `Vui lòng kiểm tra kết nối mạng và thử lại sau.`)
            );

            // ✅ FIX: DON'T set empty data - User can retry later
            // Instead, redirect back to Calculator page
            setIsLoading(false);
            setCurrentPage("calculator");

            // Clear auth to allow retry
            localStorage.removeItem("authToken");
            localStorage.removeItem("currentUser");
            setCurrentUser(null);

            return; // ← EXIT early without setting empty data
          }
        }
      } else {
        // ✅ BƯỚC 4: Returning user - Fetch data from backend DB
        console.log("👋 Welcome back! Fetching cached data from DB...");

        const { getUserInfo } = await import("./services/api-real");
        const userInfoResult = await getUserInfo();

        console.log("📊 getUserInfo result:", userInfoResult); // ✅ DEBUG

        if (userInfoResult.success && userInfoResult.user) {
          console.log("✅ User data from DB:", userInfoResult.user); // ✅ DEBUG

          // Map user-info data to WalletAnalysis format
          const cachedData = {
            score: userInfoResult.user.credit_score || 0,
            walletAge: userInfoResult.user.wallet_age || 0,
            totalTransactions: userInfoResult.user.total_transactions || 0,
            tokenDiversity: 0, // Not in user-info response
            totalAssets: userInfoResult.user.total_assets || 0,
            rating: getRatingFromScore(userInfoResult.user.credit_score || 0),
            tokenBalances: [], // Will be loaded from separate API if needed
            recentTransactions: [], // Will be loaded from separate API if needed
            walletAddress: userInfoResult.user.wallet_address,
          };

          setWalletData(cachedData);
          console.log("✅ Cached data loaded:", cachedData);

          // ✅ SAVE TO WALLET CACHE for public Calculator
          // This allows Calculator to show same data after logout
          const walletAddr = userInfoResult.user.wallet_address;

          if (walletAddr) {
            const cacheKey = `wallet_cache_${walletAddr.toLowerCase()}`;
            const cacheData = {
              data: cachedData,
              timestamp: Date.now(),
            };

            try {
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              console.log(`💾 Saved user data to wallet cache: ${cacheKey}`);
              console.log(`💾 Cache data:`, cacheData); // ✅ DEBUG
            } catch (e) {
              console.warn("⚠️ Failed to save wallet cache:", e);
            }
          } else {
            console.error("❌ No wallet_address in user data - cannot save cache!");
          }
        } else {
          // ✅ FIX: Show alert when getUserInfo failed for returning user
          console.error("❌ getUserInfo failed for returning user:", userInfoResult);

          const errorMsg = userInfoResult.message || "Không thể tải dữ liệu từ database";

          alert(
            `⚠️ Không thể tải dữ liệu tài khoản của bạn!\n\n` +
            `Lý do: ${errorMsg}\n\n` +
            `Vui lòng:\n` +
            `1. Kiểm tra kết nối mạng\n` +
            `2. Thử đăng nhập lại sau 1-2 phút\n` +
            `3. Liên hệ admin@migofin.com nếu vẫn lỗi`
          );

          // ✅ FIX: Redirect to Calculator and clear auth
          setIsLoading(false);
          setCurrentPage("calculator");
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          setCurrentUser(null);

          return; // ← EXIT early
        }
      }
    } catch (error) {
      console.error("❌ Error in handleLogin:", error);
      // On error, try to fetch onchain data as fallback
      if (user.walletAddress) {
        try {
          const { analyzeWallet } = await import("./services/api-real");
          const onchainData = await analyzeWallet(user.walletAddress);
          setWalletData(onchainData);
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }

    // Chuyển đến Dashboard
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    // Xóa localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    // Reset state
    setCurrentUser(null);
    setWalletData(null);
    setWalletAddress("");
    setShowResults(false);

    // Về trang Calculator (KHÔNG về trang login)
    setCurrentPage("calculator");

    console.log("✅ Đăng xuất thành công - về Calculator");
  };

  // ✅ Handle Calculate Click - Show CAPTCHA first
  const handleCalculateClick = () => {
    if (!walletAddress.trim()) return;

    // Validate wallet address or email format first
    const address = walletAddress.trim();
    if (!isValidEmail(address) && !isValidWalletAddress(address)) {
      alert("Vui lòng nhập địa chỉ ví hợp lệ (0x...) hoc email đã đăng ký.");
      return;
    }

    // Show CAPTCHA dialog
    setShowCaptchaCalculator(true);
  };

  // ✅ Handle CAPTCHA verified - Continue with calculation
  const handleCaptchaVerifiedCalculator = () => {
    handleCalculateScore();
  };

  const handleCalculateScore = async () => {
    if (!walletAddress.trim()) return;

    setIsLoading(true);
    try {
      let actualWalletAddress = walletAddress.trim();

      // Kiểm tra nếu là email, cần lấy wallet address
      if (isValidEmail(actualWalletAddress)) {
        console.log("🔍 Email phát hiện, đang tìm ví...");
        const result = await getWalletByEmail(actualWalletAddress);

        if (result.success && result.walletAddress) {
          actualWalletAddress = result.walletAddress;
          console.log("✅ Tìm thấy ví:", actualWalletAddress);
        } else {
          alert(
            result.message ||
            t.calculator.input.emailNotFound
          );
          setIsLoading(false);
          return;
        }
      } else if (!isValidWalletAddress(actualWalletAddress)) {
        // Nếu không phải email và không phải wallet address hợp lệ
        alert(
          "Vui lòng nhập địa chỉ ví hợp lệ (0x...) hoặc email đã đăng ký."
        );
        setIsLoading(false);
        return;
      }

      // ✅ CHECK CACHE FIRST - Before calling API
      const cacheKey = `wallet_cache_${actualWalletAddress.toLowerCase()}`;
      const cachedDataStr = localStorage.getItem(cacheKey);

      if (cachedDataStr) {
        try {
          const cachedData = JSON.parse(cachedDataStr);
          const cacheAge = Date.now() - cachedData.timestamp;
          const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

          if (cacheAge < CACHE_EXPIRY) {
            console.log(`💾 Using cached data for ${actualWalletAddress} (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
            setWalletData(cachedData.data);
            setWalletAddress(actualWalletAddress);
            setShowResults(true);

            // Still check subscription status
            const status = await checkSubscriptionStatus(actualWalletAddress);
            setSubscriptionStatus(status);

            setIsLoading(false);
            return; // ← EXIT early, don't call API
          } else {
            console.log(`⏰ Cache expired for ${actualWalletAddress}, fetching fresh data...`);
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse cache:", e);
        }
      }

      // ✅ NO CACHE or EXPIRED - Call API
      console.log(`🌐 Fetching fresh data from API for ${actualWalletAddress}...`);
      const data = await analyzeWallet(actualWalletAddress);

      // ✅ SAVE TO CACHE
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log(`💾 Saved fresh data to cache: ${cacheKey}`);
      } catch (e) {
        console.warn("⚠️ Failed to save cache:", e);
      }

      setWalletData(data);
      setWalletAddress(actualWalletAddress);
      setShowResults(true);

      // Kiểm tra subscription status
      const status = await checkSubscriptionStatus(actualWalletAddress);
      setSubscriptionStatus(status);
    } catch (error) {
      // Extract error message first
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Check if it's a backend quota/rate limit error
      const isQuotaError =
        errorMsg.includes('401') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('consumed') ||
        errorMsg.includes('upgrade your plan') ||
        errorMsg.includes('Validation service blocked') ||
        errorMsg.includes('Moralis API error') ||
        (errorMsg.includes('500') && errorMsg.includes('free-plan'));

      // Pretty console logging (instead of ugly error dump)
      if (isQuotaError) {
        console.log(
          '%c⚠️ BACKEND QUOTA ERROR',
          'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
        );
        console.log(
          '%c📊 Issue: Moralis Free Plan quota exhausted',
          'color: #fbbf24; font-weight: bold;'
        );
        console.log(
          '%c💡 Solution: Backend needs to upgrade plan at moralis.io/pricing',
          'color: #60a5fa;'
        );
        console.log(
          '%c⏰ Alternative: Wait for quota reset (daily)',
          'color: #60a5fa;'
        );
        console.log(
          '%c🔗 More info: https://moralis.io/pricing',
          'color: #34d399;'
        );
      } else {
        console.log(
          '%c❌ API ERROR',
          'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
        );
        console.log('%cError details:', 'color: #f87171; font-weight: bold;', errorMsg);
        // Only log error message to avoid memory issues
        if (error instanceof Error) {
          console.error('Error name:', error.name, 'Message:', error.message);
        }
      }

      // Set error state and show dialog
      setErrorMessage(errorMsg);

      if (isQuotaError) {
        setErrorType("quota");
        setShowQuotaWarning(true); // Show quota warning banner
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        setErrorType("network");
      } else {
        setErrorType("general");
      }

      setShowErrorDialog(true);

      // Fallback alert if dialog fails to show (shouldn't happen)
      setTimeout(() => {
        if (!document.querySelector('[role="dialog"]')) {
          console.warn('⚠️ ErrorDialog did not show, using fallback alert');
          alert(
            isQuotaError
              ? '⚠️ Backend đang hết quota Moralis.\n\nVui lòng thử lại sau 1-2 giờ hoặc liên hệ admin@migofin.com'
              : `❌ Lỗi: ${errorMsg.substring(0, 200)}`
          );
        }
      }, 100);
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
    // ✅ REMOVED: setUseDemoMode(false); // Reset demo mode
  };

  // ✅ REMOVED: handleTryDemoMode - No demo mode, app uses real data only

  const handleSubscribeClick = () => {
    if (subscriptionStatus?.verified) {
      // Nếu đã subscribe, hiển thị option để unsubscribe
      handleUnsubscribe();
    } else {
      // Mở dialog OTP verification
      setShowOTPDialog(true);
    }
  };

  const handleOTPSuccess = async (email: string) => {
    // Cập nhật subscription status
    const status = await checkSubscriptionStatus(walletAddress);
    setSubscriptionStatus(status);
  };

  const handleUnsubscribe = async () => {
    if (
      confirm("Bạn có chắc muốn hủy nhận cập nhật cho ví này?")
    ) {
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
        await sendWeeklyReport(
          subscriptionStatus.email,
          walletAddress,
        );
        alert("Báo cáo đã được gửi đến email của bạn!");
      } catch (error) {
        console.error("Lỗi khi gửi báo cáo:", error);
      }
    }
  };

  const handleEmailLogin = (email: string) => {
    // DEMO: Giả lập đng nhập qua magic link
    // Trong thực tế, backend sẽ verify JWT token từ link

    // Validate email
    if (!email || typeof email !== 'string') {
      console.error('Invalid email:', email);
      return;
    }

    // Tạo mock user từ email và tự động lưu wallet address hiện tại
    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(7),
      email: email,
      name: email.split("@")[0], // Lấy phần trước @ làm tên
      walletAddress: walletAddress || "", // Tự động lưu wallet đã nhập
      createdAt: new Date().toISOString(), // Ngày tạo tài khoản
      lastLogin: new Date().toISOString(), // Đăng nhập lần cuối
    };

    // Tạo mock auth token
    const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36)}`;

    // Lưu vào localStorage
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem(
      "currentUser",
      JSON.stringify(mockUser),
    );

    // Set state và chuyển đến dashboard
    setCurrentUser(mockUser);
    setCurrentPage("dashboard");

    console.log(
      "✅ Đăng nhập thành công qua Magic Link:",
      email,
    );
    console.log("📍 Wallet Address:", walletAddress);
  };

  // trang calculator chính
  const renderCalculatorPage = () => (
    <div
      className={`relative overflow-hidden bg-[#0f1419] ${!showResults ? "h-screen" : "min-h-screen"}`}
    >
      {/* Quota Warning Banner */}
      {showQuotaWarning && (
        <QuotaWarningBanner onDismiss={() => setShowQuotaWarning(false)} />
      )}

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-teal-500/12 to-blue-500/12 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Top Left - Logo */}
      <div className="absolute top-2.5 md:top-4 left-4 md:left-6 z-20">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-9 h-9 md:w-12 md:h-12 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center">
            <ImageWithFallback
              src={logoImage}
              alt="ScorePage Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Top Right - Register & Login Buttons & Language Switcher (if not logged in) */}
      {!currentUser && (
        <div className="absolute top-2.5 md:top-4 right-2.5 md:right-4 z-20 flex items-center gap-1 md:gap-2">
          {/* Language Switcher - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:block">
            <LanguageSwitcher size="sm" />
          </div>

          {/* Đăng ký button */}
          <Button
            onClick={() => {
              setLoginTab("register");
              setCurrentPage("login");
            }}
            variant="outline"
            className="bg-slate-800/90 backdrop-blur-sm border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:text-white rounded-lg h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-sm font-medium whitespace-nowrap transition-all duration-300"
          >
            {t.auth.register}
          </Button>

          {/* Đăng nhập button */}
          <Button
            onClick={() => setShowEmailLoginDialog(true)}
            variant="outline"
            className="bg-slate-800/90 backdrop-blur-sm border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:text-white rounded-lg h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-sm font-medium whitespace-nowrap transition-all duration-300"
          >
            {t.navigation.login}
          </Button>
        </div>
      )}

      <div
        className={`relative z-10 container mx-auto px-3 md:px-4 ${!showResults ? "h-full flex flex-col justify-center py-4 md:py-8" : "py-3 md:py-4"}`}
      >
        {!showResults ? (
          /* Input Form - Center Focus - Subtle Responsive Scaling */
          <div className="max-w-[28rem] md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto w-full space-y-2.5 md:space-y-3 px-2">
            {/* Title - Center */}
            <div className="text-center animate-in fade-in-0 duration-1000 pt-12 md:pt-0">
              <h1 className="text-[1.65rem] leading-[1.2] md:text-[2.75rem] mb-2.5 md:mb-3.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight pb-0.5 px-2 md:px-4 md:whitespace-nowrap">
                {t.calculator.title}
              </h1>

              {/* 3 Privacy Icons ngay dưới title - Responsive cho mobile */}
              <div className="flex items-center justify-center px-2 mb-0">
                <div className="inline-flex flex-wrap md:flex-nowrap items-center justify-center gap-x-1.5 gap-y-1 md:gap-x-2.5 md:gap-y-0 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-full backdrop-blur-sm">
                  <div className="flex items-center gap-0.5 md:gap-1.5 whitespace-nowrap">
                    <Shield className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-[9px] md:text-sm text-cyan-300">{t.calculator.privacy.decentralized}</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-cyan-400/50 rounded-full flex-shrink-0 hidden md:block"></div>
                  <div className="flex items-center gap-0.5 md:gap-1.5 whitespace-nowrap">
                    <Lock className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-[9px] md:text-sm text-purple-300">{t.calculator.privacy.noPersonalInfo}</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-cyan-400/50 rounded-full flex-shrink-0 hidden md:block"></div>
                  <div className="flex items-center gap-0.5 md:gap-1.5 whitespace-nowrap">
                    <Info className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-[9px] md:text-sm text-blue-300">{t.calculator.privacy.onlyPublicData}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Card - Calculator */}
            <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-10 duration-1000 rounded-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-slate-500/15 rounded-xl blur-lg opacity-50" />

              <div className="relative">
                <CardHeader className="text-center pb-1 md:pb-1.5 pt-2.5 md:pt-3 px-3 md:px-4">
                  <CardTitle className="text-sm md:text-base text-white flex items-center justify-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                    <div className="relative">
                      <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    {t.calculator.input.title}
                  </CardTitle>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    {t.calculator.input.subtitle}
                  </p>
                </CardHeader>

                <CardContent className="space-y-1.5 md:space-y-2 p-3 md:p-4 pb-3 md:pb-3.5">
                  <div className="space-y-1 md:space-y-1.5 mt-0">
                    <Label
                      htmlFor="wallet"
                      className="text-gray-300 text-[10px] md:text-xs"
                    >
                      {t.calculator.input.label}
                    </Label>
                    <div className="relative w-full">
                      <Input
                        id="wallet"
                        type={showWalletAddress ? "text" : "password"}
                        placeholder={t.calculator.input.placeholder}
                        inputMode="none"
                        autoComplete="new-password"
                        value={walletAddress}
                        onChange={(e) => {
                          setWalletAddress(e.target.value);
                        }}
                        className="h-9 md:h-10 bg-slate-900/50 border border-cyan-500/30 
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 
                          text-white placeholder:text-gray-500 text-xs md:text-sm rounded-lg 
                          transition-all duration-300 pr-9 md:pr-10 w-full"
                      />

                      {/* 👁 Nút hiện/ẩn */}
                      <div className="absolute inset-y-0 right-2 md:right-2.5 flex items-center h-full">
                        <button
                          type="button"
                          onClick={() => setShowWalletAddress(!showWalletAddress)}
                          className="text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {showWalletAddress ? <Eye size={14} className="md:w-4 md:h-4" /> : <EyeOff size={14} className="md:w-4 md:h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ℹ️ Gợi ý định dạng */}
                  {walletAddress && walletAddress.length > 0 && (
                    <p className="text-gray-400 text-[9px] md:text-xs flex items-center gap-1 md:gap-1.5">
                      {isValidEmail(walletAddress) ? (
                        <>
                          <Mail className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="text-cyan-400">Email phát hiện - Sẽ tìm ví</span>
                        </>
                      ) : walletAddress.startsWith("0x") ? (
                        <>
                          <Wallet className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-teal-400 flex-shrink-0" />
                          <span className="text-teal-400">
                            {walletAddress.length === 42
                              ? t.calculator.input.validWallet
                              : `${walletAddress.length}/42`}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500"></span>
                      )}
                    </p>
                  )}

                  {/* Button Container with Decoration */}
                  <div className="relative pt-1 md:pt-1.5">
                    {/* Decorative elements around button */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />

                    {/* Animated particles */}
                    <div className="absolute -top-1 left-1/4 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-ping" />
                    <div className="absolute -top-1 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping delay-300" />

                    <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 relative">
                      <Button
                        onClick={handleCalculateClick}
                        disabled={
                          !walletAddress.trim() || isLoading
                        }
                        className="relative flex-1 h-10 md:h-11 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] transition-all duration-500 disabled:opacity-50 rounded-xl group overflow-hidden border border-blue-400/30"
                      >
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Animated glow ring */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-70 blur-sm transition-opacity duration-500 animate-pulse" />

                        {/* Button content */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          {isLoading ? (
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <div className="w-4 h-4 md:w-4.5 md:h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="text-xs md:text-sm">
                                {t.calculator.buttons.analyzing}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <TrendingUp className="w-4 h-4 md:w-4.5 md:h-4.5 group-hover:scale-110 transition-transform" />
                              <span className="text-xs md:text-sm">
                                {t.calculator.buttons.calculate}
                              </span>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/40 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/40 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </div>
                  </div>

                  {/* Feature highlights - Icons only on mobile */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2.5 pt-1.5 md:pt-2 border-t border-cyan-500/10 text-[9px] md:text-[10px] text-gray-500">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
                      <span className="hidden sm:inline">{t.calculator.features.noStore}</span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400" />
                      <span className="hidden sm:inline">{t.calculator.features.decentralized}</span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <Info className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
                      <span className="hidden sm:inline">{t.calculator.features.transparent}</span>
                    </div>
                  </div>

                  {/* Description text - Đánh giá độ tin cậy */}
                  <div className="text-center pt-1 md:pt-1.5 pb-0">
                    <div className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-cyan-500/10 rounded-full backdrop-blur-sm">
                      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 italic">
                        {t.calculator.subtitle}
                      </p>
                      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        ) : (
          /* Results Section - Responsive Max Width for Large Screens */
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-3 px-3 md:px-4 pt-12 md:pt-0">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-cyan-500/20 backdrop-blur-sm border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 hover:text-cyan-200 hover:border-cyan-400/50 transition-all duration-300 rounded-lg md:rounded-xl px-3 md:px-6 py-1.5 md:py-3 text-xs md:text-base h-8 md:h-auto"
              >
                ← {t.calculator.buttons.tryAnother}
              </Button>

              {/*  REMOVED: Demo Mode Banner - No longer needed */}
            </div>

            {walletData ? (
              <>
                <ScoreResult
                  score={walletData.score}
                  walletAge={walletData.walletAge}
                  totalTransactions={walletData.totalTransactions}
                  tokenDiversity={walletData.tokenDiversity}
                  totalAssets={walletData.totalAssets}
                  tokenBalances={walletData.tokenBalances}
                  recentTransactions={walletData.recentTransactions}
                  // ✅ NEW: Pass feature importance & recommendations from API
                  featureImportance={walletData.featureImportance}
                  recommendations={walletData.recommendations}
                />
                <ResultsSummary
                  walletData={walletData}
                  isRecalculating={isRecalculating}
                  onRecalculate={handleRecalculate}
                  subscriptionStatus={subscriptionStatus}
                  onSubscribeClick={() => setShowEmailLoginDialog(true)}
                  onRegisterClick={() => setShowQuickRegisterDialog(true)}
                  onSendReport={handleSendReport}
                />
              </>
            ) : (
              <div className="text-center text-gray-400">
                <p>{t.calculator.noData}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <OTPVerificationDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        walletAddress={walletAddress}
        onSuccess={handleOTPSuccess}
      />

      {/* Email Login Dialog */}
      <EmailLoginDialog
        open={showEmailLoginDialog}
        onOpenChange={setShowEmailLoginDialog}
        onMagicLinkSuccess={handleEmailLogin}
        walletAddress={walletAddress}
        onNavigateToRegister={(email) => {
          // ✅ NEW: Navigate to auth page (login page) with register tab
          setPrefilledEmail(email); // Save email for pre-fill
          setShowEmailLoginDialog(false); // Close login dialog
          setLoginTab("register"); // Switch to register tab
          setCurrentPage("login"); // Navigate to auth page
        }}
        onRegisterClick={() => {
          // ✅ DEPRECATED: Fallback to QuickRegisterDialog (old flow)
          setShowEmailLoginDialog(false);
          setShowQuickRegisterDialog(true);
        }}
      />

      {/* Quick Register Dialog */}
      <QuickRegisterDialog
        open={showQuickRegisterDialog}
        onOpenChange={setShowQuickRegisterDialog}
        walletAddress={walletAddress}
        onSuccess={(user) => {
          handleLogin(user);
          setShowQuickRegisterDialog(false);
        }}
      />

      {/* Floating Feedback Button - Show on all pages */}
      <FloatingFeedbackButton
        onClick={() => setShowFeedbackDialog(true)}
      />

      {/* Feature Feedback Dialog */}
      <FeatureFeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      {/* Loading Progress Overlay */}
      <LoadingProgress
        isVisible={isLoading}
        walletAddress={walletAddress}
        onCancel={() => {
          setIsLoading(false);
          setLoadingProgress(0);
          setLoadingMessage("");
          setLoadingStep(0);
        }}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorType={errorType}
        errorMessage={errorMessage}
      />

      {/* CAPTCHA Dialog */}
      <CaptchaDialog
        open={showCaptchaCalculator}
        onOpenChange={setShowCaptchaCalculator}
        onVerified={handleCaptchaVerifiedCalculator}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* ✅ Verify Page - Show when URL is #/verify?token=xxx */}
      {showVerifyPage && (
        <VerifyPage
          onVerifySuccess={(user) => {
            handleLogin(user);
            window.location.hash = ""; // Clear hash after success
          }}
          onBackToLogin={() => {
            window.location.hash = ""; // Clear hash
            setCurrentPage("login");
          }}
        />
      )}

      {/* Normal App - Hide when showing verify page */}
      {!showVerifyPage && (
        <>
          {/* Navigation - Only show when logged in */}
          {currentUser && (
            <Navigation
              currentPage={currentPage}
              user={currentUser}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              onConnectWallet={() => setIsWalletModalOpen(true)} // ✅ NEW: Open wallet modal
            />
          )}

          {/* Page Content */}
          {currentPage === "login" && (
            <Login
              onRegisterSuccess={handleLogin}
              onBackToCalculator={() => setCurrentPage("calculator")}
              initialEmail={prefilledEmail} // ✅ NEW: Pass pre-filled email from navigation
            />
          )}
          {currentPage === "calculator" && renderCalculatorPage()}
          {currentPage === "dashboard" && currentUser && (
            <Dashboard
              user={currentUser}
              walletData={walletData}
              onLogout={handleLogout}
              onViewProfile={() => setCurrentPage("profile")}
              onCalculateScore={() => setCurrentPage("calculator")}
              onRecalculate={handleRecalculate}
            />
          )}
          {currentPage === "profile" && currentUser && (
            <ProfilePage
              user={currentUser}
              walletData={walletData}
              onUpdateProfile={setCurrentUser}
              onBack={() => setCurrentPage("dashboard")}
            />
          )}

          {/* Floating Feedback Button - Show on all pages */}
          <FloatingFeedbackButton onClick={() => setShowFeedbackDialog(true)} />

          {/* Feature Feedback Dialog */}
          <FeatureFeedbackDialog
            open={showFeedbackDialog}
            onOpenChange={setShowFeedbackDialog}
          />

          {/* Toast Notifications */}
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Connect Wallet Modal - Show on all pages when logged in */}
      {currentUser && (
        <ConnectWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </div>
  );
}
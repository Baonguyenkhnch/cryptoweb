// File này chứa các hàm gọi API
// Hiện tại dùng mock data để test, sau này sẽ thay bằng API thật

export interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
  percentage: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: "send" | "receive";
  token: string;
  amount: number;
  value: number;
  hash: string;
}

export interface WalletAnalysis {
  score: number;
  walletAge: number;
  totalTransactions: number;
  tokenDiversity: number;
  totalAssets: number;
  rating: string;
  tokenBalances: TokenBalance[];
  recentTransactions: Transaction[];
}

export interface CreditScoreData {
  score: number;
  walletAge: number;
  totalTransactions: number;
  tokenDiversity: number;
  totalAssets: number;
  rating: string;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  walletAddress: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export interface EmailSubscription {
  email: string;
  walletAddress: string;
  subscribedAt: string;
  frequency: "weekly" | "monthly" | "onchange";
  verified: boolean;
}

export interface FeatureFeedback {
  featureName: string;
  description: string;
  email?: string;
  timestamp: string;
}

const API_BASE_URL = "https://api.example.com/v1";
const MOCK_DELAY = 1500;

const simulateApiCall = <T,>(data: T, delay = MOCK_DELAY): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Các hàm xử lý authentication
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const mockResponse: AuthResponse = {
    success: true,
    token: "mock_jwt_token_" + Date.now(),
    user: {
      id: "user_123",
      walletAddress: "0x742d35Cc6231e4a8F5b2FaC6E9B4F9D2E5A7B8C9D1",
      email: credentials.email,
      name: "Crypto User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoUser",
      createdAt: "2024-01-15T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  };

  return simulateApiCall(mockResponse);
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const mockResponse: AuthResponse = {
    success: true,
    token: "mock_jwt_token_" + Date.now(),
    user: {
      id: "user_" + Date.now(),
      walletAddress: data.walletAddress,
      email: data.email,
      name: "New User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  };

  return simulateApiCall(mockResponse);
};

export const logout = async (): Promise<{ success: boolean }> => {
  return simulateApiCall({ success: true }, 500);
};

// Hàm phân tích ví đầy đủ (bao gồm tokens và transactions)
export const analyzeWallet = async (walletAddress: string): Promise<WalletAnalysis> => {
  const hash = walletAddress.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = 550 + (hash % 300); // Score từ 550-850

  // Tạo dữ liệu token balance
  const tokens = ["ETH", "USDT", "USDC", "DAI", "WBTC", "LINK", "UNI", "AAVE"];
  const tokenBalances: TokenBalance[] = tokens.slice(0, 5 + (hash % 4)).map((token, idx) => {
    const baseValue = 5000 / (idx + 1);
    const value = baseValue * (1 + (Math.random() * 0.5));
    return {
      symbol: token,
      balance: value / (100 + idx * 50),
      value: Math.round(value),
      percentage: 0, // sẽ tính sau
    };
  });

  // Tính phần trăm cho mỗi token
  const totalValue = tokenBalances.reduce((sum, t) => sum + t.value, 0);
  tokenBalances.forEach(token => {
    token.percentage = (token.value / totalValue) * 100;
  });

  // Tạo dữ liệu transaction history (10 giao dịch gần nhất)
  const recentTransactions: Transaction[] = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 2);
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const type = Math.random() > 0.5 ? "receive" : "send";
    const amount = Math.random() * 10 + 0.1;
    const value = amount * (1000 + Math.random() * 1000);

    recentTransactions.push({
      id: `tx_${i}_${hash}`,
      date: date.toISOString(),
      type,
      token,
      amount: parseFloat(amount.toFixed(4)),
      value: Math.round(value),
      hash: `0x${Math.random().toString(16).substring(2, 15)}...${Math.random().toString(16).substring(2, 7)}`,
    });
  }

  const mockData: WalletAnalysis = {
    score: Math.min(score, 850),
    walletAge: 200 + (hash % 400), // 200-600 ngày
    totalTransactions: 500 + (hash % 1500), // 500-2000 transactions
    tokenDiversity: tokenBalances.length,
    totalAssets: Math.round(totalValue),
    rating: getRating(score),
    tokenBalances,
    recentTransactions,
  };

  return simulateApiCall(mockData, 2000);
};

// Hàm tính credit score (giữ lại để backward compatible)
export const calculateCreditScore = async (walletAddress: string): Promise<CreditScoreData> => {
  const analysis = await analyzeWallet(walletAddress);
  return {
    score: analysis.score,
    walletAge: analysis.walletAge,
    totalTransactions: analysis.totalTransactions,
    tokenDiversity: analysis.tokenDiversity,
    totalAssets: analysis.totalAssets,
    rating: analysis.rating,
  };
};

export const getScoreHistory = async (walletAddress: string): Promise<Array<{ date: string; score: number }>> => {
  const history = [];
  const baseScore = 700;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = Math.random() * 50 - 25; // +/- 25 điểm

    history.push({
      date: date.toISOString().split("T")[0],
      score: Math.round(baseScore + variation),
    });
  }

  return simulateApiCall(history, 1000);
};

// Các hàm xử lý user profile
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const mockProfile: UserProfile = {
    id: userId,
    walletAddress: "0x742d35Cc6231e4a8F5b2FaC6E9B4F9D2E5A7B8C9D1",
    email: "user@example.com",
    name: "Crypto Investor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userId,
    createdAt: "2024-01-15T00:00:00Z",
    lastLogin: new Date().toISOString(),
  };

  return simulateApiCall(mockProfile);
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const currentProfile = await getUserProfile(userId);
  const updatedProfile = { ...currentProfile, ...updates };

  return simulateApiCall(updatedProfile, 1000);
};

// Đăng ký nhận email cập nhật
export const subscribeToUpdates = async (
  email: string,
  walletAddress: string,
  frequency: "weekly" | "monthly" | "onchange" = "weekly"
): Promise<{ success: boolean; message: string }> => {
  // Mock API call - trong thực tế sẽ lưu vào database
  const subscription: EmailSubscription = {
    email,
    walletAddress,
    subscribedAt: new Date().toISOString(),
    frequency,
    verified: false,
  };

  console.log("Đăng ký email thành công:", subscription);

  return simulateApiCall(
    {
      success: true,
      message: "Đăng ký thành công! Bạn sẽ nhận được email cập nhật định kỳ.",
    },
    1500
  );
};

// Gửi OTP đến email
export const requestOTP = async (email: string, walletAddress: string): Promise<{ success: boolean; message: string }> => {
  console.log("Gửi OTP đến:", email, "cho ví:", walletAddress);

  return simulateApiCall(
    {
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn.",
    },
    1000
  );
};

// Xác thực OTP
export const verifyOTP = async (
  email: string,
  walletAddress: string,
  otp: string
): Promise<{ success: boolean; message: string; subscription?: EmailSubscription }> => {
  console.log("Xác thực OTP:", otp, "cho email:", email);

  // Mock verification - trong thực tế sẽ kiểm tra OTP từ backend
  const subscription: EmailSubscription = {
    email,
    walletAddress,
    subscribedAt: new Date().toISOString(),
    frequency: "weekly",
    verified: true,
  };

  // Lưu vào localStorage để kiểm tra subscription status
  const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "{}");
  subscriptions[walletAddress] = subscription;
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions));

  return simulateApiCall(
    {
      success: true,
      message: "Xác thực thành công!",
      subscription,
    },
    1000
  );
};

// Kiểm tra subscription status cho một ví
export const checkSubscriptionStatus = async (walletAddress: string): Promise<EmailSubscription | null> => {
  const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "{}");
  return subscriptions[walletAddress] || null;
};

// Hủy subscription
export const unsubscribe = async (walletAddress: string): Promise<{ success: boolean; message: string }> => {
  const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "{}");
  delete subscriptions[walletAddress];
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions));

  return simulateApiCall(
    {
      success: true,
      message: "Đã hủy đăng ký thành công.",
    },
    500
  );
};

// Gửi feedback tính năng
export const submitFeatureFeedback = async (
  featureName: string,
  description: string,
  email?: string
): Promise<{ success: boolean; message: string }> => {
  const feedback: FeatureFeedback = {
    featureName,
    description,
    email,
    timestamp: new Date().toISOString(),
  };

  console.log("Gửi feedback:", feedback);

  // Mock API call - trong thực tế sẽ lưu vào database
  return simulateApiCall(
    {
      success: true,
      message: "Cảm ơn bạn đã đóng góp ý kiến!",
    },
    1000
  );
};

// Gửi báo cáo tuần qua
export const sendWeeklyReport = async (email: string, walletAddress: string): Promise<{ success: boolean; message: string }> => {
  console.log("Gửi báo cáo tuần qua cho:", email);

  return simulateApiCall(
    {
      success: true,
      message: "Báo cáo đã được gửi đến email của bạn.",
    },
    1500
  );
};

// helper functions
function getRating(score: number): string {
  if (score >= 750) return "AAA";
  if (score >= 700) return "AA";
  if (score >= 650) return "A";
  if (score >= 600) return "BBB";
  if (score >= 550) return "BB";
  if (score >= 500) return "B";
  return "C";
}

export const isValidWalletAddress = (address: string): boolean => {
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumRegex.test(address);
};

export const formatWalletAddress = (address: string): string => {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default {
  login,
  register,
  logout,
  analyzeWallet,
  calculateCreditScore,
  getScoreHistory,
  getUserProfile,
  updateUserProfile,
  subscribeToUpdates,
  requestOTP,
  verifyOTP,
  checkSubscriptionStatus,
  unsubscribe,
  submitFeatureFeedback,
  sendWeeklyReport,
  isValidWalletAddress,
  formatWalletAddress,
};

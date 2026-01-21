



export interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
  percentage: number;
  token_address?: string;
  name?: string;
  logo?: string;
  decimals?: number;
}


export interface Transaction {
  id: string;
  date: string;
  type: "send" | "receive";
  token: string;
  amount: number;
  value: number;
  hash: string;
  from?: string;
  to?: string;
  category?: string;
  summary?: string;
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
  // Thêm các field từ real API
  walletAddress?: string;
  chain?: string;
  employmentStatus?: string;
  monthlyIncome?: number;
  cicScore?: number;
  onChainScore?: number;
  offChainScore?: number;
  finalScore?: number;
  creditLevel?: string;
  createdAt?: string;
  updatedAt?: string;
  walletTransactionsLast30d?: number;
  stablecoinInflow30d?: number;
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


const API_BASE_URL = (() => {
  const sanitizeEnvUrl = (input: unknown): string => {
    const value = String(input ?? "").trim();
    const unquoted = value.replace(/^['"]|['"]$/g, "");
    const withoutComment = unquoted
      .replace(/\s+#.*$/, "")
      .replace(/\s+\/\/.*$/, "");
    return withoutComment.trim();
  };

  const env = import.meta.env as any;
  const raw = env.VITE_BACKEND_URL;

  const value = sanitizeEnvUrl(raw);
  if (!value) {
    console.warn("[api] Missing API base URL. Set VITE_BACKEND_URL in .env/.env.local.");
  }

  const finalValue = value || "";
  const withoutTrailingSlashes = finalValue.replace(/\/+$/, "");
  return withoutTrailingSlashes.endsWith("/api")
    ? withoutTrailingSlashes.slice(0, -4)
    : withoutTrailingSlashes;
})();
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
  // Lưu vào mock database để sau này có thể lookup bằng email
  mockUserDatabase[data.email.toLowerCase()] = data.walletAddress;


  console.log("✅ Đăng ký thành công! Email:", data.email);
  console.log("💼 Wallet được lưu:", data.walletAddress);
  console.log("📊 Database hiện tại:", mockUserDatabase);


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


// Helper: Convert real API data to WalletAnalysis format
export const convertRealApiDataToWalletAnalysis = (apiData: any): WalletAnalysis => {
  // Parse token balances từ real API
  const tokenBalances: TokenBalance[] = (apiData.total_balances || apiData.token_balances || []).map((token: any) => ({
    symbol: token.symbol || 'Unknown',
    balance: parseFloat(token.balance) / Math.pow(10, token.decimals || 18),
    value: parseFloat(token.balance_usd || 0),
    percentage: 0, // Sẽ tính lại
    token_address: token.token_address,
    name: token.name,
    logo: token.logo,
    decimals: token.decimals,
  }));


  // Tính phần trăm cho mỗi token
  const totalValue = tokenBalances.reduce((sum, t) => sum + t.value, 0);
  tokenBalances.forEach(token => {
    token.percentage = totalValue > 0 ? (token.value / totalValue) * 100 : 0;
  });


  // Parse transaction history từ real API
  const recentTransactions: Transaction[] = (apiData.transaction_history || []).slice(0, 10).map((tx: any) => {
    // Xác định type từ direction hoặc from_address/to_address
    let type: "send" | "receive" = "send";
    if (tx.from_address?.toLowerCase() !== apiData.wallet_address?.toLowerCase()) {
      type = "receive";
    }


    // Lấy token từ erc20_transfers hoặc native_transfers
    let token = "ETH";
    let amount = 0;
    let value = 0;


    if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
      const transfer = tx.erc20_transfers[0];
      token = transfer.token_symbol || "Unknown";
      amount = parseFloat(transfer.value_formatted || 0);
      value = parseFloat(transfer.value) || 0;
    } else if (tx.native_transfers && tx.native_transfers.length > 0) {
      const transfer = tx.native_transfers[0];
      token = transfer.token_symbol || "ETH";
      amount = parseFloat(transfer.value_formatted || 0);
      value = parseFloat(transfer.value) || 0;
    }


    return {
      id: tx.hash,
      date: tx.block_timestamp,
      type: type,
      token: token,
      amount: amount,
      value: value,
      hash: tx.hash,
      from: tx.from_address,
      to: tx.to_address,
      category: tx.category,
      summary: tx.summary,
    };
  });


  // Tính wallet age từ transaction đầu tiên
  const oldestTx = apiData.transaction_history?.[apiData.transaction_history.length - 1];
  const walletAge = oldestTx?.block_timestamp
    ? Math.floor((Date.now() - new Date(oldestTx.block_timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : apiData.wallet_age_days || 0;


  // Tính điểm từ final_score hoặc on_chain_score
  const score = apiData.final_score
    ? Math.round(apiData.final_score * 850) // Convert từ 0-1 sang 0-850
    : apiData.on_chain_score
      ? Math.round(apiData.on_chain_score * 850)
      : 550;


  const finalScore = Math.min(score, 850);
  return {
    score: finalScore,
    walletAge: walletAge,
    totalTransactions: apiData.total_transactions || 0,
    tokenDiversity: apiData.token_diversity || tokenBalances.length,
    totalAssets: apiData.total_assets_usd || totalValue,
    // ✅ FIX: If score is 0, always return "N/A" regardless of API's credit_level
    rating: finalScore === 0 ? "N/A" : (apiData.credit_level || getRating(finalScore)),
    tokenBalances: tokenBalances,
    recentTransactions: recentTransactions,
    walletAddress: apiData.wallet_address,
    chain: apiData.chain,
    employmentStatus: apiData.employment_status,
    monthlyIncome: apiData.monthly_income,
    cicScore: apiData.cic_score,
    onChainScore: apiData.on_chain_score,
    offChainScore: apiData.off_chain_score,
    finalScore: apiData.final_score,
    creditLevel: apiData.credit_level,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
  };
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
  if (score === 0) return "N/A"; // ✅ No score = No rating
  if (score >= 750) return "AAA";
  if (score >= 700) return "AA";
  if (score >= 650) return "A";
  if (score >= 600) return "BBB";
  if (score >= 550) return "BB";
  return "B-C"; // ✅ Unified: Show "B-C" for scores < 550 instead of separate "B" or "C"
}


export const isValidWalletAddress = (address: string): boolean => {
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumRegex.test(address);
};


export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const formatWalletAddress = (address: string): string => {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};


// Mock database để lưu email-wallet mapping
// Trong production, sẽ lưu vào database thật
// 🔥 DEMO DATA - Bạn có thể test bằng các email này:
const mockUserDatabase: Record<string, string> = {
  "test@gmail.com": "0x742d35Cc6231e4a8F5b2FaC6E9B4F9D2E5A7B8C9D1",
  "demo@example.com": "0x1234567890abcdef1234567890abcdef12345678",
  "user@migofin.com": "0xabcdef1234567890abcdef1234567890abcdef12",
  "alice@crypto.com": "0x9876543210fedcba9876543210fedcba98765432",
  "bob@defi.io": "0x1111222233334444555566667777888899990000",
};


// Đăng ký email + wallet (Quick Register)
export const registerWalletWithEmail = async (data: {
  email: string;
  password: string;
  walletAddress: string;
}): Promise<{ success: boolean; message?: string }> => {
  console.log("📝 Đăng ký email + wallet:", data.email, "→", data.walletAddress);


  // Validate
  if (!isValidEmail(data.email)) {
    return {
      success: false,
      message: "Email không hợp lệ",
    };
  }


  if (!isValidWalletAddress(data.walletAddress)) {
    return {
      success: false,
      message: "Địa chỉ ví không hợp lệ",
    };
  }


  if (data.password.length < 6) {
    return {
      success: false,
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    };
  }


  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));


  // Kiểm tra email đã tồn tại chưa
  if (mockUserDatabase[data.email.toLowerCase()]) {
    console.log("❌ Email đã được đăng ký:", data.email);
    return {
      success: false,
      message: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
    };
  }


  // Lưu vào mock database
  mockUserDatabase[data.email.toLowerCase()] = data.walletAddress;


  console.log("✅ Đăng ký thành công!");
  console.log("📊 Database hiện tại:", mockUserDatabase);


  return {
    success: true,
  };
};


// Lấy wallet address từ email (cho user đã đăng ký)
export const getWalletByEmail = async (email: string): Promise<{ success: boolean; walletAddress?: string; message?: string }> => {
  console.log("🔍 Tìm kiếm ví từ email:", email);


  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));


  const walletAddress = mockUserDatabase[email.toLowerCase()];


  if (walletAddress) {
    console.log("✅ Tìm thấy ví:", walletAddress);
    return {
      success: true,
      walletAddress,
    };
  } else {
    console.log("❌ Không tìm thấy ví cho email:", email);
    return {
      success: false,
      message: "Email này chưa được đăng ký hoặc chưa liên kết ví.",
    };
  }
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




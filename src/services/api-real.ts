// =====================================================
// FILE NÀY CHỨA API THẬT - SỬ DỤNG KHI ĐÃ SẴN SÀNG
// =====================================================
// 
// CÁCH SỬ DỤNG:
// 1. Đổi tên file này thành api.ts (backup file cũ trước)
// 2. Hoặc copy nội dung này vào file api.ts
// 3. Test bằng test-api.html
//
// =====================================================

// Giữ nguyên các interfaces với các field mở rộng
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

// =====================================================
// THAY ĐỔI 1: API BASE URL - QUAN TRỌNG!
// =====================================================
const API_BASE_URL = "https://backend.migofin.com";

// Enable debug mode để xem logs
const DEBUG_MODE = true;

// Helper function để log khi debug
const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
        console.log(`[API Debug] ${message}`, data || "");
    }
};

// =====================================================
// THAY ĐỔI 2: HÀM ANALYZE WALLET - GỌI API THẬT
// =====================================================
export const analyzeWallet = async (walletAddress: string): Promise<WalletAnalysis> => {
    debugLog(`🔍 Analyzing wallet: ${walletAddress}`);

    try {
        // Validate wallet address format
        if (!isValidWalletAddress(walletAddress)) {
            throw new Error("Invalid wallet address format");
        }

        // Build API URL
        const url = `${API_BASE_URL}/api/credit-score/${walletAddress}`;
        debugLog(`📡 Calling API: ${url}`);

        // Call API với timeout 30 giây với retry
        const maxRetries = 2; // Retry 1 lần nếu timeout
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                debugLog(`🔄 Attempt ${attempt}/${maxRetries}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // Tối đa 30 giây

                const startTime = Date.now();
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                const endTime = Date.now();

                debugLog(`⏱️ Response time: ${endTime - startTime}ms`);
                debugLog(`📊 Response status: ${response.status} ${response.statusText}`);

                // Check if response is OK
                if (!response.ok) {
                    const errorText = await response.text();
                    debugLog(`❌ API Error: ${errorText}`);

                    // Nếu là 404, có thể wallet chưa được crawl
                    if (response.status === 404) {
                        throw new Error(`Wallet chưa được phân tích. Vui lòng thử lại sau vài phút.`);
                    }

                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }

                // Parse JSON response
                const data = await response.json();
                debugLog(`✅ API Response:`, data);

                // Success - break retry loop
                return mapWalletData(data, walletAddress);

            } catch (error: any) {
                lastError = error;

                // Nếu là AbortError (timeout)
                if (error.name === 'AbortError') {
                    debugLog(`⏱️ Attempt ${attempt} timeout (30s)`);
                    if (attempt < maxRetries) {
                        debugLog(`🔄 Retrying in 3 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    }
                } else {
                    // Lỗi khác, không retry
                    throw error;
                }
            }
        }

        // Nếu hết retry vẫn timeout
        throw new Error('⏱️ Backend phản hồi quá chậm (>30s). Backend đang xử lý dữ liệu blockchain, vui lòng đợi 1-2 phút rồi thử lại.');

    } catch (error: any) {
        debugLog(`❌ Error analyzing wallet:`, error);

        // Handle different error types
        if (error.name === 'AbortError') {
            throw new Error('⏱️ Backend phản hồi quá chậm (>30s). Backend đang xử lý dữ liệu blockchain, vui lòng đợi 1-2 phút rồi thử lại.');
        }

        if (error.message.includes('Failed to fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }

        throw error;
    }
};

// Helper function để map wallet data
function mapWalletData(data: any, walletAddress: string): WalletAnalysis {
    // =====================================================
    // THAY ĐỔI 3: MAP RESPONSE TỪ API SANG INTERFACE
    // =====================================================
    // Map từ format API thực tế

    // Parse token balances
    const tokenBalances = mapTokenBalances(data.total_balances || data.token_balances || []);

    // Tính tổng giá trị t��i sản
    const totalAssetsUsd = data.total_assets_usd || tokenBalances.reduce((sum, t) => sum + t.value, 0);

    // Tính phần trăm cho mỗi token
    if (totalAssetsUsd > 0) {
        tokenBalances.forEach(token => {
            token.percentage = (token.value / totalAssetsUsd) * 100;
        });
    }

    // Parse transactions
    const recentTransactions = mapTransactions(
        data.transaction_history || data.recent_transactions || [],
        data.wallet_address || walletAddress
    );

    // Tính wallet age từ dữ liệu thực
    const walletAge = data.wallet_age_days || (() => {
        // Nếu không có wallet_age_days, tính từ transaction đầu tiên
        const oldestTx = data.transaction_history?.[data.transaction_history.length - 1];
        if (oldestTx?.block_timestamp) {
            const ageInMs = Date.now() - new Date(oldestTx.block_timestamp).getTime();
            return Math.floor(ageInMs / (1000 * 60 * 60 * 24));
        }
        return 0;
    })();

    // Tính score từ final_score hoặc on_chain_score (scale 0-1 => 0-850)
    const rawScore = data.final_score || data.on_chain_score || 0;
    const score = Math.round(Math.min(rawScore * 850, 850));

    // Map credit level
    const rating = data.credit_level || getRating(score);

    const walletAnalysis: WalletAnalysis = {
        score: score,
        walletAge: walletAge,
        totalTransactions: data.total_transactions || 0,
        tokenDiversity: data.token_diversity || tokenBalances.length,
        totalAssets: totalAssetsUsd,
        rating: rating,
        tokenBalances: tokenBalances,
        recentTransactions: recentTransactions,
        // Extended fields
        walletAddress: data.wallet_address,
        chain: data.chain,
        employmentStatus: data.employment_status,
        monthlyIncome: data.monthly_income,
        cicScore: data.cic_score,
        onChainScore: data.on_chain_score,
        offChainScore: data.off_chain_score,
        finalScore: data.final_score,
        creditLevel: data.credit_level,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        walletTransactionsLast30d: data.wallet_transactions_last_30d,
        stablecoinInflow30d: data.stablecoin_inflow_30d,
    };

    debugLog(`✅ Mapped wallet analysis:`, walletAnalysis);
    return walletAnalysis;
}

// Helper function để map token balances từ API
function mapTokenBalances(apiData: any[]): TokenBalance[] {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((token: any) => {
        // Parse balance từ wei format
        const rawBalance = token.balance || "0";
        const decimals = token.decimals || 18;
        const balance = parseFloat(rawBalance) / Math.pow(10, decimals);

        return {
            symbol: token.symbol || token.token_symbol || '',
            balance: balance,
            value: parseFloat(token.balance_usd || token.value || 0),
            percentage: 0, // Will be calculated after
            token_address: token.token_address || token.address,
            name: token.name || token.token_name,
            logo: token.logo || token.token_logo,
            decimals: decimals,
        };
    });
}

// Helper function để map transactions từ API
function mapTransactions(apiData: any[], walletAddress?: string): Transaction[] {
    if (!Array.isArray(apiData)) return [];

    return apiData.slice(0, 10).map((tx: any, index: number) => {
        // Xác định type từ category hoặc from/to address
        let type: "send" | "receive" = "send";
        const category = tx.category || "";

        if (category.includes("receive") || category === "nft receive" || category === "token receive") {
            type = "receive";
        } else if (walletAddress && tx.from_address?.toLowerCase() !== walletAddress.toLowerCase()) {
            type = "receive";
        }

        // Lấy token symbol và amount từ transfers
        let token = "ETH";
        let amount = 0;
        let value = 0;

        // Ưu tiên ERC20 transfers
        if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
            const transfer = tx.erc20_transfers[0];
            token = transfer.token_symbol || "Unknown";
            amount = parseFloat(transfer.value_formatted || 0);
            value = parseFloat(transfer.value || 0) / Math.pow(10, transfer.token_decimals || 18);
        }
        // Nếu không có ERC20, check native transfers
        else if (tx.native_transfers && tx.native_transfers.length > 0) {
            const transfer = tx.native_transfers[0];
            token = transfer.token_symbol || "ETH";
            amount = parseFloat(transfer.value_formatted || 0);
            value = parseFloat(transfer.value || 0) / Math.pow(10, 18);
        }
        // Nếu không có transfers, check value field
        else if (tx.value) {
            amount = parseFloat(tx.value) / Math.pow(10, 18);
            value = amount;
        }

        return {
            id: tx.hash || `tx_${index}`,
            date: tx.block_timestamp || tx.timestamp || new Date().toISOString(),
            type: type,
            token: token,
            amount: amount,
            value: value,
            hash: tx.hash || tx.transaction_hash || '',
            from: tx.from_address,
            to: tx.to_address,
            category: tx.category,
            summary: tx.summary || `${type === 'send' ? 'Sent' : 'Received'} ${amount.toFixed(4)} ${token}`,
        };
    });
}

// =====================================================
// CÁC HÀM KHÁC - GIỮ NGUYÊN MOCK DATA
// =====================================================
// (Các hàm login, register, logout vẫn dùng mock data)

const MOCK_DELAY = 1500;

const simulateApiCall = <T,>(data: T, delay = MOCK_DELAY): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};

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
    // TODO: Có thể thêm API endpoint cho score history
    // Tạm thời dùng mock data
    const history = [];
    const baseScore = 700;

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = Math.random() * 50 - 25;

        history.push({
            date: date.toISOString().split("T")[0],
            score: Math.round(baseScore + variation),
        });
    }

    return simulateApiCall(history, 1000);
};

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

export const subscribeToUpdates = async (
    email: string,
    walletAddress: string,
    frequency: "weekly" | "monthly" | "onchange" = "weekly"
): Promise<{ success: boolean; message: string }> => {
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

export const verifyOTP = async (
    email: string,
    walletAddress: string,
    otp: string
): Promise<{ success: boolean; message: string; subscription?: EmailSubscription }> => {
    console.log("Xác thực OTP:", otp, "cho email:", email);

    const subscription: EmailSubscription = {
        email,
        walletAddress,
        subscribedAt: new Date().toISOString(),
        frequency: "weekly",
        verified: true,
    };

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

export const checkSubscriptionStatus = async (walletAddress: string): Promise<EmailSubscription | null> => {
    const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "{}");
    return subscriptions[walletAddress] || null;
};

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

    return simulateApiCall(
        {
            success: true,
            message: "Cảm ơn bạn đã đóng góp ý kiến!",
        },
        1000
    );
};

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

// Helper functions
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

    if (!isValidEmail(data.email)) {
        return { success: false, message: "Email không hợp lệ" };
    }

    if (!isValidWalletAddress(data.walletAddress)) {
        return { success: false, message: "Địa chỉ ví không hợp lệ" };
    }

    if (data.password.length < 6) {
        return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (mockUserDatabase[data.email.toLowerCase()]) {
        return {
            success: false,
            message: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
        };
    }

    mockUserDatabase[data.email.toLowerCase()] = data.walletAddress;
    console.log("✅ Đăng ký thành công!");

    return { success: true };
};

// Lấy wallet address từ email
export const getWalletByEmail = async (email: string): Promise<{
    success: boolean;
    walletAddress?: string;
    message?: string;
}> => {
    console.log("🔍 Tìm kiếm ví từ email:", email);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const walletAddress = mockUserDatabase[email.toLowerCase()];

    if (walletAddress) {
        console.log("✅ Tìm thấy ví:", walletAddress);
        return { success: true, walletAddress };
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
    isValidEmail,
    formatWalletAddress,
    registerWalletWithEmail,
    getWalletByEmail,
}
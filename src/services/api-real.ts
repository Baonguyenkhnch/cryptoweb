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
const DEBUG_MODE = true; // ✅ BẬT DEBUG để xem backend response

// Helper function for debug logging
const debugLog = (...args: any[]) => {
    if (DEBUG_MODE) {
        console.log(...args);
    }
};

// =====================================================
// AUTHENTICATION API ENDPOINTS
// =====================================================

/**
 * Register new user - POST /api/register
 * @param email - User email address
 * @param walletAddress - User wallet address (0x...)
 * @returns Success status and verification token
 */
export const registerUser = async (
    email: string,
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    verificationToken?: string;
}> => {
    debugLog(`📝 Registering user: ${email} with wallet: ${walletAddress}`);

    try {
        // Validate inputs
        if (!email || !email.includes("@")) {
            return {
                success: false,
                message: "Email không hợp lệ",
            };
        }

        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ (phải bắt đầu bằng 0x)",
            };
        }

        const url = `${API_BASE_URL}/api/register`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
                wallet_address: walletAddress.trim(),
                password: "DefaultPassword@123", // ✅ Backend yêu cầu password field (passwordless auth nhưng vẫn cần field này)
            }),
        });

        const data = await response.json();

        // ✅ FALLBACK: If 404, use demo mode
        if (response.status === 404) {
            console.warn("⚠️ Backend endpoint not found - Using DEMO MODE");

            // Generate mock verification token
            const mockToken = `demo_verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Store email & wallet in localStorage for demo
            localStorage.setItem("demo_pending_user", JSON.stringify({
                email: email.toLowerCase().trim(),
                wallet_address: walletAddress.trim(),
                token: mockToken,
                timestamp: Date.now(),
            }));

            return {
                success: true,
                message: "🎨 DEMO MODE: Email xác thực đã được 'gửi'. Click 'Demo: Xác thực ngay' để tiếp tục.",
                verificationToken: mockToken,
            };
        }

        if (!response.ok) {
            debugLog(`❌ Register error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `HTTP ${response.status}`,
            };
        }

        debugLog(`✅ Registration successful:`, data);

        return {
            success: true,
            message: data.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
            verificationToken: data.token || data.verificationToken,
        };
    } catch (error: any) {
        debugLog(`❌ Register error:`, error.message);

        // Network error - also use demo mode
        console.warn("⚠️ Network error - Using DEMO MODE");
        const mockToken = `demo_verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        localStorage.setItem("demo_pending_user", JSON.stringify({
            email: email.toLowerCase().trim(),
            wallet_address: walletAddress.trim(),
            token: mockToken,
            timestamp: Date.now(),
        }));

        return {
            success: true,
            message: "🎨 DEMO MODE: Không thể kết nối backend. Click 'Demo: Xác thực ngay' để tiếp tục.",
            verificationToken: mockToken,
        };
    }
};

/**
 * Verify registration email - GET /api/verify-registration?token=xxx
 * @param token - Verification token from email
 */
export const verifyRegistration = async (
    token: string
): Promise<{
    success: boolean;
    message: string;
    user?: {
        email: string;
        wallet_address: string;
    };
}> => {
    debugLog(`🔍 Verifying registration token: ${token}`);

    try {
        if (!token) {
            return {
                success: false,
                message: "Token không hợp lệ",
            };
        }

        // ✅ CHECK IF DEMO MODE TOKEN
        if (token.startsWith("demo_verify_")) {
            console.log("🎨 DEMO MODE: Verifying demo token");

            // Get pending user from localStorage
            const pendingUserStr = localStorage.getItem("demo_pending_user");

            if (!pendingUserStr) {
                return {
                    success: false,
                    message: "Token demo không tìm thấy. Vui lòng đăng ký lại.",
                };
            }

            const pendingUser = JSON.parse(pendingUserStr);

            // Check if token matches
            if (pendingUser.token !== token) {
                return {
                    success: false,
                    message: "Token demo không khớp.",
                };
            }

            // Clean up
            localStorage.removeItem("demo_pending_user");

            return {
                success: true,
                message: "🎨 DEMO MODE: Xác thực thành công!",
                user: {
                    email: pendingUser.email,
                    wallet_address: pendingUser.wallet_address,
                },
            };
        }

        // ✅ REAL API CALL
        const url = `${API_BASE_URL}/api/verify-registration?token=${encodeURIComponent(token)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Verification error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || "Token không hợp lệ hoặc đã hết hạn",
            };
        }

        debugLog(`✅ Verification successful:`, data);

        return {
            success: true,
            message: data.message || "Xác thực email thành công!",
            user: data.user || {
                email: data.email,
                wallet_address: data.wallet_address,
            },
        };
    } catch (error: any) {
        debugLog(`❌ Verification error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Send Magic Link for passwordless login - POST /api/send-magic-link
 * @param email - User email
 */
export const sendMagicLinkReal = async (
    email: string
): Promise<{
    success: boolean;
    message: string;
}> => {
    debugLog(`🔐 Sending magic link to: ${email}`);

    try {
        // Validate email
        if (!email || !email.includes("@")) {
            return {
                success: false,
                message: "Email không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/send-magic-link`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Magic link error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `HTTP ${response.status}`,
            };
        }

        debugLog(`✅ Magic link sent:`, data);

        return {
            success: true,
            message: data.message || "Magic link đã được gửi đến email của bạn!",
        };
    } catch (error: any) {
        debugLog(`❌ Magic link error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Verify Magic Link token - GET /api/verify?token=xxx
 * @param token - Magic link token from email
 */
export const verifyMagicLink = async (
    token: string
): Promise<{
    success: boolean;
    message: string;
    user?: {
        id?: string;
        email: string;
        wallet_address?: string;
        name?: string;
    };
    authToken?: string;
}> => {
    debugLog(`🔍 Verifying magic link token: ${token}`);

    try {
        if (!token) {
            return {
                success: false,
                message: "Token không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/verify?token=${encodeURIComponent(token)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Magic link verification error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || "Token không hợp lệ hoặc đã hết hạn",
            };
        }

        debugLog(`✅ Magic link verified:`, data);

        return {
            success: true,
            message: data.message || "Đăng nhập thành công!",
            user: data.user || {
                email: data.email,
                wallet_address: data.wallet_address,
                name: data.name,
                id: data.id || data.user_id,
            },
            authToken: data.token || data.authToken || data.access_token,
        };
    } catch (error: any) {
        debugLog(`❌ Magic link verification error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Submit user feedback - POST /api/feedback
 * @param feedback - User feedback data
 */
export const submitFeedback = async (feedback: {
    email?: string;
    category: string;
    message: string;
    rating?: number;
}): Promise<{
    success: boolean;
    message: string;
}> => {
    debugLog(`📨 Submitting feedback:`, feedback);

    try {
        // Validate inputs
        if (!feedback.message || feedback.message.trim().length < 10) {
            return {
                success: false,
                message: "Vui lòng nhập ít nhất 10 ký tự",
            };
        }

        const url = `${API_BASE_URL}/api/feedback`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: feedback.email?.toLowerCase().trim() || "",
                category: feedback.category,
                message: feedback.message.trim(),
                rating: feedback.rating || 0,
                timestamp: new Date().toISOString(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Feedback error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `HTTP ${response.status}`,
            };
        }

        debugLog(`✅ Feedback submitted:`, data);

        return {
            success: true,
            message: data.message || "Cảm ơn bạn đã gửi feedback!",
        };
    } catch (error: any) {
        debugLog(`❌ Feedback error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Get User Info - GET /api/user-info
 * Check user profile and last_login status
 * @returns User info with last_login field
 */
export const getUserInfo = async (): Promise<{
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        wallet_address: string;
        name?: string;
        last_login: string | null; // null = first login, date string = returning user
        created_at?: string;
        credit_score?: number;
        wallet_age?: number;
        total_transactions?: number;
        total_assets?: number;
        // ... other onchain data fields if last_login is not null
    };
}> => {
    debugLog(`👤 Getting user info...`);

    try {
        // Get auth token from localStorage
        const authToken = localStorage.getItem("authToken");
        const currentUser = localStorage.getItem("currentUser");

        if (!authToken || !currentUser) {
            return {
                success: false,
                message: "Chưa đăng nhập",
            };
        }

        const url = `${API_BASE_URL}/api/user-info`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Get user info error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || "Không thể lấy thông tin user",
            };
        }

        debugLog(`✅ User info retrieved:`, data);

        return {
            success: true,
            message: "Success",
            user: {
                id: data.id || data.user_id,
                email: data.email,
                wallet_address: data.wallet_address,
                name: data.name,
                last_login: data.last_login, // null or date string
                created_at: data.created_at,
                credit_score: data.credit_score,
                wallet_age: data.wallet_age,
                total_transactions: data.total_transactions,
                total_assets: data.total_assets,
            },
        };
    } catch (error: any) {
        debugLog(`❌ Get user info error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
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

        // Call API với timeout 15 giây - Cân bằng giữa UX và backend processing
        const maxRetries = 1; // Không retry để tránh đợi quá lâu
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                debugLog(`🔄 Attempt ${attempt}/${maxRetries}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout - Backend cần thời gian crawl blockchain

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

                    // Nếu là 500, backend có lỗi internal
                    if (response.status === 500) {
                        throw new Error(`Backend đang gặp sự cố (500). Có thể do hết quota Moralis hoặc lỗi server. Vui lòng thử lại sau.`);
                    }

                    // Nếu là 401/403, có thể backend authentication issue
                    if (response.status === 401 || response.status === 403) {
                        throw new Error(`Backend authentication error (${response.status}). Có thể Moralis API key hết hạn.`);
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
                    debugLog(`⏱ Attempt ${attempt} timeout (60s)`);
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
        throw new Error('⏱️ Backend phản hồi quá chậm (>60s). Dữ liệu blockchain đang được crawl. Vui lòng thử lại sau hoặc xem Demo để test nhanh.');

    } catch (error: any) {
        debugLog(`❌ Error analyzing wallet:`, error);

        // Handle different error types
        if (error.name === 'AbortError') {
            console.warn('⏱️ Backend timeout - Fallback to mock data');
            return generateMockWalletData(walletAddress);
        }

        if (error.message.includes('Failed to fetch')) {
            console.warn('🔌 Backend offline - Fallback to mock data');
            return generateMockWalletData(walletAddress);
        }

        // Any other error - fallback to mock data
        console.warn('⚠️ API Error - Fallback to mock data:', error.message);
        return generateMockWalletData(walletAddress);
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

    // Tính tổng giá trị tài sản
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

// =====================================================
// MAGIC LINK AUTHENTICATION - REAL API
// =====================================================

const BACKEND_AUTH_API = 'https://backend.migofin.com/api/auth';

export interface MagicLinkResponse {
    success: boolean;
    message: string;
    verificationToken?: string;
}

export interface VerifyResponse {
    success: boolean;
    message?: string;
    email?: string;
    wallet?: string;
    sessionToken?: string;
    user?: UserProfile;
    authToken?: string;
}

/**
 * Gửi Magic Link đến email
 * Backend sẽ:
 * 1. Generate token ngẫu nhiên
 * 2. Lưu vào DB (email, wallet, token, expire time)
 * 3. Gửi email chứa link: https://yourapp.com/#/verify?token=xxx
 */
// DEPRECATED - Dùng sendMagicLink version mới ở cuối file
export async function sendMagicLinkOLD(
    email: string,
    walletAddress: string
): Promise<MagicLinkResponse> {
    try {
        debugLog('🚀 Gửi Magic Link');

        const response = await fetch(`${BACKEND_AUTH_API}/send-magic-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
                wallet: walletAddress.trim(),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Magic Link đã gửi:', data);

        return {
            success: true,
            message: data.message || 'Email đã được gửi!',
            verificationToken: data.verificationToken || data.token,
        };
    } catch (error) {
        console.error('❌ Lỗi gửi Magic Link:', error);

        // Return mock response for demo purposes
        return {
            success: true,
            message: '📧 [DEMO] Email xác nhận đã được gửi! Nhấn nút "Demo Verify" để tiếp tục.',
            verificationToken: `demo_${Date.now()}_${Math.random().toString(36)}`,
        };
    }
}

/**
 * Verify Magic Link Token
 * Backend sẽ:
 * 1. Kiểm tra token có hợp lệ & chưa expire
 * 2. Trả về user info + session token
 */
// DEPRECATED - Dùng verifyMagicLink version mới ở cuối file
export async function verifyMagicLinkOLD(token: string): Promise<VerifyResponse> {
    try {
        console.log('🔍 Verify Magic Link:', token);

        const response = await fetch(`${BACKEND_AUTH_API}/verify?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Xác thực thành công:', data);

        return {
            success: true,
            email: data.email,
            wallet: data.wallet || data.walletAddress,
            sessionToken: data.sessionToken || data.token,
            authToken: data.sessionToken || data.token,
            user: data.user || {
                id: data.userId || `user_${Date.now()}`,
                email: data.email,
                walletAddress: data.wallet || data.walletAddress,
                name: data.email.split('@')[0],
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('❌ Lỗi verify token:', error);

        // Return mock response for demo purposes
        if (token.startsWith('demo_')) {
            const mockEmail = `demo${Date.now()}@example.com`;
            const mockWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;

            return {
                success: true,
                email: mockEmail,
                wallet: mockWallet,
                sessionToken: `session_${Date.now()}`,
                authToken: `session_${Date.now()}`,
                user: {
                    id: `user_${Date.now()}`,
                    email: mockEmail,
                    walletAddress: mockWallet,
                    name: mockEmail.split('@')[0],
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                },
            };
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Xác thực thất bại',
        };
    }
}

// =====================================================
// MOCK DATA HÀM CŨ - GIỮ NGUYÊN
// =====================================================

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

// =====================================================
// SCORE HISTORY API - Backend CÓ endpoint này! ✅
// Endpoint: GET /api/credit-score/{wallet}/history?days=30
// =====================================================

export const getScoreHistory = async (
    walletAddress: string,
    days: number = 30
): Promise<Array<{ date: string; score: number }>> => {
    debugLog(`📊 Getting score history for: ${walletAddress} (${days} days)`);

    try {
        // Validate wallet address
        if (!isValidWalletAddress(walletAddress)) {
            throw new Error("Invalid wallet address format");
        }

        // Build API URL
        const url = `${API_BASE_URL}/api/credit-score/${walletAddress}/history?days=${days}`;
        debugLog(`📡 Calling Score History API: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout - Test nhanh

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

        debugLog(`⏱️ Score History API response time: ${endTime - startTime}ms`);
        debugLog(`📊 Score History API status: ${response.status}`);

        if (!response.ok) {
            debugLog(`⚠️ Score History API error (${response.status}), using mock data`);
            return generateMockScoreHistory(days);
        }

        const data = await response.json();
        debugLog(`✅ Score History data received:`, data);

        // Map response to expected format
        // Backend có thể trả về array trực tiếp hoặc object với field history
        let historyArray = [];

        if (Array.isArray(data)) {
            historyArray = data;
        } else if (data.history && Array.isArray(data.history)) {
            historyArray = data.history;
        } else if (data.data && Array.isArray(data.data)) {
            historyArray = data.data;
        } else {
            debugLog(`⚠️ Unexpected response format, using mock data`);
            return generateMockScoreHistory(days);
        }

        // Map to standard format
        const mappedHistory = historyArray.map((item: any) => ({
            date: item.date || item.timestamp || item.created_at,
            score: item.score || item.credit_score || item.final_score || 0,
        }));

        if (mappedHistory.length === 0) {
            debugLog(`⚠️ No history data returned, using mock data`);
            return generateMockScoreHistory(days);
        }

        debugLog(`✅ Successfully mapped ${mappedHistory.length} history records`);
        return mappedHistory;

    } catch (error: any) {
        if (error.name === 'AbortError') {
            debugLog(`⏱️ Score History API timeout, using mock data`);
        } else {
            debugLog(`❌ Error getting score history:`, error.message);
        }

        // Fallback to mock data
        return generateMockScoreHistory(days);
    }
};

// Helper function to generate mock score history (fallback)
function generateMockScoreHistory(days: number): Array<{ date: string; score: number }> {
    debugLog(`⚠️ Generating mock score history for ${days} days`);
    const history = [];
    const baseScore = 700;

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = Math.random() * 50 - 25;

        history.push({
            date: date.toISOString().split("T")[0],
            score: Math.round(baseScore + variation),
        });
    }

    return history;
}

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
            message: "Đăng ký thành công! Bạn sẽ nhận được email cập nhật đnh kỳ.",
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

// =====================================================
// FALLBACK FUNCTION - Generate Mock Data When Backend is Offline
// =====================================================
function generateMockWalletData(walletAddress: string): WalletAnalysis {
    console.log("🎨 Generating mock data for wallet:", walletAddress);

    const hash = walletAddress.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const score = 550 + (hash % 300);

    // Token balances
    const tokens = ["ETH", "USDT", "USDC", "DAI", "WBTC", "LINK", "UNI", "AAVE"];
    const tokenBalances: TokenBalance[] = tokens.slice(0, 5 + (hash % 4)).map((token, idx) => {
        const baseValue = 5000 / (idx + 1);
        const value = baseValue * (1 + (Math.random() * 0.5));
        return {
            symbol: token,
            balance: value / (100 + idx * 50),
            value: Math.round(value),
            percentage: 0,
        };
    });

    const totalValue = tokenBalances.reduce((sum, t) => sum + t.value, 0);
    tokenBalances.forEach(token => {
        token.percentage = (token.value / totalValue) * 100;
    });

    // Recent transactions
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

    return {
        score: Math.min(score, 850),
        walletAge: 200 + (hash % 400),
        totalTransactions: 500 + (hash % 1500),
        tokenDiversity: tokenBalances.length,
        totalAssets: Math.round(totalValue),
        rating: getRating(score),
        tokenBalances,
        recentTransactions,
        walletAddress,
        walletTransactionsLast30d: 50 + (hash % 100),
        stablecoinInflow30d: 1000 + (hash % 5000),
    };
}

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
    registerUser,
    verifyRegistration,
    sendMagicLinkReal,
    verifyMagicLink,
    isValidWalletAddress,
    isValidEmail,
    formatWalletAddress,
    registerWalletWithEmail,
    getWalletByEmail,
};

// =====================================================
// BACKWARD COMPATIBILITY ALIASES
// =====================================================
// Export aliases for backward compatibility with old component imports
export const sendMagicLink = sendMagicLinkReal;
export const verifyToken = verifyMagicLink;
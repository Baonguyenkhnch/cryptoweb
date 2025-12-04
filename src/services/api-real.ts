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
    // ✅ NEW: Feature importance & recommendations from API response
    featureImportance?: {
        groups?: {
            transaction_activity?: number;
            asset_value?: number;
            wallet_age?: number;
            token_diversity?: number;
        };
        top_factors?: Array<{
            factor: string;
            impact: string;
        }>;
    };
    recommendations?: string[];
    onchainMetrics?: {
        wallet_age?: number;
        transaction_count?: number;
        total_assets?: number;
        nft_holdings?: boolean;
        dapp_connections?: number;
        defi_loans_count?: number;
        defi_total_borrowed_volume?: number;
        defi_total_repaid_volume?: number;
        defi_late_repayments_count?: number;
        liquidation_events_count?: number;
        avg_collateralization_ratio?: number;
        stablecoin_inflow_30d?: number;
    };
    offchainMetrics?: {
        income?: number;
        credit_history?: number;
        existing_debt?: number;
        payment_history?: {
            past_loans?: number;
            late_payments?: number;
        };
    };
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
    lastLogin: string | null;
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

            // ✅ Handle specific error cases
            const errorMessage = data.message || data.error || "";

            // Check if email already exists (most common duplicate error is 500)
            if (response.status === 400 || response.status === 409 || response.status === 500) {
                const lowerMsg = errorMessage.toLowerCase();

                // ✅ PRIORITY: If 500 error without clear message, assume duplicate email (most common case)
                if (response.status === 500 && !errorMessage) {
                    return {
                        success: false,
                        message: "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
                    };
                }

                // Check for duplicate email patterns
                if (
                    lowerMsg.includes("email") && (
                        lowerMsg.includes("already") ||
                        lowerMsg.includes("exists") ||
                        lowerMsg.includes("đã tồn tại") ||
                        lowerMsg.includes("đã được đăng ký") ||
                        lowerMsg.includes("trùng") ||
                        lowerMsg.includes("duplicate")
                    )
                ) {
                    return {
                        success: false,
                        message: "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
                    };
                }

                // Check for duplicate wallet patterns
                if (
                    lowerMsg.includes("wallet") && (
                        lowerMsg.includes("already") ||
                        lowerMsg.includes("exists") ||
                        lowerMsg.includes("đã tồn tại") ||
                        lowerMsg.includes("đã được đăng ký") ||
                        lowerMsg.includes("trùng") ||
                        lowerMsg.includes("duplicate")
                    )
                ) {
                    return {
                        success: false,
                        message: "Địa chỉ ví này đã được đăng ký. Vui lòng sử dụng ví khác.",
                    };
                }

                // ✅ General 500 fallback for register endpoint
                if (response.status === 500) {
                    return {
                        success: false,
                        message: "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
                    };
                }
            }

            return {
                success: false,
                message: errorMessage || `Lỗi đăng ký (${response.status}). Vui lòng thử lại.`,
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
    user?: UserProfile;
    sessionToken?: string;
    authToken?: string;
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

            // ✅ Return full UserProfile for DEMO
            const mockSessionToken = `demo_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            return {
                success: true,
                message: "🎨 DEMO MODE: Xác thực thành công!",
                sessionToken: mockSessionToken,
                authToken: mockSessionToken,
                user: {
                    id: `demo_${Date.now()}`,
                    email: pendingUser.email,
                    name: pendingUser.email.split("@")[0],
                    walletAddress: pendingUser.wallet_address,
                    createdAt: new Date().toISOString(),
                    lastLogin: null, // ← First time login
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

        // ✅ MAP BACKEND RESPONSE TO FRONTEND FORMAT
        // Backend response: { success, message, email, wallet_address, sessionToken, user: { id, email, walletAddress, createdAt, lastLogin } }

        return {
            success: true,
            message: data.message || "Xác thực email thành công!",
            sessionToken: data.sessionToken,
            authToken: data.sessionToken,
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
                name: data.user.email?.split("@")[0] || "User",
                walletAddress: data.user.walletAddress || data.wallet_address,
                createdAt: data.user.createdAt,
                lastLogin: data.user.lastLogin,
            } : {
                // Fallback if user object not provided
                id: `user_${Date.now()}`,
                email: data.email,
                name: data.email.split("@")[0],
                walletAddress: data.wallet_address,
                createdAt: new Date().toISOString(),
                lastLogin: null,
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
        createdAt?: string;
        lastLogin?: string | null;
    };
    authToken?: string;
    sessionToken?: string;
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

        console.log("🔍 verifyMagicLink() - Full Backend Response:");
        console.log("  - Status:", response.status, response.statusText);
        console.log("  - Response body:", JSON.stringify(data, null, 2));
        console.log("  - Available keys:", Object.keys(data));

        if (!response.ok) {
            debugLog(`❌ Magic link verification error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || "Token không hợp lệ hoặc đ hết hạn",
            };
        }

        debugLog(`✅ Magic link verified:`, data);

        // ✅ FIX: Also check data.sessionToken like verifyRegistration()
        const sessionToken = data.sessionToken || data.token || data.authToken || data.access_token;

        console.log("🔐 verifyMagicLink() - Token extraction:");
        console.log("  - data.sessionToken:", data.sessionToken || "❌ NONE");
        console.log("  - data.token:", data.token || "❌ NONE");
        console.log("  - data.authToken:", data.authToken || "❌ NONE");
        console.log("  - data.access_token:", data.access_token || "❌ NONE");
        console.log("  - Final sessionToken:", sessionToken || "❌❌❌ NO TOKEN FOUND!");

        if (!sessionToken) {
            console.error("🚨 CRITICAL: Backend did not return any token!");
            console.error("🚨 Backend response:", data);
        }

        return {
            success: true,
            message: data.message || "Đăng nhập thành công!",
            user: data.user ? {
                id: data.user.id || data.user.user_id,
                email: data.user.email,
                wallet_address: data.user.walletAddress || data.user.wallet_address || data.wallet_address,
                name: data.user.name || data.user.email?.split("@")[0] || "User",
                createdAt: data.user.createdAt || data.user.created_at,
                lastLogin: data.user.lastLogin || data.user.last_login,
            } : {
                id: data.id || data.user_id || `user_${Date.now()}`,
                email: data.email,
                wallet_address: data.wallet_address,
                name: data.name || data.email?.split("@")[0] || "User",
                createdAt: data.created_at || new Date().toISOString(),
                lastLogin: data.last_login || null,
            },
            sessionToken: sessionToken,
            authToken: sessionToken, // Same value for backward compatibility
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
    feature_name: string;
    description: string;
    rating?: number;
}): Promise<{
    success: boolean;
    message: string;
}> => {
    debugLog(`📨 Submitting feedback:`, feedback);

    try {
        // Validate inputs
        if (!feedback.description || feedback.description.trim().length < 10) {
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
                feature_name: feedback.feature_name,
                description: feedback.description.trim(),
                email: feedback.email?.toLowerCase().trim() || "",
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
        last_login: string | null;
        created_at?: string;
        credit_score?: number;
        wallet_age?: number;
        total_transactions?: number;
        total_assets?: number;
    };
}> => {
    debugLog(`👤 Getting user info...`);

    try {
        // Get auth token from localStorage
        const authToken = localStorage.getItem("authToken");
        const currentUser = localStorage.getItem("currentUser");

        console.log("🔍 getUserInfo() - Checking localStorage:");
        console.log("  - authToken:", authToken ? `${authToken.substring(0, 30)}... (length: ${authToken.length})` : "❌ NULL");
        console.log("  - currentUser:", currentUser ? "✅ EXISTS" : "❌ NULL");

        if (!authToken || !currentUser) {
            console.error("❌ getUserInfo() - Missing auth data in localStorage!");
            return {
                success: false,
                message: "Chưa đăng nhập",
            };
        }

        const url = `${API_BASE_URL}/api/user-info`;

        debugLog(`📡 Calling getUserInfo API: ${url}`);
        console.log(`🔐 Sending Authorization header: Bearer ${authToken.substring(0, 30)}...`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });

        console.log(`📊 getUserInfo() Response status: ${response.status} ${response.statusText}`);

        const data = await response.json();

        console.log(`📦 getUserInfo() Response data:`, data);

        if (!response.ok) {
            console.error(`❌ getUserInfo() error: ${response.status}`, data);
            console.error("🔍 Possible causes:");
            console.error("  1. authToken không hợp lệ hoặc đã hết hạn");
            console.error("  2. Backend không nhận diện authToken (check backend logs)");
            console.error("  3. Backend API /api/user-info có vấn đề");

            return {
                success: false,
                message: data.message || data.error || `API error ${response.status}: ${response.statusText}`,
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
                last_login: data.last_login,
                created_at: data.created_at,
                credit_score: data.credit_score,
                wallet_age: data.wallet_age,
                total_transactions: data.total_transactions,
                total_assets: data.total_assets,
            },
        };
    } catch (error: any) {
        console.error(`❌ getUserInfo() exception:`, error.message);
        console.error("🔍 Error details:", error);

        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

// =====================================================
// THAY ĐỔI 2: HÀM ANALYZE WALLET - GỌI API THẬT
// =====================================================
export const analyzeWallet = async (
    walletAddress: string,
    options?: {
        force_refresh?: boolean;
        minimal?: boolean;
    }
): Promise<WalletAnalysis> => {
    debugLog(`🔍 Analyzing wallet: ${walletAddress}`, options);

    try {
        // Validate wallet address format
        if (!isValidWalletAddress(walletAddress)) {
            throw new Error("Invalid wallet address format");
        }

        // Build API URL with query params
        const queryParams = new URLSearchParams();
        if (options?.force_refresh) {
            queryParams.append('force_refresh', 'true');
        }
        if (options?.minimal) {
            queryParams.append('minimal', 'true');
        }

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/credit-score/${walletAddress}${queryString ? `?${queryString}` : ''}`;
        debugLog(`📡 Calling API: ${url}`);

        // ✅ AUTO-DETECT AUTH TOKEN
        const authToken = localStorage.getItem("authToken");

        // ✅ CHECK WALLET CACHE (for public requests)
        // If no authToken (public Calculator), check if we have cached data for this wallet
        if (!authToken) {
            const cacheKey = `wallet_cache_${walletAddress.toLowerCase()}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    const cacheAge = Date.now() - (parsed.timestamp || 0);
                    const cacheMaxAge = 24 * 60 * 60 * 1000; // 24 hours

                    // If cache is fresh (< 24h), use it instead of calling API
                    if (cacheAge < cacheMaxAge) {
                        console.log(`✅ Using cached data for wallet ${walletAddress} (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
                        return parsed.data;
                    } else {
                        console.log(`⏰ Cache expired for wallet ${walletAddress} (${Math.round(cacheAge / 1000 / 60 / 60)} hours old)`);
                    }
                } catch (e) {
                    console.warn("⚠️ Failed to parse wallet cache:", e);
                }
            }
        }

        // Build headers
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        // Add Authorization header if user is logged in
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            debugLog(`🔐 Adding auth token to request`);
        } else {
            debugLog(`🌐 Public request (no auth token)`);
        }

        // Call API với timeout 15 giây - Cân bằng giữa UX và backend processing
        const maxRetries = 1; // Không retry để tránh đợi quá lâu
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                debugLog(`🔄 Attempt ${attempt}/${maxRetries}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                const startTime = Date.now();
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers,
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

                    if (response.status === 404) {
                        throw new Error(`Wallet chưa được phân tích. Vui lòng thử lại sau vài phút.`);
                    }

                    if (response.status === 500) {
                        throw new Error(`Backend đang gặp sự cố (500). Có thể do hết quota Moralis hoặc lỗi server. Vui lòng thử lại sau.`);
                    }

                    if (response.status === 401 || response.status === 403) {
                        throw new Error(`Backend authentication error (${response.status}). Có thể Moralis API key hết hạn.`);
                    }

                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }

                // Parse JSON response
                const data = await response.json();
                debugLog(`✅ API Response:`, data);

                // Success - break retry loop
                const walletAnalysis = mapWalletData(data, walletAddress);

                // ✅ SAVE TO CACHE (both logged-in and public users)
                const cacheKey = `wallet_cache_${walletAddress.toLowerCase()}`;
                const cacheData = {
                    data: walletAnalysis,
                    timestamp: Date.now(),
                };

                try {
                    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                    console.log(`💾 Saved wallet data to cache: ${cacheKey}`);
                } catch (e) {
                    console.warn("⚠️ Failed to save wallet cache:", e);
                }

                return walletAnalysis;

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

        // ✅ CHECK IF USER IS LOGGED IN
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
            // ❌ LOGGED IN USER: DO NOT use mock data - Throw error instead
            console.error('🚫 API Error for logged-in user - Not using mock data:', error.message);
            throw error;
        }

        // ✅ PUBLIC USER (Calculator): Can fallback to mock data for demo
        console.warn('⚠️ Public API Error - Fallback to mock data for demo:', error.message);

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
        return generateMockWalletData(walletAddress);
    }
};

// Helper function để map wallet data
function mapWalletData(data: any, walletAddress: string): WalletAnalysis {
    // ✅ DEBUG: Log toàn bộ API response
    console.log(`🔍 ========== FULL API RESPONSE ==========`);
    console.log(`🔍 Complete data object:`, JSON.stringify(data, null, 2));
    console.log(`🔍 ========================================`);

    // ✅ NEW: Check all possible token list fields
    console.log(`🔍 Checking all possible token fields:`);
    console.log(`  - data.total_balances:`, data.total_balances);
    console.log(`  - data.token_balances:`, data.token_balances);
    console.log(`  - data.erc20_balances:`, data.erc20_balances);
    console.log(`  - data.tokens:`, data.tokens);
    console.log(`  - data.balances:`, data.balances);
    console.log(`  - data.wallet_balances:`, data.wallet_balances);

    // ✅ NEW: Try multiple possible field names for token list
    const possibleTokenFields = [
        data.total_balances,
        data.token_balances,
        data.erc20_balances,
        data.tokens,
        data.balances,
        data.wallet_balances,
    ];

    const rawTokenData = possibleTokenFields.find(field => Array.isArray(field) && field.length > 0) || [];

    console.log(`🔍 Selected token data source:`, rawTokenData);
    console.log(`🔍 Token data length:`, rawTokenData.length);

    // Parse token balances
    const tokenBalances = mapTokenBalances(rawTokenData);

    console.log(`🔍 mapWalletData() - Parsed token balances:`, tokenBalances);
    console.log(`🔍 Number of parsed tokens:`, tokenBalances.length);

    // ✅ FIX: If token_diversity > 0 but tokenBalances is empty, create placeholder
    if (tokenBalances.length === 0 && data.token_diversity > 0) {
        console.warn(`⚠️ API reports ${data.token_diversity} token(s) but token_balances is empty!`);
        console.warn(`⚠️ Creating ${data.token_diversity} placeholder token(s)...`);

        // Create placeholder tokens based on token_diversity
        for (let i = 0; i < data.token_diversity; i++) {
            tokenBalances.push({
                symbol: `Token ${i + 1}`,
                balance: 0,
                value: 0,
                percentage: 0,
                name: `Unknown Token ${i + 1}`,
            });
        }

        console.log(`✅ Created ${tokenBalances.length} placeholder tokens:`, tokenBalances);
    }

    // ✅ FIX: Filter out tokens with invalid USD values & sort by value
    const validTokens = tokenBalances
        .filter(token => {
            console.log(`🔍 [NEW CODE v2] Checking token ${token.symbol} - value: $${token.value}`);

            // ✅ CHANGED: Don't filter out tokens with value = 0, keep them to show diversity
            // Only filter out tokens with suspicious high values
            if (token.value > 10_000_000_000) {
                console.warn(`⚠️ Filtering out suspicious token ${token.symbol} with value $${token.value.toLocaleString()}`);
                return false;
            }

            // ✅ Keep all tokens, even with 0 value (shows diversity)
            console.log(`✅ [NEW CODE v2] Keeping token ${token.symbol} - value: $${token.value}`);
            return true;
        })
        .sort((a, b) => b.value - a.value);

    console.log(`✅ Valid tokens after filtering: ${validTokens.length}`, validTokens);

    // ✅ FIX: Recalculate total from valid tokens only
    const validTotalAssets = validTokens.reduce((sum, t) => sum + t.value, 0);

    let totalAssetsUsd = data.total_assets_usd || 0;

    const largestTokenValue = validTokens[0]?.value || 0;
    if (totalAssetsUsd > 0 && totalAssetsUsd < largestTokenValue) {
        console.warn(`⚠️ API total_assets_usd ($${totalAssetsUsd}) < largest token ($${largestTokenValue}). Using calculated total.`);
        totalAssetsUsd = validTotalAssets;
    }

    if (totalAssetsUsd === 0) {
        totalAssetsUsd = validTotalAssets;
    }

    // ✅ FIX: Calculate percentage based on valid total
    if (totalAssetsUsd > 0) {
        validTokens.forEach(token => {
            token.percentage = (token.value / totalAssetsUsd) * 100;
        });
    }

    console.log(`💰 Total Assets: $${totalAssetsUsd.toLocaleString()} (${validTokens.length} valid tokens)`);

    // Parse transactions
    const recentTransactions = mapTransactions(
        data.transaction_history || data.recent_transactions || [],
        data.wallet_address || walletAddress
    );

    // Tính wallet age từ dữ liệu thực
    const walletAge = data.wallet_age_days || (() => {
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
        tokenBalances: validTokens,
        recentTransactions: recentTransactions,
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
        featureImportance: data.explanation?.feature_importance,
        recommendations: data.recommendations || data.explanation?.recommendations,
        onchainMetrics: data.onchain_metrics,
        offchainMetrics: data.offchain_metrics,
    };

    debugLog(`✅ Mapped wallet analysis:`, walletAnalysis);
    return walletAnalysis;
}

// Helper function để map token balances từ API
function mapTokenBalances(apiData: any[]): TokenBalance[] {
    if (!Array.isArray(apiData)) return [];

    console.log(`🔍 mapTokenBalances() - Processing ${apiData.length} tokens`);

    return apiData.map((token: any, index: number) => {
        console.log(`🔍 Processing token ${index + 1}:`, token);

        // ✅ NEW: More flexible balance parsing
        let rawBalance = "0";
        if (token.balance !== undefined) {
            rawBalance = String(token.balance);
        } else if (token.amount !== undefined) {
            rawBalance = String(token.amount);
        } else if (token.value_decimal !== undefined) {
            rawBalance = String(token.value_decimal);
        }

        // ✅ NEW: More flexible decimals parsing
        let decimals = 18; // Default
        if (token.decimals !== undefined && !isNaN(parseInt(token.decimals))) {
            decimals = parseInt(token.decimals);
        } else if (token.token_decimals !== undefined && !isNaN(parseInt(token.token_decimals))) {
            decimals = parseInt(token.token_decimals);
        }

        // Calculate balance
        const balance = parseFloat(rawBalance) / Math.pow(10, decimals);

        // ✅ NEW: More flexible USD value parsing
        let usdValue = 0;
        if (token.balance_usd !== undefined && !isNaN(parseFloat(token.balance_usd))) {
            usdValue = parseFloat(token.balance_usd);
        } else if (token.value !== undefined && !isNaN(parseFloat(token.value))) {
            usdValue = parseFloat(token.value);
        } else if (token.usd_value !== undefined && !isNaN(parseFloat(token.usd_value))) {
            usdValue = parseFloat(token.usd_value);
        } else if (token.value_usd !== undefined && !isNaN(parseFloat(token.value_usd))) {
            usdValue = parseFloat(token.value_usd);
        } else if (token.usd_price !== undefined && balance > 0) {
            // Calculate from price * balance
            usdValue = parseFloat(token.usd_price) * balance;
        } else if (token.price_usd !== undefined && balance > 0) {
            usdValue = parseFloat(token.price_usd) * balance;
        }

        // ✅ NEW: More flexible symbol parsing
        const symbol = token.symbol || token.token_symbol || token.token_name || 'UNKNOWN';

        // ✅ NEW: More flexible name parsing
        const name = token.name || token.token_name || token.symbol || 'Unknown Token';

        console.log(`  → Symbol: ${symbol}`);
        console.log(`  → Balance: ${balance}`);
        console.log(`  → USD Value: $${usdValue}`);
        console.log(`  → Decimals: ${decimals}`);

        return {
            symbol: symbol,
            balance: balance,
            value: usdValue,
            percentage: 0, // Will be calculated later
            token_address: token.token_address || token.address || token.contract_address,
            name: name,
            logo: token.logo || token.token_logo || token.thumbnail || token.icon,
            decimals: decimals,
        };
    });
}

// Helper function để map transactions từ API
function mapTransactions(apiData: any[], walletAddress?: string): Transaction[] {
    if (!Array.isArray(apiData)) return [];

    return apiData.slice(0, 10).map((tx: any, index: number) => {
        let type: "send" | "receive" = "send";
        const category = tx.category || "";

        if (category.includes("receive") || category === "nft receive" || category === "token receive") {
            type = "receive";
        } else if (walletAddress && tx.from_address?.toLowerCase() !== walletAddress.toLowerCase()) {
            type = "receive";
        }

        let token = "ETH";
        let amount = 0;
        let value = 0;

        if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
            const transfer = tx.erc20_transfers[0];
            token = transfer.token_symbol || "Unknown";
            amount = parseFloat(transfer.value_formatted || 0);
            value = parseFloat(transfer.value || 0) / Math.pow(10, transfer.token_decimals || 18);
        } else if (tx.native_transfers && tx.native_transfers.length > 0) {
            const transfer = tx.native_transfers[0];
            token = transfer.token_symbol || "ETH";
            amount = parseFloat(transfer.value_formatted || 0);
            value = parseFloat(transfer.value || 0) / Math.pow(10, 18);
        } else if (tx.value) {
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
// MOCK DATA & HELPERS
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

export const getScoreHistory = async (
    walletAddress: string,
    days: number = 30
): Promise<Array<{ date: string; score: number }>> => {
    debugLog(`📊 Getting score history for: ${walletAddress} (${days} days)`);

    try {
        if (!isValidWalletAddress(walletAddress)) {
            throw new Error("Invalid wallet address format");
        }

        const url = `${API_BASE_URL}/api/credit-score/${walletAddress}/history?days=${days}`;
        debugLog(`📡 Calling Score History API: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

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

        return generateMockScoreHistory(days);
    }
};

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
            message: "Cảm ơn bạn đã đóng góp  kiến!",
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

const mockUserDatabase: Record<string, string> = {
    "test@gmail.com": "0x742d35Cc6231e4a8F5b2FaC6E9B4F9D2E5A7B8C9D1",
    "demo@example.com": "0x1234567890abcdef1234567890abcdef12345678",
    "user@migofin.com": "0xabcdef1234567890abcdef1234567890abcdef12",
    "alice@crypto.com": "0x9876543210fedcba9876543210fedcba98765432",
    "bob@defi.io": "0x1111222233334444555566667777888899990000",
};

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
            message: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dng email khác.",
        };
    }

    mockUserDatabase[data.email.toLowerCase()] = data.walletAddress;
    console.log("✅ Đăng ký thành công!");

    return { success: true };
};

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

function generateMockWalletData(walletAddress: string): WalletAnalysis {
    console.log("🎨 Generating mock data for wallet:", walletAddress);

    const hash = walletAddress.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const score = 550 + (hash % 300);

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

export const sendMagicLink = sendMagicLinkReal;
export const verifyToken = verifyMagicLink;
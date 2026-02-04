import { getAuthToken } from "./authToken";

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
const API_BASE_URL = (() => {
    const sanitizeEnvUrl = (input: unknown): string => {
        const value = String(input ?? "").trim();
        const unquoted = value.replace(/^['"]|['"]$/g, "");

        // Strip inline comments (common in .env files), but only when preceded by whitespace.
        // This avoids breaking `https://...`.
        const withoutComment = unquoted
            .replace(/\s+#.*$/, "")
            .replace(/\s+\/\/.*$/, "");

        return withoutComment.trim();
    };

    const env = import.meta.env as any;
    // Optional: in local dev, use same-origin (/api/...) and let Vite proxy forward to backend.
    // This avoids CORS issues when backend doesn't allow localhost:5173.
    const useProxy = String(env.VITE_USE_VITE_PROXY || "").toLowerCase() === "true";
    if (env.DEV && useProxy) {
        return "";
    }

    // Main endpoints use VITE_BACKEND_URL.
    const raw = env.VITE_BACKEND_URL;

    const value = sanitizeEnvUrl(raw);

    // No hardcoded host here. If env is missing, default to same-origin (""),
    // and let requests go to `/api/...` (requires a proxy or same-origin backend).
    if (!value) {
        console.warn("[api-real] Missing API base URL. Set VITE_BACKEND_URL in .env/.env.local.");
    }

    const finalValue = value || "";
    const withoutTrailingSlashes = finalValue.replace(/\/+$/, "");

    // Many calls below already append `/api/...`.
    // Normalize so env can be either `https://host` or `https://host/api`.
    return withoutTrailingSlashes.endsWith("/api")
        ? withoutTrailingSlashes.slice(0, -4)
        : withoutTrailingSlashes;
})();

// Enable debug mode để xem logs
const DEBUG_MODE = true; // ✅ BẬT DEBUG để xem backend response

// Helper function for debug logging
const debugLog = (...args: any[]) => {
    if (DEBUG_MODE) {
        console.log(...args);
    }
};

// =====================================================
// MORALIS WALLET API ENDPOINTS
// =====================================================

/**
 * Crawl wallet data using Moralis API - POST /api/moralis/crawl-cu
 * @param walletAddress - Wallet address to crawl
 * @returns Success status and crawl result
 */
export const crawlWalletMoralis = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    data?: any;
}> => {
    debugLog(`🕷️ Crawling wallet data from Moralis: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/moralis/crawl-cu`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                wallet_address: walletAddress.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Moralis crawl error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi crawl dữ liệu (${response.status})`,
            };
        }

        debugLog(`✅ Moralis crawl successful:`, data);

        return {
            success: true,
            message: data.message || "Crawl dữ liệu thành công!",
            data: data,
        };
    } catch (error: any) {
        debugLog(`❌ Moralis crawl error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Get wallet token balances with USD value - GET /api/moralis/{wallet_address}/token-balances-usd
 * @param walletAddress - Wallet address
 * @returns Token balances with USD value
 */
export const getWalletTokenBalances = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    data?: {
        wallet_address: string;
        total_usd_value: number;
        tokens: Array<{
            token_address: string;
            name: string;
            symbol: string;
            balance: number;
            decimals: number;
            usd_value: number;
            usd_price: number;
        }>;
    };
}> => {
    debugLog(`💰 Getting token balances for wallet: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/moralis/${walletAddress}/token-balances-usd`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Token balances error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi lấy token balances (${response.status})`,
            };
        }

        debugLog(`✅ Token balances retrieved:`, data);

        return {
            success: true,
            message: "Success",
            data: data,
        };
    } catch (error: any) {
        debugLog(`❌ Token balances error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

// =====================================================
// WALLET AUTHENTICATION (SIWE - Sign-In With Ethereum)
// =====================================================

/**
 * Request SIWE nonce for wallet authentication - POST /api/auth/wallet/nonce
 * @param walletAddress - Wallet address requesting nonce
 * @returns Nonce for signing
 */
export const requestWalletNonce = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    nonce?: string;
}> => {
    debugLog(`🔐 Requesting SIWE nonce for wallet: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/auth/wallet/nonce`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                wallet_address: walletAddress.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Nonce request error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi yêu cầu nonce (${response.status})`,
            };
        }

        debugLog(`✅ Nonce received:`, data);

        return {
            success: true,
            message: "Success",
            nonce: data.nonce,
        };
    } catch (error: any) {
        debugLog(`❌ Nonce request error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Verify wallet signature (SIWE) - POST /api/auth/wallet/verify
 * @param walletAddress - Wallet address
 * @param signature - Signed message from wallet
 * @param message - Original message that was signed
 * @returns Authentication result with session token
 */
export const verifyWalletSignature = async (
    walletAddress: string,
    signature: string,
    message: string
): Promise<{
    success: boolean;
    message: string;
    sessionToken?: string;
    authToken?: string;
    user?: UserProfile;
}> => {
    debugLog(`✅ Verifying wallet signature for: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        if (!signature || !message) {
            return {
                success: false,
                message: "Signature và message không được để trống",
            };
        }

        const url = `${API_BASE_URL}/api/auth/wallet/verify`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                wallet_address: walletAddress.trim(),
                signature: signature,
                message: message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Signature verification error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi xác thực signature (${response.status})`,
            };
        }

        debugLog(`✅ Signature verified:`, data);

        return {
            success: true,
            message: data.message || "Xác thực ví thành công!",
            sessionToken: data.sessionToken || data.token || data.authToken,
            authToken: data.sessionToken || data.token || data.authToken,
            user: data.user,
        };
    } catch (error: any) {
        debugLog(`❌ Signature verification error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

// =====================================================
// MINT IDENTITY (SBT - Soulbound Token)
// =====================================================

/**
 * Get wallet mint info - GET /api/mint/wallet-info/{wallet_address}
 * @param walletAddress - Wallet address
 * @returns Wallet mint information
 */
export const getWalletMintInfo = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    data?: {
        wallet_address: string;
        has_minted: boolean;
        token_id?: string;
        mint_date?: string;
        credit_score?: number;
        metadata_uri?: string;
    };
}> => {
    debugLog(`🎫 Getting mint info for wallet: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/mint/wallet-info/${walletAddress}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Mint info error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi lấy mint info (${response.status})`,
            };
        }

        debugLog(`✅ Mint info retrieved:`, data);

        return {
            success: true,
            message: "Success",
            data: data,
        };
    } catch (error: any) {
        debugLog(`❌ Mint info error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Mint SBT (admin pays gas) - POST /api/mint/mint-sbt
 * @param walletAddress - Wallet address to mint SBT for
 * @returns Mint transaction result
 */
export const mintSBT = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    data?: {
        transaction_hash?: string;
        token_id?: string;
        metadata_uri?: string;
    };
}> => {
    debugLog(`🎨 Minting SBT for wallet: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        // Get auth token (required for authenticated endpoint)
        const authToken = getAuthToken();
        if (!authToken) {
            return {
                success: false,
                message: "Bạn cần đăng nhập để mint SBT",
            };
        }

        const url = `${API_BASE_URL}/api/mint/mint-sbt`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                wallet_address: walletAddress.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Mint SBT error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi mint SBT (${response.status})`,
            };
        }

        debugLog(`✅ SBT minted:`, data);

        return {
            success: true,
            message: data.message || "Mint SBT thành công!",
            data: data,
        };
    } catch (error: any) {
        debugLog(`❌ Mint SBT error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
    }
};

/**
 * Prepare update score transaction (user pays gas) - POST /api/mint/prepare-update-score
 * @param walletAddress - Wallet address
 * @returns Transaction data for user to sign
 */
export const prepareUpdateScore = async (
    walletAddress: string
): Promise<{
    success: boolean;
    message: string;
    data?: {
        to: string;
        data: string;
        value: string;
        gas_estimate?: string;
    };
}> => {
    debugLog(`📝 Preparing update score transaction for wallet: ${walletAddress}`);

    try {
        if (!walletAddress || !isValidWalletAddress(walletAddress)) {
            return {
                success: false,
                message: "Địa chỉ ví không hợp lệ",
            };
        }

        // Get auth token (required for authenticated endpoint)
        const authToken = getAuthToken();
        if (!authToken) {
            return {
                success: false,
                message: "Bạn cần đăng nhập để update score",
            };
        }

        const url = `${API_BASE_URL}/api/mint/prepare-update-score`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                wallet_address: walletAddress.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            debugLog(`❌ Prepare update score error: ${response.status}`, data);
            return {
                success: false,
                message: data.message || data.error || `Lỗi prepare transaction (${response.status})`,
            };
        }

        debugLog(`✅ Update score transaction prepared:`, data);

        return {
            success: true,
            message: data.message || "Transaction prepared successfully!",
            data: data,
        };
    } catch (error: any) {
        debugLog(`❌ Prepare update score error:`, error.message);
        return {
            success: false,
            message: error.message || "Lỗi kết nối đến server",
        };
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

        // Some dev/proxy setups may return HTML (e.g., Vite index.html) on 404.
        // Always parse safely to avoid throwing `Unexpected token '<'`.
        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();
        const data: any = (() => {
            if (contentType.includes("application/json")) {
                try {
                    return rawText ? JSON.parse(rawText) : {};
                } catch {
                    return {};
                }
            }
            return {};
        })();

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
            // debugLog(`❌ Register error: ${response.status}`, data);
            // ✅ Handle specific error cases (support multiple backend shapes)
            const errorMessage =
                data?.detail?.message ||
                data?.detail?.error ||
                data?.message ||
                data?.error ||
                "";
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
            verificationToken: data.token || data.verificationToken || data.verification_token,
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
                id: data.user?.id || data.user?.user_id || `user_${Date.now()}`,
                email: data.user?.email || data.email,
                name: data.user?.email?.split("@")[0] || data.email?.split("@")[0] || "User",
                walletAddress: data.user?.walletAddress || data.user?.wallet_address || data.wallet_address,
                createdAt: data.user?.createdAt || data.user?.created_at,
                lastLogin: data.user?.lastLogin || data.user?.last_login,
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
 * @param walletAddress - Optional wallet address to link
 */
export const sendMagicLinkReal = async (
    email: string,
    walletAddress?: string
): Promise<{
    success: boolean;
    message: string;
    verificationToken?: string;
}> => {
    debugLog(`🔐 Sending magic link to: ${email}`, walletAddress ? `with wallet: ${walletAddress}` : '');

    try {
        // Validate email
        if (!email || !email.includes("@")) {
            return {
                success: false,
                message: "Email không hợp lệ",
            };
        }

        const url = `${API_BASE_URL}/api/send-magic-link`;
        const requestBody: any = {
            email: email.toLowerCase().trim(),
        };

        // Add wallet address only if it looks valid.
        // Also include both camelCase and snake_case to be compatible with different backends.
        if (walletAddress && isValidWalletAddress(walletAddress.trim())) {
            const w = walletAddress.trim();
            requestBody.walletAddress = w;
            requestBody.wallet_address = w;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        // Some dev/proxy setups may return HTML (e.g., Vite index.html) on 404.
        // Always parse safely to avoid throwing `Unexpected token '<'`.
        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();
        const data: any = (() => {
            if (contentType.includes("application/json")) {
                try {
                    return rawText ? JSON.parse(rawText) : {};
                } catch {
                    return {};
                }
            }
            return { raw: rawText };
        })();

        if (!response.ok) {
            debugLog(`❌ Magic link error: ${response.status}`, data);

            // Provide a clearer error when local backend/proxy is misconfigured.
            if (response.status === 404) {
                return {
                    success: false,
                    message:
                        "Endpoint /api/send-magic-link không tồn tại (404). Kiểm tra backend đang chạy và Vite proxy (.env.local: VITE_USE_VITE_PROXY, VITE_BACKEND_URL).",
                };
            }

            const msg =
                data?.detail?.message ||
                data?.detail?.error ||
                data?.message ||
                data?.error ||
                data?.raw ||
                `HTTP ${response.status}`;

            return {
                success: false,
                message: String(msg),
            };
        }

        debugLog(`✅ Magic link sent:`, data);

        return {
            success: true,
            message: data.message || "Magic link đã được gửi đến email của bạn!",
            verificationToken: data.verificationToken || data.verification_token || data.token,
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

        const url = `${API_BASE_URL}/api/feedback/`;
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
        const authToken = getAuthToken();
        const currentUser = localStorage.getItem("currentUser");

        console.log("🔍 getUserInfo() - Checking localStorage:");
        console.log("  - authToken:", authToken ? `${authToken.substring(0, 30)}... (length: ${authToken.length})` : "❌ NULL");
        console.log("  - currentUser:", currentUser ? "✅ EXISTS" : "❌ NULL");

        if (!authToken) {
            console.error("❌ getUserInfo() - Missing authToken in localStorage!");
            return {
                success: false,
                message: "Chưa đăng nhập",
            };
        }

        // DEMO / mock tokens are frontend-only. Do not call backend for these.
        if (
            authToken.startsWith("demo_session_") ||
            authToken.startsWith("mock_jwt_")
        ) {
            if (currentUser) {
                try {
                    const parsed = JSON.parse(currentUser);
                    return {
                        success: true,
                        message: "Success",
                        user: {
                            id: parsed?.id || `demo_${Date.now()}`,
                            email: parsed?.email,
                            wallet_address: parsed?.walletAddress || parsed?.wallet_address,
                            name: parsed?.name,
                            last_login: parsed?.lastLogin ?? null,
                            created_at: parsed?.createdAt,
                        },
                    };
                } catch {
                    // fall through
                }
            }

            return {
                success: false,
                message: "DEMO token - không có user-info từ backend",
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

        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();
        const data: any = (() => {
            if (contentType.includes("application/json")) {
                try {
                    return rawText ? JSON.parse(rawText) : {};
                } catch {
                    return {};
                }
            }
            return { raw: rawText };
        })();

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
        const authToken = getAuthToken();

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

                // ✅ DEBUG: Log wallet address and score to check for cache issues
                console.log(`🔍 ========== WALLET ANALYSIS DEBUG ==========`);
                console.log(`📍 Requested Wallet: ${walletAddress}`);
                console.log(`📊 API Response Score: ${data.score || data.credit_score || 'N/A'}`);
                console.log(`💰 API Response Total Assets: ${data.total_assets || 'N/A'}`);
                console.log(`🎂 API Response Wallet Age: ${data.wallet_age || 'N/A'}`);
                console.log(`📈 API Response Transactions: ${data.total_transactions || 'N/A'}`);
                console.log(`🔍 ============================================`);

                // Success - break retry loop
                // ✅ mapWalletData now throws error if backend returns wrong wallet
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
        throw new Error('⏱️ Backend ph���n hồi quá chậm (>60s). Dữ liệu blockchain đang được crawl. Vui lòng thử lại sau hoặc xem Demo để test nhanh.');

    } catch (error: any) {
        debugLog(`❌ Error analyzing wallet:`, error);

        // ✅ CHECK IF USER IS LOGGED IN
        const authToken = getAuthToken();

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
    console.log(`��� ========== FULL API RESPONSE ==========`);
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
    console.log(`  - data.token_summary?.top_tokens:`, data.token_summary?.top_tokens);
    console.log(`  - data.token_summary?.tokens:`, data.token_summary?.tokens);
    console.log(`  - data.token_summary?.total_tokens:`, data.token_summary?.total_tokens);

    // ✅ NEW: Check for native ETH balance fields
    console.log(`🔍 Checking ETH native balance fields:`);
    console.log(`  - data.native_balance:`, data.native_balance);
    console.log(`  - data.eth_balance:`, data.eth_balance);
    console.log(`  - data.wallet_summary?.native_balance:`, data.wallet_summary?.native_balance);
    console.log(`  - data.wallet_summary?.eth_balance:`, data.wallet_summary?.eth_balance);
    console.log(`  - data.total_assets_usd:`, data.total_assets_usd);
    console.log(`  - data.total_assets:`, data.total_assets);

    // �� FIX: Try multiple possible field names for token list
    // MOST IMPORTANT: Check token_summary.top_tokens FIRST (Real API structure!)
    const possibleTokenFields = [
        data.token_summary?.top_tokens,      // ← NEW: Real API uses this!
        data.token_summary?.tokens,          // ← NEW: Alternative
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

    // ✅ FIX: Get token_diversity from token_summary if available
    const tokenDiversityFromAPI = data.token_summary?.total_tokens || data.token_diversity || 0;

    console.log(`🔍 Token diversity from API:`, tokenDiversityFromAPI);

    // ✅ FIX: If token_diversity > 0 but tokenBalances is empty, create placeholder
    if (tokenBalances.length === 0 && tokenDiversityFromAPI > 0) {
        console.warn(`⚠️ API reports ${tokenDiversityFromAPI} token(s) but token_balances is empty!`);
        console.warn(`⚠️ Creating ${Math.min(tokenDiversityFromAPI, 10)} placeholder token(s)...`);

        // Create placeholder tokens based on token_diversity (max 10 to avoid clutter)
        for (let i = 0; i < Math.min(tokenDiversityFromAPI, 10); i++) {
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

    // ✅ FIX: Filter out spam tokens and tokens with invalid USD values & sort by value
    // ✅ CALCULATE TOTAL PORTFOLIO VALUE FIRST (before filtering)
    const totalPortfolioValue = tokenBalances.reduce((sum, t) => sum + (t.value || 0), 0);
    console.log(`💰 Total portfolio value (before filtering): $${totalPortfolioValue.toLocaleString()}`);

    const validTokens = tokenBalances
        .filter(token => {
            console.log(`🔍 [FILTER v5] Checking token ${token.symbol} - value: $${token.value}, spam: ${(token as any).possible_spam}`);

            // ✅ STRICT: Filter out spam tokens
            if ((token as any).possible_spam === true) {
                console.warn(`⚠️ [FILTER v5] Filtering out spam token: ${token.symbol}`);
                return false;
            }

            // ✅ SMART FILTER: Adaptive threshold based on portfolio size
            // If single token value > 80% of total portfolio AND > $10k, it's suspicious
            if (totalPortfolioValue > 0 && token.value > totalPortfolioValue * 0.8 && token.value > 10000) {
                console.warn(`⚠️ [FILTER v5] Filtering out suspicious dominant token ${token.symbol} with value $${token.value.toLocaleString()} (>${(totalPortfolioValue * 0.8).toLocaleString()}, >80% of $${totalPortfolioValue.toLocaleString()} portfolio)`);
                return false;
            }

            // Absolute ceiling: No single token should be > $10M (likely scam/spam)
            if (token.value > 10_000_000) {
                console.warn(`⚠️ [FILTER v5] Filtering out absurdly high-value token ${token.symbol} with value $${token.value.toLocaleString()} (> $10M ceiling)`);
                return false;
            }

            // ✅ Keep all valid tokens, even with 0 value (shows diversity)
            console.log(`✅ [FILTER v5] Keeping token ${token.symbol} - value: $${token.value}`);
            return true;
        })
        .sort((a, b) => b.value - a.value);

    console.log(`✅ Valid tokens after filtering: ${validTokens.length}`, validTokens);

    // ✅ FIX: Recalculate total from valid tokens only
    const validTotalAssets = validTokens.reduce((sum, t) => sum + t.value, 0);

    // ✅ NEW: Get ETH native balance (in USD) from API
    // Try multiple possible fields for ETH native balance in USD
    let nativeBalanceUsd = 0;

    if (data.native_balance_usd !== undefined && !isNaN(parseFloat(data.native_balance_usd))) {
        nativeBalanceUsd = parseFloat(data.native_balance_usd);
        console.log(`✅ Found native_balance_usd: $${nativeBalanceUsd}`);
    } else if (data.eth_balance_usd !== undefined && !isNaN(parseFloat(data.eth_balance_usd))) {
        nativeBalanceUsd = parseFloat(data.eth_balance_usd);
        console.log(`✅ Found eth_balance_usd: $${nativeBalanceUsd}`);
    } else if (data.wallet_summary?.native_balance_usd !== undefined && !isNaN(parseFloat(data.wallet_summary.native_balance_usd))) {
        nativeBalanceUsd = parseFloat(data.wallet_summary.native_balance_usd);
        console.log(`✅ Found wallet_summary.native_balance_usd: $${nativeBalanceUsd}`);
    } else if (data.wallet_summary?.eth_balance_usd !== undefined && !isNaN(parseFloat(data.wallet_summary.eth_balance_usd))) {
        nativeBalanceUsd = parseFloat(data.wallet_summary.eth_balance_usd);
        console.log(`✅ Found wallet_summary.eth_balance_usd: $${nativeBalanceUsd}`);
    } else {
        // ✅ FALLBACK: If backend only provides native_balance in wei (not USD), try to calculate
        // Try to find native balance in wei and ETH price
        let nativeBalanceWei = 0;
        let ethPriceUsd = 0;

        // Try multiple field names for native balance in wei
        if (data.native_balance !== undefined) {
            nativeBalanceWei = parseFloat(data.native_balance);
            console.log(`📍 Found native_balance (wei): ${nativeBalanceWei}`);
        } else if (data.eth_balance !== undefined) {
            nativeBalanceWei = parseFloat(data.eth_balance);
            console.log(`📍 Found eth_balance (wei): ${nativeBalanceWei}`);
        } else if (data.wallet_summary?.native_balance !== undefined) {
            nativeBalanceWei = parseFloat(data.wallet_summary.native_balance);
            console.log(`📍 Found wallet_summary.native_balance (wei): ${nativeBalanceWei}`);
        } else if (data.wallet_summary?.eth_balance !== undefined) {
            nativeBalanceWei = parseFloat(data.wallet_summary.eth_balance);
            console.log(`📍 Found wallet_summary.eth_balance (wei): ${nativeBalanceWei}`);
        }

        // Try to find ETH price
        if (data.eth_price !== undefined) {
            ethPriceUsd = parseFloat(data.eth_price);
            console.log(`📍 Found eth_price: $${ethPriceUsd}`);
        } else if (data.wallet_summary?.eth_price !== undefined) {
            ethPriceUsd = parseFloat(data.wallet_summary.eth_price);
            console.log(`📍 Found wallet_summary.eth_price: $${ethPriceUsd}`);
        }

        // Calculate USD value if we have both wei and price
        if (nativeBalanceWei > 0 && ethPriceUsd > 0) {
            const nativeBalanceEth = nativeBalanceWei / Math.pow(10, 18);
            nativeBalanceUsd = nativeBalanceEth * ethPriceUsd;
            console.log(`✅ Calculated native balance: ${nativeBalanceEth} ETH * $${ethPriceUsd} = $${nativeBalanceUsd}`);
        } else {
            console.log(`⚠️ No ETH native balance found in API response`);
        }
    }

    console.log(`💎 Native ETH Balance (USD): $${nativeBalanceUsd.toLocaleString()}`);
    console.log(`🪙 ERC20 Tokens Total (USD): $${validTotalAssets.toLocaleString()}`);

    let totalAssetsUsd = data.total_assets_usd || 0;

    const largestTokenValue = validTokens[0]?.value || 0;
    if (totalAssetsUsd > 0 && totalAssetsUsd < largestTokenValue) {
        console.warn(`⚠️ API total_assets_usd ($${totalAssetsUsd}) < largest token ($${largestTokenValue}). Using calculated total.`);
        totalAssetsUsd = validTotalAssets;
    }

    if (totalAssetsUsd === 0) {
        totalAssetsUsd = validTotalAssets;
    }

    // ✅ CRITICAL FIX: Add native ETH balance to total assets
    totalAssetsUsd += nativeBalanceUsd;

    console.log(`💰 Total Assets (ERC20 + ETH): $${totalAssetsUsd.toLocaleString()} (${validTokens.length} valid tokens + ${nativeBalanceUsd > 0 ? 'ETH native' : 'no ETH'})`);

    // ✅ FIX: Calculate percentage based on total (including ETH)
    if (totalAssetsUsd > 0) {
        validTokens.forEach(token => {
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

    // ✅ FIX: Use token_summary.total_tokens for tokenDiversity if available
    // ✅ UPDATED: Prioritize validTokens.length (actual parsed tokens) over API's token_diversity
    // because API's token_diversity field might be unreliable or represent something else (e.g., weight percentage)
    const finalTokenDiversity = data.token_summary?.total_tokens || validTokens.length || data.token_diversity || 0;

    console.log(`🔍 ========== TOKEN DIVERSITY CALCULATION ==========`);
    console.log(`  - data.token_summary?.total_tokens: ${data.token_summary?.total_tokens || 'N/A'}`);
    console.log(`  - validTokens.length (ACTUAL): ${validTokens.length}`);
    console.log(`  - data.token_diversity (API): ${data.token_diversity || 'N/A'}`);
    console.log(`  - finalTokenDiversity (SELECTED): ${finalTokenDiversity}`);
    console.log(`🔍 ================================================`);

    // ✅ FIX: Get total_transactions from transaction_summary if available
    const totalTransactions = data.transaction_summary?.total_transactions || data.total_transactions || 0;

    // ✅ CRITICAL VALIDATION: Check if backend returned correct wallet address
    const returnedWallet = data.wallet_address;
    if (returnedWallet && returnedWallet.toLowerCase() !== walletAddress.toLowerCase()) {
        console.error(`🚨 ========== BACKEND BUG CRITICAL ==========`);
        console.error(`🚨 Requested: ${walletAddress}`);
        console.error(`🚨 Received:  ${returnedWallet}`);
        console.error(`🚨 Backend cache/database混淆 - REJECTING DATA!`);
        console.error(`🚨 ==========================================`);

        throw new Error(
            `Backend returned wrong wallet data!\n\n` +
            `Requested: ${walletAddress}\n` +
            `Received: ${returnedWallet}\n\n` +
            `This is a critical backend bug. Please contact admin@migofin.com`
        );
    }

    const walletAnalysis: WalletAnalysis = {
        score: score,
        walletAge: walletAge,
        totalTransactions: totalTransactions,
        tokenDiversity: finalTokenDiversity,
        totalAssets: totalAssetsUsd,
        rating: rating,
        tokenBalances: validTokens,
        recentTransactions: recentTransactions,
        walletAddress: returnedWallet || walletAddress, // Use returned wallet if valid, otherwise requested
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
        walletTransactionsLast30d: data.wallet_transactions_last_30d || data.transaction_summary?.transactions_30d,
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
        console.log(`  → Spam: ${token.possible_spam || false}`);

        return {
            symbol: symbol,
            balance: balance,
            value: usdValue,
            percentage: 0, // Will be calculated later
            token_address: token.token_address || token.address || token.contract_address,
            name: name,
            logo: token.logo || token.token_logo || token.thumbnail || token.icon,
            decimals: decimals,
            // ✅ NEW: Preserve spam flag for filtering
            possible_spam: token.possible_spam || false,
            verified_contract: token.verified_contract,
            security_score: token.security_score,
        } as any;
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
    if (score === 0) return "N/A"; // ✅ No score = No rating
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
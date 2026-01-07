
const API_BASE_URL = "https://backend.migofin.com";

/**
 * Sign in với MetaMask wallet
 * @returns {Promise<{success: boolean, user?: any, error?: string}>}
 */
export async function signInWithWallet(): Promise<{
    success: boolean;
    user?: any;
    error?: string;
}> {
    try {
        // 1️⃣ Check MetaMask
        if (!window.ethereum) {
            return {
                success: false,
                error: "Vui lòng cài đặt MetaMask để tiếp tục",
            };
        }

        // 2️⃣ Connect wallet
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const address = accounts[0];

        console.log("✅ Connected wallet:", address);

        // 3️⃣ Get chainId from MetaMask (KHÔNG HARDCODE)
        const chainIdHex = await window.ethereum.request({
            method: "eth_chainId",
        });
        const chain_id = parseInt(chainIdHex, 16);

        console.log("✅ Chain ID:", chain_id, `(${chainIdHex})`);

        // 4️⃣ Request SIWE message (nonce)
        console.log("📡 Requesting nonce...");
        const nonceRes = await fetch(`${API_BASE_URL}/api/auth/wallet/nonce`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                address,
                chain_id
            }),
        });

        if (!nonceRes.ok) {
            const errorData = await nonceRes.json().catch(() => ({}));
            throw new Error(errorData.message || "Lỗi khi yêu cầu nonce");
        }

        const { message, nonce } = await nonceRes.json();

        console.log("✅ Nonce received:", nonce);
        console.log("📝 SIWE Message:", message);

        // ❗ QUAN TRỌNG: KHÔNG SỬA MESSAGE
        // ❌ const trimmedMessage = message.trim();
        // ❌ const formattedMessage = message.replace(/\n/g, '\\n');
        // ✅ Dùng NGUYÊN VẸN

        // 5️⃣ Sign message với MetaMask
        console.log("🔐 Requesting signature from MetaMask...");
        const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, address],  // ← message NGUYÊN VẸN
        });

        console.log("✅ Signature received:", signature);

        // 6️⃣ Verify signature
        console.log("📡 Verifying signature...");
        const verifyRes = await fetch(`${API_BASE_URL}/api/auth/wallet/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                address,
                chain_id,
                signature,
                // ❌ KHÔNG gửi message
                // ❌ KHÔNG gửi nonce
            }),
        });

        if (!verifyRes.ok) {
            const errorData = await verifyRes.json().catch(() => ({}));
            throw new Error(errorData.message || "Xác thực signature thất bại");
        }

        const { access_token, token_type, user } = await verifyRes.json();

        console.log("✅ Verification successful!");
        console.log("🎫 JWT Token received");

        // 7️⃣ Save JWT to localStorage
        localStorage.setItem("authToken", access_token);
        localStorage.setItem("currentUser", JSON.stringify({
            id: user?.id || `wallet_${Date.now()}`,
            walletAddress: address,
            email: user?.email,
            name: user?.name || address.substring(0, 8) + "...",
            createdAt: user?.createdAt || new Date().toISOString(),
            lastLogin: user?.lastLogin || null,
        }));

        console.log("💾 Auth data saved to localStorage");

        return {
            success: true,
            user: {
                walletAddress: address,
                chainId: chain_id,
                ...user,
            },
        };

    } catch (error: any) {
        console.error("❌ SIWE auth error:", error);

        // Handle specific errors
        if (error.code === 4001) {
            return {
                success: false,
                error: "Bạn đã từ chối ký message",
            };
        }

        if (error.code === -32002) {
            return {
                success: false,
                error: "MetaMask đang chờ bạn xác nhận. Vui lòng mở MetaMask.",
            };
        }

        return {
            success: false,
            error: error.message || "Lỗi kết nối MetaMask",
        };
    }
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        return accounts.length > 0;
    } catch {
        return false;
    }
}

/**
 * Get current wallet address
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
    if (!window.ethereum) return null;

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        return accounts[0] || null;
    } catch {
        return null;
    }
}

/**
 * Logout - clear auth data
 */
export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    console.log("👋 Logged out");
}

// TypeScript declarations
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on?: (event: string, callback: (...args: any[]) => void) => void;
            removeListener?: (event: string, callback: (...args: any[]) => void) => void;
        };
    }
}

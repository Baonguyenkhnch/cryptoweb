
// Base URL lấy từ env để linh hoạt dev/prod
const buildApiBase = () => {
    const raw = ((import.meta as any).env?.VITE_BACKEND_URL as string | undefined) || "https://backend.migofin.com/api";
    let base = raw.replace(/\/+$/, "");
    // Nếu chưa có /api thì tự thêm để khớp swagger /api/auth/...
    if (!/\/api$/i.test(base)) {
        base = `${base}/api`;
    }
    return base;
};

const API_BASE_URL = buildApiBase();
console.log("[WalletAuth] API_BASE_URL:", API_BASE_URL);
/**
 * Response type from /wallet/nonce API
 */
export interface NonceResponse {
    nonce: string;
    domain: string;
    statement: string;
    uri: string;
    issued_at: string;
    expiration_time: string;
    address?: string;
    chain_id?: number;
    message?: string
}

/**
 * Response type from /wallet/verify API
 */
export interface VerifyResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        email?: string;
        wallet_address: string;
        created_at?: string;
        last_login?: string | null;
    };
}

export async function getNonce(
    address: string,
    chainId: number
): Promise<NonceResponse> {
    try {
        // API_BASE_URL nên bao gồm prefix /api nếu backend yêu cầu
        const response = await fetch(`${API_BASE_URL}/auth/wallet/nonce`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                address, // ✅ Changed from 'address' to 'wallet_address'
                chain_id: chainId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to get nonce from backend");
        }

        const data = await response.json();

        console.log("✅ Nonce data received:", data);

        return data;
    } catch (error: any) {
        console.error("❌ getNonce error:", error);
        throw new Error(error.message || "Failed to get nonce");
    }
}

/**
 * Verify signature with backend
 * @param message - SIWE message string
 * @param signature - Signature from MetaMask
 * @returns JWT token and user data
 */
export async function verifySignature(
    address: string,
    chain_id: number,
    signature: string,

): Promise<VerifyResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/wallet/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                address,
                chain_id: chain_id,
                signature,

            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Signature verification failed");
        }

        const data = await response.json();

        console.log("✅ Verification successful!");
        console.log("🎫 JWT token received");

        return data;
    } catch (error: any) {
        console.error("❌ verifySignature error:", error);
        throw new Error(error.message || "Verify failed");
    }
}


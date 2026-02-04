
// Configure backend base URL via env only; do not bake domains into code.
// Per project convention:
// - SIWE (wallet auth) uses VITE_DEV_URL
// - Other endpoints use VITE_BACKEND_URL
// Fallbacks are kept for compatibility.
const buildApiBase = () => {
    const sanitizeEnvUrl = (input: unknown): string => {
        const value = String(input ?? "").trim();
        const unquoted = value.replace(/^['"]|['"]$/g, "");
        const withoutComment = unquoted
            .replace(/\s+#.*$/, "")
            .replace(/\s+\/\/.*$/, "");
        return withoutComment.trim();
    };

    const env = (import.meta as any).env as any;
    // Optional: in local dev, use same-origin (/api/...) and let Vite proxy forward to backend.
    // This avoids CORS issues when backend doesn't allow localhost:5173.
    const useProxy = String(env?.VITE_USE_VITE_PROXY || "").toLowerCase() === "true";
    if (env?.DEV && useProxy) {
        return "";
    }

    const raw = env?.VITE_DEV_URL || env?.VITE_BACKEND_URL;
    const value = sanitizeEnvUrl(raw);

    if (!value) {
        console.warn(
            "[walletAuth] Missing API base URL. Set VITE_DEV_URL (recommended for SIWE) or VITE_BACKEND_URL in .env/.env.local."
        );
        return "";
    }

    const withoutTrailingSlashes = value.replace(/\/+$/, "");
    // Normalize so env can be either `https://host` or `https://host/api`.
    return withoutTrailingSlashes.endsWith("/api")
        ? withoutTrailingSlashes.slice(0, -4)
        : withoutTrailingSlashes;
};

const API_BASE_URL = buildApiBase();

/**
 * Response type from /wallet/nonce API
 */
export interface NonceResponse {
    nonce: string;
    domain?: string;
    statement?: string | null;
    uri?: string;
    issued_at?: string;
    expiration_time?: string;
    address?: string;
    chain_id?: number;
    message?: string;
}

/**
 * Response type from /wallet/verify API
 */
export interface VerifyResponse {
    access_token: string;
    token_type: string;
    user?: {
        id?: string;
        email?: string;
        wallet_address?: string;
        created_at?: string;
        last_login?: string | null;
    };
}

export async function getNonce(
    address: string,
    chainId: number
): Promise<NonceResponse> {
    try {
        if ((import.meta as any).env?.DEV) {
            console.log("[walletAuth] nonce endpoint:", `${API_BASE_URL}/api/auth/wallet/nonce` || "/api/auth/wallet/nonce");
        }
        const response = await fetch(`${API_BASE_URL}/api/auth/wallet/nonce`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                address,
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
    message: string

): Promise<VerifyResponse> {
    try {
        if ((import.meta as any).env?.DEV) {
            console.log("[walletAuth] verify endpoint:", `${API_BASE_URL}/api/auth/wallet/verify` || "/api/auth/wallet/verify");
        }
        const response = await fetch(`${API_BASE_URL}/api/auth/wallet/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                message,
                signature,
                address,
                chain_id,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ verifySignature error detail:", {
                status: response.status,
                body: errorData,
            });
            throw new Error(errorData.message || `Signature verification failed (${response.status})`);
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


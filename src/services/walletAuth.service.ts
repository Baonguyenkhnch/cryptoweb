
// Minimal Vite env typing (keeps file isolated from global type packages)
declare global {
    interface ImportMetaEnv {
        readonly VITE_API_BASE_URL?: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

export { };

// Allow overriding backend via env; default to production API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://backend.migofin.com";

const NONCE_PATHS = ["/api/auth/wallet/nonce", "/auth/wallet/nonce"];
const VERIFY_PATHS = ["/api/auth/wallet/verify", "/auth/wallet/verify"];

async function postJson(url: string, body: any) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
}

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
        // Try both paths to be resilient to backend routing differences
        for (const path of NONCE_PATHS) {
            const url = `${API_BASE_URL}${path}`;
            console.log("📡 Requesting nonce from backend:", url);

            const { response, data } = await postJson(url, {
                wallet_address: address,
                chain_id: chainId,
            });

            if (response.ok) {
                console.log("✅ Nonce data received:", data);
                return data;
            }

            console.warn(`⚠️ Nonce endpoint ${url} returned ${response.status}`, data);
        }

        throw new Error("Failed to get nonce from backend (all endpoints tried)");
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
    chain_id: string,
    signature: string
): Promise<VerifyResponse> {
    try {
        for (const path of VERIFY_PATHS) {
            const url = `${API_BASE_URL}${path}`;
            console.log("📡 Verifying signature with backend:", url);

            const { response, data } = await postJson(url, {
                wallet_address: address,
                chain_id,
                signature,
            });

            if (response.ok) {
                console.log("✅ Verification successful!");
                console.log("🎫 JWT token received");
                return data;
            }

            console.warn(`⚠️ Verify endpoint ${url} returned ${response.status}`, data);
        }

        throw new Error("Signature verification failed (all endpoints tried)");
    } catch (error: any) {
        console.error("❌ verifySignature error:", error);
        throw new Error(error.message || "Verify failed");
    }
}


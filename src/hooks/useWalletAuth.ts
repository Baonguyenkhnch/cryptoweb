/**
 * ============================================
 * USE WALLET AUTH HOOK
 * ============================================
 * Custom hook xử lý logic connect + sign với:
 * 1. MetaMask (Browser Extension)
 * 2. WalletConnect (Mobile Wallets via QR)
 * 
 * Sử dụng ethers v6 (BrowserProvider)
 * ============================================
 */

import { BrowserProvider } from "ethers";
import { getNonce, verifySignature } from "../services/walletAuth.service";

export interface WalletAuthResult {
    address: string;
    chainId: number;
    accessToken: string;
    user: {
        id: string;
        email?: string;
        wallet_address: string;
        created_at?: string;
        last_login?: string | null;
    };
}

export function useWalletAuth() {
    /**
     * Connect MetaMask wallet và authenticate
     * @returns Wallet info + JWT token
     */
    const connectWallet = async (): Promise<WalletAuthResult> => {
        try {
            // ① CHECK METAMASK
            if (!window.ethereum) {
                throw new Error("MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask Extension.");
            }

            console.log("🔗 Connecting to MetaMask...");

            // ② CREATE PROVIDER (ethers v6)
            const provider = new BrowserProvider(window.ethereum);

            // ③ REQUEST ACCOUNTS
            await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("✅ MetaMask connected");

            // ④ GET SIGNER & ADDRESS
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            console.log("📍 Wallet address:", address);

            // ⑤ GET CHAIN ID
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);

            console.log("⛓️ Chain ID:", chainId);

            // ⑥ GET NONCE FROM BACKEND
            console.log("📡 Requesting nonce from backend...");
            const nonceData = await getNonce(address, chainId);

            console.log("✅ Nonce received:", nonceData.nonce);

            // ⑦ BUILD SIWE MESSAGE (FRONTEND TỰ BUILD)
            // ⚠️ QUAN TRỌNG: PHẢI ĐÚNG FORMAT EIP-4361
            const message = `${nonceData.domain} wants you to sign in with your Ethereum account:
${address}

${nonceData.statement}

URI: ${nonceData.uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonceData.nonce}
Issued At: ${nonceData.issued_at}
Expiration Time: ${nonceData.expiration_time}`;

            console.log("📝 SIWE Message built:");
            console.log(message);

            // ⑧ SIGN MESSAGE WITH METAMASK
            console.log("🔐 Requesting signature from MetaMask...");
            const signature = await signer.signMessage(message);

            console.log("✅ Signature received:", signature.substring(0, 20) + "...");

            // ⑨ VERIFY SIGNATURE WITH BACKEND
            console.log("📡 Verifying signature with backend...");
            const verifyResult = await verifySignature(address, chainId, signature);

            console.log("✅ Authentication successful!");

            // ⑩ RETURN RESULT
            return {
                address,
                chainId,
                accessToken: verifyResult.access_token,
                user: verifyResult.user,
            };
        } catch (error: any) {
            console.error("❌ Wallet auth error:", error);

            // Handle specific MetaMask errors
            if (error.code === 4001) {
                throw new Error("Bạn đã từ chối kết nối MetaMask");
            }

            if (error.code === -32002) {
                throw new Error("MetaMask đang chờ bạn xác nhận. Vui lòng mở MetaMask.");
            }

            if (error.message?.includes("user rejected")) {
                throw new Error("Bạn đã từ chối ký message");
            }

            // Re-throw with user-friendly message
            throw new Error(error.message || "Lỗi kết nối ví");
        }
    };

    /**
     * Connect WalletConnect và authenticate
     * @param onURIGenerated - Callback when QR URI is ready
     * @returns Provider instance and connection promise
     */
    const connectWalletConnect = async (
        onURIGenerated: (uri: string) => void
    ): Promise<{ uri: string; provider: any }> => {
        try {
            console.log("🔄 Initializing WalletConnect...");

            // ✅ Dynamic import WalletConnect (with error handling for build)
            let EthereumProvider: any;

            try {
                const module = await import("@walletconnect/ethereum-provider");
                // ✅ FIX: Use default export correctly
                EthereumProvider = module.default;
            } catch (importError) {
                console.error("❌ WalletConnect not available:", importError);
                throw new Error("WalletConnect không khả dụng. Vui lòng sử dụng MetaMask Desktop.");
            }

            if (!EthereumProvider) {
                throw new Error("WalletConnect provider not found");
            }

            const projectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID?.trim();
            console.log("WalletConnect projectId from env:", projectId);
            if (!projectId) {
                console.error("❌ Missing WalletConnect projectId. Set VITE_WALLETCONNECT_PROJECT_ID in .env");
                throw new Error("WalletConnect chưa được cấu hình. Vui lòng thêm VITE_WALLETCONNECT_PROJECT_ID vào .env");
            }

            // ✅ FIX: Use .init() instead of .create()
            const provider = await EthereumProvider.init({
                projectId,
                chains: [1], // Ethereum Mainnet
                showQrModal: false, // We'll show our own QR
                metadata: {
                    name: "Migo Credit Score",
                    description: "Crypto Credit Score Calculator",
                    url: "https://migofin.com",
                    icons: ["https://migofin.com/favicon.svg"]
                },
                optionalChains: [56, 137, 43114, 42161, 10, 250], // BSC, Polygon, Avalanche, Arbitrum, Optimism, Fantom
            });

            console.log("✅ WalletConnect provider created");

            let walletConnectURI = "";

            // ✅ Listen for URI generation
            provider.on("display_uri", (uri: string) => {
                console.log("🔗 WalletConnect URI:", uri);
                walletConnectURI = uri;
                onURIGenerated(uri);
            });

            // ✅ Listen for connection
            provider.on("connect", async (session: any) => {
                console.log("🎉 WalletConnect connected!", session);

                try {
                    // Get wallet info from WalletConnect
                    const accounts = await provider.request({ method: "eth_accounts" });
                    const address = accounts[0];

                    const chainIdHex = await provider.request({ method: "eth_chainId" });
                    const chainId = parseInt(chainIdHex, 16);

                    console.log("📍 WalletConnect address:", address);
                    console.log("⛓️ Chain ID:", chainId);

                    // ⑥ GET NONCE FROM BACKEND
                    console.log("📡 Requesting nonce from backend...");
                    const nonceData = await getNonce(address, chainId);

                    console.log("✅ Nonce received:", nonceData.nonce);

                    // ⑦ BUILD SIWE MESSAGE
                    const message = `${nonceData.domain} wants you to sign in with your Ethereum account:
${address}

${nonceData.statement}

URI: ${nonceData.uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonceData.nonce}
Issued At: ${nonceData.issued_at}
Expiration Time: ${nonceData.expiration_time}`;

                    console.log("📝 SIWE Message built:");
                    console.log(message);

                    // ⑧ SIGN MESSAGE WITH WALLETCONNECT
                    console.log("🔐 Requesting signature via WalletConnect...");

                    const signature = await provider.request({
                        method: "personal_sign",
                        params: [message, address]
                    });

                    console.log("✅ Signature received:", signature.substring(0, 20) + "...");

                    // ⑨ VERIFY SIGNATURE WITH BACKEND
                    console.log("📡 Verifying signature with backend...");
                    const verifyResult = await verifySignature(address, chainId, signature, message);

                    console.log("✅ WalletConnect authentication successful!");

                    // Store auth data
                    localStorage.setItem("authToken", verifyResult.access_token);
                    localStorage.setItem("currentUser", JSON.stringify({
                        id: verifyResult.user.id,
                        walletAddress: address,
                        email: verifyResult.user.email,
                        name: address.substring(0, 8) + "...",
                        createdAt: verifyResult.user.created_at,
                        lastLogin: verifyResult.user.last_login,
                    }));

                    // Reload to update auth state
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);

                } catch (error: any) {
                    console.error("❌ WalletConnect SIWE error:", error);
                    throw error;
                }
            });

            // ✅ Listen for disconnection
            provider.on("disconnect", () => {
                console.log("🔌 WalletConnect disconnected");
            });

            // ✅ Connect (this triggers display_uri event)
            try {
                await provider.connect();
            } catch (err: any) {
                // WalletConnect returns websocket code 3000 when the projectId is invalid/not found
                const message = err?.message || "";
                if (message.includes("Project not found") || message.includes("code: 3000")) {
                    throw new Error("WalletConnect projectId không hợp lệ hoặc đã bị xóa. Hãy tạo project mới tại cloud.walletconnect.com và cập nhật VITE_WALLETCONNECT_PROJECT_ID.");
                }
                throw new Error(message || "Lỗi khởi tạo WalletConnect");
            }

            return { uri: walletConnectURI, provider };

        } catch (error: any) {
            console.error("❌ WalletConnect error:", error);
            throw new Error(error.message || "Lỗi khởi tạo WalletConnect");
        }
    };

    return { connectWallet, connectWalletConnect };
}

// TypeScript declarations for window.ethereum
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on?: (event: string, callback: (...args: any[]) => void) => void;
            removeListener?: (
                event: string,
                callback: (...args: any[]) => void
            ) => void;
        };
    }
}



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
     * Connect wallet và authenticate
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
            const verifyResult = await verifySignature(message, signature);

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

    return { connectWallet };
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

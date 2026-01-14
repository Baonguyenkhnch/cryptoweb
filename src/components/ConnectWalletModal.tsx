/**
 * ============================================
 * CONNECT WALLET MODAL - 2 OPTIONS
 * ============================================
 * Modal để connect wallet qua:
 * 1. MetaMask (Desktop Browser Extension)
 * 2. WalletConnect (QR Code for Mobile)
 * ============================================
 */

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getAuthToken, setAuthToken } from "../services/authToken";
import { toast } from "sonner";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConnectWalletModal({ isOpen, onClose, onSuccess }: ConnectWalletModalProps) {
  const [step, setStep] = useState<"select" | "metamask" | "walletconnect">("select");
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnectURI, setWalletConnectURI] = useState("");
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const { connectWallet, connectWalletConnect } = useWalletAuth();

  const formatMetaMaskError = (error: any): { title: string; description: string } => {
    const code = error?.code;
    const message = String(error?.message || "");

    if (code === 4001) {
      return {
        title: "Bạn đã từ chối yêu cầu",
        description: "Vui lòng mở MetaMask và xác nhận để tiếp tục.",
      };
    }

    if (code === -32002) {
      return {
        title: "MetaMask đang chờ xác nhận",
        description: "Bạn đang có một yêu cầu đang pending. Vui lòng mở MetaMask để xử lý.",
      };
    }

    if (code === 4100) {
      return {
        title: "MetaMask chưa được cấp quyền",
        description: "Vui lòng mở MetaMask và cấp quyền truy cập tài khoản cho website.",
      };
    }

    if (code === 4902) {
      return {
        title: "Chưa có mạng này trong MetaMask",
        description: "Vui lòng thêm network phù hợp trong MetaMask rồi thử lại.",
      };
    }

    if (message.toLowerCase().includes("user rejected")) {
      return {
        title: "Bạn đã từ chối yêu cầu",
        description: "Vui lòng thử lại và xác nhận trong MetaMask.",
      };
    }

    return {
      title: "Lỗi kết nối MetaMask",
      description: message || "Vui lòng kiểm tra MetaMask và thử lại.",
    };
  };

  const handleClose = () => {
    setStep("select");
    setIsConnecting(false);
    setWalletConnectURI("");
    setQrCodeDataURL("");
    onClose();
  };

  // Generate QR Code when WalletConnect URI is available
  useEffect(() => {
    if (walletConnectURI && step === "walletconnect") {
      // Use QRCode library to generate data URL
      import("qrcode").then((QRCode) => {
        QRCode.default.toDataURL(
          walletConnectURI,
          {
            width: 280,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF"
            },
            errorCorrectionLevel: "H"
          },
          (error: unknown, url: string) => {
            if (error) {
              console.error("QR Code generation error:", error);
            } else {
              setQrCodeDataURL(url);
            }
          }
        );
      });
    }
  }, [walletConnectURI, step]);

  // If WalletConnect flow completes, token will be set and we can close without reload
  useEffect(() => {
    if (!isOpen) return;
    if (step !== "walletconnect") return;

    const onAuthTokenChanged = () => {
      const token = getAuthToken();
      if (!token) return;

      toast.success("Kết nối WalletConnect thành công!", {
        description: "Đang chuyển đến Dashboard...",
      });
      handleClose();
      onSuccess?.();
      window.location.hash = "#/dashboard";
    };

    window.addEventListener("authTokenChanged", onAuthTokenChanged);
    return () => window.removeEventListener("authTokenChanged", onAuthTokenChanged);
  }, [isOpen, step, handleClose, onSuccess]);

  // Handle MetaMask Connect
  const handleMetaMaskConnect = async () => {
    try {
      setIsConnecting(true);
      console.log('🔐 Starting MetaMask SIWE authentication...');

      if (!(window as any)?.ethereum) {
        toast.error("Chưa cài MetaMask", {
          description: "Vui lòng cài MetaMask extension cho trình duyệt, sau đó thử lại.",
        });
        return;
      }

      const result = await connectWallet();

      console.log('✅ Login success:', result);

      const accessToken = result?.accessToken;
      if (!accessToken) {
        throw new Error("Đăng nhập ví thành công nhưng không nhận được access token");
      }

      // Persist a small debug breadcrumb so reload won't lose context
      try {
        sessionStorage.setItem(
          "walletAuth:lastAttempt",
          JSON.stringify({
            ok: true,
            provider: "metamask",
            ts: new Date().toISOString(),
            address: result?.address,
            chainId: result?.chainId,
            tokenPreview: `${accessToken.substring(0, 12)}...`,
          })
        );
      } catch {
        // ignore storage errors
      }

      // Token-only auth: do not assume backend returns user/profile data
      setAuthToken(accessToken);

      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${(result?.address ? result.address.substring(0, 8) : "wallet")}...`,
      });

      handleClose();

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        // Redirect to dashboard; App.tsx will fetch profile via protected API
        window.location.hash = "#/dashboard";
      }, 500);

    } catch (error: any) {
      console.error('❌ MetaMask login error:', error);

      // Persist error so we can inspect after reload (or just for debugging)
      try {
        sessionStorage.setItem(
          "walletAuth:lastAttempt",
          JSON.stringify({
            ok: false,
            provider: "metamask",
            ts: new Date().toISOString(),
            message: error?.message,
            code: error?.code,
          })
        );
      } catch {
        // ignore storage errors
      }

      const { title, description } = formatMetaMaskError(error);
      toast.error(title, { description });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle WalletConnect
  const handleWalletConnectInit = async () => {
    try {
      setStep("walletconnect");
      setIsConnecting(true);

      console.log("🔄 Initializing WalletConnect...");

      // Call hook to initialize WalletConnect
      const { uri, provider } = await connectWalletConnect((newURI: string) => {
        console.log("🔗 WalletConnect URI:", newURI);
        setWalletConnectURI(newURI);
      });

      setIsConnecting(false);

      // Wait for user to scan QR and connect
      // Provider will emit events when connected

    } catch (error: any) {
      console.error("❌ WalletConnect init error:", error);
      toast.error("Lỗi khởi tạo WalletConnect", {
        description: error.message || "Vui lòng thử lại",
      });
      setStep("select");
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f1624] rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl relative overflow-hidden">

          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-purple-600/20 blur-3xl rounded-full" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-2 relative z-10">
            SWITCH WALLET
          </h2>

          {step === "select" && (
            <>
              {/* Two Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8 mb-6 relative z-10">

                {/* MetaMask Card */}
                <button
                  onClick={() => setStep("metamask")}
                  className="group relative bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    {/* MetaMask Fox Icon - Geometric Style */}
                    <div className="w-20 h-20 relative">
                      <svg viewBox="0 0 318.6 318.6" className="w-full h-full">
                        <defs>
                          <linearGradient id="mmGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E17726" />
                            <stop offset="100%" stopColor="#E27625" />
                          </linearGradient>
                          <linearGradient id="mmGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#CD6116" />
                            <stop offset="100%" stopColor="#F6851B" />
                          </linearGradient>
                        </defs>
                        {/* Left ear */}
                        <polygon fill="url(#mmGrad1)" points="274.1,35.5 174.6,109.4 193,65.8" />
                        {/* Right ear */}
                        <polygon fill="url(#mmGrad1)" points="44.4,35.5 143.1,110.1 125.6,65.8" />
                        {/* Left face */}
                        <polygon fill="url(#mmGrad2)" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7" />
                        {/* Right face */}
                        <polygon fill="url(#mmGrad2)" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8" />
                        {/* Center face */}
                        <polygon fill="#E27625" points="159.3,114 125.6,65.8 143.1,110.1 174.6,109.4 193,65.8" />
                        {/* Body */}
                        <polygon fill="#CD6116" points="106.8,247.4 138.8,230.9 110.6,208.1" />
                        <polygon fill="#CD6116" points="179.8,230.9 211.8,247.4 208,208.1" />
                        {/* Eyes area */}
                        <polygon fill="#233447" points="159.3,172.1 110.6,208.1 138.8,230.9 179.8,230.9 208,208.1" />
                        {/* Nose */}
                        <polygon fill="#CC6228" points="159.3,172.1 179.8,230.9 138.8,230.9" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg">MetaMask</h3>
                      <p className="text-gray-400 text-xs mt-1">Browser Extension</p>
                    </div>
                  </div>
                </button>

                {/* WalletConnect Card */}
                <button
                  onClick={handleWalletConnectInit}
                  className="group relative bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    {/* WalletConnect W Icon */}
                    <div className="w-20 h-20 flex items-center justify-center">
                      <svg viewBox="0 0 512 512" className="w-16 h-16">
                        <defs>
                          <radialGradient id="wcGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#5B9DF9" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </radialGradient>
                        </defs>
                        <path
                          fill="url(#wcGrad)"
                          d="M126.613 93.9842C181.419 39.1785 270.581 39.1785 325.387 93.9842L331.955 100.552C334.657 103.255 334.657 107.666 331.955 110.369L303.522 138.802C302.171 140.153 299.978 140.153 298.627 138.802L289.044 129.219C253.354 93.5293 196.646 93.5293 160.956 129.219L150.559 139.616C149.208 140.967 147.015 140.967 145.664 139.616L117.231 111.183C114.529 108.481 114.529 104.069 117.231 101.367L126.613 93.9842ZM368.576 148.804L393.825 174.053C396.527 176.755 396.527 181.167 393.825 183.869L285.046 292.648C282.344 295.35 277.932 295.35 275.23 292.648L218.786 236.204C218.11 235.529 217.03 235.529 216.355 236.204L159.911 292.648C157.209 295.35 152.798 295.35 150.095 292.648L41.3163 183.869C38.6143 181.167 38.6143 176.755 41.3163 174.053L66.5651 148.804C69.2671 146.102 73.6788 146.102 76.3808 148.804L132.825 205.248C133.5 205.923 134.58 205.923 135.256 205.248L191.7 148.804C194.402 146.102 198.813 146.102 201.515 148.804L257.96 205.248C258.635 205.923 259.715 205.923 260.39 205.248L316.835 148.804C319.537 146.102 323.948 146.102 326.65 148.804L368.576 148.804Z"
                        />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg">WalletConnect</h3>
                      <p className="text-gray-400 text-xs mt-1">Mobile Wallets</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer Text */}
              <p className="text-gray-400 text-sm text-center mt-6 relative z-10">
                You can switch address via MetaMask UI
              </p>
            </>
          )}

          {/* MetaMask Step */}
          {step === "metamask" && (
            <div className="mt-6 space-y-6 relative z-10">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F6851B]/20 to-[#E2761B]/20 border border-[#F6851B]/30 flex items-center justify-center">
                    <svg viewBox="0 0 318.6 318.6" className="w-16 h-16">
                      <defs>
                        <linearGradient id="mmGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#E17726" />
                          <stop offset="100%" stopColor="#E27625" />
                        </linearGradient>
                        <linearGradient id="mmGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#CD6116" />
                          <stop offset="100%" stopColor="#F6851B" />
                        </linearGradient>
                      </defs>
                      <polygon fill="url(#mmGrad1)" points="274.1,35.5 174.6,109.4 193,65.8" />
                      <polygon fill="url(#mmGrad1)" points="44.4,35.5 143.1,110.1 125.6,65.8" />
                      <polygon fill="url(#mmGrad2)" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7" />
                      <polygon fill="url(#mmGrad2)" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8" />
                      <polygon fill="#E27625" points="159.3,114 125.6,65.8 143.1,110.1 174.6,109.4 193,65.8" />
                      <polygon fill="#CD6116" points="106.8,247.4 138.8,230.9 110.6,208.1" />
                      <polygon fill="#CD6116" points="179.8,230.9 211.8,247.4 208,208.1" />
                      <polygon fill="#233447" points="159.3,172.1 110.6,208.1 138.8,230.9 179.8,230.9 208,208.1" />
                      <polygon fill="#CC6228" points="159.3,172.1 179.8,230.9 138.8,230.9" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Connect MetaMask</h3>
                <p className="text-gray-400 text-sm">Click to connect your MetaMask wallet</p>
              </div>

              <Button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting}
                className="w-full py-4 bg-gradient-to-r from-[#F6851B] to-[#E2761B] hover:from-[#E2761B] hover:to-[#CD6116] text-white font-semibold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Đang kết nối..." : "Connect MetaMask"}
              </Button>

              <button
                onClick={() => setStep("select")}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          )}

          {/* WalletConnect Step */}
          {step === "walletconnect" && (
            <div className="mt-6 space-y-6 relative z-10">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-4">Scan QR Code</h3>

                {/* QR Code Display */}
                <div className="flex justify-center mb-4">
                  {isConnecting && !qrCodeDataURL ? (
                    <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center">
                      <div className="text-gray-400">Đang tạo QR code...</div>
                    </div>
                  ) : qrCodeDataURL ? (
                    <div className="p-4 bg-white rounded-2xl">
                      <img src={qrCodeDataURL} alt="WalletConnect QR" className="w-56 h-56" />
                    </div>
                  ) : null}
                </div>

                <p className="text-gray-400 text-sm">
                  Scan with MetaMask Mobile, Trust Wallet, or 300+ wallets
                </p>
              </div>

              <button
                onClick={() => {
                  setStep("select");
                  setWalletConnectURI("");
                  setQrCodeDataURL("");
                }}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

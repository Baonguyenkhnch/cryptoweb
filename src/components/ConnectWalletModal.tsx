/**
 * ============================================
 * CONNECT WALLET MODAL
 * ============================================
 * Modal để connect wallet qua WalletConnect
 * Hiển thị QR code để user scan
 * ============================================
 */

import { useState, useRef, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import QRCode from "qrcode";
import switchWalletLogo from "./images/logonhap.jpg";
import { signInWithWallet } from "../utils/siwe-auth";
import { toast } from "sonner";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConnectWalletModal({ isOpen, onClose, onSuccess }: ConnectWalletModalProps) {
  const [step, setStep] = useState<"select" | "qrcode" | "metamask">("select");
  const [walletConnectURI, setWalletConnectURI] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate WalletConnect QR Code
  useEffect(() => {
    if (step === "qrcode" && canvasRef.current) {
      // Mock WalletConnect URI (in production, this would be from WalletConnect SDK)
      const uri = `wc:${generateRandomString()}@2?relay-protocol=irn&symKey=${generateRandomString()}`;
      setWalletConnectURI(uri);

      QRCode.toCanvas(
        canvasRef.current,
        uri,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          },
          errorCorrectionLevel: "H"
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [step]);

  // Generate random string for mock WalletConnect URI
  const generateRandomString = () => {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const handleCopyURI = async () => {
    try {
      await navigator.clipboard.writeText(walletConnectURI);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleWalletConnectClick = () => {
    setStep("qrcode");
  };

  const handleMetamaskClick = () => {
    setStep("metamask");
  };

  const handleClose = () => {
    setStep("select");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Step 1: Select Wallet */}
        {step === "select" && (
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 border border-cyan-500/20 shadow-2xl relative">
            {/* Close Button - Inside Modal */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              SWITCH WALLET
            </h2>

            {/* Wallet Options - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* MetaMask Option */}
              <button
                onClick={handleMetamaskClick}
                className="p-6 bg-[#1a1d2e] hover:bg-[#242838] border border-slate-700/50 hover:border-orange-500/40 rounded-2xl transition-all duration-300 group"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* MetaMask Fox Icon - SVG */}
                  <div className="w-20 h-20 rounded-2xl bg-[#0d0f1a] border border-slate-700/50 flex items-center justify-center">
                    <svg width="56" height="56" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
                      <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1" />
                      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207.1,208.1" />
                      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3" />
                      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9" />
                      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 130.5,176.1" />
                      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="179.7,193.5 188,176.1 208,185.2" />
                      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.6,206.8 80.3,207.7" />
                      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="207,206.8 211.8,247.4 238.3,207.7" />
                      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="230.8,162.1 174.6,164.6 179.8,193.5 188.1,176.1 208.1,185.2" />
                      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 130.6,176.1 138.8,193.5 144.1,164.6 87.8,162.1" />
                      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 110.6,185.2" />
                      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="208.1,185.2 207.1,208.1 230.8,162.1" />
                      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7" />
                      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 171.9,182.6 173.1,227.6 179.8,193.5" />
                      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="179.8,193.5 173.1,227.6 177.9,230.9 207.1,208.1 208.1,185.2" />
                      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 111.4,208.1 140.6,230.9 145.4,227.6 138.8,193.5" />
                      <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 140.1,271.9 178.4,271.9 200.8,256.4 211.8,247.4" />
                      <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 173.1,227.6 145.4,227.6 140.6,230.9 138.1,253 140.4,250.8 178.1,250.8 180.6,253" />
                      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.8,136.4 281.8,129.1 275.6,124.3 283.6,118.2" />
                      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="31.8,73.4 40.3,114.2 34.9,118.2 42.9,124.3 36.8,129.1 44.8,136.4 39.8,140 51.3,153.5 103.6,138.2 140.6,106.9 44.4,35.5" />
                      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="267.2,153.5 214.9,138.2 230.8,162.1 207.1,208.1 238.3,207.7 284.8,207.7" />
                      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 87.8,162.1" />
                      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 177.9,106.9 193.1,65.8 125.6,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 173.1,227.6 173.3,182.8" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                    MetaMask
                  </span>
                </div>
              </button>

              {/* WalletConnect Option */}
              <button
                onClick={handleWalletConnectClick}
                className="p-6 bg-[#1a1d2e] hover:bg-[#242838] border border-slate-700/50 hover:border-cyan-500/40 rounded-2xl transition-all duration-300 group"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* WalletConnect W Logo - SVG */}
                  <div className="w-20 h-20 rounded-2xl bg-[#0d0f1a] border border-slate-700/50 flex items-center justify-center">
                    <svg width="56" height="56" viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg">
                      <path d="M61.439 36.256c48.91-47.888 128.212-47.888 177.123 0l5.886 5.764a6.041 6.041 0 0 1 0 8.67l-20.136 19.716a3.179 3.179 0 0 1-4.428 0l-8.101-7.931c-34.122-33.408-89.444-33.408-123.566 0l-8.675 8.494a3.179 3.179 0 0 1-4.428 0L54.978 51.253a6.041 6.041 0 0 1 0-8.67l6.461-6.327ZM280.206 77.03l17.922 17.547a6.041 6.041 0 0 1 0 8.67l-80.81 79.122c-2.446 2.394-6.41 2.394-8.856 0l-57.354-56.155a1.59 1.59 0 0 0-2.214 0L91.54 182.369c-2.446 2.394-6.411 2.394-8.857 0L1.872 103.247a6.041 6.041 0 0 1 0-8.671l17.922-17.547c2.445-2.394 6.41-2.394 8.856 0l57.355 56.155a1.59 1.59 0 0 0 2.214 0L145.572 77.03c2.446-2.394 6.41-2.395 8.856 0l57.355 56.155a1.59 1.59 0 0 0 2.214 0L271.35 77.03c2.446-2.394 6.41-2.394 8.856 0Z"
                        fill="#3B99FC"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                    WalletConnect
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: QR Code */}
        {step === "qrcode" && (
          <div className="bg-[#141414] rounded-2xl overflow-hidden shadow-2xl relative max-w-md">
            {/* Purple Header */}
            <div className="bg-gradient-to-r from-[#5B4FE9] to-[#7B3FE4] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Switch Wallet Logo */}
                <img
                  src={switchWalletLogo}
                  alt="Switch Wallet"
                  className="w-9 h-9 rounded-full"
                />
                <span className="text-white text-xl font-semibold">Switch Wallet</span>
              </div>
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Title with Help Icon */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl">Connect your wallet</h3>
                <button className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all">
                  <span className="text-sm">?</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E1E1E] border border-[#2D4CC8] rounded-lg">
                  <svg className="w-5 h-5 text-[#2D4CC8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
                    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[#2D4CC8] text-sm font-medium">Mobile</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-transparent rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  </svg>
                  <span className="text-gray-500 text-sm">Scan with your wallet</span>
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-5 bg-white rounded-3xl">
                  <div className="relative">
                    <canvas ref={canvasRef} className="rounded-xl" />
                    {/* Switch Wallet Logo Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <img
                          src={switchWalletLogo}
                          alt="Switch Wallet"
                          className="w-12 h-12 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                By connecting your wallet to this app, you agree to the app's{" "}
                <span className="text-[#2D4CC8] cursor-pointer hover:underline">
                  Terms of Service
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: MetaMask */}
        {step === "metamask" && (
          <div className="bg-[#141414] rounded-2xl overflow-hidden shadow-2xl relative max-w-md">
            {/* Orange Header for MetaMask */}
            <div className="bg-gradient-to-r from-[#F6851B] to-[#E2761B] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* MetaMask Fox Icon */}
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div className="text-2xl">🦊</div>
                </div>
                <span className="text-white text-xl font-semibold">MetaMask</span>
              </div>
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h3 className="text-white text-2xl font-semibold mb-2">Connect to MetaMask</h3>
                <p className="text-gray-400 text-sm">Click the button below to connect your MetaMask wallet</p>
              </div>

              {/* MetaMask Fox Large Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#F6851B]/20 to-[#E2761B]/20 border border-[#F6851B]/30 flex items-center justify-center">
                  <div className="text-8xl">🦊</div>
                </div>
              </div>

              {/* Connect Button */}
              <Button
                onClick={async () => {
                  try {
                    console.log('🔐 Starting MetaMask SIWE authentication...');

                    // Call SIWE login function
                    const result = await signInWithWallet();

                    if (result.success) {
                      toast.success("Đăng nhập thành công!", {
                        description: `Chào mừng ${result.user?.walletAddress?.substring(0, 8)}...`,
                      });

                      // Close modal
                      handleClose();

                      // Callback to parent (refresh UI, etc.)
                      if (onSuccess) {
                        onSuccess();
                      }

                      // Reload page to update auth state
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    } else {
                      toast.error("Đăng nhập thất bại", {
                        description: result.error || "Vui lòng thử lại",
                      });
                    }
                  } catch (error: any) {
                    console.error('❌ MetaMask login error:', error);
                    toast.error("Lỗi kết nối MetaMask", {
                      description: error.message || "Vui lòng kiểm tra MetaMask và thử lại",
                    });
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-[#F6851B] to-[#E2761B] hover:from-[#E2761B] hover:to-[#CD6116] text-white font-semibold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300"
              >
                Connect MetaMask
              </Button>

              {/* Footer Text */}
              <p className="text-gray-500 text-xs text-center leading-relaxed mt-6">
                Make sure you have MetaMask extension installed in your browser.
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F6851B] cursor-pointer hover:underline ml-1"
                >
                  Download MetaMask
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
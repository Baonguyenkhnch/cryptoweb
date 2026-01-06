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

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
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
                  {/* MetaMask Fox Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-[#0d0f1a] border border-slate-700/50 flex items-center justify-center">
                    <div className="text-5xl">🦊</div>
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
                  {/* WalletConnect Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-[#0d0f1a] border border-slate-700/50 flex items-center justify-center">
                    <img 
                      src={switchWalletLogo} 
                      alt="WalletConnect" 
                      className="w-14 h-14 rounded-xl"
                    />
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
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[#2D4CC8] text-sm font-medium">Mobile</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-transparent rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
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
                onClick={() => {
                  // Mock MetaMask connection
                  console.log('Connecting to MetaMask...');
                  // In production, this would trigger: window.ethereum.request({ method: 'eth_requestAccounts' })
                  setTimeout(() => {
                    alert('MetaMask connection simulated! In production, this would connect to the actual MetaMask wallet.');
                    handleClose();
                  }, 500);
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
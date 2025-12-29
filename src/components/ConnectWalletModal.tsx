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

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
    const [step, setStep] = useState<"select" | "qrcode">("select");
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
                            CONNECT WALLET
                        </h2>

                        {/* Wallet Options */}
                        <div className="space-y-4">
                            {/* WalletConnect Option */}
                            <button
                                onClick={handleWalletConnectClick}
                                className="w-full p-6 bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl transition-all duration-300 group"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    {/* WalletConnect Icon */}
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 300 185"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M61.4385 36.2562C110.349 -9.2186 189.651 -9.2186 238.562 36.2562L244.448 41.7213C246.897 44.0213 246.897 47.8209 244.448 50.1209L224.425 68.9019C223.201 70.0519 221.275 70.0519 220.051 68.9019L211.101 60.5515C177.397 28.7467 122.603 28.7467 88.8987 60.5515L79.2254 69.5513C78.0011 70.7013 76.0751 70.7013 74.8508 69.5513L54.8274 50.7703C52.3787 48.4703 52.3787 44.6707 54.8274 42.3707L61.4385 36.2562ZM280.206 77.0334L298.128 93.8618C300.577 96.1618 300.577 99.9614 298.128 102.261L217.317 178.045C214.868 180.345 210.942 180.345 208.494 178.045L151.116 124.062C150.504 123.487 149.495 123.487 148.883 124.062L91.5052 178.045C89.0565 180.345 85.1306 180.345 82.6819 178.045L1.87227 102.261C-0.576537 99.9614 -0.576537 96.1618 1.87227 93.8618L19.7937 77.0334C22.2424 74.7334 26.1683 74.7334 28.617 77.0334L85.995 131.017C86.6071 131.592 87.6161 131.592 88.2282 131.017L145.606 77.0334C148.055 74.7334 151.981 74.7334 154.429 77.0334L211.808 131.017C212.42 131.592 213.429 131.592 214.041 131.017L271.419 77.0334C273.867 74.7334 277.793 74.7334 280.206 77.0334Z"
                                                fill="white"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-white text-lg font-medium group-hover:text-cyan-400 transition-colors">
                                        WalletConnect
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: QR Code */}
                {step === "qrcode" && (
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 border border-purple-500/20 shadow-2xl relative">
                        {/* Close Button - Top Right Corner */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* WalletConnect Header */}
                        <div className="flex items-center justify-start mb-6 pb-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                {/* WalletConnect Icon */}
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 300 185"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M61.4385 36.2562C110.349 -9.2186 189.651 -9.2186 238.562 36.2562L244.448 41.7213C246.897 44.0213 246.897 47.8209 244.448 50.1209L224.425 68.9019C223.201 70.0519 221.275 70.0519 220.051 68.9019L211.101 60.5515C177.397 28.7467 122.603 28.7467 88.8987 60.5515L79.2254 69.5513C78.0011 70.7013 76.0751 70.7013 74.8508 69.5513L54.8274 50.7703C52.3787 48.4703 52.3787 44.6707 54.8274 42.3707L61.4385 36.2562ZM280.206 77.0334L298.128 93.8618C300.577 96.1618 300.577 99.9614 298.128 102.261L217.317 178.045C214.868 180.345 210.942 180.345 208.494 178.045L151.116 124.062C150.504 123.487 149.495 123.487 148.883 124.062L91.5052 178.045C89.0565 180.345 85.1306 180.345 82.6819 178.045L1.87227 102.261C-0.576537 99.9614 -0.576537 96.1618 1.87227 93.8618L19.7937 77.0334C22.2424 74.7334 26.1683 74.7334 28.617 77.0334L85.995 131.017C86.6071 131.592 87.6161 131.592 88.2282 131.017L145.606 77.0334C148.055 74.7334 151.981 74.7334 154.429 77.0334L211.808 131.017C212.42 131.592 213.429 131.592 214.041 131.017L271.419 77.0334C273.867 74.7334 277.793 74.7334 280.206 77.0334Z"
                                            fill="white"
                                        />
                                    </svg>
                                </div>
                                <span className="text-white font-medium">WalletConnect</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-white text-center mb-2">Connect your wallet</h3>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-6">
                            <button className="flex-1 text-cyan-400 text-sm border-b-2 border-cyan-400 pb-2">
                                📱 Mobile
                            </button>
                            <button className="flex-1 text-gray-500 text-sm pb-2">
                                Scan with your wallet
                            </button>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-white rounded-3xl shadow-2xl">
                                <canvas ref={canvasRef} className="rounded-xl" />
                            </div>
                        </div>

                        {/* Copy URI Button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={handleCopyURI}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all"
                            >
                                {isCopied ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                                <span className="text-sm">
                                    {isCopied ? "Copied" : "Copy URI"}
                                </span>
                            </button>
                        </div>

                        {/* Footer Text */}
                        <p className="text-gray-400 text-xs text-center">
                            By connecting your wallet to this app, you agree to the app's{" "}
                            <span className="text-cyan-400 cursor-pointer hover:underline">
                                Terms of Service
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
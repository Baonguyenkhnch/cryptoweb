/**
 * ============================================
 * VERIFIED QR CODE COMPONENT
 * ============================================
 * Component hiển thị QR code cho user đã xác thực
 * QR code chứa thông tin:
 * - NFT xác thực chính chủ
 * - Điểm tín dụng
 * - Dữ liệu on-chain
 * - Dữ liệu off-chain (nếu có)
 * ============================================
 */

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { QrCode, Download, CheckCircle2 } from "lucide-react";
import type { UserProfile, WalletAnalysis } from "../services/api-real";
import QRCode from "qrcode";
import { useLanguage } from "../services/LanguageContext";

interface VerifiedQRCodeProps {
    user: UserProfile;
    walletData: WalletAnalysis | null;
    type?: "credit-score" | "wallet-verification"; // ✅ NEW: Type of QR code
    isVerified?: boolean; // User đã verify wallet
    hasNFT?: boolean; // User đã mint NFT
}

// Translations
const translations = {
    en: {
        title: "Verification QR Code",
        subtitle: "Scan to view full credit information",
        verified: "Verified",
        download: "Download QR Code",
        infoTitle: "Information in QR Code:",
        nftVerified: "NFT verified ownership",
        creditScore: "Credit score",
        onchainData: "On-chain data (transactions, assets, DeFi...)",
        offchainData: "Off-chain data (email verified, profile...)",
        requirementTitle: "Requirements to receive QR code:",
        requireVerify: "Wallet Verification",
        requireNFT: "Mint verification NFT",
        requirementNote: "Complete the steps above to receive QR code for use at Banks, Fintech..."
    },
    vi: {
        title: "Mã QR Xác Thực",
        subtitle: "Quét để xem thông tin tín dụng đầy đủ",
        verified: "Đã xác thực",
        download: "Tải xuống QR Code",
        infoTitle: "Thông tin trong QR Code:",
        nftVerified: "NFT xác thực chính chủ",
        creditScore: "Điểm tín dụng",
        onchainData: "Dữ liệu on-chain (transactions, assets, DeFi...)",
        offchainData: "Dữ liệu off-chain (email verified, profile...)",
        requirementTitle: "Yêu cầu để nhận mã QR:",
        requireVerify: "Xác thực ví (Wallet Verification)",
        requireNFT: "Mint NFT xác thực chính chủ",
        requirementNote: "Hoàn thành các bước trên để nhận mã QR và sử dụng tại Bank, Fintech..."
    }
};

export function VerifiedQRCode({ user, walletData, type = "credit-score", isVerified = false, hasNFT = false }: VerifiedQRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrGenerated, setQrGenerated] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];

    // ✅ Different condition based on type
    const showQR = type === "wallet-verification"
        ? false // Wallet verification QR - Coming soon
        : (isVerified && hasNFT); // Credit score QR - Requires verification + NFT

    useEffect(() => {
        if (!showQR || !canvasRef.current) return;

        // Prepare QR data with all user information
        const qrData = {
            version: "1.0",
            type: "MIGO_CREDIT_SCORE",
            timestamp: Date.now(),
            wallet: user.walletAddress,
            verification: {
                verified: isVerified,
                nft_minted: hasNFT,
                verified_at: user.createdAt
            },
            credit_score: {
                score: walletData?.score || 0,
                rating: walletData?.rating || "N/A",
                wallet_age: walletData?.walletAge || 0,
                total_transactions: walletData?.totalTransactions || 0,
                token_diversity: walletData?.tokenDiversity || 0,
                total_assets: walletData?.totalAssets || 0
            },
            onchain_data: {
                defi_interaction: walletData?.defiInteraction || 0,
                nft_holdings: walletData?.nftHoldings || 0,
                stablecoin_ratio: walletData?.stablecoinRatio || 0,
                unique_protocols: walletData?.uniqueProtocols || 0
            },
            offchain_data: {
                email_verified: !!user.email,
                name: user.name || null
            },
            profile_url: `${window.location.origin}/profile/${user.walletAddress}`
        };

        // Generate QR Code
        const qrDataString = JSON.stringify(qrData);

        QRCode.toCanvas(
            canvasRef.current,
            qrDataString,
            {
                width: 280,
                margin: 2,
                color: {
                    dark: "#000000",  // Black QR code
                    light: "#FFFFFF"  // White background
                },
                errorCorrectionLevel: "H"
            },
            (error) => {
                if (error) {
                    console.error("QR Code generation error:", error);
                } else {
                    setQrGenerated(true);
                    console.log("✅ QR Code generated successfully");
                }
            }
        );
    }, [showQR, user, walletData, isVerified, hasNFT]);

    // Download QR Code as image
    const handleDownloadQR = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `migo-credit-qr-${user.walletAddress.slice(0, 8)}.png`;
        link.href = url;
        link.click();
    };

    // ✅ If not verified or no NFT, show different messages based on type
    if (!showQR) {
        // ✅ Wallet Verification QR - Coming Soon
        if (type === "wallet-verification") {
            return (
                <div className="text-center py-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                        <QrCode className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg text-white">Mã QR Xác Thực Ví</h3>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Tính năng này sẽ cho phép bạn xác minh quyền sở hữu ví thông qua MetaMask hoặc WalletConnect để mint NFT Credit Score.
                    </p>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        🚧 Đang phát triển
                    </Badge>
                </div>
            );
        }

        // ✅ Credit Score QR - Requirements
        return (
            <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
                    <QrCode className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg text-white">Mã QR Điểm Tín Dụng</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    {t.requirementNote}
                </p>
                <div className="max-w-sm mx-auto space-y-2">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${isVerified ? 'bg-green-500/10' : 'bg-slate-800/50'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isVerified ? 'bg-green-500/30 text-green-400' : 'bg-gray-600/30 text-gray-500'}`}>
                            {isVerified ? '✓' : '1'}
                        </div>
                        <span className="text-sm text-gray-300">{t.requireVerify}</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${hasNFT ? 'bg-green-500/10' : 'bg-slate-800/50'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${hasNFT ? 'bg-green-500/30 text-green-400' : 'bg-gray-600/30 text-gray-500'}`}>
                            {hasNFT ? '✓' : '2'}
                        </div>
                        <span className="text-sm text-gray-300">{t.requireNFT}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Show QR Code when verified (Credit Score QR only)
    return (
        <div className="space-y-4">
            {/* Verified Badge at top */}
            <div className="flex items-center justify-center">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1.5">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Đã Xác Thực
                </Badge>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-400 text-sm">
                Quét để xem thông tin tín dụng đầy đủ
            </p>

            {/* QR Code Display - Clean white background like in image */}
            <div className="flex justify-center">
                <div className="p-6 bg-white rounded-2xl shadow-2xl">
                    <canvas
                        ref={canvasRef}
                        className="rounded-lg"
                    />
                </div>
            </div>

            {/* Download Button - Centered */}
            {qrGenerated && (
                <div className="flex justify-center">
                    <Button
                        onClick={handleDownloadQR}
                        variant="outline"
                        className="bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống QR Code
                    </Button>
                </div>
            )}
        </div>
    );
}
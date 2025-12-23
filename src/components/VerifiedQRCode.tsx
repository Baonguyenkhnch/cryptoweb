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

export function VerifiedQRCode({ user, walletData, isVerified = false, hasNFT = false }: VerifiedQRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrGenerated, setQrGenerated] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];

    // ✅ CONDITION: Only show QR if verified AND has NFT
    const showQR = isVerified && hasNFT;

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

    // ✅ If not verified or no NFT, show requirement message
    if (!showQR) {
        return (
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-yellow-500/20 shadow-2xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Yêu cầu xác thực để nhận mã QR
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-yellow-400 mb-2">{t.requirementTitle}</div>
                                <ul className="text-gray-400 text-sm space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isVerified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {isVerified ? '✓' : '○'}
                                        </div>
                                        {t.requireVerify}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasNFT ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {hasNFT ? '✓' : '○'}
                                        </div>
                                        {t.requireNFT}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        {t.requirementNote}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ✅ Show QR Code when verified
    return (
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Mã QR Xác Thực
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                            {t.subtitle}
                        </CardDescription>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t.verified}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* QR Code Display */}
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                        <canvas
                            ref={canvasRef}
                            className="rounded-lg"
                        />
                    </div>

                    {/* Download Button */}
                    {qrGenerated && (
                        <Button
                            onClick={handleDownloadQR}
                            variant="outline"
                            className="mt-4 bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t.download}
                        </Button>
                    )}
                </div>

                {/* Information */}
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <div className="text-cyan-400 mb-1">{t.infoTitle}</div>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>• {t.nftVerified}</li>
                                <li>• {t.creditScore} <span className="text-cyan-400">{walletData?.score || 0}</span></li>
                                <li>• {t.onchainData}</li>
                                <li>• {t.offchainData}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Usage Guide */}
                {/* <div className="text-center text-gray-500 text-xs">
                    Xuất trình mã QR này tại Bank, Fintech để họ xác minh<br />
                    thông tin tín dụng on-chain của bạn
                </div> */}
            </CardContent>
        </Card>
    );
}
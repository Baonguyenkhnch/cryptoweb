/**
 * ============================================
 * LOADING PROGRESS COMPONENT
 * ============================================
 * Hiển thị loading state với progress bar và messages
 */

import { useEffect, useState } from "react";
import { Loader2, Database, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "../services/LanguageContext";

interface LoadingProgressProps {
    isVisible: boolean;
    walletAddress?: string;
    onCancel?: () => void; // Thêm callback để cancel
    onTryDemo?: () => void; // Thêm callback để thử demo mode
}

export function LoadingProgress({ isVisible, walletAddress, onCancel, onTryDemo }: LoadingProgressProps) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showDemoButton, setShowDemoButton] = useState(false);
    const { language } = useLanguage();

    const steps = [
        {
            icon: Database,
            title: language === 'en' ? "Connecting to blockchain..." : "Đang kết nối blockchain...",
            duration: 2000,
            tips: language === 'en' ? "Retrieving data from Ethereum network" : "Đang truy xuất dữ liệu từ mạng Ethereum",
        },
        {
            icon: TrendingUp,
            title: language === 'en' ? "Analyzing transactions..." : "Đang phân tích giao dịch...",
            duration: 3000,
            tips: language === 'en' ? "Processing transaction history and token balances" : "Đang xử lý lịch sử giao dịch và token balances",
        },
        {
            icon: CheckCircle,
            title: language === 'en' ? "Calculating credit score..." : "Đang tính toán điểm...",
            duration: 3000,
            tips: language === 'en' ? "Applying credit scoring algorithm" : "Áp dụng thuật toán đánh giá tín dụng",
        },
    ];

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            setCurrentStep(0);
            setTimeElapsed(0);
            return;
        }

        // Progress bar animation - Smooth và steady
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95; // Stop at 95%, complete when done
                return prev + 2; // Tăng đều đặn
            });
        }, 300); // Smooth animation

        // Step progression - Tự nhiên hơn
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= steps.length - 1) return prev;
                return prev + 1;
            });
        }, 2500); // Chuyển step mượt mà hơn

        // Time counter
        const timeInterval = setInterval(() => {
            setTimeElapsed((prev) => {
                const newTime = prev + 1;
                // Hiện nút Demo sau 2 giây - Test nhanh cho người dùng
                if (newTime >= 2) {
                    setShowDemoButton(true);
                }
                return newTime;
            });
        }, 1000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            clearInterval(timeInterval);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const CurrentIcon = steps[currentStep].icon;
    const estimatedTime = 3; // seconds - Test nhanh, timeout chỉ 3 giây

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/95 border-cyan-500/30 shadow-2xl">
                <CardContent className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
                            <CurrentIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </div>
                        <h3 className="text-xl text-white mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {steps[currentStep].tips}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>

                    {/* Steps Indicator */}
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col items-center flex-1 ${index < steps.length - 1 ? "relative" : ""
                                        }`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                                ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 scale-110"
                                                : isCompleted
                                                    ? "bg-green-500/20"
                                                    : "bg-slate-700/50"
                                            }`}
                                    >
                                        <StepIcon
                                            className={`w-5 h-5 ${isActive
                                                    ? "text-cyan-400 animate-pulse"
                                                    : isCompleted
                                                        ? "text-green-400"
                                                        : "text-gray-500"
                                                }`}
                                        />
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute top-5 left-1/2 w-full h-0.5 bg-slate-700">
                                            <div
                                                className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ${isCompleted ? "w-full" : "w-0"
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Info - CHỈ HIỂN THỊ THỜI GIAN TRÔI QUA */}
                    <div className="flex items-center justify-center text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{language === 'en' ? 'Analyzed:' : 'Đã phân tích:'} {timeElapsed}s</span>
                        </div>
                    </div>

                    {/* Wallet Address */}
                    {walletAddress && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">{language === 'en' ? 'Analyzing wallet:' : 'Đang phân tích ví:'}</p>
                            <p className="text-xs text-cyan-400 font-mono bg-slate-900/50 px-3 py-2 rounded-lg">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons - HIỆN SAU 2 GIÂY */}
                    {showDemoButton && (
                        <div className="flex justify-center">
                            {onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="bg-slate-700 hover:bg-slate-600 text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                                >
                                    {language === 'en' ? '❌ Cancel' : '❌ Hủy'}
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}
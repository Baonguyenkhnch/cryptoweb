/**
 * ============================================
 * LOADING PROGRESS COMPONENT
 * ============================================
 * Hiển thị loading state với progress bar và messages
 */

import { useEffect, useState } from "react";
import { Loader2, Database, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface LoadingProgressProps {
    isVisible: boolean;
    walletAddress?: string;
}

export function LoadingProgress({ isVisible, walletAddress }: LoadingProgressProps) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const steps = [
        {
            icon: Database,
            title: "Đang kết nối blockchain...",
            titleEn: "Connecting to blockchain...",
            duration: 3000,
            tips: "Đang truy xuất dữ liệu từ mạng Ethereum",
        },
        {
            icon: TrendingUp,
            title: "Đang phân tích giao dịch...",
            titleEn: "Analyzing transactions...",
            duration: 5000,
            tips: "Đang xử lý lịch sử giao dịch và token balances",
        },
        {
            icon: CheckCircle,
            title: "Đang tính toán điểm...",
            titleEn: "Calculating credit score...",
            duration: 4000,
            tips: "Áp dụng thuật toán đánh giá tín dụng",
        },
    ];

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            setCurrentStep(0);
            setTimeElapsed(0);
            return;
        }

        // Progress bar animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95; // Stop at 95%, complete when done
                return prev + 1;
            });
        }, 400);

        // Step progression
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= steps.length - 1) return prev;
                return prev + 1;
            });
        }, 4000);

        // Time counter
        const timeInterval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            clearInterval(timeInterval);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const CurrentIcon = steps[currentStep].icon;
    const estimatedTime = 5; // seconds - Timeout tối đa

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

                    {/* Time Info */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Đã trôi qua: {timeElapsed}s</span>
                        </div>
                        <div className="text-gray-500">
                            Ước tính: ~{estimatedTime}s
                        </div>
                    </div>

                    {/* Wallet Address */}
                    {walletAddress && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Analyzing wallet:</p>
                            <p className="text-xs text-cyan-400 font-mono bg-slate-900/50 px-3 py-2 rounded-lg">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </p>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-300 text-center">
                            {timeElapsed > 5
                                ? "⚠️ Quá thời gian chờ (5s). Vui lòng thử lại..."
                                : "💡 Backend đang phân tích dữ liệu blockchain..."}
                        </p>
                    </div>

                    {/* Cancel hint */}
                    <p className="text-xs text-gray-500 text-center">
                        Đang xử lý... Vui lòng đợi hoặc thử lại sau
                    </p>
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

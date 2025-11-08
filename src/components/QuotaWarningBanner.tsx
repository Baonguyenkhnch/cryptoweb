import { AlertTriangle, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface QuotaWarningBannerProps {
    onDismiss?: () => void;
}

export function QuotaWarningBanner({ onDismiss }: QuotaWarningBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-xl border-b border-yellow-500/30 shadow-2xl">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Icon + Message */}
                        <div className="flex items-center gap-3 flex-1">
                            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 animate-pulse" />

                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                <span className="text-white text-sm md:text-base">
                                    <strong>⚠️ Backend đang hết quota Moralis API.</strong>
                                </span>
                                <span className="text-yellow-100 text-xs md:text-sm">
                                    Vui lòng thử Demo Mode hoặc liên hệ admin để upgrade.
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                                href="mailto:admin@migofin.com"
                                className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 text-sm"
                            >
                                <span>Liên hệ</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                                onClick={handleDismiss}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-300"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/60 rounded-full animate-pulse"
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

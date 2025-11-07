import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Clock, Mail, Wrench, X } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface ErrorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    errorType: "quota" | "network" | "general";
    errorMessage?: string;
    onTryDemoMode?: () => void; // New prop for demo mode
}

export function ErrorDialog({
    open,
    onOpenChange,
    errorType,
    errorMessage,
    onTryDemoMode,
}: ErrorDialogProps) {
    const { t, language } = useLanguage();

    const getErrorContent = () => {
        if (errorType === "quota") {
            return {
                title: language === "vi" ? "⚠️ Dịch Vụ Tạm Thời Quá Tải" : "⚠️ Service Temporarily Overloaded",
                description:
                    language === "vi"
                        ? "Backend đang gặp vấn đề với API quota (Moralis Free Plan đã hết)."
                        : "Backend is experiencing API quota issues (Moralis Free Plan exhausted).",
                icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />,
                suggestions: [
                    {
                        icon: <Clock className="w-5 h-5 text-cyan-400" />,
                        text:
                            language === "vi"
                                ? "Thử lại sau 1-2 giờ (quota reset mỗi ngày)"
                                : "Try again in 1-2 hours (quota resets daily)",
                    },
                    {
                        icon: <Mail className="w-5 h-5 text-purple-400" />,
                        text:
                            language === "vi"
                                ? "Liên hệ admin để upgrade plan"
                                : "Contact admin to upgrade plan",
                    },
                    {
                        icon: <Wrench className="w-5 h-5 text-blue-400" />,
                        text:
                            language === "vi"
                                ? "Hoặc thử với ví khác đã có cache"
                                : "Or try another cached wallet",
                    },
                ],
                contact: {
                    label: language === "vi" ? "📧 Support" : "📧 Support",
                    value: "admin@migofin.com",
                },
                footer:
                    language === "vi"
                        ? "🔧 Backend cần: Upgrade Moralis plan tại moralis.io/pricing"
                        : "🔧 Backend needs: Upgrade Moralis plan at moralis.io/pricing",
            };
        } else if (errorType === "network") {
            return {
                title: language === "vi" ? "❌ Lỗi Kết Nối" : "❌ Connection Error",
                description:
                    language === "vi"
                        ? "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn."
                        : "Unable to connect to server. Please check your network connection.",
                icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
                suggestions: [
                    {
                        icon: <Clock className="w-5 h-5 text-cyan-400" />,
                        text:
                            language === "vi"
                                ? "Kiểm tra kết nối mạng"
                                : "Check network connection",
                    },
                    {
                        icon: <Wrench className="w-5 h-5 text-blue-400" />,
                        text:
                            language === "vi"
                                ? "Thử lại sau vài giây"
                                : "Try again in a few seconds",
                    },
                ],
            };
        } else {
            return {
                title: language === "vi" ? "❌ Đã Có Lỗi Xảy Ra" : "❌ An Error Occurred",
                description: errorMessage || (language === "vi" ? "Không thể xử lý yêu cầu." : "Unable to process request."),
                icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
                suggestions: [
                    {
                        icon: <Clock className="w-5 h-5 text-cyan-400" />,
                        text:
                            language === "vi"
                                ? "Nếu ví mới: Đợi 1-2 phút để crawl dữ liệu"
                                : "For new wallets: Wait 1-2 minutes for data crawling",
                    },
                    {
                        icon: <Wrench className="w-5 h-5 text-blue-400" />,
                        text:
                            language === "vi"
                                ? "Thử lại sau vài giây"
                                : "Try again in a few seconds",
                    },
                ],
            };
        }
    };

    const content = getErrorContent();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-yellow-500/30 text-white max-w-md rounded-2xl">
                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4 text-gray-400" />
                    <span className="sr-only">Close</span>
                </button>

                <DialogHeader className="space-y-4">
                    {/* Icon */}
                    <div className="flex justify-center pt-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
                            <div className="relative">{content.icon}</div>
                        </div>
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-2xl text-center text-white">
                        {content.title}
                    </DialogTitle>

                    {/* Description */}
                    <DialogDescription className="text-gray-300 text-center text-base leading-relaxed">
                        {content.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Suggestions */}
                <div className="space-y-3 py-4">
                    <div className="text-sm font-semibold text-cyan-400 mb-2">
                        💡 {language === "vi" ? "Gợi ý" : "Suggestions"}:
                    </div>
                    {content.suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10"
                        >
                            <div className="flex-shrink-0 mt-0.5">{suggestion.icon}</div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {suggestion.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Contact info */}
                {content.contact && (
                    <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">{content.contact.label}:</span>
                            <a
                                href={`mailto:${content.contact.value}`}
                                className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                            >
                                {content.contact.value}
                            </a>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {content.footer && (
                    <div className="text-xs text-gray-400 text-center py-2 border-t border-cyan-500/10">
                        {content.footer}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2 pb-2">
                    {/* Try Demo Mode button - only for quota errors */}
                    {errorType === "quota" && onTryDemoMode && (
                        <Button
                            onClick={() => {
                                onTryDemoMode();
                                onOpenChange(false);
                            }}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/30"
                        >
                            🎨 {language === "vi" ? "Thử Demo Mode (Dữ liệu Mẫu)" : "Try Demo Mode (Sample Data)"}
                        </Button>
                    )
                    }

                    {/* Got It button */}
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="w-full bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 px-8 py-2 rounded-lg transition-all duration-300"
                    >
                        {language === "vi" ? "Đã Hiểu" : "Got It"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, CheckCircle2, Wallet, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";
import { maskEmail } from "../utils/maskEmail"; // ✅ NEW: Import maskEmail

interface QuickRegisterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    walletAddress: string;
    onRegisterSuccess: (email: string, walletAddress: string) => void;
}

export function QuickRegisterDialog({
    open,
    onOpenChange,
    walletAddress,
    onRegisterSuccess,
}: QuickRegisterDialogProps) {
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailSent, setShowEmailSent] = useState(false);
    const [verificationToken, setVerificationToken] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // ✅ NEW: For success messages

    const handleSendMagicLink = async () => {
        setError("");
        setSuccessMessage(""); // ✅ Clear previous messages

        // Validation
        if (!email.trim() || !email.includes("@")) {
            setError("Vui lòng nhập email hợp lệ");
            return;
        }

        const isResend = showEmailSent; // ✅ Track if this is a resend action

        setIsLoading(true);
        try {
            // Import API function
            const { sendMagicLink } = await import("../services/api-real");

            // Gửi magic link
            const result = await sendMagicLink(email.trim(), walletAddress);

            if (result.success) {
                setShowEmailSent(true);
                setVerificationToken(result.verificationToken || "");

                // ✅ Show success message for BOTH first send and resend
                if (isResend) {
                    setSuccessMessage("✅ Gửi lại thành công!");
                } else {
                    setSuccessMessage("✅ Gửi thành công! Vui lòng kiểm tra email.");
                }
            } else {
                setError(result.message || "Gửi email thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi magic link:", error);

            const errorMessage = error instanceof Error ? error.message : String(error);

            // ✅ For resend: Don't show "already registered" error, just show generic error
            if (isResend) {
                setError("Không thể gửi lại email. Vui lòng thử lại sau.");
            }
            // For first send: Check if email already exists
            else if (errorMessage.includes("already exists") ||
                errorMessage.includes("đã tồn tại") ||
                errorMessage.includes("already registered") ||
                errorMessage.includes("500")) {
                setError("📧 Email này đã được đăng ký. Vui lòng đăng nhập thay vì đăng ký mới.");
            } else {
                setError("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDemo = async () => {
        setIsLoading(true);
        try {
            const { verifyMagicLink } = await import("../services/api-real");

            const result = await verifyMagicLink(verificationToken);

            if (result.success && result.user) {
                // Lưu auth token
                if (result.authToken) {
                    localStorage.setItem("authToken", result.authToken);
                    localStorage.setItem("currentUser", JSON.stringify(result.user));
                }

                // Show success briefly then redirect
                setTimeout(() => {
                    onOpenChange(false);
                    onRegisterSuccess(email, walletAddress);

                    // Reset form
                    setEmail("");
                    setShowEmailSent(false);
                    setError("");
                }, 1000);
            } else {
                setError(result.message || "Xác thực thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi verify:", error);
            setError("Có lỗi xảy ra khi xác thực");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        onOpenChange(false);
        setEmail("");
        setShowEmailSent(false);
        setError("");
    };

    const handleBack = () => {
        setShowEmailSent(false);
        setError("");
        setSuccessMessage(""); // ✅ NEW: Clear success message
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl p-6">
                {!showEmailSent ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center justify-center mb-2">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                                    <div className="relative p-2 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-400/30">
                                        <Sparkles className="w-6 h-6 text-orange-400" />
                                    </div>
                                </div>
                            </div>

                            <DialogTitle className="text-center bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                💾 Lưu Kết Quả Của Bạn
                            </DialogTitle>

                            <DialogDescription className="text-center text-gray-300 mt-1 text-sm">
                                Nhập email để nhận link xác nhận
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            {/* Wallet Info */}
                            <div className="p-2 bg-slate-700/30 rounded-lg border border-cyan-500/20">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-xs text-gray-400">Địa chỉ ví của bạn:</span>
                                </div>
                                <div className="text-white text-xs font-mono break-all leading-tight">
                                    {walletAddress}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-2.5">
                                <div className="text-xs text-gray-200 mb-1.5 font-medium">🎁 Lợi ích khi đăng ký:</div>
                                <ul className="space-y-1 text-xs text-gray-300">
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-green-400 mt-0.5">✓</span>
                                        <span>Không cần mật khẩu - Đăng nhập bằng email</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-green-400 mt-0.5">✓</span>
                                        <span>Truy cp Dashboard cá nhân</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-green-400 mt-0.5">✓</span>
                                        <span>Nhận thông báo cập nhật điểm</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="quick-email" className="text-gray-300 flex items-center gap-1.5 text-xs">
                                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                                    Email của bạn
                                </Label>
                                <Input
                                    id="quick-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && email.trim()) {
                                            handleSendMagicLink();
                                        }
                                    }}
                                    className="h-10 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white text-sm"
                                    autoFocus
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-xs">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <p className="text-green-400 text-xs">{successMessage}</p>
                                </div>
                            )}

                            {/* How it works */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                                <div className="text-xs text-blue-300">
                                    <div className="font-medium mb-1">📬 Cách hoạt động:</div>
                                    <ol className="space-y-0.5 text-xs text-gray-300 ml-4 list-decimal">
                                        <li>Nhập email và nhấn "Gửi Link"</li>
                                        <li>Kiểm tra hộp thư email</li>
                                        <li>Click vào link xác nhận</li>
                                        <li>Tự động vào Dashboard! ✨</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    onClick={handleSkip}
                                    variant="outline"
                                    className="flex-1 h-10 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white text-sm"
                                >
                                    Bỏ Qua
                                </Button>

                                <Button
                                    onClick={handleSendMagicLink}
                                    disabled={isLoading || !email}
                                    className="flex-1 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg shadow-orange-500/30 text-sm"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Đang gửi...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-4 h-4" />
                                            <span>Gửi Link</span>
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Privacy Note */}
                            <p className="text-xs text-gray-500 text-center">
                                🔒 Phi tập trung - Chỉ lưu email để liên kết ví
                            </p>
                        </div>
                    </>
                ) : (
                    /* Email Sent State */
                    <div className="py-3 text-center space-y-4">
                        <div className="flex items-center justify-center mb-3">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                                <div className="relative p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                            </div>
                        </div>

                        <DialogTitle className="text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                            Email Đã Gửi!
                        </DialogTitle>

                        <DialogDescription className="text-center text-gray-300 text-sm space-y-2">
                            <p>
                                Chúng tôi đã gửi link xác nhận đến:
                            </p>
                            <p className="text-cyan-400 font-medium">{maskEmail(email)}</p> {/* ✅ NEW: Mask email */}
                        </DialogDescription>

                        {/* ✅ Success Message - Show immediately after email */}
                        {successMessage && (
                            <div className="p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg animate-in fade-in duration-300">
                                <p className="text-green-400 text-xs font-medium">{successMessage}</p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left">
                            <div className="text-xs text-blue-300 space-y-2">
                                <div className="font-medium mb-2"> Bước tiếp theo:</div>
                                <ol className="space-y-1.5 ml-4 list-decimal text-gray-300">
                                    <li>Mở hộp thư email của bạn</li>
                                    <li>Tìm email từ <span className="text-orange-400">Migo</span></li>
                                    <li>Click vào nút <span className="text-green-400">"Xác nhận và Đăng nhập"</span></li>
                                    <li>Tự động chuyển đến Dashboard ✨</li>
                                </ol>
                            </div>
                        </div>

                        {/* ✅ REMOVED: Demo Mode button - production only */}

                        {/* Resend / Back */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1 h-9 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700 text-sm"
                            >
                                ← Quay Lại
                            </Button>
                            <Button
                                onClick={handleSendMagicLink}
                                variant="outline"
                                disabled={isLoading}
                                className="flex-1 h-9 bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 text-sm"
                            >
                                <Clock className="w-4 h-4 mr-1.5" />
                                Gửi Lại
                            </Button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-xs">{error}</p>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">
                            Không nhận được email? Kiểm tra hộp thư spam hoặc gửi lại
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
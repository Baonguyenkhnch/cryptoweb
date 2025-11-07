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
import { Mail, Lock, CheckCircle2, Eye, EyeOff, Wallet } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

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
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");

        // Validation
        if (!email.trim() || !email.includes("@")) {
            setError("Vui lòng nhập email hợp lệ");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        try {
            // Import API function
            const { registerWalletWithEmail } = await import("../services/api");

            // Đăng ký
            const result = await registerWalletWithEmail({
                email: email.trim(),
                password,
                walletAddress,
            });

            if (result.success) {
                setShowSuccess(true);

                // Đóng dialog sau 2 giây và callback
                setTimeout(() => {
                    onOpenChange(false);
                    onRegisterSuccess(email, walletAddress);

                    // Reset form
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setShowSuccess(false);
                    setError("");
                }, 2000);
            } else {
                setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        onOpenChange(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowSuccess(false);
        setError("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[320px] max-h-[80vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl p-3">
                {!showSuccess ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center justify-center mb-1">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                                    <div className="relative p-1.5 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-400/30 text-xl">
                                        ✨
                                    </div>
                                </div>
                            </div>

                            <DialogTitle className="text-center bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent text-base">
                                💾 Lưu Kết Quả?
                            </DialogTitle>

                            <DialogDescription className="text-center text-gray-300 mt-0.5 text-xs leading-tight">
                                Lần sau chỉ cần nhập email!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-1">
                            {/* Wallet Info */}
                            <div className="p-1.5 bg-slate-700/30 rounded border border-cyan-500/20">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Wallet className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[10px] text-gray-400">Địa chỉ ví:</span>
                                </div>
                                <div className="text-white text-[10px] font-mono break-all leading-tight">
                                    {walletAddress}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded p-1.5">
                                <div className="text-[10px] text-gray-200 mb-0.5">🎁 Lợi ích:</div>
                                <ul className="space-y-0 text-[10px] text-gray-300 leading-tight">
                                    <li>✅ Lần sau chỉ cần email</li>
                                    <li>✅ Lưu lịch sử điểm số</li>
                                    <li>✅ Nhận thông báo</li>
                                </ul>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-0.5">
                                <Label htmlFor="quick-email" className="text-gray-300 flex items-center gap-1 text-[10px]">
                                    <Mail className="w-3 h-3 text-cyan-400" />
                                    Email
                                </Label>
                                <Input
                                    id="quick-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-8 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white text-xs px-2"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-0.5">
                                <Label htmlFor="quick-password" className="text-gray-300 flex items-center gap-1 text-[10px]">
                                    <Lock className="w-3 h-3 text-cyan-400" />
                                    Mật khẩu (tối thiểu 6 ký tự)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="quick-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-8 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white text-xs px-2 pr-8"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-3 h-3" />
                                        ) : (
                                            <Eye className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-0.5">
                                <Label htmlFor="quick-confirm-password" className="text-gray-300 flex items-center gap-1 text-[10px]">
                                    <Lock className="w-3 h-3 text-cyan-400" />
                                    Xác nhận mật khẩu
                                </Label>
                                <Input
                                    id="quick-confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-8 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white text-xs px-2"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-1.5 bg-red-500/10 border border-red-500/30 rounded">
                                    <p className="text-red-400 text-[10px] leading-tight">{error}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-1.5 pt-0.5">
                                <Button
                                    onClick={handleSkip}
                                    variant="outline"
                                    className="flex-1 h-8 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white text-xs px-2"
                                >
                                    Bỏ Qua
                                </Button>

                                <Button
                                    onClick={handleRegister}
                                    disabled={isLoading || !email || !password || !confirmPassword}
                                    className="flex-1 h-8 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg shadow-orange-500/30 text-xs px-2"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Đăng ký...</span>
                                        </div>
                                    ) : (
                                        <span>Đăng Ký</span>
                                    )}
                                </Button>
                            </div>

                            {/* Privacy Note */}
                            <p className="text-[10px] text-gray-500 text-center leading-tight">
                                🔒 Chỉ lưu email để tra cứu ví
                            </p>
                        </div>
                    </>
                ) : (
                    /* Success State */
                    <div className="py-4 text-center">
                        <div className="flex items-center justify-center mb-3">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-lg opacity-60 animate-pulse" />
                                <div className="relative p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                        </div>

                        <DialogTitle className="text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                            ✅ Thành Công!
                        </DialogTitle>

                        <DialogDescription className="text-center text-gray-300 text-xs leading-tight px-2">
                            Lần sau chỉ cần nhập <span className="text-cyan-400">{email}</span> để xem điểm!
                        </DialogDescription>

                        <div className="mt-3 p-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded">
                            <p className="text-[10px] text-gray-300 leading-tight">
                                💡 <span className="text-cyan-400">Mẹo:</span> Bookmark trang này!
                            </p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}



import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, Send, Check, Loader2, Shield, AlertCircle } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface EmailChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentEmail: string;
    newEmail: string;
    onVerifySuccess: () => void;
}

export function EmailChangeDialog({
    open,
    onOpenChange,
    currentEmail,
    newEmail,
    onVerifySuccess,
}: EmailChangeDialogProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<"confirm" | "sent" | "verified">("confirm");
    const [isSending, setIsSending] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // ============================================
    // HANDLERS
    // ============================================

    const handleSendVerification = async () => {
        setIsSending(true);
        setError("");

        try {
            // TODO: Call real API to send magic link to new email
            // await sendEmailChangeVerification(newEmail);

            // DEMO: Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log("📧 Verification email sent to:", newEmail);
            setStep("sent");
        } catch (err) {
            setError("Không thể gửi email xác minh. Vui lòng thử lại.");
            console.error("Send verification error:", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setError("Vui lòng nhập mã xác minh");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            // TODO: Call real API to verify code
            // await verifyEmailChangeCode(newEmail, verificationCode);

            // DEMO: Accept any 6-digit code
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (verificationCode.length !== 6) {
                throw new Error("Mã xác minh không hợp lệ");
            }

            console.log("✅ Email verified successfully!");
            setStep("verified");

            // Wait a bit then trigger success callback
            setTimeout(() => {
                onVerifySuccess();
                handleClose();
            }, 1500);
        } catch (err) {
            setError("Mã xác minh không đúng. Vui lòng thử lại.");
            console.error("Verify code error:", err);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClose = () => {
        setStep("confirm");
        setVerificationCode("");
        setError("");
        onOpenChange(false);
    };


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        Xác Minh Email Mới
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Để bảo mật tài khoản, vui lòng xác minh email mới
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current vs New Email Display */}
                    <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-start gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400">Email hiện tại:</p>
                                <p className="text-white truncate">{currentEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                            <Mail className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400">Email mới:</p>
                                <p className="text-cyan-400 truncate font-medium">{newEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Confirm */}
                    {step === "confirm" && (
                        <div className="space-y-4">
                            <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-200">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription className="text-sm">
                                    Chúng tôi sẽ gửi email xác minh đến <strong>{newEmail}</strong>.
                                    Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={handleSendVerification}
                                disabled={isSending}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Gửi Email Xác Minh
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Verification Code Input */}
                    {step === "sent" && (
                        <div className="space-y-4">
                            <Alert className="bg-green-500/10 border-green-500/30 text-green-200">
                                <Check className="w-4 h-4" />
                                <AlertDescription className="text-sm">
                                    Email đã được gửi! Vui lòng kiểm tra hộp thư <strong>{newEmail}</strong> và nhập mã xác minh.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="verification-code" className="text-gray-300">
                                    Mã Xác Minh (6 số)
                                </Label>
                                <Input
                                    id="verification-code"
                                    type="text"
                                    placeholder="Nhập mã 6 số"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => {
                                        // Only allow numbers
                                        const value = e.target.value.replace(/\D/g, "");
                                        setVerificationCode(value);
                                        setError("");
                                    }}
                                    className="bg-slate-800/50 border-cyan-500/30 text-white text-center text-lg tracking-widest"
                                    autoComplete="off"
                                />
                            </div>

                            {error && (
                                <Alert className="bg-red-500/10 border-red-500/30 text-red-200">
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSendVerification}
                                    variant="outline"
                                    disabled={isSending}
                                    className="flex-1 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Gửi Lại"
                                    )}
                                </Button>
                                <Button
                                    onClick={handleVerifyCode}
                                    disabled={isVerifying || verificationCode.length !== 6}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xác minh...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Xác Minh
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                Không nhận được email? Kiểm tra thư mục Spam hoặc click "Gửi Lại"
                            </p>
                        </div>
                    )}

                    {/* Step 3: Verified */}
                    {step === "verified" && (
                        <div className="space-y-4 text-center py-6">
                            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">
                                    Xác Minh Thành Công!
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Email của bạn đã được cập nhật
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

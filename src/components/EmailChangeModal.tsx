/**
 * ============================================
 * EMAIL CHANGE MODAL COMPONENT
 * ============================================
 * Modal với 2 bước để thay đổi email:
 * - Bước 1: Nhập email mới và gửi mã xác nhận
 * - Bước 2: Nhập mã xác nhận từ email
 * ============================================
 */

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
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentEmail: string;
    onEmailChange: (newEmail: string, verificationCode: string) => Promise<void>;
}

const translations = {
    en: {
        title: "Change Email Address",
        subtitle: "Verify your new email to complete the change",
        step1: {
            title: "Step 1: Enter New Email",
            description: "We will send a verification code to your new email address",
            label: "New Email Address",
            placeholder: "Enter your new email",
            button: "Send Verification Code",
            sending: "Sending code..."
        },
        step2: {
            title: "Step 2: Enter Verification Code",
            description: "Check your inbox and enter the 6-digit code we sent to",
            label: "Verification Code",
            placeholder: "Enter 6-digit code",
            button: "Verify & Update Email",
            verifying: "Verifying...",
            resend: "Resend Code",
            resending: "Resending..."
        },
        messages: {
            codeSent: "Verification code sent successfully!",
            invalidEmail: "Please enter a valid email address",
            codeRequired: "Please enter the verification code",
            invalidCode: "Invalid verification code. Please try again.",
            success: "Email updated successfully!",
            error: "An error occurred. Please try again."
        },
        buttons: {
            cancel: "Cancel"
        }
    },
    vi: {
        title: "Thay Đổi Địa Chỉ Email",
        subtitle: "Xác minh email mới của bạn để hoàn tất thay đổi",
        step1: {
            title: "Bước 1: Nhập Email Mới",
            description: "Chúng tôi sẽ gửi mã xác nhận đến địa chỉ email mới của bạn",
            label: "Địa Chỉ Email Mới",
            placeholder: "Nhập email mới của bạn",
            button: "Gửi Mã Xác Nhận",
            sending: "Đang gửi mã..."
        },
        step2: {
            title: "Bước 2: Nhập Mã Xác Nhận",
            description: "Ki��m tra hộp thư và nhập mã 6 chữ số chúng tôi đã gửi đến",
            label: "Mã Xác Nhận",
            placeholder: "Nhập mã 6 chữ số",
            button: "Xác Minh & Cập Nhật Email",
            verifying: "Đang xác minh...",
            resend: "Gửi Lại Mã",
            resending: "Đang gửi lại..."
        },
        messages: {
            codeSent: "Mã xác nhận đã được gửi thành công!",
            invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ",
            codeRequired: "Vui lòng nhập mã xác nhận",
            invalidCode: "Mã xác nhận không hợp lệ. Vui lòng thử lại.",
            success: "Email đã được cập nhật thành công!",
            error: "Đã xảy ra lỗi. Vui lòng thử lại."
        },
        buttons: {
            cancel: "Hủy"
        }
    }
};

type Step = "enter-email" | "verify-code";

export function EmailChangeModal({
    isOpen,
    onClose,
    currentEmail,
    onEmailChange,
}: EmailChangeModalProps) {
    const { language } = useLanguage();
    const t = translations[language];

    const [step, setStep] = useState<Step>("enter-email");
    const [newEmail, setNewEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleClose = () => {
        setStep("enter-email");
        setNewEmail("");
        setVerificationCode("");
        setMessage(null);
        onClose();
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendCode = async () => {
        if (!validateEmail(newEmail)) {
            setMessage({ type: "error", text: t.messages.invalidEmail });
            return;
        }

        if (newEmail === currentEmail) {
            setMessage({ type: "error", text: "This is your current email address" });
            return;
        }

        setIsSending(true);
        setMessage(null);

        try {
            // TODO: Call API to send verification code
            // await sendEmailVerificationCode(newEmail);

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage({ type: "success", text: t.messages.codeSent });
            setTimeout(() => {
                setStep("verify-code");
                setMessage(null);
            }, 1000);
        } catch (error) {
            setMessage({ type: "error", text: t.messages.error });
        } finally {
            setIsSending(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setMessage(null);

        try {
            // TODO: Call API to resend verification code
            // await sendEmailVerificationCode(newEmail);

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: "success", text: t.messages.codeSent });
        } catch (error) {
            setMessage({ type: "error", text: t.messages.error });
        } finally {
            setIsResending(false);
        }
    };

    const handleVerifyAndUpdate = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setMessage({ type: "error", text: t.messages.codeRequired });
            return;
        }

        setIsVerifying(true);
        setMessage(null);

        try {
            // Call the parent's onEmailChange function
            await onEmailChange(newEmail, verificationCode);

            setMessage({ type: "success", text: t.messages.success });
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (error: any) {
            if (error.message?.includes("Invalid code")) {
                setMessage({ type: "error", text: t.messages.invalidCode });
            } else {
                setMessage({ type: "error", text: t.messages.error });
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Mail className="w-6 h-6 text-cyan-400" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {t.subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Enter New Email */}
                    {step === "enter-email" && (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-blue-400 font-semibold mb-2">{t.step1.title}</h3>
                                <p className="text-sm text-gray-300">{t.step1.description}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newEmail" className="text-gray-300">
                                    {t.step1.label}
                                </Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder={t.step1.placeholder}
                                    className="bg-slate-900/50 border-cyan-500/30 text-white focus:border-cyan-400"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isSending) {
                                            handleSendCode();
                                        }
                                    }}
                                />
                            </div>

                            {message && (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success"
                                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                            : "bg-red-500/20 border border-red-500/30 text-red-400"
                                        }`}
                                >
                                    {message.type === "success" ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                    <span className="text-sm">{message.text}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={handleClose}
                                    className="flex-1 bg-transparent border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:text-cyan-200"
                                >
                                    {t.buttons.cancel}
                                </Button>
                                <Button
                                    onClick={handleSendCode}
                                    disabled={isSending}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.step1.sending}
                                        </>
                                    ) : (
                                        t.step1.button
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Enter Verification Code */}
                    {step === "verify-code" && (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-blue-400 font-semibold mb-2">{t.step2.title}</h3>
                                <p className="text-sm text-gray-300">
                                    {t.step2.description}
                                </p>
                                <p className="text-sm text-cyan-400 font-semibold mt-2 break-all">
                                    {newEmail}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="verificationCode" className="text-gray-300">
                                    {t.step2.label}
                                </Label>
                                <Input
                                    id="verificationCode"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                        setVerificationCode(value);
                                    }}
                                    placeholder={t.step2.placeholder}
                                    maxLength={6}
                                    className="bg-slate-900/50 border-cyan-500/30 text-white text-center text-2xl tracking-widest focus:border-cyan-400"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isVerifying) {
                                            handleVerifyAndUpdate();
                                        }
                                    }}
                                />
                            </div>

                            <Button
                                onClick={handleResendCode}
                                disabled={isResending}
                                variant="ghost"
                                className="w-full text-cyan-400 hover:bg-cyan-500/10"
                                size="sm"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.step2.resending}
                                    </>
                                ) : (
                                    t.step2.resend
                                )}
                            </Button>

                            {message && (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success"
                                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                            : "bg-red-500/20 border border-red-500/30 text-red-400"
                                        }`}
                                >
                                    {message.type === "success" ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                    <span className="text-sm">{message.text}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setStep("enter-email");
                                        setVerificationCode("");
                                        setMessage(null);
                                    }}
                                    variant="outline"
                                    className="flex-1 border-gray-500/30 text-gray-300 hover:bg-gray-500/10"
                                >
                                    {t.buttons.cancel}
                                </Button>
                                <Button
                                    onClick={handleVerifyAndUpdate}
                                    disabled={isVerifying || verificationCode.length !== 6}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.step2.verifying}
                                        </>
                                    ) : (
                                        t.step2.button
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
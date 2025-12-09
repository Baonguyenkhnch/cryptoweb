import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Shield, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface CaptchaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: () => void;
    title?: string;
}

export function CaptchaDialog({
    open,
    onOpenChange,
    onVerified,
    title
}: CaptchaDialogProps) {
    const { language } = useLanguage();
    const [isChecked, setIsChecked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Default title based on language
    const defaultTitle = language === 'vi'
        ? 'Xác Minh Trước Khi Tính Điểm'
        : 'Verify Before Calculating Score';

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setIsChecked(false);
                setIsVerifying(false);
                setIsVerified(false);
            }, 300);
        }
    }, [open]);

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
        if (checked) {
            // Simulate verification process
            setIsVerifying(true);
            setTimeout(() => {
                setIsVerifying(false);
                setIsVerified(true);
                // Auto verify after animation
                setTimeout(() => {
                    onVerified();
                    onOpenChange(false);
                }, 800);
            }, 1500);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-center mb-3">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                            <div className="relative p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-400/30">
                                <Shield className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                    </div>

                    <DialogTitle className="text-center text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {title || defaultTitle}
                    </DialogTitle>

                    <DialogDescription className="text-center text-gray-300 text-sm mt-1">
                        {language === 'vi'
                            ? 'Xác nhận bạn không phải robot để tiếp tục'
                            : 'Confirm you are not a robot to continue'}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-6">
                    {/* CAPTCHA Box */}
                    <div className="relative">
                        <div className={`
              p-6 rounded-xl border-2 transition-all duration-300
              ${isVerified
                                ? 'bg-green-500/10 border-green-500/50'
                                : isVerifying
                                    ? 'bg-cyan-500/10 border-cyan-500/50'
                                    : 'bg-slate-900/50 border-slate-700'
                            }
            `}>
                            <div className="flex items-center gap-4">
                                {/* Checkbox */}
                                <div className="relative">
                                    {isVerified ? (
                                        <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded animate-in zoom-in-50 duration-300">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                    ) : (
                                        <Checkbox
                                            id="captcha-checkbox"
                                            checked={isChecked}
                                            onCheckedChange={handleCheckboxChange}
                                            disabled={isVerifying}
                                            className="w-6 h-6 border-2 border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                        />
                                    )}
                                </div>

                                {/* Text */}
                                <label
                                    htmlFor="captcha-checkbox"
                                    className={`
                    flex-1 select-none cursor-pointer transition-colors duration-300
                    ${isVerified ? 'text-green-400' : 'text-gray-300'}
                  `}
                                >
                                    {isVerified ? (
                                        <span className="flex items-center gap-2">
                                            <span>
                                                {language === 'vi'
                                                    ? '✓ Đã xác minh thành công!'
                                                    : '✓ Successfully verified!'}
                                            </span>
                                        </span>
                                    ) : isVerifying ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                            <span>
                                                {language === 'vi'
                                                    ? 'Đang xác minh...'
                                                    : 'Verifying...'}
                                            </span>
                                        </span>
                                    ) : (
                                        "I'm not a robot"
                                    )}
                                </label>

                                {/* Logo Icon */}
                                {!isVerified && !isVerifying && (
                                    <div className="flex flex-col items-center gap-0.5">
                                        <Shield className="w-6 h-6 text-cyan-500/60" />
                                        <span className="text-[8px] text-gray-500">reCAPTCHA</span>
                                    </div>
                                )}
                            </div>

                            {/* Loading Bar */}
                            {isVerifying && (
                                <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"
                                        style={{ width: '70%' }} />
                                </div>
                            )}
                        </div>

                        {/* Info text */}
                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-400">
                                {isVerified
                                    ? (language === 'vi' ? 'Bảo mật đã được xác minh ✓' : 'Security verified ✓')
                                    : (language === 'vi' ? 'Vui lòng xác nhận bạn không phải robot' : 'Please confirm you are not a robot')
                                }
                            </p>
                        </div>
                    </div>

                    {/* Cancel Button - Only show before verification */}
                    {!isVerified && (
                        <div className="mt-4">
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                                disabled={isVerifying}
                            >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
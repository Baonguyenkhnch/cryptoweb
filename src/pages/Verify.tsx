import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { verifyMagicLink } from "../services/api-real";
import type { UserProfile } from "../services/api-real";

interface VerifyPageProps {
    onVerifySuccess: (user: UserProfile) => void;
    onBackToLogin: () => void;
}

export function VerifyPage({ onVerifySuccess, onBackToLogin }: VerifyPageProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        // Parse token từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Token không hợp lệ hoặc đã hết hạn.");
            return;
        }

        // Verify token
        const verify = async () => {
            try {
                console.log("🔐 Verifying token:", token);
                const result = await verifyMagicLink(token);

                if (result.success && result.user) {
                    // Lưu auth token
                    if (result.authToken) {
                        localStorage.setItem("authToken", result.authToken);
                        localStorage.setItem("currentUser", JSON.stringify(result.user));
                    }

                    setStatus("success");
                    setMessage("Xác thực thành công! Đang chuyển đến Dashboard...");

                    // Countdown và redirect
                    let count = 3;
                    const timer = setInterval(() => {
                        count--;
                        setCountdown(count);
                        if (count <= 0) {
                            clearInterval(timer);
                            onVerifySuccess(result.user!);
                        }
                    }, 1000);
                } else {
                    setStatus("error");
                    setMessage(result.message || "Xác thực thất bại. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error("Verify error:", error);
                setStatus("error");
                setMessage("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
            }
        };

        verify();
    }, [onVerifySuccess]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419] flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="relative w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                        {status === "loading" && <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />}
                        {status === "success" && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                        {status === "error" && <XCircle className="w-6 h-6 text-red-400" />}

                        {status === "loading" && "Đang xác thực..."}
                        {status === "success" && "Xác thực thành công!"}
                        {status === "error" && "Xác thực thất bại"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Message */}
                    <div className="text-center">
                        <p className={`text-sm ${status === "success" ? "text-green-300" :
                                status === "error" ? "text-red-300" :
                                    "text-gray-300"
                            }`}>
                            {message}
                        </p>
                    </div>

                    {/* Success - Auto redirect countdown */}
                    {status === "success" && (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="w-8 h-8 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
                                <span className="text-green-300 text-sm">
                                    Chuyển trang sau {countdown} giây...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error - Back to login */}
                    {status === "error" && (
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={onBackToLogin}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Quay lại đăng nhập
                            </Button>

                            <p className="text-xs text-gray-400 text-center">
                                Link xác thực có thể đã hết hạn (15 phút). Vui lòng yêu cầu gửi lại email.
                            </p>
                        </div>
                    )}

                    {/* Loading - Spinner */}
                    {status === "loading" && (
                        <div className="flex justify-center py-8">
                            <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

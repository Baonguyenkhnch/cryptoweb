import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { verifyMagicLink, verifyRegistration } from "../services/api-real";
import type { UserProfile } from "../services/api-real";

interface VerifyPageProps {
    onVerifySuccess: (user: UserProfile) => void;
    onBackToLogin: () => void;
}

export function VerifyPage({ onVerifySuccess, onBackToLogin }: VerifyPageProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(3);
    const [debugInfo, setDebugInfo] = useState<string>(""); // ✅ ADD DEBUG INFO

    // ✅ ALERT ON COMPONENT MOUNT
    useEffect(() => {
        alert(`🔍 VerifyPage MOUNTED!\n\nURL: ${window.location.href}\nHash: ${window.location.hash}`);
    }, []);

    useEffect(() => {
        // Parse token từ URL (support multiple formats)
        let token: string | null = null;
        let isRegistration = false; // ✅ Track if this is registration or login

        // Format 1: #/verify?token=xxx OR #/verify-registration?token=xxx (hash routing with query)
        const hash = window.location.hash;
        if (hash.includes("?")) {
            const hashParams = new URLSearchParams(hash.split("?")[1]);
            // ✅ FIX: Try both lowercase and uppercase "Token"
            token = hashParams.get("token") || hashParams.get("Token");
            // ✅ Check if this is registration verification
            isRegistration = hash.includes("/verify-registration");
            console.log("🔍 Found token in hash:", token);
            console.log("🔍 Is registration:", isRegistration);
        }

        // Format 2: ?token=xxx (regular query string)
        if (!token) {
            const urlParams = new URLSearchParams(window.location.search);
            // ✅ FIX: Try both lowercase and uppercase "Token"
            token = urlParams.get("token") || urlParams.get("Token");
            console.log("🔍 Found token in query string:", token);
        }

        // Format 3: /verify?token=xxx OR /verify-registration?token=xxx (pathname without hash, redirect to hash)
        if (!token && (window.location.pathname.includes("/verify") || window.location.pathname.includes("/verify-registration"))) {
            const urlParams = new URLSearchParams(window.location.search);
            // ✅ FIX: Try both lowercase and uppercase "Token"
            token = urlParams.get("token") || urlParams.get("Token");
            isRegistration = window.location.pathname.includes("/verify-registration");
            if (token) {
                console.log("🔍 Found token in pathname, redirecting to hash...");
                // Redirect to hash-based URL
                const verifyPath = isRegistration ? "/verify-registration" : "/verify";
                window.location.hash = `#${verifyPath}?token=${token}`;
                return;
            }
        }

        // ✅ SET DEBUG INFO
        setDebugInfo(`Token: ${token?.substring(0, 20)}...\nURL: ${window.location.href}\nType: ${isRegistration ? 'Registration' : 'Magic Link'}`);

        console.log("🔍 Final parsed token:", token);
        console.log("🔍 Verification type:", isRegistration ? "Registration" : "Magic Link");
        console.log("🔍 Full URL:", window.location.href);
        console.log("🔍 Hash:", window.location.hash);
        console.log("🔍 Search:", window.location.search);
        console.log("🔍 Pathname:", window.location.pathname);

        if (!token) {
            setStatus("error");
            setMessage("Token không hợp lệ hoặc đã hết hạn.");
            setDebugInfo("❌ Token not found in URL");
            return;
        }

        // Verify token
        const verify = async () => {
            try {
                console.log("🔐 Verifying token:", token);
                console.log("🔐 Using API:", isRegistration ? "/api/verify-registration" : "/api/verify");

                // ✅ FORCE ALERT FOR DEBUGGING
                alert(`🔍 DEBUG: Calling ${isRegistration ? 'REGISTRATION' : 'MAGIC LINK'} API with token: ${token?.substring(0, 30)}...`);

                // ✅ CALL CORRECT API BASED ON URL PATH
                const result = isRegistration
                    ? await verifyRegistration(token)
                    : await verifyMagicLink(token);

                console.log("🔍 Verify API Response:", result); // ✅ ADD DETAILED LOGGING

                // ✅ FORCE ALERT WITH RESULT
                alert(`🔍 API Response: ${JSON.stringify(result).substring(0, 200)}`);

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
                    // ✅ SHOW DETAILED ERROR MESSAGE
                    const errorMsg = result.message || "Xác thực thất bại. Vui lòng thử lại.";
                    console.error("❌ Verify failed:", errorMsg);
                    console.error("❌ Full response:", result);
                    setMessage(errorMsg);
                    setDebugInfo(`❌ Error: ${errorMsg}\n\nAPI Response: ${JSON.stringify(result, null, 2)}`);
                }
            } catch (error) {
                console.error("❌ Verify error:", error);
                // ✅ SHOW MORE DETAILS
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error("❌ Error details:", errorMsg);
                setStatus("error");
                setMessage(`Có lỗi xảy ra: ${errorMsg}`);
                setDebugInfo(`❌ Exception: ${errorMsg}`);

                // ✅ FORCE ALERT
                alert(`❌ ERROR: ${errorMsg}`);
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
                            {/* ✅ SHOW DEBUG INFO */}
                            {debugInfo && (
                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-left">
                                    <p className="text-xs text-red-300 font-mono whitespace-pre-wrap break-all">
                                        {debugInfo}
                                    </p>
                                </div>
                            )}

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
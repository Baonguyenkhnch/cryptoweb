import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h2 className="text-xl text-white mb-2">Oops! Something went wrong</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

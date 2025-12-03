import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ScoreResult } from "./ScoreResult";
import { useLanguage } from "../services/LanguageContext";
import { formatCurrency } from "../utils/format";

import {
  Wallet,
  TrendingUp,
  Calendar,
  Activity,
  User
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { UserProfile, WalletAnalysis } from "../services/api-real";
import { RefreshCw } from "lucide-react";

// ============================================
// TYPES
// ============================================

interface DashboardProps {
  user: UserProfile;
  walletData: WalletAnalysis | null;
  onLogout: () => void;
  onViewProfile: () => void;
  onCalculateScore: () => void;
  onRecalculate?: () => Promise<void>;
}

interface ScoreHistoryItem {
  date: string;
  score: number;
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_STATS = {
  currentScore: 785,
  previousScore: 742,
  rating: "Excellent",
  walletAge: 456,
  totalTransactions: 1234,
  tokenDiversity: 15,
  totalAssets: 125000,
  totalChecks: 23,
};

const MOCK_WALLET_DATA = {
  tokenBalances: [
    { symbol: "ETH", balance: 2.5, value: 4500, percentage: 45 },
    { symbol: "USDT", balance: 5000, value: 5000, percentage: 50 },
    { symbol: "LINK", balance: 200, value: 500, percentage: 5 },
  ],
  recentTransactions: [
    {
      id: "tx-1",
      hash: "0x123...abc",
      type: "send" as const,
      amount: 0.5,
      token: "ETH",
      value: 900,
      date: "2024-01-15",
    },
    {
      id: "tx-2",
      hash: "0x456...def",
      type: "receive" as const,
      amount: 1000,
      token: "USDT",
      value: 1000,
      date: "2024-01-14",
    },
  ],
};

// ============================================
// DASHBOARD COMPONENT
// ============================================

export function Dashboard({
  user,
  walletData,
  onLogout,
  onViewProfile,
  onCalculateScore,
  onRecalculate
}: DashboardProps) {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "15d" | "30d">("7d");
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // REMOVED: formatAssets function - now using formatCurrency from utils/format.ts

  // ============================================
  // LIFECYCLE & DATA LOADING
  // ============================================

  useEffect(() => {
    loadScoreHistory();
  }, [selectedPeriod, user.walletAddress]);

  const loadScoreHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // Determine number of days based on selected period
      const daysMap = { "7d": 7, "15d": 15, "30d": 30 };
      const numDays = daysMap[selectedPeriod];

      // ✅ ALWAYS USE REAL CURRENT SCORE FROM WALLET
      const currentScore = walletData?.score ?? 0;

      console.log(`📊 Generating score history based on REAL score: ${currentScore} (${numDays} days)`);

      // ✅ Generate history based ONLY on REAL current score
      const realHistory = Array.from({ length: numDays }, (_, i) => {
        const daysAgo = numDays - 1 - i;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        // If current score is 0, show flat line at 0
        if (currentScore === 0) {
          return {
            date: date.toISOString().split('T')[0],
            score: 0
          };
        }

        // Otherwise, simulate score fluctuation around REAL current score
        const variation = Math.sin(i / 5) * (currentScore * 0.05) + (Math.random() - 0.5) * (currentScore * 0.03);
        const score = Math.max(0, Math.min(850, currentScore + variation));

        return {
          date: date.toISOString().split('T')[0],
          score: Math.round(score)
        };
      });

      setScoreHistory(realHistory);
      console.log(`✅ Generated history with ${numDays} points based on real score: ${currentScore}`);

    } catch (error) {
      console.error("Error loading score history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRecalculate = async () => {
    if (!onRecalculate) return;
    setIsRecalculating(true);
    try {
      await onRecalculate();
      await loadScoreHistory(); // Reload history after recalculation
    } catch (error) {
      console.error("Error recalculating:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Tính toán score change
  // ✅ FIX: Only fallback to MOCK if walletData is null, not if score is 0
  const currentScore = walletData !== null ? (walletData.score ?? MOCK_STATS.currentScore) : MOCK_STATS.currentScore;
  const walletAge = walletData !== null ? (walletData.walletAge ?? MOCK_STATS.walletAge) : MOCK_STATS.walletAge;
  const totalTransactions = walletData !== null ? (walletData.totalTransactions ?? MOCK_STATS.totalTransactions) : MOCK_STATS.totalTransactions;
  const tokenDiversity = walletData !== null ? (walletData.tokenDiversity ?? MOCK_STATS.tokenDiversity) : MOCK_STATS.tokenDiversity;
  const totalAssets = walletData !== null ? (walletData.totalAssets ?? MOCK_STATS.totalAssets) : MOCK_STATS.totalAssets;
  const rating = walletData !== null ? (walletData.rating ?? MOCK_STATS.rating) : MOCK_STATS.rating;
  const tokenBalances = walletData !== null ? (walletData.tokenBalances ?? MOCK_WALLET_DATA.tokenBalances) : MOCK_WALLET_DATA.tokenBalances;
  const recentTransactions = walletData !== null ? (walletData.recentTransactions ?? MOCK_WALLET_DATA.recentTransactions) : MOCK_WALLET_DATA.recentTransactions;

  // ✅ DEBUG: Log để check giá trị truyền vào ScoreResult
  console.log("🎯 Dashboard - Data passed to ScoreResult:");
  console.log("  - walletData:", walletData);
  console.log("  - currentScore:", currentScore);
  console.log("  - walletAge:", walletAge);
  console.log("  - totalTransactions:", totalTransactions);
  console.log("  - totalAssets:", totalAssets);

  const scoreChange = MOCK_STATS.currentScore - MOCK_STATS.previousScore;
  const scoreChangePercent = ((scoreChange / MOCK_STATS.previousScore) * 100).toFixed(1);
  const isPositiveChange = scoreChange >= 0;

  // ============================================
  // RENDER UI
  // ============================================

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 relative z-20">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Title section */}
            <div>
              <h1 className="text-2xl md:text-4xl mb-1 md:mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-400 text-xs md:text-sm flex items-center gap-2">
                <Wallet className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                {t.statsLabels.wallet} <span className="text-cyan-400 font-mono">{formatWalletAddress(user.walletAddress)}</span>
              </p>
            </div>

            {/* Buttons section - Full width on mobile, side by side */}
            <div className="flex items-center gap-2 md:gap-3 w-full relative z-30">
              <Button
                onClick={onViewProfile}
                variant="outline"
                className="flex-shrink-0 bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 cursor-pointer relative z-40 px-3 md:px-4 h-9 md:h-10 text-sm md:text-base"
              >
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t.navigation.profile}</span>
              </Button>

              {/* Button Tính Điểm Mới - Compact like profile button */}
              <Button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="flex-shrink-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 shadow-lg shadow-cyan-500/30 text-white disabled:opacity-50 h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
              >
                {isRecalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden md:inline text-xs md:text-sm">{t.dashboard.recalculating}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden md:inline text-xs md:text-sm">{t.dashboard.recalculate}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                {currentScore}
              </div>
              <div className="text-gray-400 text-xs">{t.statsLabels.creditScore}</div>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {rating}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
            <CardContent className="p-4 text-center">
              <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-2xl text-cyan-400 mb-1">{walletAge}</div>
              <div className="text-gray-400 text-xs">{t.statsLabels.walletAgeDays}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
            <CardContent className="p-4 text-center">
              <Activity className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl text-blue-400 mb-1">{totalTransactions.toLocaleString()}</div>
              <div className="text-gray-400 text-xs">{t.statsLabels.transactions}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl text-purple-400 mb-1">
                {walletData?.walletTransactionsLast30d || 0}
              </div>
              <div className="text-gray-400 text-xs">{t.statsLabels.transactions30d || 'Giao dịch 30 ngày'}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
            <CardContent className="p-4 text-center">
              <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl text-emerald-400 mb-1">{formatCurrency(totalAssets)}</div>
              <div className="text-gray-400 text-xs">{t.statsLabels.assets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Score History Chart */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                {t.statsLabels.scoreHistory}
              </CardTitle>

              <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                <TabsList className="bg-slate-900/50 gap-1">
                  <TabsTrigger value="7d" className="min-w-[70px] data-[state=active]:!text-slate-900 data-[state=active]:font-semibold">{t.statsLabels.period7d}</TabsTrigger>
                  <TabsTrigger value="15d" className="min-w-[70px] data-[state=active]:!text-slate-900 data-[state=active]:font-semibold">{t.statsLabels.period15d}</TabsTrigger>
                  <TabsTrigger value="30d" className="min-w-[70px] data-[state=active]:!text-slate-900 data-[state=active]:font-semibold">{t.statsLabels.period30d}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingHistory ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  {t.statsLabels.loadingData}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      const day = date.getDate();
                      const month = date.getMonth() + 1;
                      return `${day}/${month}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8' }}
                    domain={currentScore === 0 ? [0, 100] : ['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      const day = date.getDate();
                      const month = date.getMonth() + 1;
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Detailed Charts & Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl text-white flex items-center gap-2 mb-1">
                {t.statsLabels.detailedAnalysis}
              </h2>
              <p className="text-gray-400 text-sm">
                {t.statsLabels.chartDescription} {formatWalletAddress(user.walletAddress)}
              </p>
            </div>
          </div>

          <ScoreResult
            score={currentScore}
            walletAge={walletAge}
            totalTransactions={totalTransactions}
            tokenDiversity={tokenDiversity}
            totalAssets={totalAssets}
            tokenBalances={tokenBalances}
            recentTransactions={recentTransactions}
            scoreHistory={scoreHistory}
            onSubscribe={undefined}
            onFeedback={undefined}
            onRecalculate={undefined}
            onSendReport={undefined}
            isSubscribed={false}
            isRecalculating={false}
          />
        </div>
      </div>
    </div>
  );
}
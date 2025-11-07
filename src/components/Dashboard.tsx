import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ScoreResult } from "./ScoreResult";
import { useLanguage } from "../services/LanguageContext";
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
import { getScoreHistory } from "../services/api-real";

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
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
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

  // Helper function to format assets
  const formatAssets = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // ============================================
  // LIFECYCLE & DATA LOADING
  // ============================================

  useEffect(() => {
    loadScoreHistory();
  }, [selectedPeriod, user.walletAddress]);

  const loadScoreHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getScoreHistory(user.walletAddress);
      setScoreHistory(history);
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
  const currentScore = walletData?.score || MOCK_STATS.currentScore;
  const walletAge = walletData?.walletAge || MOCK_STATS.walletAge;
  const totalTransactions = walletData?.totalTransactions || MOCK_STATS.totalTransactions;
  const tokenDiversity = walletData?.tokenDiversity || MOCK_STATS.tokenDiversity;
  const totalAssets = walletData?.totalAssets || MOCK_STATS.totalAssets;
  const rating = walletData?.rating || MOCK_STATS.rating;
  const tokenBalances = walletData?.tokenBalances || MOCK_WALLET_DATA.tokenBalances;
  const recentTransactions = walletData?.recentTransactions || MOCK_WALLET_DATA.recentTransactions;

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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                {t.statsLabels.wallet} <span className="text-cyan-400 font-mono">{formatWalletAddress(user.walletAddress)}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={onViewProfile}
                variant="outline"
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              >
                <User className="w-4 h-4 mr-2" />
                {t.navigation.profile}
              </Button>

              {/* Button Tính Điểm Mới - Design đẹp với stats */}
              <Button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 shadow-lg shadow-cyan-500/30 text-white px-6 disabled:opacity-50"
              >
                {isRecalculating ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{t.dashboard.recalculating}</span>
                      <span className="text-[10px] opacity-80">{t.statsLabels.calculatedTimes} {MOCK_STATS.totalChecks} {t.statsLabels.times}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{t.dashboard.recalculate}</span>
                      <span className="text-[10px] opacity-80">{t.statsLabels.calculatedTimes} {MOCK_STATS.totalChecks} {t.statsLabels.times}</span>
                    </div>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl text-emerald-400 mb-1">{formatAssets(totalAssets)}</div>
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
                <TabsList className="bg-slate-900/50">
                  <TabsTrigger value="7d">{t.statsLabels.period7d}</TabsTrigger>
                  <TabsTrigger value="30d">{t.statsLabels.period30d}</TabsTrigger>
                  <TabsTrigger value="90d">{t.statsLabels.period90d}</TabsTrigger>
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
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8' }}
                    domain={[500, 850]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
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
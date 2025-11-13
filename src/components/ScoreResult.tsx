import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { memo, useMemo, lazy, Suspense } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Crown, Trophy, Award, Star, TrendingUp, Wallet, Activity } from "lucide-react";
import type { TokenBalance, Transaction } from "../services/api-real";
import { ActionButtons } from "./ActionButtons";
import { useLanguage } from "../services/LanguageContext";

interface ScoreResultProps {
  score: number;
  walletAge: number;
  totalTransactions: number;
  tokenDiversity: number;
  totalAssets: number;
  tokenBalances?: TokenBalance[];
  recentTransactions?: Transaction[];
  scoreHistory?: Array<{ date: string; score: number }>;
  onSubscribe?: () => void;
  onFeedback?: () => void;
  onRecalculate?: () => void;
  onSendReport?: () => void;
  isSubscribed?: boolean;
  isRecalculating?: boolean;
  // ✅ NEW: Feature importance & recommendations from API
  featureImportance?: {
    groups?: {
      transaction_activity?: number;
      asset_value?: number;
      wallet_age?: number;
      token_diversity?: number;
    };
    top_factors?: Array<{
      factor: string;
      impact: string;
    }>;
  };
  recommendations?: string[];
}

const getRating = (score: number): string => {
  if (score >= 750) return "AAA";
  if (score >= 700) return "AA";
  if (score >= 650) return "A";
  if (score >= 600) return "BBB";
  if (score >= 550) return "BB";
  if (score >= 500) return "B";
  return "C";
};

const getRatingColor = (rating: string): string => {
  switch (rating) {
    case "AAA": return "text-emerald-400";
    case "AA": return "text-green-400";
    case "A": return "text-blue-400";
    case "BBB": return "text-yellow-400";
    case "BB": return "text-orange-400";
    case "B": return "text-red-400";
    default: return "text-red-500";
  }
};

const getRatingGradient = (rating: string): string => {
  switch (rating) {
    case "AAA": return "from-emerald-400 to-green-400";
    case "AA": return "from-green-400 to-cyan-400";
    case "A": return "from-blue-400 to-purple-400";
    case "BBB": return "from-yellow-400 to-amber-400";
    case "BB": return "from-orange-400 to-red-400";
    case "B": return "from-red-400 to-pink-400";
    default: return "from-red-500 to-red-600";
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case "AAA": return <Crown className="w-8 h-8 text-emerald-400" />;
    case "AA": return <Trophy className="w-8 h-8 text-green-400" />;
    case "A": return <Award className="w-8 h-8 text-blue-400" />;
    default: return <Star className="w-8 h-8 text-yellow-400" />;
  }
};

function ScoreResultComponent({
  score,
  walletAge,
  totalTransactions,
  tokenDiversity,
  totalAssets,
  tokenBalances = [],
  recentTransactions = [],
  scoreHistory = [],
  onSubscribe,
  onFeedback,
  onRecalculate,
  onSendReport,
  isSubscribed = false,
  isRecalculating = false,
  // ✅ NEW: Feature importance & recommendations from API
  featureImportance,
  recommendations,
}: ScoreResultProps) {
  const { t } = useLanguage();
  const rating = useMemo(() => getRating(score), [score]);
  const percentage = useMemo(() => Math.min((score / 850) * 100, 100), [score]);

  const chartData = useMemo(() => [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ], [percentage]);

  const COLORS = ['url(#gradient)', '#e5e7eb'];

  // Colors cho token pie chart
  const TOKEN_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  // REMOVED: Score Trend chart - không cần nữa vì chỉ dùng wallet_transactions_last_30d

  // Generate activity timeline from transactions
  const activityData = useMemo(() =>
    recentTransactions.reduce((acc: any[], tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === dateKey);
      if (existing) {
        existing.count += 1;
        existing.volume += tx.value;
      } else {
        acc.push({ date: dateKey, count: 1, volume: tx.value });
      }
      return acc;
    }, []).reverse(), [recentTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-700">
      {/* Main Score Card */}
      <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-3xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-slate-900/40" />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl opacity-50" />

        <div className="relative">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {getRatingIcon(rating)}
              <CardTitle className="text-4xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t.scoreResult.title}
              </CardTitle>
            </div>
            <p className="text-gray-400 text-lg">{t.scoreResult.subtitle}</p>
          </CardHeader>

          <CardContent className="pb-12">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
              {/* Enhanced Circular Chart */}
              <div className="relative">
                <div className="w-72 h-72 relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600/40 to-blue-600/40 blur-2xl animate-pulse" />

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        dataKey="value"
                        filter="url(#glow)"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center score display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                        {score}
                      </div>
                      <div className="text-gray-400 text-lg">{t.scoreResult.score}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Score Details */}
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="text-8xl mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                    {score}
                  </div>
                  <div className="text-3xl text-gray-300">{t.scoreResult.creditScore}</div>
                </div>

                {/* Rating badge */}
                <div className="relative inline-block">
                  <div className={`absolute -inset-2 bg-gradient-to-r ${getRatingGradient(rating)} rounded-2xl blur-lg opacity-60 animate-pulse`} />
                  <div className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${getRatingGradient(rating)} shadow-2xl`}>
                    {getRatingIcon(rating)}
                    <span className="text-white text-4xl tracking-wider">{rating}</span>
                  </div>
                </div>

                {/* Progress section */}
                <div className="w-80 space-y-4">
                  <div className="relative">
                    <Progress
                      value={percentage}
                      className="h-4 bg-slate-700/50 rounded-full overflow-hidden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-full pointer-events-none" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{percentage.toFixed(1)}% {t.scoreResult.maxProgress}</span>
                    <span>{t.scoreResult.maxScore}</span>
                  </div>
                </div>

                {/* Score breakdown indicators */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-green-400 text-sm">{t.scoreResult.excellent}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                    <Wallet className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-blue-400 text-sm">{t.scoreResult.verified}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Wallet Age Card */}
        <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600/30 to-cyan-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-cyan-400 text-sm tracking-wide uppercase">{t.scoreResult.walletAge}</CardTitle>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                  {walletAge}
                </div>
                <div className="text-gray-400 text-sm">{t.scoreResult.daysActive}</div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full w-3/4" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Total Transactions Card */}
        <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-400 text-sm tracking-wide uppercase">{t.scoreResult.transactions}</CardTitle>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
                  {totalTransactions.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">{t.scoreResult.totalTransactions}</div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-4/5" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Token Diversity Card */}
        <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-teal-500/20 shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600/30 to-teal-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-teal-400 text-sm tracking-wide uppercase">{t.scoreResult.tokenDiversity}</CardTitle>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
                  {tokenDiversity}
                </div>
                <div className="text-gray-400 text-sm">{t.scoreResult.typesOfTokens}</div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full w-3/5" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Total Assets Card */}
        <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-emerald-500/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/30 to-emerald-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-400 text-sm tracking-wide uppercase">{t.scoreResult.totalAssets}</CardTitle>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-tight">
                  {formatCurrency(totalAssets)}
                </div>
                <div className="text-gray-400 text-sm">{t.scoreResult.portfolioValue}</div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-5/6" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Charts Section - 3 biểu đồ chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REMOVED: Score Trend Chart - Anh chỉ muốn dùng wallet_transactions_last_30d trong Dashboard */}

        {/* Activity Chart */}
        {activityData.length > 0 && (
          <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-3xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-xl opacity-50" />

            <div className="relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  {t.scoreResult.activityTimeline}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4">
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #a855f7',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVolume)"
                        name={t.scoreResult.value}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Token Distribution */}
        {tokenBalances.length > 0 && (
          <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-3xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-teal-500/30 rounded-3xl blur-xl opacity-50" />

            <div className="relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  {t.scoreResult.tokenDistribution}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4">
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tokenBalances.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tokenBalances.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TOKEN_COLORS[index % TOKEN_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #06b6d4',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {tokenBalances.slice(0, 3).map((token, idx) => (
                    <div key={token.symbol} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: TOKEN_COLORS[idx % TOKEN_COLORS.length] }}
                        />
                        <span className="text-gray-300">{token.symbol}</span>
                      </div>
                      <span className="text-cyan-400">{(token.percentage || 0).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons - Simplified */}
      {onSubscribe && onFeedback && onRecalculate && (
        <div className="flex justify-center">
          <ActionButtons
            onSubscribe={onSubscribe}
            onFeedback={onFeedback}
            onRecalculate={onRecalculate}
            onSendReport={onSendReport}
            isSubscribed={isSubscribed}
            isRecalculating={isRecalculating}
          />
        </div>
      )}
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export const ScoreResult = memo(ScoreResultComponent);
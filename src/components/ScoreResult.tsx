import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { memo, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Crown, Trophy, Award, Star, TrendingUp, Wallet, ChevronRight, AlertCircle } from "lucide-react";
import type { TokenBalance, Transaction } from "../services/api-real";
import { ActionButtons } from "./ActionButtons";
import { useLanguage } from "../services/LanguageContext";
import { formatCurrency as formatCurrencyUtil } from "../utils/format";

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
  if (score === 0) return "N/A"; // ✅ No score yet
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
    case "N/A": return "text-gray-400"; // ✅ No score yet
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
    case "N/A": return "from-gray-500 to-gray-600"; // ✅ No score yet
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
    case "N/A": return <AlertCircle className="w-4 h-4 md:w-8 md:h-8 text-gray-400" />; // ✅ No score yet
    case "AAA": return <Crown className="w-4 h-4 md:w-8 md:h-8 text-emerald-400" />;
    case "AA": return <Trophy className="w-4 h-4 md:w-8 md:h-8 text-green-400" />;
    case "A": return <Award className="w-4 h-4 md:w-8 md:h-8 text-blue-400" />;
    default: return <Star className="w-4 h-4 md:w-8 md:h-8 text-yellow-400" />;
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
  featureImportance,
  recommendations,
}: ScoreResultProps) {
  const { t, language } = useLanguage();
  const rating = useMemo(() => getRating(score), [score]);
  const percentage = useMemo(() => Math.min((score / 850) * 100, 100), [score]);

  const [showTokenDetails, setShowTokenDetails] = useState(false);
  // --- Sửa đoạn này: tính diversity khớp thực tế ---
  const diversity = (Array.isArray(tokenBalances) && tokenBalances.length > 0)
    ? tokenBalances.length : (tokenDiversity ?? 0); // Ưu tiên lấy tokenBalances.length thực tế

  const chartData = useMemo(() => [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ], [percentage]);

  const COLORS = ['url(#gradient)', '#e5e7eb'];

  const TOKEN_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value);
  };

  // Thay vì lọc theo balance_usd hay balance, chỉ filter spam:
  const displayedTokens = tokenBalances.filter(token => !token.possible_spam);
  const totalValue = displayedTokens.reduce((sum, t) => sum + (t.value ?? 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-8 lg:space-y-12 animate-in fade-in-50 duration-700 px-2 md:px-4">
      {/* Main Score Card */}
      <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-lg md:rounded-2xl lg:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-slate-900/40" />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-lg md:rounded-2xl lg:rounded-3xl blur-xl opacity-50" />

        <div className="relative">
          <CardHeader className="text-center pb-2 md:pb-6 lg:pb-8 pt-3 md:pt-5 lg:pt-6 px-3 md:px-5 lg:px-6">
            <div className="flex items-center justify-center gap-1.5 md:gap-2.5 lg:gap-3 mb-1 md:mb-3 lg:mb-4">
              {getRatingIcon(rating)}
              <CardTitle className="text-base md:text-3xl lg:text-4xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t.scoreResult.title}
              </CardTitle>
            </div>
            <p className="text-gray-400 text-[10px] md:text-base lg:text-lg">{t.scoreResult.subtitle}</p>
          </CardHeader>

          <CardContent className="pb-3 md:pb-8 lg:pb-12 px-3 md:px-5 lg:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-12 lg:gap-16">
              {/* Enhanced Circular Chart */}
              <div className="relative">
                <div className="w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600/40 to-blue-600/40 blur-xl md:blur-2xl animate-pulse" />

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
                        innerRadius={56}
                        outerRadius={80}
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

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl md:text-5xl lg:text-6xl mb-1 md:mb-1.5 lg:mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                        {score}
                      </div>
                      <div className="text-gray-400 text-[10px] md:text-base lg:text-lg">{t.scoreResult.score}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Score Details */}
              <div className="text-center space-y-3 md:space-y-6 lg:space-y-8 w-full lg:w-auto">
                <div className="space-y-1.5 md:space-y-3 lg:space-y-4">
                  <div className="text-4xl md:text-6xl lg:text-8xl mb-1 md:mb-3 lg:mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                    {score}
                  </div>
                  {/* ✅ Bỏ text "Không Có Điểm" khi score = 0 */}
                  {score > 0 && (
                    <div className="text-lg md:text-2xl lg:text-3xl text-gray-300">
                      {t.scoreResult.creditScore}
                    </div>
                  )}
                </div>

                <div className="relative inline-block">
                  <div className={`absolute -inset-1 md:-inset-1.5 lg:-inset-2 bg-gradient-to-r ${getRatingGradient(rating)} rounded-lg md:rounded-xl lg:rounded-2xl blur md:blur-md lg:blur-lg opacity-60 animate-pulse`} />
                  <div className={`relative inline-flex items-center gap-1.5 md:gap-2.5 lg:gap-3 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-r ${getRatingGradient(rating)} shadow-xl md:shadow-2xl`}>
                    {getRatingIcon(rating)}
                    <span className="text-white text-xl md:text-3xl lg:text-4xl tracking-wider">
                      {rating === "N/A" ? t.scoreResult.noRating : rating}
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-xs md:max-w-sm lg:w-80 mx-auto space-y-2 md:space-y-3 lg:space-y-4">
                  <div className="relative">
                    <Progress
                      value={percentage}
                      className="h-2 md:h-3 lg:h-4 bg-slate-700/50 rounded-full overflow-hidden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-full pointer-events-none" />
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs lg:text-sm text-gray-400">
                    <span>{percentage.toFixed(1)}% {t.scoreResult.maxProgress}</span>
                    <span>{t.scoreResult.maxScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Enhanced Statistics Cards - NEW LAYOUT: Row 1 = 3 cards, Row 2 = Token card left + list right */}
      <div className="space-y-3 md:space-y-6 lg:space-y-8">
        {/* Row 1: 3 Cards horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {/* Wallet Age Card */}
          <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-xl md:rounded-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600/30 to-cyan-500/30 rounded-xl md:rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <CardHeader className="pb-2 md:pb-3 lg:pb-4 px-3 md:px-5 lg:px-6 pt-3 md:pt-4 lg:pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-400 text-[10px] md:text-xs lg:text-sm tracking-wide uppercase">{t.scoreResult.walletAge}</CardTitle>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-5 lg:px-6 pb-3 md:pb-4 lg:pb-5">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                    {walletAge}
                  </div>
                  <div className="text-gray-400 text-[10px] md:text-xs lg:text-sm">{t.scoreResult.daysActive}</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full w-3/4" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Total Transactions Card */}
          <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-xl md:rounded-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-500/30 rounded-xl md:rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <CardHeader className="pb-2 md:pb-3 lg:pb-4 px-3 md:px-5 lg:px-6 pt-3 md:pt-4 lg:pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-400 text-[10px] md:text-xs lg:text-sm tracking-wide uppercase">{t.scoreResult.transactions}</CardTitle>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-5 lg:px-6 pb-3 md:pb-4 lg:pb-5">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
                    {totalTransactions.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-[10px] md:text-xs lg:text-sm">{t.scoreResult.totalTransactions}</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-4/5" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Total Assets Card */}
          <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-emerald-500/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-xl md:rounded-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/30 to-emerald-500/30 rounded-xl md:rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <CardHeader className="pb-2 md:pb-3 lg:pb-4 px-3 md:px-5 lg:px-6 pt-3 md:pt-4 lg:pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-400 text-[10px] md:text-xs lg:text-sm tracking-wide uppercase">{t.scoreResult.totalAssets}</CardTitle>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-5 lg:px-6 pb-3 md:pb-4 lg:pb-5">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-tight">
                    {formatCurrency(totalAssets)}
                  </div>
                  <div className="text-gray-400 text-[10px] md:text-xs lg:text-sm">{t.scoreResult.portfolioValue}</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-5/6" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Row 2: Token Diversity Card (left) + Token List (right when clicked) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 lg:gap-8 items-start">
          {/* Token Diversity Card - Left side, centered and balanced */}
          <div className="flex justify-center">
            <Card className="relative group overflow-hidden bg-slate-800/50 backdrop-blur-xl border-2 border-teal-500/50 shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-500 rounded-xl md:rounded-2xl w-full max-w-md">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600/40 to-teal-500/40 rounded-xl md:rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <CardHeader className="pb-3 md:pb-5 lg:pb-6 px-3 md:px-5 lg:px-6 pt-3 md:pt-4 lg:pt-5">
                  <div className="text-center space-y-1.5 md:space-y-2.5 lg:space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="p-2.5 md:p-3.5 lg:p-4 bg-teal-500/20 rounded-xl md:rounded-2xl">
                        <Wallet className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-teal-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 md:gap-2">
                      <CardTitle className="text-base md:text-lg lg:text-xl bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent tracking-wide uppercase">
                        {t.scoreResult.tokenDiversity}
                      </CardTitle>
                      <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/40 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                        {language === 'vi' ? 'Chi Tiết' : 'Details'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm">
                      {language === 'vi' ? 'Danh mục đa dạng giúp phân tán rủi ro' : 'Diversified portfolio helps spread risk'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 md:space-y-5 lg:space-y-6 px-3 md:px-5 lg:px-6 pb-3 md:pb-4 lg:pb-5">
                  {/* Big number display */}
                  <div className="text-center py-3 md:py-5 lg:py-6">
                    <div className="text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent tracking-tight mb-1.5 md:mb-2.5 lg:mb-3">
                      {diversity}
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm lg:text-base">{t.scoreResult.typesOfTokens}</div>
                  </div>

                  {/* Progress bar với label */}
                  <div className="space-y-1.5 md:space-y-2.5 lg:space-y-3">
                    <div className="flex items-center justify-between text-[10px] md:text-xs lg:text-sm">
                      <span className="text-gray-400">{language === 'vi' ? 'Mức độ đa dạng' : 'Diversity Level'}</span>
                      <span className="text-teal-400 font-medium">{Math.min((diversity / 20) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 md:h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((diversity / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Button to view token details */}
                  <button
                    onClick={() => setShowTokenDetails(!showTokenDetails)}
                    className="w-full flex items-center justify-center gap-2 md:gap-2.5 lg:gap-3 px-4 md:px-5 lg:px-6 py-2.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border-2 border-teal-500/40 hover:border-teal-400/60 rounded-lg md:rounded-xl text-teal-300 text-xs md:text-sm lg:text-base font-medium transition-all duration-300 group/btn"
                  >
                    <Wallet className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 group-hover/btn:scale-110 transition-transform" />
                    <span>{t.scoreResult.viewTokenDetails}</span>
                    <ChevronRight className={`w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-transform duration-300 ${showTokenDetails ? 'rotate-90' : ''}`} />
                  </button>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Token List - Right side, appears when showTokenDetails is true */}
          {showTokenDetails && displayedTokens.length > 0 ? (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border-2 border-teal-500/30 shadow-xl rounded-xl md:rounded-2xl h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600/20 to-teal-500/20 rounded-xl md:rounded-2xl blur-xl opacity-50" />

                <div className="relative h-full flex flex-col">
                  <CardHeader className="pb-2 md:pb-3 lg:pb-4 px-3 md:px-5 lg:px-6 pt-3 md:pt-4 lg:pt-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm md:text-base lg:text-lg bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent flex items-center gap-1.5 md:gap-2">
                        <Wallet className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-teal-400" />
                        {language === 'vi' ? 'Danh Sách Token' : 'Token List'}
                      </CardTitle>
                      <span className="text-[10px] md:text-xs lg:text-sm text-teal-400 font-medium">
                        {displayedTokens.length} {language === 'vi' ? 'tokens' : 'tokens'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-5 lg:px-6 pb-3 md:pb-4 lg:pb-5">
                    <div className="space-y-1.5 md:space-y-2">
                      {displayedTokens.map((token, idx) => {
                        const percentage = totalValue ? (token.value / totalValue) * 100 : 0;
                        return (
                          <div
                            key={token.symbol}
                            className="group/token relative overflow-hidden p-2.5 md:p-3.5 lg:p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg md:rounded-xl border border-teal-500/20 hover:border-teal-400/40 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover/token:opacity-100 transition-opacity" />

                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3">
                                <div
                                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 shadow-lg"
                                  style={{ backgroundColor: TOKEN_COLORS[idx % TOKEN_COLORS.length] }}
                                />
                                <div>
                                  <div className="text-gray-200 text-xs md:text-sm lg:text-base font-semibold">{token.symbol}</div>
                                  <div className="text-teal-400 text-[10px] md:text-xs lg:text-sm font-mono">{formatCurrency(token.value)}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-400 text-[10px] md:text-xs lg:text-sm font-medium">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          ) : (
            // Placeholder when not showing token details
            !showTokenDetails && (
              <div className="hidden lg:flex items-center justify-center h-full">
                <div className="text-center space-y-2 md:space-y-3 opacity-50">
                  <Wallet className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-teal-400/30 mx-auto" />
                  <p className="text-gray-500 text-xs md:text-sm">
                    {language === 'vi' ? 'Bấm "Xem Chi Tiết Tokens" để hiển thị danh sách' : 'Click "View Tokens Details" to display list'}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Action Buttons */}
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

export const ScoreResult = memo(ScoreResultComponent);
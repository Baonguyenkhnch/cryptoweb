import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Activity,
  Coins,
  Wallet,
  Shield,
  Zap,
  Crown,
  Target,
  Info,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import type { WalletAnalysis } from "../services/api-real";
import { useLanguage } from "../services/LanguageContext";

interface ResultsSummaryProps {
  walletData: WalletAnalysis;
  onSubscribeClick?: () => void;
  onRegisterClick?: () => void;
  subscriptionStatus?: any;
  isRecalculating?: boolean;
  onRecalculate?: () => void;
  onSendReport?: () => void;
}

export function ResultsSummary({
  walletData,
  onSubscribeClick,
  onRegisterClick,
}: ResultsSummaryProps) {
  const { t, language } = useLanguage();
  const [showCalculationDetails, setShowCalculationDetails] = useState(true); // ✅ Changed: Always show by default

  if (!walletData) {
    return null;
  }

  // Helper function to format assets consistently
  const formatAssets = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`; // Changed from .toFixed(2) to .toFixed(1)
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    } else {
      return `$${value.toFixed(1)}`; // Changed from .toFixed(2) to .toFixed(1)
    }
  };

  // Get rating badge info
  const getRatingInfo = (score: number) => {
    // ✅ Handle score = 0 case with "Không Có Hạng"
    if (score === 0) return {
      text: "N/A",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-500/20",
      textColor: "text-gray-400",
      borderColor: "border-gray-500/30",
      label: language === 'vi' ? 'Không Có Hạng' : 'No Rating'
    };
    if (score >= 750) return {
      text: "AAA",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      label: language === 'vi' ? 'Xuất Sắc' : 'Excellent'
    };
    if (score >= 700) return {
      text: "AA",
      color: "from-green-500 to-cyan-500",
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      borderColor: "border-green-500/30",
      label: language === 'vi' ? 'Rất Tốt' : 'Very Good'
    };
    if (score >= 650) return {
      text: "A",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/20",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      label: language === 'vi' ? 'Tốt' : 'Good'
    };
    if (score >= 600) return {
      text: "BBB",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      label: language === 'vi' ? 'Khá' : 'Fair'
    };
    if (score >= 550) return {
      text: "BB",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/20",
      textColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      label: language === 'vi' ? 'Trung Bình' : 'Average'
    };
    return {
      text: "B-C",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      label: language === 'vi' ? 'Cần Cải Thiện' : 'Needs Improvement'
    };
  };

  const rating = getRatingInfo(walletData.score);

  // Calculate metrics with score contribution
  const metrics = [
    {
      icon: Clock,
      label: language === 'vi' ? 'Tuổi Ví' : 'Wallet Age',
      value: walletData.walletAge,
      unit: language === 'vi' ? 'ngày' : 'days',
      subtitle: `${(walletData.walletAge / 365).toFixed(1)} ${language === 'vi' ? 'năm' : 'years'}`,
      weight: 20, // Changed from 30% to 20%
      contributedScore: Math.round(walletData.score * 0.20), // Changed from 0.30 to 0.20
      badge: language === 'vi' ? 'Trung Bình' : 'Average',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20',
    },
    {
      icon: Activity,
      label: language === 'vi' ? 'Giao Dịch' : 'Transactions',
      value: walletData.totalTransactions.toLocaleString(),
      unit: '',
      subtitle: language === 'vi' ? 'giao dịch' : 'transactions',
      weight: 30, // Changed from 25% to 30%
      contributedScore: Math.round(walletData.score * 0.30), // Changed from 0.25 to 0.30
      badge: language === 'vi' ? 'Hoạt Động' : 'Active',
      badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
    },
    {
      icon: Coins,
      label: language === 'vi' ? 'Đa Dạng Token' : 'Token Diversity',
      value: walletData.tokenDiversity,
      unit: '',
      subtitle: language === 'vi' ? 'loại token' : 'tokens',
      weight: 20,
      contributedScore: Math.round(walletData.score * 0.20),
      badge: language === 'vi' ? 'Ổn Định' : 'Stable',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', // Changed from purple to cyan
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
    },
    {
      icon: Wallet,
      label: language === 'vi' ? 'Tổng Tài Sản' : 'Total Assets',
      value: formatAssets(walletData.totalAssets),
      unit: '',
      subtitle: 'USD',
      weight: 30, // Changed from 25% to 30%
      contributedScore: Math.round(walletData.score * 0.30), // Changed from 0.25 to 0.30
      badge: language === 'vi' ? 'Tốt' : 'Good',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20',
    },
  ];

  // Rating ranges for guide
  const ratingRanges = [
    { rating: 'AAA', range: '750-850', label: language === 'vi' ? 'Xuất Sắc' : 'Excellent', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
    { rating: 'AA', range: '700-749', label: language === 'vi' ? 'Rất Tốt' : 'Very Good', color: 'from-green-500 to-cyan-500', bgColor: 'bg-green-500/20', textColor: 'text-green-400', borderColor: 'border-green-500/30' },
    { rating: 'A', range: '650-699', label: language === 'vi' ? 'Tốt' : 'Good', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/30' },
    { rating: 'BBB', range: '600-649', label: language === 'vi' ? 'Khá' : 'Fair', color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30' },
    { rating: 'BB', range: '550-599', label: language === 'vi' ? 'Trung Bình' : 'Average', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400', borderColor: 'border-orange-500/30' },
    { rating: 'B-C', range: '< 550', label: language === 'vi' ? 'Cần Cải Thiện' : 'Needs Improvement', color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/20', textColor: 'text-red-400', borderColor: 'border-red-500/30' },
  ];

  // Optimization factors
  const optimizationFactors = [
    {
      icon: Clock,
      label: language === 'vi' ? 'Tuổi ví và thời gian sử dụng' : 'Wallet age and usage time',
      percentage: 20, // Changed from 30% to 20%
      color: 'text-cyan-400',
    },
    {
      icon: Activity,
      label: language === 'vi' ? 'Tần suất và khối lượng giao dịch' : 'Transaction frequency and volume',
      percentage: 30, // Changed from 25% to 30%
      color: 'text-blue-400',
    },
    {
      icon: Coins,
      label: language === 'vi' ? 'Đa dạng hóa tài sản token' : 'Token asset diversification',
      percentage: 20,
      color: 'text-purple-400',
    },
    {
      icon: Wallet,
      label: language === 'vi' ? 'Tổng tài sản' : 'Total assets',
      percentage: 30, // Changed from 25% to 30%
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Overview Grid */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
            📊 {language === 'vi' ? 'Tổng Quan Nhanh' : 'Quick Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${metric.iconBg} border border-slate-600/30`}>
                        <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                      </div>
                      <Badge className={`${metric.badgeColor} border text-xs px-2 py-0.5`}>
                        {metric.badge}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">{metric.label}</div>
                      <div className="text-sm text-gray-500">{metric.subtitle}</div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl ${metric.iconColor}`}>
                          {metric.value}
                        </div>
                        {metric.unit && (
                          <div className="text-xs text-gray-500">{metric.unit}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg ${metric.iconColor}`}>
                          {metric.contributedScore} {language === 'vi' ? 'điểm' : 'pts'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {language === 'vi' ? 'Đóng góp' : 'Contributes'} {metric.weight}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Credit Score */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-700/50 to-slate-800/80 backdrop-blur-sm border-2 border-cyan-500/30 rounded-xl p-6">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                  <Crown className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    {language === 'vi' ? 'Tổng Điểm Tín Dụng:' : 'Total Credit Score:'}
                  </div>
                  <div className="text-4xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {walletData.score}
                  </div>
                </div>
              </div>

              <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${rating.color} text-white shadow-lg`}>
                <div className="text-sm opacity-80">{rating.label}</div>
                <div className="text-3xl">{rating.text}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Details (Collapsible) */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowCalculationDetails(!showCalculationDetails)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <Info className="w-5 h-5" />
            <span className="font-medium">
              💡 {language === 'vi' ? 'Cách tính điểm Tín Dụng' : 'How Credit Score is Calculated'}
            </span>
          </div>
          {showCalculationDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showCalculationDetails && (
          <CardContent className="px-6 pb-6 pt-0 border-t border-slate-700/50">
            <div className="space-y-3 text-sm text-gray-300 mt-4">
              <p className="text-cyan-400">
                {language === 'vi'
                  ? 'Điểm được tính toán dựa trên việc phân tích dữ liệu blockchain với trọng số như sau:'
                  : 'Score is calculated based on blockchain data analysis with the following weights:'}
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <span className="text-cyan-400">{language === 'vi' ? 'Tuổi Ví' : 'Wallet Age'} (20%)</span>
                    {' - '}
                    {walletData.score} × 20% = {Math.round(walletData.score * 0.2)} {language === 'vi' ? 'điểm' : 'pts'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <span className="text-blue-400">{language === 'vi' ? 'Giao Dịch' : 'Transactions'} (30%)</span>
                    {' - '}
                    {walletData.score} × 30% = {Math.round(walletData.score * 0.3)} {language === 'vi' ? 'điểm' : 'pts'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    <span className="text-purple-400">{language === 'vi' ? 'Đa Dạng Token' : 'Token Diversity'} (20%)</span>
                    {' - '}
                    {walletData.score} × 20% = {Math.round(walletData.score * 0.2)} {language === 'vi' ? 'điểm' : 'pts'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>
                    <span className="text-green-400">{language === 'vi' ? 'Tổng Tài Sản' : 'Total Assets'} (30%)</span>
                    {' - '}
                    {walletData.score} × 30% = {Math.round(walletData.score * 0.3)} {language === 'vi' ? 'điểm' : 'pts'}
                  </span>
                </li>
              </ul>
              <p className="text-xs text-gray-400 italic pt-2 border-t border-slate-700/50">
                📊 {language === 'vi'
                  ? 'Tổng điểm càng cao → Đóng góp của mỗi yếu tố càng lớn'
                  : 'Higher total score → Greater contribution from each factor'}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Login & Register CTA - Side by Side */}
      {(onSubscribeClick || onRegisterClick) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Login Card - Blue */}
          {onSubscribeClick && (
            <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />

              <CardContent className="relative p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Left Section - Icon + Text + Badges */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30 flex-shrink-0">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-cyan-300 mb-1.5">
                        🔒 {language === 'vi' ? 'Xem Biểu Đồ Chi Tiết & Lịch Sử Giao Dịch' : 'View Detailed Charts & Transaction History'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2.5">
                        {language === 'vi'
                          ? 'Đăng nhập để mở khóa phân tích chuyên sâu - Không cần mật khẩu, chỉ cần email!'
                          : 'Login to unlock in-depth analysis - No password needed, just email!'}
                      </p>

                      {/* ✅ REMOVED: Feature Badges - User request */}
                    </div>
                  </div>

                  {/* Right Section - Login Button */}
                  <Button
                    onClick={onSubscribeClick}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 group flex-shrink-0 font-medium"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {language === 'vi' ? 'Đăng Nhập Ngay' : 'Login Now'}
                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Register Card - Orange */}
          {onRegisterClick && (
            <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-orange-500/20 rounded-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />

              <CardContent className="relative p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Left Section - Icon + Text + Badges */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-400/30 flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-orange-300 mb-1.5">
                        {language === 'vi' ? 'Bạn Chưa Có Tài Khoản?' : 'Don\'t Have Account?'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2.5">
                        {language === 'vi'
                          ? 'Đăng ký miễn phí để lưu ví, theo dõi điểm số và nhận thông báo - Hoàn toàn phi tập trung!'
                          : 'Register for free to save wallet, track score and get notifications - Fully decentralized!'}
                      </p>

                      {/* ✅ REMOVED: Feature Badges - User request */}
                    </div>
                  </div>

                  {/* Right Section - Register Button */}
                  <Button
                    onClick={onRegisterClick}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 group flex-shrink-0 font-medium"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {language === 'vi' ? 'Đăng Ký Ngay' : 'Register Now'}
                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Two Column Layout: Rating Guide + Optimization Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Guide */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              ⭐ {language === 'vi' ? 'Thang Xếp Hạng' : 'Rating Scale'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-3">
              {ratingRanges.map((item, index) => {
                // ✅ Only highlight when score > 0 AND matches the rating
                // For score = 0, rating.text is "N/A" which won't match any tier
                const isCurrentRating = walletData.score > 0 && item.rating === rating.text;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isCurrentRating
                        ? `${item.bgColor} ${item.borderColor} border-2 ring-2 ring-offset-2 ring-offset-slate-900 ${item.textColor.replace('text-', 'ring-')}`
                        : 'bg-slate-700/20 border-slate-600/30 hover:bg-slate-700/40'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${item.color} text-white font-bold text-sm min-w-[60px] text-center`}>
                        {item.rating}
                      </div>
                      <div>
                        <div className={`text-sm ${item.textColor}`}>{item.range}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                    </div>
                    {/* ✅ Only show 👈 when score > 0 AND it's the current rating */}
                    {isCurrentRating && (
                      <div className="text-xl">👈</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Factors */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              🚀 {language === 'vi' ? 'Các Yếu Tố Tối Ưu Điểm' : 'Score Optimization Factors'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              {optimizationFactors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg bg-slate-700/50 border border-slate-600/30`}>
                      <Icon className={`w-5 h-5 ${factor.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 mb-1">{factor.label}</div>
                      <div className="flex items-center gap-2">
                        <Progress value={factor.percentage} className="h-2 flex-1" />
                        <span className={`text-sm ${factor.color} min-w-[45px] text-right`}>
                          {factor.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-gray-400 text-center italic">
                  💡 {language === 'vi'
                    ? 'Điểm đưc tính toán tự động từ dữ liệu blockchain'
                    : 'Score is automatically calculated from blockchain data'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
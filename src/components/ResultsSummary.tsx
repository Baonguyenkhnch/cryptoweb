import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Calendar,
  Activity,
  Coins,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Mail
} from "lucide-react";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from "recharts";
import type { WalletAnalysis } from "../services/api";
import { useLanguage } from "../services/LanguageContext";

interface ResultsSummaryProps {
  data: WalletAnalysis;
  onLoginClick?: () => void;
}

export function ResultsSummary({ data, onLoginClick }: ResultsSummaryProps) {
  const { t, language } = useLanguage();

  // Validate data to prevent crashes
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>{language === 'vi' ? 'Không có dữ liệu để hiển thị' : 'No data to display'}</p>
      </div>
    );
  }

  const getRating = (score: number) => {
    if (score >= 750) return { text: "AAA", color: "from-green-400 to-emerald-400" };
    if (score >= 700) return { text: "AA", color: "from-blue-400 to-cyan-400" };
    if (score >= 650) return { text: "A", color: "from-cyan-400 to-teal-400" };
    if (score >= 600) return { text: "BBB", color: "from-yellow-400 to-amber-400" };
    if (score >= 550) return { text: "BB", color: "from-orange-400 to-red-400" };
    return { text: "B-C", color: "from-red-400 to-red-500" };
  };

  const rating = getRating(data.score);

  const stats = [
    {
      icon: Calendar,
      label: t.resultsSummary.walletAge,
      value: `${data.walletAge} ${t.resultsSummary.days}`,
      subtitle: `${(data.walletAge / 365).toFixed(1)} ${t.resultsSummary.years}`,
      color: "cyan",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      textColor: "text-cyan-400"
    },
    {
      icon: Activity,
      label: t.resultsSummary.totalTransactions,
      value: data.totalTransactions.toLocaleString(),
      subtitle: t.resultsSummary.transactions,
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400"
    },
    {
      icon: Coins,
      label: t.resultsSummary.tokenDiversity,
      value: data.tokenDiversity,
      subtitle: t.resultsSummary.typesToken,
      color: "purple",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400"
    },
    {
      icon: Wallet,
      label: t.resultsSummary.totalAssets,
      value: `$${data.totalAssets.toLocaleString()}`,
      subtitle: t.resultsSummary.usd,
      color: "green",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400"
    }
  ];

  const scorePercentage = (data.score / 850) * 100;

  // Determine assessment labels based on language
  const getWalletAgeAssessment = (age: number) => age > 365 ? (t.ratingGuide.ratings.a) : (t.ratingGuide.ratings.bb);
  const getTransactionAssessment = (txs: number) => txs > 100 ? (language === 'vi' ? 'Hoạt Động' : 'Active') : (language === 'vi' ? 'Ít' : 'Low');
  const getDiversityAssessment = (div: number) => div >= 5 ? (language === 'vi' ? 'Đa Dạng' : 'Diverse') : (language === 'vi' ? 'Hạn Chế' : 'Limited');
  const getAssetsAssessment = (assets: number) => assets > 1000 ? (language === 'vi' ? 'Cao' : 'High') : (language === 'vi' ? 'Thấp' : 'Low');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Main Score Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl rounded-xl md:rounded-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />

        <CardContent className="relative p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border-2 md:border-4 border-cyan-500/30 shadow-xl">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl text-white mb-1">{data.score}</div>
                  <div className="text-xs text-gray-400">/ 850</div>
                </div>
              </div>
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 md:px-4 py-0.5 md:py-1 rounded-full bg-gradient-to-r ${rating.color} text-white text-xs md:text-sm shadow-lg`}>
                {rating.text}
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-1 w-full">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-300">{t.resultsSummary.creditScore}</span>
                    <span className="text-sm md:text-base text-cyan-400">{scorePercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={scorePercentage} className="h-2 md:h-3" />
                </div>

                <div className="flex items-start gap-2 p-2 md:p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs md:text-sm text-gray-300">
                    {language === 'vi'
                      ? <>Điểm của bạn đã được tính toán dựa trên <span className="text-cyan-400">phân tích blockchain</span> và <span className="text-blue-400">hoạt động lịch sử ví</span></>
                      : <>Your score is calculated based on <span className="text-cyan-400">blockchain analysis</span> and <span className="text-blue-400">wallet activity history</span></>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Flowcharts - 2 mini infographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Flowchart 1: Score Calculation Flow */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
          <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="text-sm md:text-base text-white flex items-center gap-2">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              {t.resultsSummary.scoreBreakdown}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4 md:pb-6">
            {/* Flow steps */}
            <div className="relative space-y-1.5 md:space-y-2">
              {[
                { icon: "📊", label: language === 'vi' ? "Phân tích Blockchain" : "Blockchain Analysis", value: "On-chain data", color: "cyan" },
                { icon: "⚡", label: language === 'vi' ? "Tính toán AI" : "AI Calculation", value: "Smart algorithm", color: "blue" },
                { icon: "🎯", label: language === 'vi' ? "Điểm số cuối cùng" : "Final Score", value: `${data.score}/850`, color: "green" }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-cyan-500/40 transition-all">
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                      <span className="text-base md:text-lg">{step.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm text-gray-300 truncate">{step.label}</div>
                      <div className={`text-[10px] md:text-xs text-${step.color}-400`}>{step.value}</div>
                    </div>
                    <div className="text-cyan-400 text-lg md:text-xl flex-shrink-0">→</div>
                  </div>
                  {index < 2 && (
                    <div className="absolute left-6 md:left-7 top-full w-0.5 h-1.5 md:h-2 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: User Journey Progress */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden">
          <CardHeader className="pb-2 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="text-sm md:text-base text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              {t.resultsSummary.userJourney}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-4 md:px-6">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={18}
                data={[
                  { name: language === 'vi' ? "Tính điểm" : "Score Calc", value: 100, fill: "#10b981" },
                  { name: language === 'vi' ? "Đăng nhập" : "Login", value: 33, fill: "#06b6d4" },
                  { name: language === 'vi' ? "Khám phá" : "Explore", value: 0, fill: "#6366f1" }
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background={{ fill: "#1e293b" }}
                  dataKey="value"
                  cornerRadius={10}
                  label={false}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-1.5 md:space-y-2 mt-2">
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs text-gray-300 truncate">{language === 'vi' ? 'Tính điểm tín dụng' : 'Calculate credit score'}</div>
                  <div className="text-[10px] md:text-xs text-green-400">✅ {language === 'vi' ? 'Hoàn thành' : 'Completed'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg ring-1 ring-cyan-500/20">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-cyan-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs text-gray-300 truncate">{language === 'vi' ? 'Đăng nhập xem chi tiết' : 'Login for details'}</div>
                  <div className="text-[10px] md:text-xs text-cyan-400">🔓 {language === 'vi' ? 'Bước tiếp theo' : 'Next step'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-slate-700/20 border border-slate-600/20 rounded-lg">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-indigo-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs text-gray-400 truncate">{language === 'vi' ? 'Dashboard & phân tích' : 'Dashboard & analysis'}</div>
                  <div className="text-[10px] md:text-xs text-purple-400">📈 {language === 'vi' ? 'Sắp mở khóa' : 'Coming soon'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Table */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <CardHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            {language === 'vi' ? 'Tổng Quan Nhanh' : 'Quick Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-400">{language === 'vi' ? 'Chỉ Số' : 'Metric'}</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-400">{language === 'vi' ? 'Giá Trị' : 'Value'}</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-400 hidden sm:table-cell">{language === 'vi' ? 'Đánh Giá' : 'Assessment'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{t.resultsSummary.walletAge}</td>
                  <td className="py-3 px-4 text-right text-cyan-400">{data.walletAge} {t.resultsSummary.days}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${data.walletAge > 365 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {getWalletAgeAssessment(data.walletAge)}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{t.resultsSummary.transactions}</td>
                  <td className="py-3 px-4 text-right text-blue-400">{data.totalTransactions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${data.totalTransactions > 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {getTransactionAssessment(data.totalTransactions)}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{t.resultsSummary.tokenDiversity}</td>
                  <td className="py-3 px-4 text-right text-purple-400">{data.tokenDiversity}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${data.tokenDiversity >= 5 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {getDiversityAssessment(data.tokenDiversity)}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{t.resultsSummary.totalAssets}</td>
                  <td className="py-3 px-4 text-right text-green-400">${data.totalAssets.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${data.totalAssets > 1000 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {getAssetsAssessment(data.totalAssets)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA for more details - only show if not logged in */}
          {onLoginClick && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/40 rounded-2xl backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300 shadow-xl shadow-cyan-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {language === 'vi' ? 'Xem Biểu Đồ Chi Tiết & Lịch Sử Giao Dịch' : 'View Detailed Charts & Transaction History'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300 mb-4">
                    {language === 'vi'
                      ? 'Đăng nhập để mở khóa phân tích chuyên sâu - không cần mật khẩu, chỉ cần email'
                      : 'Login to unlock in-depth analysis - no password needed, just email'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-400 flex items-center gap-1">
                      <span>📊</span> <span>Token Diversity Charts</span>
                    </span>
                    <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400 flex items-center gap-1">
                      <span>📈</span> <span>Score Trend Analysis</span>
                    </span>
                    <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-400 flex items-center gap-1">
                      <span>💎</span> <span>Transaction History</span>
                    </span>
                    <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1">
                      <span>📧</span> <span>Email Updates</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLoginClick}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 whitespace-nowrap group"
                >
                  <span className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span className="text-base">{language === 'vi' ? 'Đăng Nhập Ngay' : 'Login Now'}</span>
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
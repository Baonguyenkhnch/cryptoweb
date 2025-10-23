import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Info, TrendingUp } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

export function RatingGuide() {
  const { t } = useLanguage();
  
  const ratings = [
    { rating: "AAA", range: "750-850", desc: t.ratingGuide.ratings.aaa, color: "from-green-400 to-emerald-400" },
    { rating: "AA", range: "700-749", desc: t.ratingGuide.ratings.aa, color: "from-blue-400 to-cyan-400" },
    { rating: "A", range: "650-699", desc: t.ratingGuide.ratings.a, color: "from-cyan-400 to-teal-400" },
    { rating: "BBB", range: "600-649", desc: t.ratingGuide.ratings.bbb, color: "from-yellow-400 to-amber-400" },
    { rating: "BB", range: "550-599", desc: t.ratingGuide.ratings.bb, color: "from-orange-400 to-red-400" },
    { rating: "B-C", range: "< 550", desc: t.ratingGuide.ratings.bc, color: "from-red-400 to-red-500" }
  ];

  const factors = [
    { icon: "📅", text: t.ratingGuide.factors.walletHistory, weight: t.ratingGuide.weights.walletHistory },
    { icon: "💱", text: t.ratingGuide.factors.transactionFreq, weight: t.ratingGuide.weights.transactionFreq },
    { icon: "🎯", text: t.ratingGuide.factors.assetDiversity, weight: t.ratingGuide.weights.assetDiversity },
    { icon: "💰", text: t.ratingGuide.factors.portfolioValue, weight: t.ratingGuide.weights.portfolioValue }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rating Scale */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            {t.ratingGuide.ratingScale}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratings.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-sm min-w-[60px] text-center`}>
                    {item.rating}
                  </div>
                  <span className="text-gray-400 text-sm">{item.range}</span>
                </div>
                <span className="text-gray-300 text-sm">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Factors */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            {t.ratingGuide.scoringFactors}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {factors.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
                <span className="text-cyan-400 text-sm">{item.weight}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              💡 {t.ratingGuide.autoCalculated}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Mail, Bell, Zap, CheckCircle2, Shield } from "lucide-react";
import { useLanguage } from "../services/LanguageContext";

interface EmailSubscriptionCTAProps {
  onSubscribe: () => void;
  isSubscribed: boolean;
}

export function EmailSubscriptionCTA({ onSubscribe, isSubscribed }: EmailSubscriptionCTAProps) {
  const { t } = useLanguage();

  if (isSubscribed) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl border border-green-500/30 shadow-2xl rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl" />

        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-400/50">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl text-white mb-2">{t.emailSubscription.subscribed.title}</h3>
              <p className="text-gray-300">
                {t.emailSubscription.subscribed.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl border border-cyan-500/30 shadow-2xl rounded-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />

      <CardContent className="relative p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - CTA */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-400/30">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl text-white">{t.emailSubscription.cta.title}</h3>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              {t.emailSubscription.cta.description}
            </p>

            <Button
              onClick={onSubscribe}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300 rounded-xl group"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>{t.emailSubscription.cta.button}</span>
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
              </div>
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400">{t.emailSubscription.cta.privacy}</span>
              <span>• {t.emailSubscription.cta.emailUse}</span>
            </div>
          </div>

          {/* Right side - Benefits */}
          <div className="space-y-4">
            <div className="text-cyan-300 mb-4">{t.emailSubscription.benefits.title}</div>

            {[
              {
                icon: Bell,
                title: t.emailSubscription.benefits.notification.title,
                desc: t.emailSubscription.benefits.notification.desc,
              },
              {
                icon: Zap,
                title: t.emailSubscription.benefits.analysis.title,
                desc: t.emailSubscription.benefits.analysis.desc,
              },
              {
                icon: Shield,
                title: t.emailSubscription.benefits.security.title,
                desc: t.emailSubscription.benefits.security.desc,
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-800/40 backdrop-blur-sm rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                >
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 flex-shrink-0">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm mb-1">{benefit.title}</div>
                    <div className="text-gray-400 text-xs">{benefit.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
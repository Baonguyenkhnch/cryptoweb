import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Lightbulb, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../services/LanguageContext";
import { CaptchaDialog } from "./CaptchaDialog";
import { submitFeedback } from "../services/api-real";

interface FeatureFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureFeedbackDialog({
  open,
  onOpenChange,
}: FeatureFeedbackDialogProps) {
  const { t } = useLanguage();
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmitClick = () => {
    // Validate first
    if (!featureName.trim()) {
      setError(t.featureFeedback.errors.nameRequired);
      return;
    }
    if (!description.trim()) {
      setError(t.featureFeedback.errors.descriptionRequired);
      return;
    }
    if (!email.trim()) {
      setError(t.featureFeedback.errors.emailRequired);
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.featureFeedback.errors.emailInvalid);
      return;
    }

    // Show CAPTCHA if validation passes
    setError("");
    setShowCaptcha(true);
  };

  const handleCaptchaVerified = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await submitFeedback({
        feature_name: featureName.trim(),
        description: description.trim(),
        email: email.trim(),
      });

      if (!result.success) {
        setError(result.message || t.featureFeedback.errors.submitError);
        return;
      }

      // Show toast notification
      toast.success(t.featureFeedback.success.toastTitle, {
        description: result.message || t.featureFeedback.success.toastDescription,
      });

      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(t.featureFeedback.errors.submitError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFeatureName("");
    setDescription("");
    setEmail("");
    setError("");
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
        {!showSuccess ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-0">
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                    <Lightbulb className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <DialogTitle className="text-center text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t.featureFeedback.title}
              </DialogTitle>

              <DialogDescription className="text-center text-gray-300 text-sm mt-1">
                {t.featureFeedback.subtitle}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] px-6">
              <div className="space-y-4 py-4">
                {/* Feature Name */}
                <div className="space-y-2">
                  <Label htmlFor="feature-name" className="text-gray-300 text-sm">
                    {t.featureFeedback.featureName} <span className="text-red-400">{t.featureFeedback.required}</span>
                  </Label>
                  <Input
                    id="feature-name"
                    placeholder={t.featureFeedback.featureNamePlaceholder}
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500 h-10 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 text-sm">
                    {t.featureFeedback.description} <span className="text-red-400">{t.featureFeedback.required}</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t.featureFeedback.descriptionPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500 min-h-[80px] resize-none text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-400">
                    {description.length} / 500 {t.featureFeedback.charactersCount}
                  </p>
                </div>

                {/* Email (Required) */}
                <div className="space-y-2">
                  <Label htmlFor="feedback-email" className="text-gray-300 text-sm">
                    {t.featureFeedback.emailResponseLabel} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder={t.featureFeedback.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-purple-500/30 focus:border-purple-400 text-white placeholder:text-gray-500 h-10 text-sm"
                  />
                  <p className="text-xs text-gray-400">
                    {t.featureFeedback.emailResponseHint}
                  </p>
                </div>

                {/* Benefits Info - Compact */}
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      <div className="mb-1">{t.featureFeedback.benefits.title}</div>
                      <ul className="ml-3 space-y-0.5 text-gray-400 text-[11px]">
                        <li>✓ {t.featureFeedback.benefits.review}</li>
                        <li>✓ {t.featureFeedback.benefits.priority}</li>
                        <li>✓ {t.featureFeedback.benefits.notification}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex gap-3 px-6 pt-4 pb-6">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white h-10 text-sm"
              >
                {t.featureFeedback.buttons.cancel}
              </Button>

              <Button
                onClick={handleSubmitClick}
                disabled={!featureName.trim() || !description.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 h-10 text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.featureFeedback.buttons.submitting}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {t.featureFeedback.buttons.submit}
                  </div>
                )}
              </Button>
            </div>
          </>
        ) : (
          // Success state - Compact
          <div className="py-8 text-center space-y-3 px-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <CheckCircle2 className="relative w-12 h-12 text-purple-400" />
              </div>
            </div>

            <div>
              <h3 className="text-xl text-white mb-1.5">{t.featureFeedback.success.title}</h3>
              <p className="text-gray-300 text-sm">
                {t.featureFeedback.success.description}
              </p>
              <p className="text-purple-400 mt-1 text-sm">
                {t.featureFeedback.success.message}
              </p>
            </div>

            <div className="text-xs text-gray-400 pt-2">
              {t.featureFeedback.success.autoClose}
            </div>
          </div>
        )}
      </DialogContent>

      {/* CAPTCHA Dialog */}
      <CaptchaDialog
        open={showCaptcha}
        onOpenChange={setShowCaptcha}
        onVerified={handleCaptchaVerified}
        title="Xác Minh Trước Khi Gửi"
      />
    </Dialog>
  );
}
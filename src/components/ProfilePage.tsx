/**
 * ============================================
 * TRANG PROFILE NGƯỜI DÙNG
 * ============================================
 * Component này cho phép người dùng:
 * - Xem thông tin cá nhân
 * - Chỉnh sửa profile (tên, email, avatar)
 * - Quản lý wallet addresses
 * - Xem thống kê tổng quan
 * 
 * CÁCH SỬ DỤNG:
 * import { ProfilePage } from './components/ProfilePage';
 * <ProfilePage user={currentUser} onUpdateProfile={handleUpdate} />
 * ============================================
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Mail,
  Wallet,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Copy,
  Check,
  TrendingUp,
  Award,
  Activity,
  Clock,
  ArrowLeft,
  Home,
  QrCode,
  Download
} from "lucide-react";
import type { UserProfile } from "../services/api-real";
import type { WalletAnalysis } from "../services/api-real"; // ✅ NEW: Import WalletAnalysis type
import { updateUserProfile, formatWalletAddress } from "../services/api-real";
import { useLanguage } from "../services/LanguageContext";
import { copyToClipboard } from "./ui/utils";
import { EmailChangeDialog } from "./EmailChangeDialog"; // ✅ NEW
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { maskEmail } from "../utils/maskEmail"; // ✅ NEW: Import maskEmail utility
import QRCodeStyling from "qrcode"; // ✅ NEW: QR Code library
import { VerifiedQRCode } from "./VerifiedQRCode"; // ✅ NEW: QR Code component

// ============================================
// TYPES
// ============================================

interface ProfilePageProps {
  user: UserProfile;
  walletData?: WalletAnalysis | null; // ✅ NEW: Add walletData prop
  onUpdateProfile?: (updatedUser: UserProfile) => void;
  onBack?: () => void;
}

// ============================================
// MOCK STATS DATA
// ============================================

const MOCK_PROFILE_STATS = {
  totalScoreChecks: 47,
  averageScore: 765,
  highestScore: 820,
  daysActive: 89,
  lastScoreCheck: "2 giờ trước"
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ProfilePage({ user, walletData, onUpdateProfile, onBack }: ProfilePageProps) {
  // Language context
  const { t, language } = useLanguage();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state (wallet address không cho edit)
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
  });

  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedWallet, setCopiedWallet] = useState(false);

  // ✅ NEW: Email change verification
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState("");

  // ============================================
  // HANDLERS
  // ============================================

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Copy wallet address to clipboard
  const handleCopyWallet = async () => {
    const success = await copyToClipboard(user.walletAddress);
    // Show copied state regardless of success for better UX
    // (the fallback methods usually work even if modern API is blocked)
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
    });
    setIsEditing(false);
    setShowError(false);
  };

  // Save profile changes
  const handleSave = async () => {
    setShowError(false);
    setShowSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage(t.profile.messages.nameRequired);
      setShowError(true);
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage(t.profile.messages.emailInvalid);
      setShowError(true);
      return;
    }

    // ✅ CHECK: Email đã thay đổi? → Yêu cầu verification
    const emailChanged = formData.email !== user.email;

    if (emailChanged) {
      console.log("📧 Email change detected! Opening verification dialog...");
      setPendingEmailChange(formData.email);
      setShowEmailChangeDialog(true);
      return; // Stop here - Wait for verification
    }

    // ✅ NO EMAIL CHANGE: Save name only
    setIsSaving(true);

    try {
      // Gọi API để update profile (chỉ name vì email không đổi)
      const updatedUser = await updateUserProfile(user.id, {
        name: formData.name,
        email: user.email, // Keep original email
      });

      // Success
      setShowSuccess(true);
      setIsEditing(false);
      onUpdateProfile?.(updatedUser);

      // Hide success message after 2s (shorter duration)
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      setErrorMessage(t.profile.messages.updateError);
      setShowError(true);
      console.error("Update profile error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ NEW: Handle email verification success
  const handleEmailVerified = async () => {
    console.log("✅ Email verified! Updating profile with new email...");
    setIsSaving(true);

    try {
      // Now update with the new verified email
      const updatedUser = await updateUserProfile(user.id, {
        name: formData.name,
        email: pendingEmailChange,
      });

      // Success
      setShowSuccess(true);
      setIsEditing(false);
      setPendingEmailChange("");
      onUpdateProfile?.(updatedUser);

      // Hide success message after 2s
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      setErrorMessage(t.profile.messages.updateError);
      setShowError(true);
      console.error("Update profile with new email error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    // Use first and last char of wallet address
    if (user.walletAddress && user.walletAddress.length > 2) {
      return (user.walletAddress.slice(2, 4)).toUpperCase();
    }
    return "W";
  };

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

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        {/* Back Button - Prominent on mobile */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 w-full md:w-auto shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <Home className="w-4 h-4 mr-1.5" />
            {t.profile.back}
          </Button>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl mb-1 md:mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent leading-tight">
              {t.profile.title}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">{t.profile.subtitle}</p>
          </div>
        </div>

        {/* REMOVED: Large Alert notifications - Now using inline verification */}

        {/* Error Alert - Keep as fallback for critical errors */}
        {showError && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-400">
            <X className="w-4 h-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-cyan-600 to-blue-600" />

              <CardContent className="relative pt-0 pb-6">
                {/* Avatar */}
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-slate-800 shadow-xl">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800" />
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-3">
                  <div>
                    <h2 className="text-2xl text-white font-mono">{formatWalletAddress(user.walletAddress)}</h2>
                    <p className="text-gray-400 text-sm">{user.email ? maskEmail(user.email) : t.profile.fields.noEmail}</p>
                  </div>

                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30">
                    <Award className="w-3 h-3 mr-1" />
                    {t.profile.badges.member}
                  </Badge>
                </div>

                <Separator className="my-4 bg-slate-700/50" />

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t.profile.stats.joined}
                    </span>
                    <span className="text-gray-300">{formatDate(user.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t.profile.stats.active}
                    </span>
                    <span className="text-gray-300">{MOCK_PROFILE_STATS.daysActive} {t.profile.stats.days}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {t.profile.stats.totalChecks}
                    </span>
                    <span className="text-gray-300">{MOCK_PROFILE_STATS.totalScoreChecks} {t.profile.stats.times}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t.profile.stats.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-cyan-500/20">
                  <div className="text-gray-400 text-xs mb-1">{t.profile.stats.averageScore}</div>
                  <div className="text-2xl text-cyan-400">
                    {walletData ? walletData.score : "---"}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
                  <div className="text-gray-400 text-xs mb-1">{t.profile.stats.highestScore}</div>
                  <div className="text-2xl text-emerald-400">
                    {walletData ? walletData.score : "---"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ QR Code Card */}
            {/* <VerifiedQRCode
              user={user}
              walletData={walletData ?? null}
              isVerified={true}
              hasNFT={true}
            /> */}
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <User className="w-6 h-6 text-cyan-400" />
                      {t.profile.details.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {isEditing ? t.profile.editing : t.profile.details.viewandfix}
                    </CardDescription>
                  </div>

                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t.profile.edit}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 p-1">
                    <TabsTrigger
                      value="personal"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 text-gray-400 hover:text-gray-300 transition-all duration-300"
                    >
                      {t.profile.tabs.personal}
                    </TabsTrigger>
                    <TabsTrigger
                      value="wallet"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 text-gray-400 hover:text-gray-300 transition-all duration-300"
                    >
                      {t.profile.tabs.wallet}
                    </TabsTrigger>
                    <TabsTrigger
                      value="qrcode"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 text-gray-400 hover:text-gray-300 transition-all duration-300"
                    >
                      <QrCode className="w-4 h-4 mr-1.5" />
                      Mã QR
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Personal Info */}
                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-400" />
                          {t.profile.fields.name}
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-slate-900/50 border-cyan-500/30 text-white ${isEditing ? "focus:border-cyan-400" : "opacity-70"
                            }`}
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-400" />
                          {t.profile.fields.email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-slate-900/50 border-cyan-500/30 text-white ${isEditing ? "focus:border-cyan-400" : "opacity-70"
                            }`}
                        />
                      </div>

                      {/* Account Created */}
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          {t.profile.fields.createdAt}
                        </Label>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30 text-gray-400 cursor-not-allowed">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>

                      {/* Last Login */}
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          {t.profile.fields.lastLogin}
                        </Label>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30 text-gray-400 cursor-not-allowed">
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="space-y-3 pt-4">
                        <div className="flex gap-3">
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                {t.profile.saving}
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                {t.profile.save}
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            disabled={isSaving}
                            variant="outline"
                            className="flex-1 bg-slate-900/50 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t.navigation.cancel || "Hủy"}
                          </Button>
                        </div>

                        {/* Inline Success Message - Compact verification */}
                        {showSuccess && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm animate-in fade-in-0 slide-in-from-top-2 duration-300">
                            <Check className="w-4 h-4" />
                            <span>✓ Đã lưu thành công</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Wallet & Security */}
                  <TabsContent value="wallet" className="space-y-6 mt-6">
                    {/* Wallet Address - READ ONLY */}
                    <div className="space-y-2">
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                        {t.profile.fields.wallet}
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 bg-slate-900/50 rounded-lg border border-cyan-500/30 text-cyan-400 font-mono break-all">
                          {user.walletAddress || t.profile.messages.walletSavedAddress}
                        </div>
                        <Button
                          onClick={handleCopyWallet}
                          variant="outline"
                          className="bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                          disabled={!user.walletAddress}
                        >
                          {copiedWallet ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {copiedWallet ? t.profile.wallet.copied : t.profile.security.autosave}
                      </p>
                    </div>

                    {/* Security Badge */}
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-green-400 mb-1">{t.profile.security.title}</div>
                          <div className="text-gray-400 text-sm">
                            {t.profile.security.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                        <div className="text-gray-400 text-sm mb-2">{t.profile.stats.checks}</div>
                        <div className="text-3xl text-cyan-400">{MOCK_PROFILE_STATS.totalScoreChecks}</div>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-blue-500/20">
                        <div className="text-gray-400 text-sm mb-2">{t.profile.stats.lastCheck}</div>
                        <div className="text-lg text-blue-400">{MOCK_PROFILE_STATS.lastScoreCheck}</div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: QR Code */}
                  <TabsContent value="qrcode" className="space-y-6 mt-6">
                    {/* QR Code Card */}
                    <VerifiedQRCode
                      user={user}
                      walletData={walletData ?? null}
                      isVerified={true}
                      hasNFT={true}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ✅ Email Change Verification Dialog */}
        <EmailChangeDialog
          open={showEmailChangeDialog}
          onOpenChange={setShowEmailChangeDialog}
          currentEmail={user.email}
          newEmail={pendingEmailChange}
          onVerifySuccess={handleEmailVerified}
        />
      </div>
    </div>
  );
}
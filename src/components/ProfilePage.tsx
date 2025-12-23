/**
 * ============================================
 * PROFILE PAGE COMPONENT
 * ============================================
 * Trang profile với 3 tabs:
 * - Personal Info
 * - Wallet & Security
 * - QR Code (hiển thị khi verified + NFT minted)
 * ============================================
 */

import { useState, useEffect } from "react";
import { useLanguage } from "../services/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Activity,
  QrCode
} from "lucide-react";
import type { UserProfile, WalletAnalysis } from "../services/api-real";
import { VerifiedQRCode } from "./VerifiedQRCode";

interface ProfilePageProps {
  user: UserProfile;
  walletData: WalletAnalysis | null;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
}

// Translations
const translations = {
  en: {
    profile: {
      title: "My Profile",
      subtitle: "Manage your account information",
      editing: "Editing mode enabled",
      details: {
        title: "Profile Details",
        viewandfix: "View and update your information"
      },
      tabs: {
        personal: "Personal Info",
        wallet: "Wallet & Security"
      },
      fields: {
        name: "Full Name",
        email: "Email Address",
        wallet: "Wallet Address",
        createdAt: "Account Created",
        lastLogin: "Last Login"
      },
      buttons: {
        edit: "Edit Profile",
        save: "Save Changes",
        cancel: "Cancel"
      },
      stats: {
        title: "Quick Stats",
        score: "Credit Score",
        rating: "Rating",
        walletAge: "Wallet Age",
        transactions: "Total Transactions"
      },
      security: {
        title: "Security Status",
        verified: "Verified Account",
        notVerified: "Not Verified",
        verifiedMsg: "Your account has been verified and secured."
      },
      walletStats: {
        totalAssets: "Total Assets",
        tokenDiversity: "Token Diversity",
        defiInteraction: "DeFi Interaction",
        nftHoldings: "NFT Holdings"
      }
    }
  },
  vi: {
    profile: {
      title: "Hồ Sơ Của Tôi",
      subtitle: "Quản lý thông tin tài khoản",
      editing: "Đang chỉnh sửa",
      details: {
        title: "Thông Tin Chi Tiết",
        viewandfix: "Xem và cập nhật thông tin của bạn"
      },
      tabs: {
        personal: "Cá Nhân",
        wallet: "Ví & Bảo Mật"
      },
      fields: {
        name: "Họ và Tên",
        email: "Địa Chỉ Email",
        wallet: "Địa Chỉ Ví",
        createdAt: "Ngày Tạo Tài Khoản",
        lastLogin: "Lần Đăng Nhập Cuối"
      },
      buttons: {
        edit: "Chỉnh Sửa",
        save: "Lưu Thay Đổi",
        cancel: "Hủy"
      },
      stats: {
        title: "Thống Kê Nhanh",
        score: "Điểm Tín Dụng",
        rating: "Xếp Hạng",
        walletAge: "Tuổi Ví",
        transactions: "Tổng Giao Dịch"
      },
      security: {
        title: "Trạng Thái Bảo Mật",
        verified: "Đã Xác Thực",
        notVerified: "Chưa Xác Thực",
        verifiedMsg: "Tài khoản của bạn đã được xác thực và bảo mật"
      },
      walletStats: {
        totalAssets: "Tổng Tài Sản",
        tokenDiversity: "Đa Dạng Token",
        defiInteraction: "Tương Tác DeFi",
        nftHoldings: "NFT Holdings"
      }
    }
  }
};

export function ProfilePage({ user, walletData, onUpdateProfile }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Lấy ngôn ngữ và object dịch từ context toàn cục
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    setFormData({
      name: user.name || "",
      email: user.email || ""
    });
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!onUpdateProfile) return;

    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || ""
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1419]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-24 pb-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.profile.title}
          </h1>
          <p className="text-gray-400">
            {t.profile.subtitle}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
              <CardContent className="pt-0 -mt-12 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl shadow-2xl border-4 border-slate-800 mb-4">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                </div>
                <h2 className="text-2xl text-white mb-1">
                  {user.name || "Anonymous"}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {user.email || "No email provided"}
                </p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t.profile.security.verified}
                </Badge>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t.profile.stats.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.profile.stats.score}</span>
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {walletData ? walletData.score : "---"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.profile.stats.rating}</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {walletData ? walletData.rating : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.profile.stats.walletAge}</span>
                  <div className="text-white">
                    {walletData ? `${walletData.walletAge} days` : "---"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.profile.stats.transactions}</span>
                  <div className="text-white">
                    {walletData ? walletData.totalTransactions : "---"}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t.profile.buttons.edit}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {t.profile.buttons.save}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t.profile.buttons.cancel}
                      </Button>
                    </div>
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

                      {/* Account Info (Read-only) */}
                      <div className="pt-4 border-t border-cyan-500/20 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            {t.profile.fields.createdAt}
                          </Label>
                          <div className="text-white bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-2">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            {t.profile.fields.lastLogin}
                          </Label>
                          <div className="text-white bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-2">
                            {formatDate(user.lastLogin)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: Wallet & Security */}
                  <TabsContent value="wallet" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      {/* Wallet Address */}
                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-cyan-400" />
                          {t.profile.fields.wallet}
                        </Label>
                        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-3 text-white font-mono text-sm break-all">
                          {user.walletAddress}
                        </div>
                      </div>

                      {/* Security Badge */}
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-green-400 mb-1">
                              {t.profile.security.title}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Tài khoản của bạn đã được xác thực và bảo mật
                            </div>
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                      </div>

                      {/* Wallet Stats */}
                      {walletData && (
                        <div className="pt-4 border-t border-cyan-500/20 grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                            <div className="text-gray-400 text-sm mb-1">{t.profile.walletStats.totalAssets}</div>
                            <div className="text-2xl text-white font-bold">
                              ${walletData.totalAssets.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                            <div className="text-gray-400 text-sm mb-1">{t.profile.walletStats.tokenDiversity}</div>
                            <div className="text-2xl text-white font-bold">
                              {walletData.tokenDiversity}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                            <div className="text-gray-400 text-sm mb-1">{t.profile.walletStats.defiInteraction}</div>
                            <div className="text-2xl text-white font-bold">
                              {walletData.defiInteraction}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
                            <div className="text-gray-400 text-sm mb-1">{t.profile.walletStats.nftHoldings}</div>
                            <div className="text-2xl text-white font-bold">
                              {walletData.nftHoldings}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab: QR Code */}
                  <TabsContent value="qrcode" className="mt-6">
                    <VerifiedQRCode
                      user={user}
                      walletData={walletData}
                      isVerified={true}
                      hasNFT={true}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


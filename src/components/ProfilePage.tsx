/**
 * ============================================
 * PROFILE PAGE COMPONENT
 * ============================================
 * Trang profile với 2 tabs:
 * - Cá Nhân (Personal Info)
 * - Ví & Bảo Mật (Wallet & Security) - KHÔNG có QR Code
 * ============================================
 */

import { useState, useEffect } from "react";
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
  Activity,
  Eye,
  EyeOff,
  KeyRound
} from "lucide-react";
import type { UserProfile, WalletAnalysis } from "../services/api-real";
import { useLanguage } from "../services/LanguageContext";
import { EmailChangeModal } from "./EmailChangeModal";

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
      editing: "Editing mode",
      details: {
        title: "Profile Details",
        viewandfix: "View and update your information"
      },
      tabs: {
        personal: "Personal",
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
        cancel: "Cancel",
        show: "Show",
        hide: "Hide"
      },
      stats: {
        title: "Quick Stats",
        score: "Credit Score",
        rating: "Rating",
        walletAge: "Wallet Age",
        transactions: "Total Transactions"
      },
      security: {
        verified: "Verified"
      },
      wallet: {
        title: "Wallet Information",
        address: "Wallet Address"
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
        cancel: "Hủy",
        show: "Hiện",
        hide: "Ẩn"
      },
      stats: {
        title: "Thống Kê Nhanh",
        score: "Điểm Tín Dụng",
        rating: "Xếp Hạng",
        walletAge: "Tuổi Ví",
        transactions: "Tổng Giao Dịch"
      },
      security: {
        verified: "Đã Xác Thực"
      },
      wallet: {
        title: "Thông Tin Ví",
        address: "Địa Chỉ Ví"
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
  const [showWalletAddress, setShowWalletAddress] = useState(false);

  // Get language from context
  const { language } = useLanguage();
  const t = translations[language].profile;

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

  const maskWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
            {t.title}
          </h1>
          <p className="text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Main Grid - 2 Columns */}
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
                  {t.security.verified}
                </Badge>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t.stats.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.stats.score}</span>
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {walletData ? walletData.score : "---"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.stats.rating}</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {walletData ? walletData.rating : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.stats.walletAge}</span>
                  <div className="text-white">
                    {walletData ? `${walletData.walletAge} days` : "---"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t.stats.transactions}</span>
                  <div className="text-white">
                    {walletData ? walletData.totalTransactions : "---"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs with Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-cyan-400" />
                  {t.details.title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {t.details.viewandfix}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 p-1 rounded-xl mb-6">
                    <TabsTrigger
                      value="personal"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t.tabs.personal}
                    </TabsTrigger>
                    <TabsTrigger
                      value="wallet"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {t.tabs.wallet}
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Cá Nhân */}
                  <TabsContent value="personal" className="space-y-6">
                    {/* Edit Button */}
                    <div className="flex justify-end">
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          {t.buttons.edit}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t.buttons.save}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t.buttons.cancel}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Personal Info Fields */}
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-400" />
                          {t.fields.name}
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
                          {t.fields.email}
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
                            {t.fields.createdAt}
                          </Label>
                          <div className="text-white bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-2">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            {t.fields.lastLogin}
                          </Label>
                          <div className="text-white bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-2">
                            {formatDate(user.lastLogin)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: Ví & Bảo Mật */}
                  <TabsContent value="wallet" className="space-y-6">
                    {/* Wallet Address */}
                    <div className="space-y-2">
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                        {t.wallet.address}
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg px-4 py-3 text-white font-mono text-sm break-all">
                          {showWalletAddress ? user.walletAddress : maskWalletAddress(user.walletAddress)}
                        </div>
                        <Button
                          onClick={() => setShowWalletAddress(!showWalletAddress)}
                          variant="outline"
                          size="icon"
                          className="bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          {showWalletAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Wallet Stats from walletData */}
                    {walletData && (
                      <div className="space-y-4 pt-4 border-t border-cyan-500/20">
                        <h3 className="text-lg text-white font-semibold">{t.wallet.title}</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">{t.stats.score}</div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                              {walletData.score}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">{t.stats.rating}</div>
                            <div className="text-xl font-bold text-white">
                              {walletData.rating}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">{t.stats.walletAge}</div>
                            <div className="text-xl font-bold text-white">
                              {walletData.walletAge} days
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-1">{t.stats.transactions}</div>
                            <div className="text-xl font-bold text-white">
                              {walletData.totalTransactions}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
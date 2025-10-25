import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  TrendingUp,
  Wallet,
  User as UserIcon,
  LogOut,
  Shield,
  Settings,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import type { UserProfile } from "../services/api";
import { formatWalletAddress } from "../services/api";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../services/LanguageContext";
import logoIcon from "../components/images/logonhap.jpg";
import logoFull from "../components/images/logodash.jpg";

type Page = "login" | "calculator" | "dashboard" | "profile";

interface NavigationProps {
  currentPage: Page;
  user: UserProfile;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Navigation({ currentPage, user, onNavigate, onLogout }: NavigationProps) {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    {
      id: "dashboard" as Page,
      label: t.nav.dashboard,
      icon: TrendingUp,
      color: "cyan",
    },
    {
      id: "calculator" as Page,
      label: t.nav.calculator,
      icon: Wallet,
      color: "blue",
    },
    {
      id: "profile" as Page,
      label: t.nav.profile,
      icon: UserIcon,
      color: "teal",
    },
  ];

  const getUserInitials = () => {
    // Use wallet address for initials
    if (user.walletAddress && user.walletAddress.length > 2) {
      return (user.walletAddress.slice(2, 4)).toUpperCase();
    }
    if (user.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-900/90 border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {/* MigoFin Logo */}
            <div className="relative group cursor-pointer" onClick={() => handleNavigate("dashboard")}>
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-0.5 overflow-hidden hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-red-500/5 transition-all duration-300">
                {/* Gradient border effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-xl blur-md group-hover:blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300" />
                
                {/* White background container for both logos */}
                <div className="relative bg-white rounded-lg overflow-hidden flex items-center gap-2 px-2 py-1.5">
                  {/* Logo Icon - Always visible */}
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <img 
                      src={logoIcon} 
                      alt="MigoFin" 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Logo Text - Hidden on mobile, visible on sm+ */}
                  {/* Only show text logo in authenticated pages (dashboard/profile) */}
                  {(currentPage === 'dashboard' || currentPage === 'profile') && (
                    <div className="hidden sm:flex items-center">
                      <img 
                        src={logoFull} 
                        alt="MigoFin" 
                        className="h-5 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="relative group px-4 py-2"
                  >
                    {/* Active background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30 animate-in fade-in-0 duration-300" />
                    )}
                    
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300" />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-2">
                      <Icon className={`w-4 h-4 transition-all duration-300 ${
                        isActive 
                          ? "text-cyan-400 scale-110" 
                          : "text-gray-400 group-hover:text-cyan-400 group-hover:scale-110"
                      }`} />
                      <span className={`transition-all duration-300 ${
                        isActive 
                          ? "text-cyan-300" 
                          : "text-gray-400 group-hover:text-cyan-300"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute -bottom-5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-in fade-in-0 slide-in-from-top-2 duration-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher - Always visible on all screen sizes */}
            <LanguageSwitcher size="sm" />

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
                    {/* Hover glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative flex items-center gap-3">
                      <Avatar className="w-8 h-8 ring-2 ring-cyan-500/30 group-hover:ring-cyan-400/50 transition-all duration-300">
                        <AvatarImage src={user.avatar} alt={user.walletAddress} />
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="hidden lg:block text-left">
                        <div className="text-sm text-cyan-400 leading-none font-mono">
                          {user.walletAddress ? formatWalletAddress(user.walletAddress) : "No Wallet"}
                        </div>
                        <div className="text-xs text-gray-500 leading-none mt-1">AAA Member</div>
                      </div>
                      
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-slate-900/95 backdrop-blur-xl border-cyan-500/20 rounded-xl shadow-2xl shadow-cyan-500/10"
                >
                  <DropdownMenuLabel className="text-gray-400">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online
                    </div>
                    <div className="text-xs text-gray-500 font-normal">{user.email}</div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-slate-700/50" />
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigate("profile")}
                    className="cursor-pointer text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 focus:bg-cyan-500/10 focus:text-cyan-400"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigate("dashboard")}
                    className="cursor-pointer text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 focus:bg-blue-500/10 focus:text-blue-400"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer text-gray-300 hover:text-teal-400 hover:bg-teal-500/10 focus:bg-teal-500/10 focus:text-teal-400"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-700/50" />
                  
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative p-2 rounded-xl bg-slate-800/50 border border-cyan-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top-4 fade-in-0 duration-300">
            <div className="space-y-2 pt-4 border-t border-cyan-500/20">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20 mb-4">
                <Avatar className="w-12 h-12 ring-2 ring-cyan-500/30">
                  <AvatarImage src={user.avatar} alt={user.walletAddress} />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm text-cyan-400 font-mono">
                    {user.walletAddress ? formatWalletAddress(user.walletAddress) : "No Wallet"}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

              {/* Navigation Links */}
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300"
                        : "bg-slate-800/30 border border-slate-700/30 text-gray-400 hover:bg-slate-800/50 hover:text-cyan-400 hover:border-cyan-500/30"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : ""}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-300 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>{t.nav.logout}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, type Language } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { Wallet, Globe, LogOut, Menu } from "lucide-react";
import { walletAPI } from "../services/api";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [balance, setBalance] = useState<number>(8200);

  const fetchBalance = async () => {
    try {
      const data = await walletAPI.fetchBalance();
      setBalance(data.wallet_balance);
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      // Polling or syncing balance when user action takes place
      const interval = setInterval(fetchBalance, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(balance);

  return (
    <header className="glass-panel border-b border-white/5 h-16 px-4 md:px-6 flex items-center justify-between z-10 w-full">
      {/* Brand logo for mobile / Hamburger */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 hover:bg-white/5 rounded-lg md:hidden text-gray-300"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center font-extrabold text-white text-md">
            CH
          </div>
          <span className="font-bold text-white text-sm">
            ConstructHire
          </span>
        </div>
      </div>

      {/* Header action controls */}
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Wallet Balance Indicator */}
        {user && (role === "customer" || role === "worker") && (
          <Link 
            to="/wallet" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:border-violet-500/30 text-gray-300 hover:text-white transition-all duration-200"
          >
            <Wallet className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold leading-none">{formattedBalance}</span>
          </Link>
        )}

        {/* Multi-language Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-2.5 py-1.5 text-gray-300 hover:border-white/12 transition-all">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
          >
            <option className="bg-gray-950 text-white" value="English">English</option>
            <option className="bg-gray-950 text-white" value="Hindi">हिंदी (Hindi)</option>
            <option className="bg-gray-950 text-white" value="Bengali">বাংলা (Bengali)</option>
            <option className="bg-gray-950 text-white" value="Marathi">मराठी (Marathi)</option>
            <option className="bg-gray-950 text-white" value="Tamil">தமிழ் (Tamil)</option>
            <option className="bg-gray-950 text-white" value="Telugu">తెలుగు (Telugu)</option>
            <option className="bg-gray-950 text-white" value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option className="bg-gray-950 text-white" value="Kannada">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>

        {/* User Badge Info */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-white leading-tight">
                {user.name}
              </span>
              <span className="text-[9px] text-violet-400 uppercase font-extrabold tracking-wider leading-none">
                {user.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs">
              {user.name[0]}
            </div>
          </div>
        )}

        {/* Mobile logout */}
        <button 
          onClick={logout}
          className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl md:hidden cursor-pointer"
          title={t("logout")}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

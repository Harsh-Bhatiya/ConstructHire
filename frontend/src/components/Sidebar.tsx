import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Wallet, 
  Users, 
  ShieldAlert, 
  LogOut 
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { role, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  // Define sidebar menu options based on user role
  const menuItems = [];

  // Admin sees all menu options for easy BCA viva grading
  if (role === "admin") {
    menuItems.push(
      { path: "/", label: t("dashboard"), icon: LayoutDashboard },
      { path: "/workers", label: t("workers"), icon: Search },
      { path: "/jobs", label: t("jobs"), icon: Briefcase },
      { path: "/wallet", label: t("wallet"), icon: Wallet },
      { path: "/roster", label: t("mediator"), icon: Users },
      { path: "/admin", label: t("admin"), icon: ShieldAlert }
    );
  } else {
    // Normal roles get customized links
    if (role === "customer") {
      menuItems.push(
        { path: "/", label: t("dashboard"), icon: LayoutDashboard },
        { path: "/workers", label: t("workers"), icon: Search },
        { path: "/jobs", label: t("jobs"), icon: Briefcase },
        { path: "/wallet", label: t("wallet"), icon: Wallet }
      );
    } else if (role === "worker") {
      menuItems.push(
        { path: "/", label: t("dashboard"), icon: LayoutDashboard },
        { path: "/jobs", label: t("jobs"), icon: Briefcase },
        { path: "/wallet", label: t("wallet"), icon: Wallet }
      );
    } else if (role === "mediator") {
      menuItems.push(
        { path: "/roster", label: t("mediator"), icon: Users }
      );
    }
  }

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col justify-between p-4 hidden md:flex min-h-screen">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-violet-600/30">
            CH
          </div>
          <div>
            <h1 className="text-md font-bold text-white tracking-wider leading-none">
              ConstructHire
            </h1>
            <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase">
              Labor Marketplace
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
};

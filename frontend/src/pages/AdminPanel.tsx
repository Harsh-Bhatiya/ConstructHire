import React, { useEffect, useState } from "react";
import { adminAPI, type AdminAnalytics, type AdminAlert, type UserAdminView } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Users, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Ban, 
  TrendingUp 
} from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const { syncUser } = useAuth();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const loadAdminData = async () => {
    try {
      const analyticsData = await adminAPI.fetchAnalytics();
      setAnalytics(analyticsData);

      const alertsData = await adminAPI.fetchAlerts();
      setAlerts(alertsData);

      const usersData = await adminAPI.fetchUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading admin records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await adminAPI.resolveAlert(alertId);
      await syncUser();
      loadAdminData();
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminAPI.toggleStatus(userId, !currentStatus);
      loadAdminData();
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await adminAPI.deleteUser(userId);
      loadAdminData();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const handleResetDB = async () => {
    if (!window.confirm("This will drop all tables and reload original mockup seed data. Proceed?")) return;
    setIsResetting(true);
    try {
      await adminAPI.resetDB();
      await syncUser();
      await loadAdminData();
      alert("Database successfully reset and re-seeded!");
    } catch (err) {
      alert("Database reset failed.");
    } finally {
      setIsResetting(false);
    }
  };



  // Chart data representing monthly transaction volume
  const chartData = [
    { month: "Jan", GMV: 8000, Revenue: 400 },
    { month: "Feb", GMV: 12000, Revenue: 600 },
    { month: "Mar", GMV: 15000, Revenue: 750 },
    { month: "Apr", GMV: 22000, Revenue: 1100 },
    { month: "May", GMV: 28000, Revenue: 1400 },
    { month: "Jun", GMV: analytics?.gmv || 35000, Revenue: analytics?.platform_commission || 1750 },
  ];

  const severityColors: Record<string, string> = {
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    orange: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    gray: "bg-gray-500/10 border-gray-500/20 text-gray-400",
  };

  if (isLoading || !analytics) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
        <span className="text-xs font-semibold">Loading Admin metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Moderation & Risk Panel
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("admin")}
          </h2>
        </div>
        <button
          onClick={handleResetDB}
          disabled={isResetting}
          className="px-4 py-2 bg-red-650 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          Reset Demo Database
        </button>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-1">Total Workers</span>
          <strong className="text-lg font-bold text-white">{analytics.total_workers}</strong>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-1">Disputes Queue</span>
          <strong className="text-lg font-bold text-red-400">{analytics.disputes_count}</strong>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-1">Fraud Alerts</span>
          <strong className="text-lg font-bold text-amber-400">{analytics.fraud_alerts_count}</strong>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-1">IVR Alerts Sent</span>
          <strong className="text-lg font-bold text-gray-300">{analytics.ivr_alerts_count}</strong>
        </div>
      </section>

      {/* Analytics Charts & Moderation Queue split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GMV/Revenue charts */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            GMV & Platform Revenue Growth
          </h3>
          <div className="h-[240px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                  itemStyle={{ color: "#8b5cf6" }}
                />
                <Area type="monotone" dataKey="GMV" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Review Queue Alerts */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-violet-400" />
            {t("disputesQueue")}
          </h3>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 divide-y divide-white/5">
            {alerts.map((alert) => (
              <div key={alert.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-bold rounded-md uppercase ${severityColors[alert.severity] || "text-gray-400"}`}>
                    {alert.type}
                  </span>
                  <p className="text-gray-300 text-[10px] leading-relaxed pr-2">{alert.text}</p>
                </div>
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/8 text-[9px] font-bold text-white rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Resolve
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-12">All alerts and disputes resolved.</div>
            )}
          </div>
        </div>
      </section>

      {/* Users Database List */}
      <section className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Users className="w-4 h-4 text-violet-400" />
          Registered Users Database
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                <th className="pb-2.5">Name</th>
                <th className="pb-2.5">Phone</th>
                <th className="pb-2.5">Role</th>
                <th className="pb-2.5">City</th>
                <th className="pb-2.5 text-center">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/1">
                  <td className="py-2.5 font-semibold text-white">{u.name}</td>
                  <td className="py-2.5 text-gray-400">{u.phone}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-md text-[9px] font-bold uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400">{u.city}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      u.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {u.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                      className={`p-1.5 hover:bg-white/5 rounded-lg inline-block cursor-pointer ${
                        u.is_active ? "text-amber-400" : "text-emerald-400"
                      }`}
                      title={u.is_active ? "Suspend User" : "Activate User"}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg inline-block cursor-pointer"
                      title="Permanently Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

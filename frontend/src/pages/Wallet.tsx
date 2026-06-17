import React, { useEffect, useState } from "react";
import { walletAPI, type WalletTransaction } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Wallet as WalletIcon, Check, ArrowDownLeft, ArrowUpRight, Lock, Plus } from "lucide-react";

export const Wallet: React.FC = () => {
  const { t } = useLanguage();
  const { syncUser } = useAuth();
  
  const [balance, setBalance] = useState<number>(8200);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topupAmount, setTopupAmount] = useState<number>(1000);
  const [isTopupLoading, setIsTopupLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadWalletData = async () => {
    try {
      const balanceData = await walletAPI.fetchBalance();
      setBalance(balanceData.wallet_balance);
      
      const transactionsData = await walletAPI.fetchTransactions();
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Error loading wallet logs:", err);
    }
  };

  useEffect(() => {
    loadWalletData();
    const interval = setInterval(loadWalletData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTopup = async (amount: number) => {
    setSuccessMsg(null);
    setIsTopupLoading(true);
    try {
      await walletAPI.topup(amount);
      await syncUser();
      await loadWalletData();
      setSuccessMsg(`Successfully simulated recharge of ${money(amount)} via UPI webhook!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert("Top-up simulation failed.");
    } finally {
      setIsTopupLoading(false);
    }
  };

  const money = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const getTxStyles = (type: string) => {
    if (type === "credit" || type === "refund") {
      return {
        icon: ArrowDownLeft,
        iconClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        amountClass: "text-emerald-400",
        prefix: "+"
      };
    } else if (type === "hold") {
      return {
        icon: Lock,
        iconClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        amountClass: "text-amber-400",
        prefix: ""
      };
    } else { // release
      return {
        icon: ArrowUpRight,
        iconClass: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        amountClass: "text-gray-400",
        prefix: ""
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Simulated Razorpay Webhooks
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("wallet")}
          </h2>
        </div>
      </section>

      {/* Top Wallet Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">
              Available Balance
            </span>
            <strong className="text-lg font-extrabold text-white block">{money(balance)}</strong>
            <small className="text-[10px] text-violet-400 font-semibold">secured escrow</small>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">
              {t("commissionSaved")}
            </span>
            <strong className="text-lg font-extrabold text-white block">₹3,900 INR</strong>
            <small className="text-[10px] text-emerald-400 font-semibold">vs 20% middlemen margins</small>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">
              Platform Commission Cap
            </span>
            <strong className="text-lg font-extrabold text-white block">5% Flat</strong>
            <small className="text-[10px] text-gray-400">deducted only on completion</small>
          </div>
        </div>
      </section>

      {/* Main split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: Top up triggers */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white">
              UPI Top-Up Simulation
            </h3>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold leading-normal">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Manual amount selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recharge Amount</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        topupAmount === amt 
                          ? "bg-violet-600/15 border-violet-500 text-white"
                          : "bg-white/5 border-white/8 text-gray-400 hover:border-white/12"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleTopup(topupAmount)}
                disabled={isTopupLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/15 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {isTopupLoading ? "Verifying signature..." : `Recharge Wallet ₹${topupAmount}`}
              </button>

              <div className="p-3 bg-white/5 rounded-xl border border-white/8 text-[9px] text-gray-400 leading-relaxed space-y-1">
                <strong className="text-white uppercase tracking-wider block">Razorpay Integrity</strong>
                <p>In production, UPI transactions trigger webhooks verified using HMAC-SHA256 signatures before updating customer database balances.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Immutable Transaction ledger */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">
              {t("ledgerTitle")}
            </h3>
            <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-[9px] font-extrabold tracking-wider">
              {transactions.length} entries
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            {transactions.map((tx) => {
              const style = getTxStyles(tx.type);
              const TxIcon = style.icon;
              const date = new Date(tx.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
              });
              
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${style.iconClass}`}>
                      <TxIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block leading-tight mb-0.5">
                        {tx.label}
                      </strong>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        {date} · {tx.type}
                      </span>
                    </div>
                  </div>
                  <strong className={`text-xs font-bold ${style.amountClass}`}>
                    {style.prefix}{money(tx.amount)}
                  </strong>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-12">No transactions recorded in ledger.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";
import { Phone, Key, HelpCircle } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  const [phone, setPhone] = useState<string>("9876543210");
  const [otp, setOtp] = useState<string>("123456");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (otp !== "123456") {
      setError("Incorrect OTP. For the BCA viva demo, use OTP: 123456.");
      return;
    }

    setIsLoading(true);
    try {
      await login(phone, selectedRole, otp);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      id: "customer" as UserRole,
      title: "Customer / Contractor",
      desc: "Post jobs, browse nearest workers, and hire daily labor with escrow safety.",
    },
    {
      id: "worker" as UserRole,
      title: "Construction Worker",
      desc: "Receive daily job alerts, accept offers, and track your wallet earnings.",
    },
    {
      id: "mediator" as UserRole,
      title: "Mediator / Thekedar",
      desc: "Manage roster list, log attendance, and coordinate commissions.",
    },
    {
      id: "admin" as UserRole,
      title: "Platform Admin",
      desc: "Monitor metrics, handle dispute alerts, and manage fraud review queues.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#030712]">
      {/* Left Pane: Startup Marketing and Viva Hero details */}
      <section className="flex-1 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-violet-950/20 via-transparent to-transparent">
        <div className="space-y-6 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-violet-600/30">
              CH
            </div>
            <h1 className="text-xl font-bold text-white tracking-wider leading-none">
              ConstructHire
            </h1>
          </div>

          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-extrabold tracking-wider uppercase">
              BCA Viva Command Center
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Digitizing Construction Labor Hiring
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              A location-aware construction labor marketplace providing verified workers, escrow protection, roster checkouts, and 2G/IVR features for offline workers.
            </p>
          </div>
        </div>

        {/* Feature stats widget grid */}
        <div className="grid grid-cols-3 gap-6 pt-12 md:pt-0">
          <div className="space-y-1">
            <strong className="block text-2xl md:text-3xl font-extrabold text-white">5%</strong>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Commission Limit</span>
          </div>
          <div className="space-y-1">
            <strong className="block text-2xl md:text-3xl font-extrabold text-white">8</strong>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Indian Languages</span>
          </div>
          <div className="space-y-1">
            <strong className="block text-2xl md:text-3xl font-extrabold text-white">&lt;200ms</strong>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">AI Rank Queries</span>
          </div>
        </div>
      </section>

      {/* Right Pane: Login Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/8 shadow-2xl space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white leading-none">
              Enter the Platform
            </h3>
            <p className="text-xs text-gray-400">
              For testing convenience, use any 10-digit number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Phone input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* OTP input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  OTP Code
                </label>
                <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Viva Demo Bypass: 123456
                </span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Grid Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRole(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === opt.id
                        ? "bg-violet-600/10 border-violet-500 text-white"
                        : "bg-white/5 border-white/8 text-gray-400 hover:border-white/12"
                    }`}
                  >
                    <strong className="block text-xs font-bold text-white mb-0.5 capitalize">
                      {opt.id}
                    </strong>
                    <span className="text-[10px] leading-snug block opacity-80">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/30 transition-all duration-200 cursor-pointer"
            >
              {isLoading ? "Authenticating session..." : "Verify OTP and open dashboard"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

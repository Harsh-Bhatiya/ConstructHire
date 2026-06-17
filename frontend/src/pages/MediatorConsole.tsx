import React, { useEffect, useState } from "react";
import { rosterAPI, type RosterWorker } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { Users, Plus, Smartphone, Calendar } from "lucide-react";

export const MediatorConsole: React.FC = () => {
  const { t } = useLanguage();
  const [roster, setRoster] = useState<RosterWorker[]>([]);
  const [name, setName] = useState<string>("");
  const [skill, setSkill] = useState<string>("Helper");
  const [phoneStatus, setPhoneStatus] = useState<string>("IVR only");
  const [status, setStatus] = useState<string>("Available");
  const [commission, setCommission] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const loadRoster = async () => {
    try {
      const data = await rosterAPI.fetchRoster();
      setRoster(data);
    } catch (err) {
      console.error("Error loading roster:", err);
    }
  };

  useEffect(() => {
    loadRoster();
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsAdding(true);
    try {
      await rosterAPI.addWorker({
        name,
        skill,
        phone_status: phoneStatus,
        status,
        commission,
      });
      setName("");
      setCommission(0);
      loadRoster();
    } catch (err) {
      alert("Failed to add roster worker.");
    } finally {
      setIsAdding(false);
    }
  };

  const skillsList = ["Mason", "Electrician", "Painter", "Carpenter", "Plumber", "Helper"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Contractor Digital Roster
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("mediator")}
          </h2>
        </div>
      </section>

      {/* Main split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Add Worker to Roster Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" />
              Add Roster Worker
            </h3>

            <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Worker Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rafiq Alam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all"
                  required
                />
              </div>

              {/* Skill */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Skill Category</label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
                >
                  {skillsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Phone Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Connection</label>
                <select
                  value={phoneStatus}
                  onChange={(e) => setPhoneStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
                >
                  <option value="IVR only">IVR only (Non-smartphone)</option>
                  <option value="Verified">Verified Smartphone</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="On job">On job</option>
                </select>
              </div>

              {/* Accrued Commission */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Accrued Commission (INR)</label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                {isAdding ? "Adding..." : "Add to Roster"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Roster Listing & Attendance Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Managed Roster List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                {t("availableRoster")}
              </h3>
              <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-[9px] font-extrabold tracking-wider">
                {roster.length} workers
              </span>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {roster.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-xs font-bold text-white block leading-tight mb-1">
                      {item.name}
                    </strong>
                    <div className="flex items-center gap-2.5 text-[9px] text-gray-500 font-semibold uppercase">
                      <span>{item.skill}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-violet-400">
                        <Smartphone className="w-3 h-3 text-violet-400" />
                        {item.phone_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[8px] text-gray-400 block font-bold leading-none mb-1">Commission</span>
                      <strong className="text-xs font-bold text-white">₹{item.commission}</strong>
                    </div>
                    <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-md uppercase ${
                      item.status === "Available"
                        ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/15 border-amber-500/20 text-amber-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
              {roster.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-12">No workers added to roster yet.</div>
              )}
            </div>
          </div>

          {/* Bulk attendance log (viva mock display) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Digitized Attendance & Payouts Log
            </h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Provides digital checkins and daily pay disbursement records for IVR-based roster laborers.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Present Count</th>
                    <th className="pb-2 text-right">Commission Accrued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr>
                    <td className="py-2.5">Monday Checkin</td>
                    <td className="py-2.5">8 / 10 workers</td>
                    <td className="py-2.5 text-right font-bold text-violet-400">₹5,200</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Tuesday Checkin</td>
                    <td className="py-2.5">10 / 10 workers</td>
                    <td className="py-2.5 text-right font-bold text-violet-400">₹6,500</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Wednesday Checkin</td>
                    <td className="py-2.5">7 / 10 workers</td>
                    <td className="py-2.5 text-right font-bold text-violet-400">₹4,550</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

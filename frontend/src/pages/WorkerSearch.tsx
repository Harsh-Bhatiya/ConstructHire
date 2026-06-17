import React, { useEffect, useState } from "react";
import { workersAPI, bookingsAPI, type WorkerSearchResult } from "../services/api";
import { MapWidget } from "../components/MapWidget";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShieldCheck, MapPin, Loader, Zap } from "lucide-react";

export const WorkerSearch: React.FC = () => {
  const { t } = useLanguage();
  const { role, user, syncUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search parameters states
  const [skill, setSkill] = useState<string>("All");
  const [radius, setRadius] = useState<number>(10);
  const [online, setOnline] = useState<string>("yes");
  const [query, setQuery] = useState<string>("");

  const [workers, setWorkers] = useState<WorkerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookingWorkerId, setBookingWorkerId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);

  // Load matching workers
  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await workersAPI.search(skill, radius, online, query);
      setWorkers(data);
    } catch (err) {
      console.error("Error searching workers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [skill, radius, online, query]);

  // Handle query parameter trigger (direct book check from dashboard jumps)
  useEffect(() => {
    const bookParam = searchParams.get("book");
    if (bookParam) {
      setBookingWorkerId(bookParam);
    }
  }, [searchParams]);

  const handleBook = async () => {
    if (!bookingWorkerId) return;
    setBookingError(null);
    setIsBookingLoading(true);

    try {
      const selectedWorker = workers.find((w) => w.id === bookingWorkerId);
      if (!selectedWorker) {
        setBookingError("Worker profile details not loaded.");
        setIsBookingLoading(false);
        return;
      }

      // Check balance local check
      const currentBalance = user?.customer_profile?.wallet_balance || 0;
      if (currentBalance < selectedWorker.rate) {
        setBookingError(`Insufficient wallet balance (${currentBalance} INR). Escrow hold requires ${selectedWorker.rate} INR. Please top up your wallet.`);
        setIsBookingLoading(false);
        return;
      }

      // Create Booking API call
      await bookingsAPI.create(bookingWorkerId);
      
      // Update local wallet context balance
      await syncUser();
      
      setBookingWorkerId(null);
      // Navigate to bookings page to see state machine
      navigate("/jobs");
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || "Booking transaction failed. Try again.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const skillsList = ["Mason", "Electrician", "Painter", "Carpenter", "Plumber", "Helper"];

  return (
    <div className="space-y-6">
      {/* Header title */}
      <section className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Worker Discover Center
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("workers")}
          </h2>
        </div>
      </section>

      {/* Filter panel */}
      <section className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Text input search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all"
              />
            </div>
          </div>

          {/* Skill selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Skill Required</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
            >
              <option value="All">{t("allSkills")}</option>
              {skillsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Radius selector slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>{t("radiusText")}</span>
              <span className="text-violet-400">{radius} km</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-white/5 border border-white/8 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>

          {/* Availability radio */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Availability</label>
            <select
              value={online}
              onChange={(e) => setOnline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
            >
              <option value="yes">{t("onlineOnly")}</option>
              <option value="all">{t("allWorkers")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main mapping/results layout split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left pane: dynamic map */}
        <div className="lg:col-span-5 space-y-4">
          <MapWidget 
            workers={workers} 
            selectedWorkerId={bookingWorkerId || undefined}
            onSelectWorker={(w) => w && setBookingWorkerId(w.id)}
            onBookWorker={(id) => setBookingWorkerId(id)}
          />
        </div>

        {/* Right pane: ranked results cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">
              AI-Ranked Discovery Results
            </h3>
            <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-[9px] font-extrabold tracking-wider">
              {workers.length} matching profiles
            </span>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Loader className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="text-xs font-semibold">Ranking nearest workers...</span>
            </div>
          ) : workers.length === 0 ? (
            <div className="h-48 glass-panel rounded-2xl flex flex-col items-center justify-center text-gray-500 border border-white/5">
              <span className="text-xs font-semibold">No workers match selected criteria.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {workers.map((w) => (
                <div 
                  key={w.id}
                  className={`glass-card p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    bookingWorkerId === w.id ? "border-violet-500 bg-violet-650/10" : "border-white/6"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1">
                        {w.name}
                        {w.verified && (
                          <span title="Aadhaar KYC Verified">
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-400 fill-violet-400/20" />
                          </span>
                        )}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-white/5 border border-white/8 text-gray-400 rounded-md text-[9px] font-bold">
                        {w.skill}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5 text-amber-400">
                        ★ <strong className="text-white">{w.rating}</strong>
                      </span>
                      <span>•</span>
                      <span>{w.distance} km away</span>
                      <span>•</span>
                      <span>{w.completed_jobs} jobs completed</span>
                      <span>•</span>
                      <span className="text-violet-400 font-semibold flex items-center gap-0.5">
                        <Zap className="w-3 h-3" /> Score: {w.ai_score}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block font-bold leading-none mb-1">Daily Wage</span>
                      <strong className="text-sm font-bold text-white">₹{w.rate}/day</strong>
                    </div>
                    {role === "customer" && (
                      <button
                        onClick={() => setBookingWorkerId(w.id)}
                        className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                      >
                        {t("bookEscrow")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Dialog Overlay */}
      {bookingWorkerId && !isLoading && workers.find((w) => w.id === bookingWorkerId) && (
        <div className="fixed inset-0 bg-black/75 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <MapPin className="w-5 h-5 text-violet-400" />
              Confirm Booking Hold
            </h3>

            {bookingError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold leading-normal">
                {bookingError}
              </div>
            )}

            <div className="space-y-3 text-xs text-gray-300">
              <p>
                You are about to book: <strong>{workers.find((w) => w.id === bookingWorkerId)?.name}</strong> for daily wage masonry or support work.
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/8 flex justify-between items-center text-sm">
                <span className="text-xs text-gray-400 font-bold">Escrow Hold Amount:</span>
                <strong className="text-white font-extrabold">₹{workers.find((w) => w.id === bookingWorkerId)?.rate} INR</strong>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                This amount will be locked in the constructhire escrow ledger. Payment is released to the worker only when you mark the work as COMPLETED.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setBookingWorkerId(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={isBookingLoading}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isBookingLoading ? "Processing Escrow..." : "Confirm Hold"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

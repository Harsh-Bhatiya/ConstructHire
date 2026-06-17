import React, { useEffect, useState } from "react";
import { MapWidget } from "../components/MapWidget";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { workersAPI, bookingsAPI, jobsAPI, type WorkerSearchResult, type Booking } from "../services/api";
import { Users, Wallet, Trophy, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState<WorkerSearchResult[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalGmv, setTotalGmv] = useState<number>(0);
  const [isWorkerOnline, setIsWorkerOnline] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const workersData = await workersAPI.search("All", 10, "all", "");
      setWorkers(workersData);

      const bookingsData = await bookingsAPI.list();
      setBookings(bookingsData);

      // Calculate GMV
      const jobsData = await jobsAPI.list();
      const jobBudgetSum = jobsData.reduce((sum, j) => sum + j.budget, 0);
      const bookingSum = bookingsData.reduce((sum, b) => sum + b.amount, 0);
      setTotalGmv(jobBudgetSum + bookingSum);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter((w) => w.verified).length;
  const onlineWorkers = workers.filter((w) => w.online).length;

  const money = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Jaipur Command Center
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("dashboard")}
          </h2>
        </div>
        {role === "customer" && (
          <button
            onClick={() => navigate("/jobs")}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
          >
            {t("postJob")}
          </button>
        )}
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Workers Metric */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">{t("verifiedWorkers")}</span>
            <strong className="text-lg font-bold text-white block">{verifiedWorkers}/{totalWorkers}</strong>
            <small className="text-[10px] text-emerald-400 font-semibold">{onlineWorkers} online now</small>
          </div>
        </div>

        {/* Active Bookings Metric */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">{t("activeBookings")}</span>
            <strong className="text-lg font-bold text-white block">{bookings.length}</strong>
            <small className="text-[10px] text-gray-400">escrow active</small>
          </div>
        </div>

        {/* Wallet balance */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">{t("walletBalance")}</span>
            <strong className="text-lg font-bold text-white block">
              {money(role === "customer" ? (user?.customer_profile?.wallet_balance || 8200) : 12400)}
            </strong>
            <small className="text-[10px] text-violet-400 font-semibold">secured balance</small>
          </div>
        </div>

        {/* GMV Tracked */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-1.5">GMV Tracked</span>
            <strong className="text-lg font-bold text-white block">{money(totalGmv)}</strong>
            <small className="text-[10px] text-gray-400">5% commission limit</small>
          </div>
        </div>
      </section>

      {/* Main split: Map and Simulated 2G Phone Wireframe */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Vector Map */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white leading-none">
                Live Worker Map
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Visualizing available blue-collar workers in pilot sectors
              </p>
            </div>
            <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-[9px] font-extrabold tracking-wider uppercase">
              Jaipur Urban
            </span>
          </div>

          <MapWidget 
            workers={workers} 
            onBookWorker={(id) => navigate(`/workers?book=${id}`)}
          />
        </div>

        {/* 2G Mobile view simulator */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white leading-none">
                Worker Mobile View Simulation
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Demonstrates 2G non-smartphone inclusion
              </p>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-extrabold tracking-wider uppercase">
              2G Simulator
            </span>
          </div>

          {/* Wireframe wrapper */}
          <div className="w-full max-w-[280px] mx-auto bg-gray-900 border-8 border-gray-800 rounded-[32px] overflow-hidden shadow-2xl relative aspect-[9/16]">
            {/* Speaker & camera slot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
            </div>

            {/* Screen layout */}
            <div className="p-4 pt-6 text-xs text-gray-300 space-y-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-white">Namaste, Ramesh</span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              {/* Toggle online status */}
              <div className="flex justify-between items-center p-2.5 bg-white/5 border border-white/8 rounded-xl">
                <div>
                  <strong className="block text-[10px] text-white">Available for Jobs</strong>
                  <span className="text-[8px] text-gray-400">Toggles online state</span>
                </div>
                <button 
                  onClick={() => setIsWorkerOnline(!isWorkerOnline)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isWorkerOnline ? "bg-emerald-500 text-right" : "bg-gray-700 text-left"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full inline-block shadow"></div>
                </button>
              </div>

              {/* Simulated job alert */}
              <div className="p-3 bg-violet-600/10 border border-violet-500/30 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <strong className="text-[10px] text-violet-300 font-extrabold uppercase tracking-wider block">
                    New Job Alert
                  </strong>
                  <span className="text-[9px] text-violet-400 font-bold">Today</span>
                </div>
                <p className="text-[9px] leading-relaxed text-gray-300">
                  Masonry wall repair in Mansarovar, Jaipur. <br />
                  Budget: <strong>₹1,300/day</strong>.
                </p>
                <button 
                  onClick={() => alert("Simulated Worker phone flow: Ramesh accepted this job alert via SMS/IVR triggers.")}
                  className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[9px] font-bold tracking-wider transition-colors cursor-pointer"
                >
                  Accept Job Offer
                </button>
              </div>

              {/* KYC status */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Aadhaar KYC Progress</span>
                  <span className="text-emerald-400 font-bold">82%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 border border-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: "82%" }}></div>
                </div>
              </div>

              {/* IVR menu checklist */}
              <div className="p-2.5 bg-white/5 border border-white/8 rounded-xl space-y-1.5 text-gray-400">
                <strong className="text-[9px] text-white uppercase tracking-wider block">
                  IVR Phone Menu:
                </strong>
                <ul className="space-y-1 text-[8px] list-disc list-inside">
                  <li>Press <strong>1</strong>: Hear nearest jobs</li>
                  <li>Press <strong>2</strong>: Accept booking</li>
                  <li>Press <strong>3</strong>: Check wallet balance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

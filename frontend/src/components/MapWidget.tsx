import React, { useState } from "react";
import { type WorkerSearchResult } from "../services/api";
import { Navigation, Star, ShieldCheck, Zap } from "lucide-react";

interface MapWidgetProps {
  workers: WorkerSearchResult[];
  onBookWorker?: (workerId: string) => void;
  selectedWorkerId?: string;
  onSelectWorker?: (worker: WorkerSearchResult | null) => void;
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  workers,
  onBookWorker,
  selectedWorkerId,
  onSelectWorker,
}) => {
  const [activeWorker, setActiveWorker] = useState<WorkerSearchResult | null>(null);

  const handlePinClick = (w: WorkerSearchResult) => {
    setActiveWorker(w);
    if (onSelectWorker) onSelectWorker(w);
  };

  const closePopup = () => {
    setActiveWorker(null);
    if (onSelectWorker) onSelectWorker(null);
  };

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden map-grid border border-white/8 shadow-2xl">
      {/* Horizontal & Vertical simulated roads */}
      <div className="map-road-h" style={{ top: "30%" }}></div>
      <div className="map-road-h" style={{ top: "60%" }}></div>
      <div className="map-road-v" style={{ left: "25%" }}></div>
      <div className="map-road-v" style={{ left: "75%" }}></div>

      {/* Customer Pin (Center of the pilot command center) */}
      <div 
        className="absolute w-8 h-8 flex items-center justify-center -ml-4 -mt-4 bg-red-500 rounded-full border-2 border-white shadow-lg glow-primary z-20 cursor-default"
        style={{ left: "50%", top: "50%" }}
        title="Your Location (Jaipur Command Center)"
      >
        <span className="text-xs font-bold text-white">C</span>
      </div>

      {/* Active Worker Pins */}
      {workers.map((w) => {
        const isSelected = selectedWorkerId === w.id || activeWorker?.id === w.id;
        
        return (
          <button
            key={w.id}
            onClick={() => handlePinClick(w)}
            className={`absolute -ml-3 -mt-3 w-7 h-7 flex items-center justify-center rounded-full border-2 transition-all duration-300 z-10 hover:z-30 hover:scale-125 cursor-pointer ${
              isSelected
                ? "bg-violet-600 border-white glow-primary scale-110"
                : w.online
                ? "bg-emerald-600 border-white hover:bg-emerald-500"
                : "bg-gray-700 border-gray-400 opacity-60"
            }`}
            style={{ left: `${w.map_x}%`, top: `${w.map_y}%` }}
            title={`${w.name} (${w.skill})`}
          >
            <span className="text-[10px] font-bold text-white uppercase">
              {w.skill[0]}
            </span>
            {w.online && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full pulse-online"></span>
            )}
          </button>
        );
      })}

      {/* Worker Detail Popup Card overlay */}
      {activeWorker && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 glass-panel p-4 rounded-xl shadow-2xl border border-white/10 z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                {activeWorker.name}
                {activeWorker.verified && (
                  <span title="Aadhaar KYC Verified">
                    <ShieldCheck className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-400">{activeWorker.skill}</p>
            </div>
            <button 
              onClick={closePopup}
              className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/5"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>{activeWorker.rating} rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-violet-400" />
              <span>{activeWorker.distance} km away</span>
            </div>
            <div className="col-span-2 flex items-center gap-1 text-violet-300 font-semibold">
              <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400/20" />
              <span>AI Score: {activeWorker.ai_score} pts</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-sm font-bold text-white">
              ₹{activeWorker.rate}/day
            </span>
            {onBookWorker && (
              <button
                onClick={() => {
                  onBookWorker(activeWorker.id);
                  closePopup();
                }}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                Book with Escrow
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

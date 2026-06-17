import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { WorkerSearch } from "./pages/WorkerSearch";
import { JobsBookings } from "./pages/JobsBookings";
import { Wallet } from "./pages/Wallet";
import { MediatorConsole } from "./pages/MediatorConsole";
import { AdminPanel } from "./pages/AdminPanel";

const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dynamic Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-[#0b0f19] border-r border-white/8 p-4 z-50 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Viewport Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-violet-500 font-bold text-sm">
        <span>Loading session environment...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <LayoutShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          {/* Customer only / Admin routes */}
          {(role === "customer" || role === "admin") && (
            <Route path="/workers" element={<WorkerSearch />} />
          )}

          {/* Customer/Worker/Admin routes */}
          {(role === "customer" || role === "worker" || role === "admin") && (
            <>
              <Route path="/jobs" element={<JobsBookings />} />
              <Route path="/wallet" element={<Wallet />} />
            </>
          )}

          {/* Mediator / Admin routes */}
          {(role === "mediator" || role === "admin") && (
            <Route path="/roster" element={<MediatorConsole />} />
          )}

          {/* Admin exclusive routes */}
          {role === "admin" && (
            <Route path="/admin" element={<AdminPanel />} />
          )}

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutShell>
    </Router>
  );
};

import React, { useEffect, useState } from "react";
import { jobsAPI, bookingsAPI, type Job, type Booking } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Briefcase, AlertCircle, AlertTriangle, Star } from "lucide-react";

export const JobsBookings: React.FC = () => {
  const { role, syncUser } = useAuth();
  const { t } = useLanguage();

  // Job posting states
  const [jobSkill, setJobSkill] = useState<string>("Mason");
  const [jobLocation, setJobLocation] = useState<string>("Mansarovar, Jaipur");
  const [jobBudget, setJobBudget] = useState<number>(1200);
  const [jobDesc, setJobDesc] = useState<string>("One day cement masonry work.");
  const [jobError, setJobError] = useState<string | null>(null);
  const [isJobLoading, setIsJobLoading] = useState<boolean>(false);

  // Lists states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Dialog overlays states
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("Excellent work, verified!");
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);

  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("Work quality not up to specification.");
  const [isDisputeLoading, setIsDisputeLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const jobsData = await jobsAPI.listMy();
      setJobs(jobsData);
      
      const bookingsData = await bookingsAPI.list();
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error loading jobs and bookings data:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobError(null);
    setIsJobLoading(true);

    try {
      await jobsAPI.create({
        skill_required: jobSkill,
        location: jobLocation,
        budget: jobBudget,
        description: jobDesc,
      });
      setJobDesc("");
      loadData();
    } catch (err: any) {
      setJobError(err.response?.data?.detail || "Failed to create job posting.");
    } finally {
      setIsJobLoading(false);
    }
  };

  const handleAdvanceStatus = async (bookingId: string, nextStatus: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, nextStatus);
      await syncUser();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Status update transaction failed.");
    }
  };

  const handleDispute = async () => {
    if (!disputeBookingId) return;
    setIsDisputeLoading(true);
    try {
      await bookingsAPI.dispute(disputeBookingId, disputeReason);
      setDisputeBookingId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to file dispute.");
    } finally {
      setIsDisputeLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewBookingId) return;
    setIsReviewLoading(true);
    try {
      await bookingsAPI.rate(reviewBookingId, rating, comment);
      setReviewBookingId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit rating.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  const money = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const steps = ["POSTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "RATED"];
  const getStepIndex = (status: string) => {
    if (status === "DISPUTED") return 2; // custom handle
    if (status === "CANCELLED") return -1;
    return steps.indexOf(status);
  };

  const skillsList = ["Mason", "Electrician", "Painter", "Carpenter", "Plumber", "Helper"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider">
            Escrow Labor Lifecycle
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("jobs")}
          </h2>
        </div>
      </section>

      {/* Main split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Post Job / Open Offers */}
        <div className="lg:col-span-4 space-y-5">
          {role === "customer" ? (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-400" />
                Post New Job
              </h3>

              {jobError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold">
                  {jobError}
                </div>
              )}

              <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                {/* Skill selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Skill Category</label>
                  <select
                    value={jobSkill}
                    onChange={(e) => setJobSkill(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#111827] border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white cursor-pointer"
                  >
                    {skillsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Location Address</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all"
                    required
                  />
                </div>

                {/* Budget */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Budget (INR)</label>
                  <input
                    type="number"
                    value={jobBudget}
                    onChange={(e) => setJobBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Task Description</label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJobLoading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/10 cursor-pointer"
                >
                  {isJobLoading ? "Publishing post..." : "Post Job Announcement"}
                </button>
              </form>
            </div>
          ) : (
            // Workers see open match posts matching their skill
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-400" />
                Matching Job Alerts
              </h3>
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="p-3 bg-white/4 border border-white/6 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <strong className="text-white text-xs font-bold">{j.skill_required} Needed</strong>
                      <span className="text-violet-400 font-bold">{money(j.budget)}</span>
                    </div>
                    <p className="text-gray-400 text-[10px]">{j.description}</p>
                    <span className="inline-block px-1.5 py-0.5 bg-white/5 border border-white/8 text-[8px] text-gray-400 rounded-md">
                      {j.location}
                    </span>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-6">No matching job alerts.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active Bookings List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-white">
            Escrow Booking Status Machine
          </h3>

          <div className="space-y-4">
            {bookings.map((b) => {
              const currentStep = getStepIndex(b.status);
              
              return (
                <div key={b.id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                  {/* Booking Top Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {b.code} · {b.job_title}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {role === "customer" ? `Assigned Worker: ${b.worker_name}` : `Hiring Client: ${b.customer_name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm font-extrabold text-violet-400 block">{money(b.amount)}</strong>
                      <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/8 text-[9px] text-gray-400 rounded-md font-bold mt-1">
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Progress Step Bar */}
                  {b.status !== "CANCELLED" && b.status !== "DISPUTED" && (
                    <div className="flex items-center justify-between gap-1 text-[9px] font-bold text-gray-500 pt-2 pb-2">
                      {steps.map((st, i) => {
                        const done = i <= currentStep;
                        return (
                          <React.Fragment key={st}>
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-extrabold ${
                                done ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30" : "bg-white/5 border-white/8 text-gray-400"
                              }`}>
                                {i + 1}
                              </div>
                              <span className={done ? "text-violet-400" : "text-gray-500"}>
                                {st.replace("_", " ")}
                              </span>
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`flex-1 h-0.5 rounded ${
                                i < currentStep ? "bg-violet-600" : "bg-white/5"
                              }`}></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  {/* Warning Alerts for Dispute/Cancel states */}
                  {b.status === "DISPUTED" && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>This booking is currently locked in dispute. Platform administrators are reviewing details. Escrow hold is suspended.</span>
                    </div>
                  )}
                  {b.status === "CANCELLED" && (
                    <div className="p-3 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Booking cancelled by administrator review. Booking hold amount has been refunded to the customer wallet.</span>
                    </div>
                  )}

                  {/* Action triggers */}
                  {b.status !== "CANCELLED" && b.status !== "RATED" && (
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5 justify-end">
                      {/* Raise Dispute button (shows if not disputed yet) */}
                      {b.status !== "DISPUTED" && (
                        <button
                          onClick={() => setDisputeBookingId(b.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer mr-auto"
                        >
                          Raise Dispute
                        </button>
                      )}

                      {/* Advance workflow states based on roles */}
                      {b.status === "ACCEPTED" && (role === "customer" || role === "admin") && (
                        <button
                          onClick={() => handleAdvanceStatus(b.id, "IN_PROGRESS")}
                          className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Start Work
                        </button>
                      )}
                      
                      {b.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleAdvanceStatus(b.id, "COMPLETED")}
                          className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Complete Work & Pay
                        </button>
                      )}

                      {b.status === "COMPLETED" && role === "customer" && (
                        <button
                          onClick={() => setReviewBookingId(b.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-[10px] font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-gray-950" /> Rate & Close
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {bookings.length === 0 && (
              <div className="h-48 glass-panel rounded-2xl flex flex-col items-center justify-center text-gray-500 border border-white/5">
                <span className="text-xs font-semibold">No active bookings found.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review Dialog Overlay */}
      {reviewBookingId && (
        <div className="fixed inset-0 bg-black/75 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">
              Rate & Review Worker
            </h3>

            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Star Rating</label>
                <div className="flex gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                        rating >= star ? "text-amber-400" : "text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Feedback Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white text-xs resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReviewBookingId(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={isReviewLoading}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isReviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Dialog Overlay */}
      {disputeBookingId && (
        <div className="fixed inset-0 bg-black/75 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">
              Raise Booking Dispute
            </h3>

            <div className="space-y-3.5 text-xs text-gray-300">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Filing a dispute pauses the escrow flow. Our administrators will review the dispute details to release payouts or issue refunds.
              </p>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reason for Dispute</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl focus:border-violet-500/40 focus:outline-none text-white text-xs resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDisputeBookingId(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                disabled={isDisputeLoading}
                className="flex-1 py-2 bg-red-650 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isDisputeLoading ? "Filing..." : "File Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

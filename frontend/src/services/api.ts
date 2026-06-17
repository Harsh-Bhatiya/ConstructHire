import axios from "axios";

// Target local API port during development; will fallback or adapt to production URL in deployment.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("constructhire-token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface WorkerSearchResult {
  id: string;
  name: string;
  phone: string;
  city: string;
  skill: string;
  rate: number;
  rating: number;
  distance: number;
  online: boolean;
  verified: boolean;
  completed_jobs: number;
  completion_rate: number;
  map_x: number;
  map_y: number;
  ai_score: number;
}

export interface Job {
  id: string;
  customer_id: string;
  skill_required: string;
  location: string;
  budget: number;
  description: string;
  status: string;
  created_at: string;
}

export interface Booking {
  id: string;
  code: string;
  job_id?: string;
  customer_id: string;
  worker_id: string;
  amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
  worker_name?: string;
  job_title?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  booking_id?: string;
  label: string;
  amount: number;
  type: string;
  created_at: string;
}

export interface RosterWorker {
  id: string;
  mediator_id: string;
  name: string;
  skill: string;
  phone_status: string;
  status: string;
  commission: number;
  created_at: string;
}

export interface AdminAlert {
  id: string;
  type: string;
  text: string;
  severity: string;
  status: string;
  created_at: string;
}

export interface UserAdminView {
  id: string;
  name: string;
  phone: string;
  role: string;
  city: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminAnalytics {
  total_workers: number;
  total_customers: number;
  total_jobs: number;
  active_bookings: number;
  gmv: number;
  platform_commission: number;
  disputes_count: number;
  fraud_alerts_count: number;
  ivr_alerts_count: number;
}

export const authAPI = {
  signup: async (data: any) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },
  login: async (phone: string, role: string, otp: string) => {
    const res = await api.post("/auth/login", { phone, role, otp });
    return res.data; // returns token, token_type, role
  },
  fetchMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export const workersAPI = {
  search: async (skill = "All", radius = 5, online = "yes", query = "") => {
    const res = await api.get<WorkerSearchResult[]>("/workers", {
      params: { skill, radius, online, query },
    });
    return res.data;
  },
};

export const jobsAPI = {
  create: async (data: { skill_required: string; location: string; budget: number; description: string }) => {
    const res = await api.post<Job>("/jobs", data);
    return res.data;
  },
  list: async (skill?: string) => {
    const res = await api.get<Job[]>("/jobs", { params: { skill } });
    return res.data;
  },
  listMy: async () => {
    const res = await api.get<Job[]>("/jobs/my");
    return res.data;
  },
};

export const bookingsAPI = {
  create: async (workerId: string, jobId?: string) => {
    const res = await api.post<Booking>("/bookings", { worker_id: workerId, job_id: jobId });
    return res.data;
  },
  list: async () => {
    const res = await api.get<Booking[]>("/bookings");
    return res.data;
  },
  updateStatus: async (bookingId: string, status: string) => {
    const res = await api.patch<Booking>(`/bookings/${bookingId}/status`, { status });
    return res.data;
  },
  dispute: async (bookingId: string, reason: string) => {
    const res = await api.post<Booking>(`/bookings/${bookingId}/dispute`, null, { params: { reason } });
    return res.data;
  },
  rate: async (bookingId: string, rating: number, comment?: string) => {
    const res = await api.post(`/bookings/${bookingId}/review`, { rating, comment });
    return res.data;
  },
};

export const walletAPI = {
  topup: async (amount: number) => {
    const res = await api.post("/wallet/topup", { amount });
    return res.data;
  },
  fetchTransactions: async () => {
    const res = await api.get<WalletTransaction[]>("/wallet/transactions");
    return res.data;
  },
  fetchBalance: async () => {
    const res = await api.get<{ wallet_balance: number }>("/wallet/balance");
    return res.data;
  },
};

export const rosterAPI = {
  addWorker: async (data: { name: string; skill: string; phone_status: string; status: string; commission: number }) => {
    const res = await api.post<RosterWorker>("/roster", data);
    return res.data;
  },
  fetchRoster: async () => {
    const res = await api.get<RosterWorker[]>("/roster");
    return res.data;
  },
};

export const adminAPI = {
  fetchUsers: async () => {
    const res = await api.get<UserAdminView[]>("/admin/users");
    return res.data;
  },
  toggleStatus: async (userId: string, isActive: boolean) => {
    const res = await api.patch<UserAdminView>(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    });
    return res.data;
  },
  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },
  fetchAlerts: async () => {
    const res = await api.get<AdminAlert[]>("/admin/alerts");
    return res.data;
  },
  resolveAlert: async (alertId: string) => {
    const res = await api.post<AdminAlert>(`/admin/alerts/${alertId}/resolve`);
    return res.data;
  },
  fetchAnalytics: async () => {
    const res = await api.get<AdminAnalytics>("/admin/analytics");
    return res.data;
  },
  resetDB: async () => {
    const res = await api.post("/admin/reset-db");
    return res.data;
  },
};

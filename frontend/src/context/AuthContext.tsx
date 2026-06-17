import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export type UserRole = "customer" | "worker" | "mediator" | "admin";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  city: string;
  is_active: boolean;
  created_at: string;
  worker_profile?: {
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
  };
  customer_profile?: {
    wallet_balance: number;
  };
}

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, role: UserRole, otp: string) => Promise<void>;
  register: (name: string, phone: string, role: UserRole, city: string, skill?: string, rate?: number) => Promise<void>;
  logout: () => void;
  syncUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("constructhire-token"));
  const [role, setRoleState] = useState<UserRole | null>(() => localStorage.getItem("constructhire-role") as UserRole);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncUser = async () => {
    try {
      if (localStorage.getItem("constructhire-token")) {
        const userData = await authAPI.fetchMe();
        setUser(userData);
        setRoleState(userData.role);
        localStorage.setItem("constructhire-role", userData.role);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error syncing user details:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      syncUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (phone: string, selectedRole: UserRole, otp: string) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(phone, selectedRole, otp);
      localStorage.setItem("constructhire-token", data.access_token);
      localStorage.setItem("constructhire-role", data.role);
      setToken(data.access_token);
      setRoleState(data.role);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name: string, phone: string, selectedRole: UserRole, city: string, skill?: string, rate?: number) => {
    setIsLoading(true);
    try {
      await authAPI.signup({
        name,
        phone,
        role: selectedRole,
        city,
        skill,
        rate,
      });
      // Automatically log in after successful signup
      await login(phone, selectedRole, "123456");
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("constructhire-token");
    localStorage.removeItem("constructhire-role");
    setToken(null);
    setRoleState(null);
    setUser(null);
    setIsLoading(false);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

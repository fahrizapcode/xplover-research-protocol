"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type RoleName = "ADMIN" | "RESEARCHER" | "CONTENT_CREATOR" | "PEER_REVIEWER" | "VISUAL_DESIGNER";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  walletAddress?: string;
  xcrBalance: number;
  roles: RoleName[];
}

interface AuthContextType {
  user: User | null;
  activeRole: RoleName;
  setActiveRole: (role: RoleName) => void;
  walletAddress: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (email: string) => Promise<void>;
  connectWallet: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<RoleName>("RESEARCHER");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data);
        if (res.data.walletAddress) {
          setWalletAddress(res.data.walletAddress);
        }
        // Set default active role from user roles
        if (res.data.roles && res.data.roles.length > 0) {
          setActiveRole((prev) => (res.data.roles.includes(prev) ? prev : res.data.roles[0]));
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.data) {
        if (res.data.token) {
          localStorage.setItem("xplover_token", res.data.token);
        }
        setUser(res.data.user);
        if (res.data.user.walletAddress) {
          setWalletAddress(res.data.user.walletAddress);
        }
        if (res.data.user.roles && res.data.user.roles.length > 0) {
          setActiveRole(res.data.user.roles[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    await login({ email, password: "Password123!" });
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem("xplover_token");
      setUser(null);
      setWalletAddress(null);
    }
  };

  const connectWallet = async (): Promise<string | null> => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setWalletAddress(addr);
          // Update profile if logged in
          if (user) {
            await api.auth.updateProfile({ walletAddress: addr });
            setUser((prev) => (prev ? { ...prev, walletAddress: addr } : null));
          }
          return addr;
        }
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    } else {
      alert("MetaMask or Web3 wallet not detected. Please install a Web3 wallet extension.");
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        walletAddress,
        isLoading,
        login,
        logout,
        quickLogin,
        connectWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

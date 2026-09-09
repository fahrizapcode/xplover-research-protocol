"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify credentials.");
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    try {
      await quickLogin(demoEmail);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Quick login failed.");
    }
  };

  const demoAccounts = [
    { name: "Dr. Satoshi Nakamoto", role: "Researcher",      email: "satoshi@xplover.io" },
    { name: "Maya Lin",            role: "Content creator",  email: "maya@xplover.io" },
    { name: "Prof. Marcus Brody",  role: "Peer reviewer",    email: "marcus@xplover.io" },
    { name: "Sofia Rossi",         role: "Visual designer",  email: "sofia@xplover.io" },
    { name: "Administrator",       role: "Admin",            email: "admin@xplover.io" },
  ];

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "1rem auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {/* Standard Form */}
      <div className="glass-panel" style={{ padding: "1.75rem", borderRadius: "var(--radius-lg)" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Sign in to Xplover
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
            Connect to the collaborative research and knowledge network.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              color: "#18181b",
              fontSize: "0.78rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="input-field"
                style={{ paddingLeft: "2.2rem" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: "2.2rem" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            <span>{isLoading ? "Signing in..." : "Sign in to network"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>

      {/* Demo Fast-Login Selection */}
      <div className="glass-panel" style={{ padding: "1.75rem", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
          <UserCheck size={16} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Instant demo personas</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginBottom: "1.25rem" }}>
          Select a pre-seeded account to evaluate role-specific workflows:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => handleQuickLogin(acc.email)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-soft)",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color var(--duration-fast) ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.825rem", color: "var(--text-primary)" }}>{acc.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{acc.email}</div>
              </div>
              <span className="badge">
                {acc.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

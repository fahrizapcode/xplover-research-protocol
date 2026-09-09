"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    walletAddress: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.auth.register(formData);
      if (res.success) {
        // Auto login
        await login({ email: formData.email, password: formData.password });
        router.push("/research");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "1.5rem auto" }}>
      <div className="glass-panel" style={{ padding: "1.75rem", borderRadius: "var(--radius-lg)" }}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Join Xplover network
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
            Contribute to science, review carousels, and earn on-chain XCR rewards.
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Full name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Katherine Johnson"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="kjohnson"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="katherine@nasa.gov"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Ethereum / Arbitrum wallet (Optional)
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              placeholder="0x71C...49A"
              className="input-field"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Research bio / specialization
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Orbital mechanics, DeSci governance, applied mathematics..."
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            <span>{isLoading ? "Creating account..." : "Complete registration"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

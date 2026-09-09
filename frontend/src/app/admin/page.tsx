"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import BlockchainBadge from "@/components/BlockchainBadge";
import {
  ShieldAlert,
  Users,
  Cpu,
  Plus,
  Trash2,
  ExternalLink,
  Search,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [attestations, setAttestations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "blockchain">("users");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const availableRoles = [
    "RESEARCHER",
    "CONTENT_CREATOR",
    "PEER_REVIEWER",
    "VISUAL_DESIGNER",
    "ADMIN",
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resChain, resAttest] = await Promise.all([
        api.admin.listUsers({ search: search || undefined }),
        api.admin.getBlockchainInfo(),
        api.admin.getBlockchainAttestations(),
      ]);

      if (resUsers.success && resUsers.data) {
        setUsers(resUsers.data);
      }
      if (resChain.success && resChain.data) {
        setBlockchainInfo(resChain.data);
      }
      if (resAttest.success && resAttest.data) {
        setAttestations(resAttest.data);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleAssignRole = async (userId: string, role: string) => {
    try {
      await api.admin.assignRole(userId, role);
      setActionMessage(`Role ${role} assigned successfully!`);
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to assign role.");
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      await api.admin.removeRole(userId, role);
      setActionMessage(`Role ${role} revoked.`);
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to remove role.");
    }
  };

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#18181b",
              }}
            >
              <ShieldAlert size={16} />
            </div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
              Admin command center
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", maxWidth: "520px" }}>
            Protocol governance, role authorizations, XCR token distribution, and Arbitrum Sepolia attestation monitor.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            onClick={() => setActiveTab("users")}
            className={`tab-pill ${activeTab === "users" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "var(--radius-md)",
              border: activeTab === "users" ? "1px solid #18181b" : "1px solid var(--border-soft)",
              background: activeTab === "users" ? "var(--bg-elevated)" : "transparent",
              color: activeTab === "users" ? "#18181b" : "var(--text-muted)",
              fontSize: "0.78rem",
              fontWeight: activeTab === "users" ? 600 : 400,
            }}
          >
            User governance
          </button>
          <button
            onClick={() => setActiveTab("blockchain")}
            className={`tab-pill ${activeTab === "blockchain" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "var(--radius-md)",
              border: activeTab === "blockchain" ? "1px solid #18181b" : "1px solid var(--border-soft)",
              background: activeTab === "blockchain" ? "var(--bg-elevated)" : "transparent",
              color: activeTab === "blockchain" ? "#18181b" : "var(--text-muted)",
              fontSize: "0.78rem",
              fontWeight: activeTab === "blockchain" ? 600 : 400,
            }}
          >
            Blockchain monitor
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", fontSize: "0.78rem" }}>
          {actionMessage}
        </div>
      )}

      {/* Tab 1: User Governance */}
      {activeTab === "users" && (
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={16} color="var(--text-muted)" />
              <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Active protocol contributors</h2>
            </div>

            <div style={{ position: "relative", minWidth: "220px" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, role..."
                className="input-field"
                style={{ paddingLeft: "2.2rem", paddingRight: "0.85rem", height: "34px", fontSize: "0.78rem" }}
              />
              <Search size={13} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-soft)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Contributor</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Assigned roles</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>XCR balance</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Grant role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userRoles = u.roles?.map((r: any) => r.role?.name || r) || [];

                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{u.email}</div>
                        {u.walletAddress && (
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            {u.walletAddress}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                          {userRoles.map((r: string) => (
                            <span
                              key={r}
                              className="badge"
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.15rem 0.45rem" }}
                            >
                              <span>{r.replace(/_/g, " ").toLowerCase()}</span>
                              {userRoles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRole(u.id, r)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: "0.75rem", fontWeight: 600, color: "#18181b" }}>
                        {u.xcrBalance} XCR
                      </td>

                      <td style={{ padding: "0.75rem" }}>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignRole(u.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="input-field"
                          style={{ width: "auto", fontSize: "0.75rem", padding: "0.25rem 0.5rem", height: "30px" }}
                        >
                          <option value="">+ Assign role...</option>
                          {availableRoles
                            .filter((r) => !userRoles.includes(r))
                            .map((r) => (
                              <option key={r} value={r}>
                                {r.replace(/_/g, " ").toLowerCase()}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Blockchain Monitor */}
      {activeTab === "blockchain" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status & Contract details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Cpu size={16} color="var(--text-muted)" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Arbitrum Sepolia node status</h3>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Integration: <span style={{ fontWeight: 600, color: "#18181b" }}>{blockchainInfo?.enabled ? "Active" : "Disabled"}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>
                RPC: {blockchainInfo?.rpcUrl || "Default Provider"}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>Smart contracts</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div>XCR Token: <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>{blockchainInfo?.xcrTokenAddress || "—"}</span></div>
                <div>Attestation Registry: <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>{blockchainInfo?.attestationAddress || "—"}</span></div>
              </div>
            </div>
          </div>

          {/* Attestation Events Table */}
          <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
              Attestation events ledger
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-soft)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Contribution</th>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Network status</th>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Transaction hash</th>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {attestations.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.65rem 0.75rem", fontWeight: 500, color: "var(--text-primary)" }}>
                        {a.contributionType ? a.contributionType.replace(/_/g, " ").toLowerCase() : "Contribution"}
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem" }}>
                        <span className="badge">
                          {a.status ? a.status.toLowerCase() : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                        {a.transactionHash ? (
                          <a
                            href={`https://sepolia.arbiscan.io/tx/${a.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--text-primary)" }}
                          >
                            <span>{a.transactionHash.slice(0, 10)}...</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Off-chain pending</span>
                        )}
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-muted)" }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

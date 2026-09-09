"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Coins,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";

export default function XCRLedgerPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(user?.xcrBalance || 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.xcr.getMyXCR();
        if (res.success && res.data) {
          setBalance(res.data.balance);
          setTransactions(res.data.history || []);
        }
      } catch (err) {
        console.error("Failed to load XCR data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const typeLabels: Record<string, { label: string; icon: any }> = {
    RESEARCH_SUBMITTED: { label: "Research paper submitted", icon: BookOpen },
    PEER_REVIEW_COMPLETED: { label: "Peer review completed", icon: CheckCircle2 },
    RESEARCH_REFERENCED_CONTENT_APPROVED: { label: "Content carousel approved", icon: LayoutGrid },
    ADMIN_ADJUSTMENT: { label: "Protocol governance grant", icon: ShieldCheck },
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
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
            <Coins size={16} />
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
            XCR token ledger
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
          Xplover Community Research (XCR) ERC-20 token rewards for verifiable scientific contributions.
        </p>
      </div>

      {/* Top Cards: Balance & Reward Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* Balance Card */}
        <div
          className="glass-panel"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Total earned balance
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.35rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 600, color: "#18181b", letterSpacing: "-0.02em" }}>
                {balance}
              </span>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                XCR
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Accumulated through peer reviews, accepted carousels, and scientific research.
            </p>
          </div>

          <div
            style={{
              paddingTop: "0.85rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Token standard</span>
            <span style={{ fontWeight: 500, color: "#18181b" }}>ERC-20 (Arbitrum Sepolia)</span>
          </div>
        </div>

        {/* Reward Schedule Reference Card */}
        <div
          className="glass-panel"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Reward distribution schedule
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Submit verified paper</span>
              <span style={{ fontWeight: 600, color: "#18181b" }}>+10 XCR</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Complete peer review (consensus)</span>
              <span style={{ fontWeight: 600, color: "#18181b" }}>+5 XCR</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Carousel approved for visual</span>
              <span style={{ fontWeight: 600, color: "#18181b" }}>+25 XCR</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Visual design finalized</span>
              <span style={{ fontWeight: 600, color: "#18181b" }}>+10 XCR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
          Transaction history
        </div>

        {isLoading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.825rem" }}>
            Loading ledger history...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.825rem" }}>
            No recorded transactions yet. Contribute to research or reviews to start earning!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-soft)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Event type</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Reward amount</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Reference</th>
                  <th style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const info = typeLabels[tx.transactionType] || { label: tx.transactionType, icon: Coins };
                  const Icon = info.icon;
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.65rem 0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Icon size={14} color="var(--text-muted)" />
                          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{info.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem", fontWeight: 600, color: "#18181b" }}>
                        +{tx.amount} XCR
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                        {tx.referenceId ? `${tx.referenceId.slice(0, 8)}...` : "—"}
                      </td>
                      <td style={{ padding: "0.65rem 0.75rem", color: "var(--text-muted)" }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

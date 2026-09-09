"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  Palette,
  Coins,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.activity.list(1, 40);
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error("Failed to load activity logs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const actionMeta: Record<string, { label: string; icon: any }> = {
    RESEARCH_SUBMITTED: { label: "Published scientific research", icon: BookOpen },
    PEER_REVIEW_COMPLETED: { label: "Submitted peer review", icon: CheckCircle2 },
    CONTENT_APPROVED: { label: "Carousel consensus approved", icon: CheckCircle2 },
    CONTENT_SUBMITTED: { label: "Submitted carousel for review", icon: LayoutGrid },
    VISUAL_DESIGN_COMPLETED: { label: "Finalized visual slides", icon: Palette },
    CONTENT_PUBLISHED: { label: "Published carousel to network", icon: ShieldCheck },
    XCR_EARNED: { label: "Earned XCR tokens", icon: Coins },
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
            <Activity size={16} />
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
            Audit & activity trail
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
          Chronological stream of all contributions, consensus approvals, and incentive distributions.
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
        {isLoading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.825rem" }}>
            Loading activity stream...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.825rem" }}>
            No activity logged yet. Start contributing to generate an audit trail!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
            {logs.map((log) => {
              const meta = actionMeta[log.action] || {
                label: log.action.replace(/_/g, " ").toLowerCase(),
                icon: Activity,
              };
              const Icon = meta.icon;

              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    gap: "0.85rem",
                    alignItems: "flex-start",
                    paddingBottom: "0.85rem",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#18181b",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={11} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Actor: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{log.actor?.name || "System"}</span> ({log.actor?.email || "internal"})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

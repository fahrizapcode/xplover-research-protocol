"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CarouselSlideViewer from "@/components/CarouselSlideViewer";
import {
  Palette,
  CheckCircle2,
  Play,
  RefreshCw,
  Layers,
  ArrowRight,
  X,
  XCircle,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";

// ──────────────────────────────────────────────
// Confirmation Modal
// ──────────────────────────────────────────────
interface CompleteModalProps {
  item: any;
  user: any;
  onConfirm: (remark: string) => void;
  onClose: () => void;
}

function CompleteModal({ item, user, onConfirm, onClose }: CompleteModalProps) {
  const [remark, setRemark] = useState("");

  const designer = item.visualDesign?.designer;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "1.75rem",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <CheckCircle2 size={16} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                Mark design as complete
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Confirm that you've finished the visual design for this carousel. This action will move it to the
              publication queue.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ flexShrink: 0, padding: "0.3rem" }}>
            <X size={14} />
          </button>
        </div>

        {/* Audit trail — who started the design */}
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-soft)",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Design audit trail
          </div>

          {/* Started by */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={12} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Design started by
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {designer ? `${designer.name} (@${designer.username})` : "Unknown designer"}
              </div>
            </div>
          </div>

          {/* Will be completed by */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={12} style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Completion claimed by
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {user ? `${user.name} (@${user.username})` : "You"}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel being completed */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>Carousel</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
        </div>

        {/* Remark field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            Design notes / enhancements applied <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Applied typography hierarchy, adjusted color palette for accessibility…"
            rows={3}
            className="input-field"
            style={{ resize: "none", lineHeight: 1.5, fontSize: "0.8rem" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.65rem" }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(remark)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <CheckCircle2 size={13} />
            <span>Confirm completion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
export default function VisualStudioPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.visual.getQueue();
      if (res.success && res.data) {
        // Show only READY_FOR_VISUAL and IN_VISUAL_DESIGN
        const filtered = res.data.filter(
          (c: any) => c.status === "READY_FOR_VISUAL" || c.status === "IN_VISUAL_DESIGN"
        );
        setQueue(filtered);
        // Keep selectedItem in sync
        if (selectedItem) {
          const updated = filtered.find((c: any) => c.id === selectedItem.id);
          setSelectedItem(updated ?? null);
        }
      }
    } catch (err) {
      console.error("Failed to load visual queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartDesign = async (contentId: string) => {
    try {
      await api.visual.start(contentId);
      showMsg("Visual design session started.");
      await loadQueue();
    } catch (err: any) {
      showMsg(err.message || "Failed to start design.", "error");
    }
  };

  const handleCancelDesign = async (contentId: string) => {
    try {
      await api.visual.cancel(contentId);
      showMsg("Visual design session cancelled. Carousel returned to design queue.");
      await loadQueue();
    } catch (err: any) {
      showMsg(err.message || "Failed to cancel design.", "error");
    }
  };

  const handleCompleteDesign = async (remark: string) => {
    if (!selectedItem) return;
    try {
      await api.visual.complete(selectedItem.id, remark);
      showMsg("Visual design marked as complete! Carousel moved to publication queue.");
      setShowCompleteModal(false);
      setSelectedItem(null);
      await loadQueue();
    } catch (err: any) {
      showMsg(err.message || "Failed to complete design.", "error");
    }
  };

  const STATUS_LABEL: Record<string, string> = {
    READY_FOR_VISUAL: "Ready to design",
    IN_VISUAL_DESIGN: "In visual design",
  };

  const STATUS_COLOR: Record<string, string> = {
    READY_FOR_VISUAL: "var(--text-secondary)",
    IN_VISUAL_DESIGN: "var(--accent)",
  };

  return (
    <>
      {showCompleteModal && selectedItem && (
        <CompleteModal
          item={selectedItem}
          user={user}
          onConfirm={handleCompleteDesign}
          onClose={() => setShowCompleteModal(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                }}
              >
                <Palette size={16} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
                Visual design studio
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", maxWidth: "520px" }}>
              Transform peer-reviewed educational slide decks into finalized, publication-ready visual assets.
            </p>
          </div>

          <button onClick={loadQueue} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} />
            <span>Refresh queue</span>
          </button>
        </div>

        {/* Feedback toast */}
        {actionMessage && (
          <div
            style={{
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              background: actionMessage.type === "error" ? "rgba(239,68,68,0.08)" : "var(--bg-elevated)",
              border: `1px solid ${actionMessage.type === "error" ? "rgba(239,68,68,0.25)" : "var(--border-soft)"}`,
              fontSize: "0.78rem",
              color: actionMessage.type === "error" ? "#ef4444" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {actionMessage.type === "error" ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
            {actionMessage.text}
          </div>
        )}

        {/* Queue */}
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Loading design queue…
          </div>
        ) : queue.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              No carousels ready for design
            </div>
            <div style={{ fontSize: "0.825rem" }}>
              All reviewed carousels have been polished or are still awaiting peer review.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1rem" }}>
            {queue.map((c) => {
              const label = STATUS_LABEL[c.status] ?? c.status?.replace(/_/g, " ").toLowerCase();
              const isInDesign = c.status === "IN_VISUAL_DESIGN";
              const designer = c.visualDesign?.designer;
              const isSelected = selectedItem?.id === c.id;

              return (
                <div
                  key={c.id}
                  className="glass-panel"
                  style={{
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "var(--radius-lg)",
                    transition: "border-color var(--duration-fast) ease",
                    borderColor: isSelected ? "var(--border-strong)" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = isSelected ? "var(--border-strong)" : "var(--border-soft)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                      <span
                        className="badge"
                        style={{ color: STATUS_COLOR[c.status] }}
                      >
                        {label}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Layers size={13} />
                        <span>{c.slides?.length || 0} slides</span>
                      </span>
                    </div>

                    <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem", lineHeight: 1.35 }}>
                      {c.title}
                    </h2>

                    <p
                      className="truncate-2"
                      style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.65rem", lineHeight: 1.5 }}
                    >
                      Hook: "{c.hook}"
                    </p>

                    {/* Show who is designing if in progress */}
                    {isInDesign && designer && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          marginBottom: "0.65rem",
                        }}
                      >
                        <User size={11} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Being designed by{" "}
                          <strong style={{ color: "var(--text-primary)" }}>
                            {designer.name}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      By {c.creator?.name || "Creator"}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedItem(c);
                        setTimeout(() => {
                          document.getElementById("visual-workspace")?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                    >
                      <span>Open workspace</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Selected Workspace Panel ── */}
        {selectedItem && (
          <div
            id="visual-workspace"
            className="glass-panel"
            style={{
              marginTop: "0.5rem",
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {/* Workspace header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem" }}>
              <div>
                <span className="badge" style={{ marginBottom: "0.35rem" }}>
                  Design workspace
                </span>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {selectedItem.title}
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                  {STATUS_LABEL[selectedItem.status] ?? selectedItem.status?.replace(/_/g, " ")}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                <X size={13} />
                <span>Close</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
              {/* Slide preview */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  Interactive deck preview
                </div>
                <CarouselSlideViewer slides={selectedItem.slides || []} />
              </div>

              {/* Right column: Carousel info + Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Carousel metadata */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Carousel content
                  </div>

                  {selectedItem.hook && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Hook</div>
                      <div style={{ fontSize: "0.825rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                        {selectedItem.hook}
                      </div>
                    </div>
                  )}

                  {selectedItem.headline && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Headline</div>
                      <div style={{ fontSize: "0.825rem", color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.4 }}>
                        {selectedItem.headline}
                      </div>
                    </div>
                  )}

                  {selectedItem.caption && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Caption</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {selectedItem.caption}
                      </div>
                    </div>
                  )}

                  {selectedItem.cta && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Call to action</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {selectedItem.cta}
                      </div>
                    </div>
                  )}

                  {selectedItem.targetAudience && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Audience</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          {selectedItem.targetAudience.replace(/_/g, " ").toLowerCase()}
                        </div>
                      </div>
                      {selectedItem.contentAngle && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 500 }}>Angle</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                            {selectedItem.contentAngle.replace(/_/g, " ").toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedItem.sources && selectedItem.sources.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontWeight: 500 }}>Sources</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        {selectedItem.sources.map((src: string, i: number) => (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.75rem", color: "var(--accent-indigo)", textDecoration: "none", wordBreak: "break-all" }}
                          >
                            {src}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit trail card */}
                {selectedItem.visualDesign && (
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-soft)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.65rem",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Design audit trail
                    </div>

                    {selectedItem.visualDesign.designer && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                        >
                          <User size={13} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Started by</div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {selectedItem.visualDesign.designer.name}{" "}
                            <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>
                              @{selectedItem.visualDesign.designer.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItem.visualDesign.status === "COMPLETED" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: "#fff" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Completed by</div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {selectedItem.visualDesign.designer.name}{" "}
                            <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>
                              @{selectedItem.visualDesign.designer.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItem.visualDesign.remark && (
                      <div
                        style={{
                          padding: "0.5rem 0.65rem",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          display: "flex",
                          gap: "0.4rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <Clock size={11} style={{ color: "var(--text-muted)", marginTop: "2px", flexShrink: 0 }} />
                        <span>{selectedItem.visualDesign.remark}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Workflow actions */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.1rem" }}>
                    Workflow actions
                  </div>

                  {/* READY_FOR_VISUAL → start */}
                  {selectedItem.status === "READY_FOR_VISUAL" && (
                    <button
                      onClick={() => handleStartDesign(selectedItem.id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                    >
                      <Play size={13} />
                      <span>Start visual design session</span>
                    </button>
                  )}

                  {/* IN_VISUAL_DESIGN → complete or cancel */}
                  {selectedItem.status === "IN_VISUAL_DESIGN" && (
                    <>
                      <button
                        onClick={() => setShowCompleteModal(true)}
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%" }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark design as complete</span>
                      </button>

                      <button
                        onClick={() => handleCancelDesign(selectedItem.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: "100%", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                      >
                        <XCircle size={13} />
                        <span>Cancel design session</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

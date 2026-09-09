"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CarouselSlideViewer from "@/components/CarouselSlideViewer";
import {
  CheckCircle2,
  Layers,
  Coins,
  Sliders,
  X,
} from "lucide-react";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 8 Review Scores (1-10)
  const [scores, setScores] = useState({
    accuracyScore: 9,
    relevanceScore: 9,
    clarityScore: 8,
    hookScore: 8,
    valueScore: 9,
    flowScore: 8,
    ctaScore: 8,
    consistencyScore: 9,
  });
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const criteriaLabels: Record<string, { label: string; desc: string }> = {
    accuracyScore: { label: "Scientific accuracy", desc: "Faithfulness to source research findings" },
    relevanceScore: { label: "Research relevance", desc: "Correct mapping to academic problem" },
    clarityScore: { label: "Clarity & tone", desc: "Accessible language for targeted audience" },
    hookScore: { label: "Opening hook", desc: "Attention-grabbing first slide / teaser" },
    valueScore: { label: "Educational value", desc: "Actionable takeaways for builders" },
    flowScore: { label: "Logical flow", desc: "Smooth narrative progression across slides" },
    ctaScore: { label: "Call to action", desc: "Inspires constructive community debate" },
    consistencyScore: { label: "Term consistency", desc: "Rigorous technical nomenclature" },
  };

  const loadPending = async () => {
    setIsLoading(true);
    try {
      const res = await api.content.getPendingReviews();
      if (res.success && res.data) {
        const filtered = (res.data || []).filter(
          (c: any) =>
            c.createdBy !== user?.id &&
            c.creatorId !== user?.id &&
            c.creator?.id !== user?.id
        );
        setPendingContent(filtered);
      }
    } catch (err) {
      console.error("Failed to load review queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleScoreChange = (field: string, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const averageScore =
    Object.values(scores).reduce((acc, val) => acc + val, 0) / Object.values(scores).length;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent) return;

    setIsSubmitting(true);
    setReviewMessage(null);

    try {
      const res = await api.content.submitReview(selectedContent.id, {
        ...scores,
        comment,
      });

      if (res.success) {
        setReviewMessage("Review recorded! +5 XCR credited and on-chain attestation scheduled.");
        setTimeout(() => {
          setSelectedContent(null);
          setReviewMessage(null);
          setComment("");
          loadPending();
        }, 1500);
      }
    } catch (err: any) {
      setReviewMessage(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                color: "#18181b",
              }}
            >
              <CheckCircle2 size={16} />
            </div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
              Peer reviewer dashboard
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", maxWidth: "520px" }}>
            Decentralized quality consensus. 5 peer reviews required per carousel with a ≥ 8.0/10 average score for automated approval.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-soft)",
            color: "var(--text-primary)",
            fontWeight: 500,
            fontSize: "0.78rem",
          }}
        >
          <Coins size={14} color="var(--text-muted)" />
          <span>Reward: +5 XCR per review</span>
        </div>
      </div>

      {/* Queue List */}
      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Loading pending peer reviews...
        </div>
      ) : pendingContent.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No pending carousels
          </div>
          <div style={{ fontSize: "0.825rem" }}>
            No carousels are currently waiting for your review. Check back soon!
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {pendingContent.map((c) => {
            const reviewCount = c.reviews?.length || c._count?.reviews || 0;

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
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                    <span className="badge">
                      Under review ({reviewCount}/5)
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Layers size={13} />
                      <span>{c.slides?.length || 0} slides</span>
                    </span>
                  </div>

                  <h2 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.35rem", lineHeight: 1.35, color: "var(--text-primary)" }}>
                    {c.title}
                  </h2>

                  <p className="truncate-2" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.65rem", lineHeight: 1.5 }}>
                    Hook: "{c.hook}"
                  </p>

                  {c.research && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.65rem" }}>
                      Source: {c.research.title}
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
                      setSelectedContent(c);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                  >
                    <Sliders size={12} />
                    <span>Evaluate (+5 XCR)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal / Drawer */}
      {selectedContent && (
        <div
          className="glass-panel"
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <span className="badge" style={{ marginBottom: "0.35rem" }}>
                Active evaluation session
              </span>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Evaluating: {selectedContent.title}
              </h2>
            </div>

            <button
              onClick={() => setSelectedContent(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.4rem",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Left: Slide Viewer */}
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Slide preview
              </div>
              <CarouselSlideViewer slides={selectedContent.slides || []} />
            </div>

            {/* Right: Evaluation Criteria */}
            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Rubric criteria (1 - 10)
                </span>
                <span className="badge" style={{ fontWeight: 600 }}>
                  Average: {averageScore.toFixed(1)} / 10
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {Object.entries(criteriaLabels).map(([key, { label, desc }]) => (
                  <div
                    key={key}
                    style={{
                      padding: "0.65rem",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-primary)" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {scores[key as keyof typeof scores]}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                      {desc}
                    </p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores[key as keyof typeof scores]}
                      onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "#18181b", cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.35rem", color: "var(--text-primary)" }}>
                  Constructive feedback / notes (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide guidance on scientific accuracy, clarity, or suggested slide revisions..."
                  className="input-field"
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              {reviewMessage && (
                <div style={{ padding: "0.65rem", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", fontSize: "0.78rem" }}>
                  {reviewMessage}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedContent(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit evaluation (+5 XCR)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import BlockchainBadge from "@/components/BlockchainBadge";
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Star,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  Layers,
  TrendingUp,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

const formatCategory = (cat?: string) => {
  if (!cat) return "Research";
  const map: Record<string, string> = {
    AI_ML: "AI & Machine Learning",
    DECENTRALIZED_SCIENCE: "Decentralized Science",
    BLOCKCHAIN_INFRASTRUCTURE: "Blockchain Infrastructure",
    ZERO_KNOWLEDGE: "Zero Knowledge",
    DEFI_PRIMITIVES: "DeFi Primitives",
    BIOTECH: "Biotech",
  };
  if (map[cat]) return map[cat];
  return cat
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStatus = (status?: string) => {
  if (!status) return "Ready to review";
  const map: Record<string, string> = {
    DRAFT: "Ready to review",
    SUBMITTED: "Ready to review",
    UNDER_REVIEW: "Ready to review",
    REVISION_REQUIRED: "Revision required",
    APPROVED: "Ready for visual design",
    READY_FOR_VISUAL: "Ready for visual design",
    IN_VISUAL_DESIGN: "In visual design",
    VISUAL_COMPLETED: "Ready to publish",
    PUBLISHED: "Published",
  };
  if (map[status]) return map[status];
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [research, setResearch] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [attestations, setAttestations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rating form state
  const [userScore, setUserScore] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resPaper, resRatings, resAttest] = await Promise.all([
        api.research.getById(id),
        api.research.getRatings(id),
        api.activity.getAttestations("RESEARCH", id).catch(() => ({ success: false, data: [] })),
      ]);

      if (resPaper.success && resPaper.data) {
        setResearch(resPaper.data);
      }
      if (resRatings.success && resRatings.data) {
        setRatings(resRatings.data.ratings || resRatings.data || []);
      }
      if (resAttest.success && resAttest.data) {
        setAttestations(resAttest.data);
      }
    } catch (err) {
      console.error("Failed to load research:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    setRatingMessage(null);
    try {
      await api.research.rate(id, userScore, comment);
      setRatingMessage("Rating submitted successfully!");
      setComment("");
      await loadData();
    } catch (err: any) {
      setRatingMessage(err.message || "Failed to submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading scientific publication...
      </div>
    );
  }

  if (!research) {
    return (
      <div className="glass-panel detail-card-panel" style={{ textAlign: "center" }}>
        <h2>Research not found</h2>
        <Link href="/research" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Repository
        </Link>
      </div>
    );
  }

  const latestAttestation = attestations.length > 0 ? attestations[0] : null;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top Breadcrumb & Actions */}
      <div className="detail-top-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <Link
          href="/research"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.825rem",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Repository</span>
        </Link>

        <div className="detail-action-buttons" style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          <BlockchainBadge
            status={latestAttestation?.status || "CONFIRMED"}
            txHash={latestAttestation?.transactionHash}
          />

          <Link
            href={`/content/new?researchId=${research.id}`}
            className="btn btn-primary btn-sm"
          >
            <LayoutGrid size={14} />
            <span>Create carousel</span>
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span
            className="badge badge-cyan"
            style={{ fontSize: "0.72rem" }}
          >
            {formatCategory(research.technologyCategory)}
          </span>
          <span className="badge badge-muted" style={{ fontSize: "0.72rem" }}>
            Published {research.publicationYear}
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(1.2rem, 3.5vw, 1.65rem)",
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.015em",
            marginBottom: "1rem",
            color: "#18181b",
          }}
        >
          {research.title}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            paddingTop: "0.85rem",
            borderTop: "1px solid var(--border-soft)",
            fontSize: "0.825rem",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
            <User size={15} color="var(--text-muted)" />
            <span>Submitted by <strong style={{ fontWeight: 600, color: "#18181b" }}>{research.author?.name || "Researcher"}</strong></span>
            {research.author?.walletAddress && (
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                ({research.author.walletAddress.slice(0, 6)}...{research.author.walletAddress.slice(-4)})
              </span>
            )}
          </div>

          <a
            href={research.paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span>Original paper</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Detailed Analysis Breakdown */}
      <div className="detail-grid">
        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <AlertCircle size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            The Core Problem
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.problem}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <Layers size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            Methodological Approach
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.approach}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <TrendingUp size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            Key Findings & Benchmarks
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.keyFindings}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <MessageSquare size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            Researcher Commentary
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.researcherInsight}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <Lightbulb size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            Why It Matters
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.whyItMatters}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "1.15rem", borderRadius: "var(--radius-md)" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              marginBottom: "0.6rem",
            }}
          >
            <GraduationCap size={14} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b", marginBottom: "0.35rem" }}>
            What Community Should Learn
          </h3>
          <p style={{ fontSize: "0.825rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {research.whatCommunityShouldLearn}
          </p>
        </div>
      </div>

      {/* Linked Carousels */}
      {research.content && research.content.length > 0 && (
        <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <LayoutGrid size={18} color="#18181b" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#18181b" }}>
              Derived Educational Carousels ({research.content.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {research.content.map((c: any) => (
              <Link
                key={c.id}
                href={`/content/${c.id}`}
                style={{
                  textDecoration: "none",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "#ffffff",
                  border: "1px solid var(--border-soft)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    className="badge"
                    style={{ fontSize: "0.68rem", marginBottom: "0.35rem" }}
                  >
                    {formatStatus(c.status)}
                  </span>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.35rem", lineHeight: 1.35 }}>
                    {c.title}
                  </h4>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                  By {c.creator?.name || "Creator"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Peer Ratings and Comments Section */}
      <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Star size={18} color="#18181b" fill="#18181b" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#18181b" }}>Peer Ratings & Discussions</h2>
        </div>

        {/* Rating Submission Box */}
        <form
          onSubmit={handleRatingSubmit}
          style={{
            background: "rgba(11, 15, 26, 0.6)",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Rate Research Quality:</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setUserScore(star)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.2rem",
                  }}
                >
                  <Star
                    size={22}
                    color="#fbbf24"
                    fill={star <= userScore ? "#fbbf24" : "transparent"}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your peer assessment or discussion feedback on this paper..."
            className="input-field"
            rows={3}
            style={{ marginBottom: "1rem" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {ratingMessage && (
              <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 600 }}>
                {ratingMessage}
              </span>
            )}
            <button
              type="submit"
              disabled={isSubmittingRating}
              className="btn btn-primary btn-sm"
              style={{ marginLeft: "auto", padding: "0.5rem 1.2rem" }}
            >
              <Send size={14} />
              <span>{isSubmittingRating ? "Submitting..." : "Submit Rating"}</span>
            </button>
          </div>
        </form>

        {/* Previous Ratings List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ratings.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>
              No peer reviews posted yet. Be the first to evaluate this paper!
            </div>
          ) : (
            ratings.map((r: any) => (
              <div
                key={r.id}
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      {r.user?.name || "Peer Reviewer"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      • {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color="#fbbf24"
                        fill={i < r.score ? "#fbbf24" : "transparent"}
                      />
                    ))}
                  </div>
                </div>

                {r.comment && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {r.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

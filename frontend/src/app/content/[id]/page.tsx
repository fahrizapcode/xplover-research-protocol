"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CarouselSlideViewer from "@/components/CarouselSlideViewer";
import BlockchainBadge from "@/components/BlockchainBadge";
import {
  LayoutGrid,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Palette,
  Sparkles,
  Send,
  AlertCircle,
  FileText,
  Star,
  Award,
} from "lucide-react";

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

const formatText = (val?: string) => {
  if (!val) return "";
  return val
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, activeRole } = useAuth();

  const [content, setContent] = useState<any>(null);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [attestations, setAttestations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resContent, resReviews, resAttest] = await Promise.all([
        api.content.getById(id),
        api.content.getReviewResult(id).catch(() => ({ success: false, data: null })),
        api.activity.getAttestations("CONTENT", id).catch(() => ({ success: false, data: [] })),
      ]);

      if (resContent.success && resContent.data) {
        setContent(resContent.data);
      }
      if (resReviews.success && resReviews.data) {
        setReviewResult(resReviews.data);
      }
      if (resAttest.success && resAttest.data) {
        setAttestations(resAttest.data);
      }
    } catch (err) {
      console.error("Failed to load content details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleSubmitForReview = async () => {
    try {
      await api.content.submit(id);
      setActionMessage("Submitted for peer review!");
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to submit.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading educational carousel...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="glass-panel detail-card-panel" style={{ textAlign: "center" }}>
        <h2>Carousel not found</h2>
        <Link href="/content" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Library
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
          href="/content"
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
          <span>Back to Carousel Library</span>
        </Link>

        <div className="detail-action-buttons" style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          <BlockchainBadge
            status={latestAttestation?.status || "CONFIRMED"}
            txHash={latestAttestation?.transactionHash}
          />

          {content.status === "UNDER_REVIEW" && (
            <Link
              href="/reviews"
              className="btn btn-secondary btn-sm"
            >
              <CheckCircle2 size={14} />
              <span>Review queue</span>
            </Link>
          )}

          {(content.status === "READY_FOR_VISUAL" || content.status === "APPROVED") && (
            <Link
              href="/visual"
              className="btn btn-primary btn-sm"
            >
              <Palette size={14} />
              <span>Visual studio</span>
            </Link>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#059669",
            fontSize: "0.825rem",
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* Main Header Card */}
      <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span
            className="badge"
            style={{ fontSize: "0.72rem" }}
          >
            {formatStatus(content.status)}
          </span>
          {content.targetAudience && (
            <span className="badge badge-muted" style={{ fontSize: "0.72rem" }}>
              {formatText(content.targetAudience)}
            </span>
          )}
          {content.contentAngle && (
            <span className="badge badge-muted" style={{ fontSize: "0.72rem" }}>
              {formatText(content.contentAngle)}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.65rem)", fontWeight: 600, color: "#18181b", marginBottom: "0.4rem", lineHeight: 1.3, letterSpacing: "-0.015em" }}>
          {content.title}
        </h1>
        {content.headline && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.85rem", lineHeight: 1.5 }}>
            {content.headline}
          </p>
        )}

        {content.research && (
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: "1px solid var(--border-soft)" }}>
            <span>Adapted from paper:</span>
            <Link
              href={`/research/${content.research.id}`}
              style={{ color: "#18181b", textDecoration: "none", fontWeight: 600 }}
            >
              {content.research.title}
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Carousel Slide Viewer */}
      <CarouselSlideViewer
        slides={content.slides || []}
        title={content.title}
        hook={content.hook}
      />

      {/* Peer Review Scorecard & Evaluation Summary */}
      {reviewResult && (
        <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={18} color="#18181b" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#18181b" }}>Peer Review Consensus</h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                background: reviewResult.overallScore >= 8.0 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                border: reviewResult.overallScore >= 8.0 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                color: reviewResult.overallScore >= 8.0 ? "#6ee7b7" : "#fcd34d",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              <span>Score: {reviewResult.overallScore?.toFixed(1) || "N/A"}/10</span>
              <span>•</span>
              <span>{reviewResult.reviewCount || 0}/5 Reviewers</span>
            </div>
          </div>

          {/* 8-Criteria Metric Breakdown */}
          {reviewResult.categoryAverages && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {Object.entries(reviewResult.categoryAverages).map(([key, val]: [string, any]) => (
                <div
                  key={key}
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.775rem", marginBottom: "0.4rem" }}>
                    <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {key.replace("Score", "")}
                    </span>
                    <span style={{ fontWeight: 700, color: val >= 8 ? "#34d399" : "#fbbf24" }}>
                      {typeof val === "number" ? val.toFixed(1) : val}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
                    <div
                      style={{
                        width: `${Math.min(100, (Number(val) / 10) * 100)}%`,
                        height: "100%",
                        background: val >= 8 ? "var(--accent-emerald)" : "var(--accent-amber)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviewer Feedback Comments */}
          {reviewResult.reviews && reviewResult.reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Reviewer Assessments
              </h3>
              {reviewResult.reviews.map((r: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(11, 15, 26, 0.5)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {r.reviewer?.name || `Reviewer ${idx + 1}`}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Round {r.reviewRound || 1}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visual Design Status Card */}
      {content.visualDesign && (
        <div className="glass-panel detail-card-panel" style={{ borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Palette size={18} color="#18181b" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#18181b" }}>Visual Design Phase</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <span className="badge" style={{ fontSize: "0.72rem" }}>
              {formatStatus(content.visualDesign.status)}
            </span>
            <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Designer: <strong style={{ fontWeight: 600, color: "#18181b" }}>{content.visualDesign.designer?.name || "Sofia Rossi"}</strong>
            </span>
          </div>
          {content.visualDesign.remark && (
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Remarks: "{content.visualDesign.remark}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}

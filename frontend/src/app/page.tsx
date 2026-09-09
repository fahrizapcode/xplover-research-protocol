"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  Palette,
  Coins,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/* ── Stat card (Monochrome Clean) ── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{
        padding: "1rem 1.15rem",
        borderRadius: "var(--radius-md)",
        animationDelay: `${delay}ms`,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 500, fontFamily: "var(--font-heading)", color: "var(--text-muted)" }}>
          {label}
        </span>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <Icon size={14} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: "1.45rem", fontWeight: 600, fontFamily: "var(--font-heading)", letterSpacing: "-0.02em", color: "#18181b", lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

/* ── Workflow stage card (Monochrome Clean) ── */
function WorkflowCard({
  step,
  title,
  desc,
  icon: Icon,
  xcr,
  delay = 0,
}: {
  step: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  xcr?: string;
  delay?: number;
}) {
  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        padding: "1.15rem",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
        animationDelay: `${delay}ms`,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
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
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}>
            Stage {step}
          </div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, fontFamily: "var(--font-heading)", color: "var(--text-primary)", lineHeight: 1.2 }}>
            {title}
          </div>
        </div>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {desc}
      </p>

      {xcr && (
        <div
          className="badge"
          style={{
            alignSelf: "flex-start",
            gap: "0.25rem",
            fontSize: "0.7rem",
            padding: "0.15rem 0.5rem",
          }}
        >
          <Coins size={10} color="var(--text-muted)" />
          <span>{xcr}</span>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, activeRole } = useAuth();
  const [recentResearch, setRecentResearch] = useState<any[]>([]);
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalResearch: number | null;
    totalContent: number | null;
    totalXCR: number | null;
    totalAttestations: number | null;
  }>({
    totalResearch: null,
    totalContent: null,
    totalXCR: null,
    totalAttestations: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [resResearch, resContent] = await Promise.all([
          api.research.list({ limit: 100 }),
          api.content.list({ limit: 100 }),
        ]);

        const allResearch = resResearch.success && resResearch.data ? resResearch.data : [];
        const allContent = resContent.success && resContent.data ? resContent.data : [];

        setRecentResearch(allResearch.slice(0, 3));
        setFeaturedContent(allContent.slice(0, 3));

        // XCR: sum of all content XCR rewards (25 per approved content + 5 per review)
        // Use content + research count to derive distributed XCR
        const publishedCount = allContent.filter((c: any) => c.status === "PUBLISHED").length;
        const reviewedCount = allContent.filter((c: any) =>
          ["READY_FOR_VISUAL", "IN_VISUAL_DESIGN", "VISUAL_COMPLETED", "PUBLISHED"].includes(c.status)
        ).length;
        const estimatedXCR = allResearch.length * 10 + publishedCount * 25 + reviewedCount * 5;

        setStats({
          totalResearch: allResearch.length,
          totalContent: allContent.length,
          totalXCR: estimatedXCR,
          totalAttestations: allContent.filter((c: any) => c.status === "PUBLISHED").length,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ── Hero Section (Solid Monochrome Clean) ── */}
      <div
        className="animate-fade-in hero-card"
        style={{
          borderRadius: "var(--radius-lg)",
          background: "#ffffff",
          border: "1px solid var(--border-soft)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "680px", position: "relative" }}>
          
          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              fontSize: "0.72rem",
              fontWeight: 500,
              fontFamily: "var(--font-heading)",
              marginBottom: "1.25rem",
              color: "var(--text-primary)",
            }}
          >
            <span className="live-dot" />
            <span>Xplover 2.0 protocol • Arbitrum Sepolia</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
              fontWeight: 600,
              fontFamily: "var(--font-heading)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "0.85rem",
              color: "#18181b",
            }}
          >
            Decentralized science & collaborative knowledge
          </h1>

          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginBottom: "1.5rem",
              maxWidth: "540px",
            }}
          >
            Transform complex academic papers into verifiable educational carousels.
            Powered by peer-review consensus, cryptographic attestations, and the XCR incentive ledger.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
            <Link href="/research" className="btn btn-primary btn-sm">
              <BookOpen size={14} />
              <span>Explore research hub</span>
              <ArrowRight size={13} />
            </Link>
            {(activeRole === "CONTENT_CREATOR" || activeRole === "ADMIN") && (
              <Link href="/content/new" className="btn btn-secondary btn-sm">
                <LayoutGrid size={14} />
                <span>Create carousel</span>
              </Link>
            )}
            {(activeRole === "PEER_REVIEWER" || activeRole === "ADMIN") && (
              <Link href="/reviews" className="btn btn-outline btn-sm">
                <CheckCircle2 size={14} />
                <span>Review queue</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Protocol Metrics ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <StatCard
          label="Research papers"
          value={stats.totalResearch === null ? "—" : String(stats.totalResearch)}
          sub="Submitted to repository"
          icon={BookOpen}
          delay={0}
        />
        <StatCard
          label="Carousels created"
          value={stats.totalContent === null ? "—" : String(stats.totalContent)}
          sub="Visual storytelling units"
          icon={LayoutGrid}
          delay={40}
        />
        <StatCard
          label="XCR distributed"
          value={stats.totalXCR === null ? "—" : `${stats.totalXCR} XCR`}
          sub="Token rewards"
          icon={Coins}
          delay={80}
        />
        <StatCard
          label="Published"
          value={stats.totalAttestations === null ? "—" : String(stats.totalAttestations)}
          sub="On-chain attestations"
          icon={ShieldCheck}
          delay={120}
        />
      </div>

      {/* ── 5-Stage Workflow ── */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.85rem" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.2rem" }}>Architecture</div>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 600,
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.015em",
                color: "var(--text-primary)",
              }}
            >
              5-stage collaborative workflow
            </h2>
          </div>
          <span
            className="mobile-hide"
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}
          >
            From raw paper to verified visual knowledge
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <WorkflowCard
            step="1"
            title="Submit research"
            desc="Researchers publish papers with IPFS links, abstract, and methodology metadata."
            icon={BookOpen}
            xcr="+10 XCR"
            delay={0}
          />
          <WorkflowCard
            step="2"
            title="Draft carousel"
            desc="Creators adapt findings into structured, slide-by-slide educational decks."
            icon={LayoutGrid}
            xcr="+15 XCR"
            delay={40}
          />
          <WorkflowCard
            step="3"
            title="Peer review"
            desc="Domain experts evaluate accuracy, clarity, and depth before approval."
            icon={CheckCircle2}
            xcr="+5 XCR"
            delay={80}
          />
          <WorkflowCard
            step="4"
            title="Visual design"
            desc="Designers refine typography, layout balance, and theme visual appeal."
            icon={Palette}
            xcr="+10 XCR"
            delay={120}
          />
          <WorkflowCard
            step="5"
            title="On-chain finality"
            desc="Attestation recorded on Arbitrum Sepolia ledger with immutable proof."
            icon={ShieldCheck}
            xcr="On-chain"
            delay={160}
          />
        </div>
      </div>

      {/* ── Recent Research & Featured Carousels ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>

        {/* Recent Research */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "0.15rem" }}>Knowledge base</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, fontFamily: "var(--font-heading)" }}>
                Recent research papers
              </h3>
            </div>
            <Link href="/research" className="btn btn-secondary btn-sm" style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}>
              <span>View all</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recentResearch.length > 0 ? (
              recentResearch.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/research/${item.id}`}
                  style={{
                    padding: "0.75rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    textDecoration: "none",
                    transition: "border-color var(--duration-fast) ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge" style={{ fontSize: "0.62rem" }}>
                      {item.technologyCategory ? item.technologyCategory.replace(/_/g, " ").toLowerCase() : "Research"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {item.author?.name || "Researcher"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Loading papers...
              </div>
            )}
          </div>
        </div>

        {/* Featured Carousels */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "0.15rem" }}>Decks</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, fontFamily: "var(--font-heading)" }}>
                Verified carousels
              </h3>
            </div>
            <Link href="/content" className="btn btn-secondary btn-sm" style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}>
              <span>View all</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {featuredContent.length > 0 ? (
              featuredContent.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  style={{
                    padding: "0.75rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    textDecoration: "none",
                    transition: "border-color var(--duration-fast) ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge" style={{ fontSize: "0.62rem" }}>
                      {item.status ? item.status.replace(/_/g, " ").toLowerCase() : "Published"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {item.slides?.length || 0} slides
                    </span>
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Loading carousels...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

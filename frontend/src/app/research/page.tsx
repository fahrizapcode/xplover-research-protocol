"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Search,
  Plus,
  Star,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  { label: "All",              value: "" },
  { label: "AI & ML",          value: "ARTIFICIAL_INTELLIGENCE" },
  { label: "Web3 & Crypto",    value: "WEB3" },
  { label: "Cybersecurity",    value: "CYBERSECURITY" },
  { label: "Quantum",          value: "QUANTUM_COMPUTING" },
  { label: "Robotics",         value: "ROBOTICS" },
];

export default function ResearchPage() {
  const { user, activeRole } = useAuth();
  const [researchList, setResearchList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isLoading, setIsLoading] = useState(true);

  const loadResearch = async () => {
    setIsLoading(true);
    try {
      const res = await api.research.list({
        search: search || undefined,
        technologyCategory: selectedCategory || undefined,
        sortBy,
      });
      if (res.success && res.data) setResearchList(res.data);
    } catch (err) {
      console.error("Failed to load research papers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadResearch(); }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResearch();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Top Section: Title & Search Bar (No Extra Gap) ── */}
      <div className="research-top-section" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        
        {/* Page Title Row */}
        <div className="page-header" style={{ paddingBottom: "0.25rem" }}>
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
                <BookOpen size={16} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
                Research repository
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", maxWidth: "520px" }}>
              Verified scientific papers powering educational carousels. Submissions earn +10 XCR.
            </p>
          </div>

          {(activeRole === "RESEARCHER" || activeRole === "ADMIN") && (
            <Link
              href="/research/new"
              className="btn btn-primary btn-sm"
              style={{ padding: "0.65rem 1rem", flexShrink: 0 }}
            >
              <Plus size={15} />
              <span>Submit paper</span>
              <span
                style={{
                  padding: "0.1rem 0.45rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-dark-surface)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                }}
              >
                +10 XCR
              </span>
            </Link>
          )}
        </div>

        {/* ── Search + Filters (Directly Below Title, No Space) ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{ flex: 1, minWidth: "220px", position: "relative" }}
          >
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search papers by keyword, problem, or title…"
              className="input-field"
              style={{
                borderRadius: "var(--radius-md)",
                paddingLeft: "2.35rem",
                paddingRight: "5rem",
                height: "38px",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{
                position: "absolute",
                right: "3px",
                top: "3px",
                bottom: "3px",
                borderRadius: "var(--radius-md)",
                padding: "0 0.85rem",
                fontSize: "0.75rem",
                height: "32px",
              }}
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{
              width: "auto",
              minWidth: "140px",
              height: "38px",
              paddingLeft: "0.75rem",
            }}
          >
            <option value="latest">Newest first</option>
            <option value="highest_rated">Highest rated</option>
            <option value="most_content">Most carousels</option>
          </select>
        </div>

      </div>

      {/* ── Category Tabs (Active turns solid black text) ── */}
      <div className="tab-bar" style={{ gap: "0.35rem", margin: "0" }}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`tab-pill ${isActive ? "active" : ""}`}
              style={{
                color: isActive ? "#18181b" : "var(--text-muted)",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                border: isActive ? "1px solid #18181b" : "1px solid transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.78rem",
                padding: "0.35rem 0.75rem",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Research Cards List ── */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel" style={{ padding: "1.25rem", height: "180px" }}>
              <div className="skeleton" style={{ height: "16px", width: "50%", marginBottom: "0.75rem" }} />
              <div className="skeleton" style={{ height: "12px", width: "100%", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ height: "12px", width: "80%", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ height: "12px", width: "60%" }} />
            </div>
          ))}
        </div>
      ) : researchList.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}
        >
          <BookOpen size={32} color="var(--text-dim)" style={{ marginBottom: "0.75rem", display: "inline-block" }} />
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No research found
          </div>
          <div style={{ fontSize: "0.825rem" }}>
            No papers match your filters. Be the first to publish one!
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {researchList.map((paper, i) => {
            const avgRating =
              paper._count?.ratings > 0
                ? (paper.ratings?.reduce((acc: number, r: any) => acc + r.score, 0) / paper._count.ratings).toFixed(1)
                : "5.0";

            return (
              <div
                key={paper.id}
                className="glass-panel animate-fade-in-up"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "var(--radius-lg)",
                  animationDelay: `${i * 30}ms`,
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
                  {/* Category + Rating */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span className="badge">
                      {paper.technologyCategory ? paper.technologyCategory.replace(/_/g, " ").toLowerCase() : "Research"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                      <Star size={12} color="#18181b" fill="#18181b" />
                      <span>{avgRating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: 1.35 }}>
                    <Link href={`/research/${paper.id}`} style={{ color: "inherit" }}>
                      {paper.title}
                    </Link>
                  </h2>

                  {/* Problem / Abstract Preview */}
                  <p className="truncate-2" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                    {paper.problemSolved || paper.abstract}
                  </p>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: "0.5rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "var(--radius-sm)",
                      background: "var(--bg-elevated)", color: "#18181b",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 600,
                    }}>
                      {paper.author?.name?.[0] || "R"}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {paper.author?.name || "Researcher"}
                    </span>
                  </div>

                  <Link
                    href={`/research/${paper.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.72rem" }}
                  >
                    <span>Details</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

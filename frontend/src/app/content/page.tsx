"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutGrid,
  Plus,
  ArrowRight,
  Edit3,
  Send,
  Coins,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Eye,
} from "lucide-react";

const STATUS_DISPLAY_MAP: Record<string, string> = {
  UNDER_REVIEW: "Ready to review",
  SUBMITTED: "Ready to review",
  READY_FOR_VISUAL: "Ready for visual design",
  APPROVED: "Ready for visual design",
  IN_VISUAL_DESIGN: "In visual design",
  VISUAL_COMPLETED: "Ready to publish",
  PUBLISHED: "Published",
  REVISION_REQUIRED: "Revision required",
  DRAFT: "Ready to review",
};

const TABS = [
  { label: "All",              value: "ALL",               icon: LayoutGrid },
  { label: "Revision",        value: "REVISION_REQUIRED",  icon: Edit3 },
];

export default function ContentPage() {
  const { user, activeRole } = useAuth();
  const [contentList, setContentList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Form State for creating carousel directly inside Carousel Studio
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [researchList, setResearchList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    researchId: "",
    title: "",
    targetAudience: "DEVELOPER",
    contentAngle: "TECH_IMPACT",
    hook: "",
    headline: "",
    caption: "",
    cta: "Follow for more verified research breakdowns!",
    sources: [""],
  });
  const [slides, setSlides] = useState<Array<{ title: string; body: string }>>([
    { title: "The Problem", body: "Overview of the core technical challenge solved by this paper." },
    { title: "The Solution", body: "Breakdown of the novel methodology and architecture." },
    { title: "Key Impact", body: "Benchmark results and practical real-world applications." },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Research papers for the selector
  useEffect(() => {
    async function loadResearch() {
      try {
        const res = await api.research.list({ limit: 50 });
        if (res.success && res.data && res.data.length > 0) {
          setResearchList(res.data);
          const first = res.data[0];
          setFormData((prev) => ({
            ...prev,
            researchId: first.id,
            title: `Visual Breakdown: ${first.title}`,
            hook: first.problem || "How does this scientific paper solve a major engineering bottleneck?",
            headline: first.approach || "A revolutionary approach to decentralized research.",
            caption: `Adapted from scientific research: ${first.title}`,
            sources: [first.paperUrl || "https://arxiv.org"],
          }));
        }
      } catch (err) {
        console.error("Failed to load research papers:", err);
      }
    }
    loadResearch();
  }, []);

  // Update defaults when researchId changes
  const handlePaperChange = (paperId: string) => {
    const selected = researchList.find((r) => r.id === paperId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        researchId: selected.id,
        title: `Visual Breakdown: ${selected.title}`,
        hook: selected.problem || "How does this paper solve a key problem?",
        headline: selected.approach || "Novel research methodology.",
        caption: `Adapted from scientific research: ${selected.title}`,
        sources: [selected.paperUrl || "https://arxiv.org"],
      }));
    } else {
      setFormData((prev) => ({ ...prev, researchId: paperId }));
    }
  };

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await api.content.list({
        status: activeTab === "ALL" ? undefined : activeTab,
      });
      if (res.success && res.data) {
        // FILTER: ONLY show carousels created by the current user
        const myCarousels = (res.data || []).filter(
          (c: any) =>
            c.createdBy === user?.id ||
            c.creatorId === user?.id ||
            c.creator?.id === user?.id
        );
        setContentList(myCarousels);
      }
    } catch (err) {
      console.error("Failed to load carousels:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadContent();
  }, [activeTab, user?.id]);

  const handleAddSlide = () => {
    setSlides([...slides, { title: `Slide ${slides.length + 1}`, body: "New slide description." }]);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    setSlides(newSlides);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        sources: formData.sources.filter((s) => s.trim() !== ""),
        slides: slides.map((s) => ({
          title: s.title,
          body: s.body,
        })),
      };

      const res = await api.content.create(payload);

      if (res.success && res.data) {
        setMessage("Carousel created & submitted for peer review (+25 XCR on approval)!");
        await loadContent();
        // Reset form title
        if (researchList.length > 0) {
          handlePaperChange(researchList[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to create carousel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Page Header ── */}
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
              <LayoutGrid size={16} />
            </div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
              Carousel studio
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", maxWidth: "540px" }}>
            Create educational carousels adapted from research papers. Submitted carousels immediately enter peer review.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary btn-sm"
          style={{ padding: "0.5rem 1rem", flexShrink: 0 }}
        >
          {!showCreateForm && <Plus size={15} />}
          <span>{showCreateForm ? "Hide form" : "Create new carousel"}</span>
          {!showCreateForm && (
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
              +25 XCR
            </span>
          )}
        </button>
      </div>

      {/* ── Inline Creation Form Section ── */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="glass-panel detail-card-panel animate-fade-in"
          style={{ borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <Sparkles size={16} color="#18181b" />
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#18181b" }}>
                Create educational carousel
              </h2>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Submits directly to peer review queue
            </span>
          </div>

          {message && (
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
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#dc2626",
                fontSize: "0.825rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Form Fields Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Referenced scientific paper *
              </label>
              <select
                value={formData.researchId}
                onChange={(e) => handlePaperChange(e.target.value)}
                className="input-field"
              >
                {researchList.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.technologyCategory ? r.technologyCategory.replace(/_/g, " ").toLowerCase() : "research"}] {r.title} ({r.publicationYear})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Carousel title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title for the carousel deck"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Target audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="input-field"
              >
                <option value="DEVELOPER">Developers & engineers</option>
                <option value="RESEARCHER">Academic researchers</option>
                <option value="GENERAL_ENTHUSIAST">Tech enthusiasts</option>
                <option value="STUDENT">Students & beginners</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Content angle
              </label>
              <select
                value={formData.contentAngle}
                onChange={(e) => setFormData({ ...formData, contentAngle: e.target.value })}
                className="input-field"
              >
                <option value="TECH_IMPACT">Technical impact & architecture</option>
                <option value="PRACTICAL_APPLICATION">Practical application</option>
                <option value="EDUCATION">Foundational education</option>
                <option value="CAREER">Career & skill building</option>
                <option value="FUTURE">Future trend analysis</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Opening hook *
              </label>
              <input
                type="text"
                required
                value={formData.hook}
                onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                placeholder="Question or statement to capture reader attention"
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
                Headline *
              </label>
              <input
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Clear headline summarizing key value"
                className="input-field"
              />
            </div>
          </div>

          {/* Slide Builder */}
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#18181b" }}>
                Slides ({slides.length})
              </span>
              <button
                type="button"
                onClick={handleAddSlide}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              >
                <Plus size={13} />
                <span>Add slide</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {slides.map((slide, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      Slide {index + 1}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, "up")}
                        disabled={index === 0}
                        style={{ border: "none", background: "transparent", cursor: index === 0 ? "default" : "pointer", padding: "2px" }}
                      >
                        <ChevronUp size={14} color={index === 0 ? "var(--text-dim)" : "var(--text-muted)"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, "down")}
                        disabled={index === slides.length - 1}
                        style={{ border: "none", background: "transparent", cursor: index === slides.length - 1 ? "default" : "pointer", padding: "2px" }}
                      >
                        <ChevronDown size={14} color={index === slides.length - 1 ? "var(--text-dim)" : "var(--text-muted)"} />
                      </button>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(index)}
                          style={{ border: "none", background: "transparent", cursor: "pointer", padding: "2px", marginLeft: "0.35rem" }}
                        >
                          <Trash2 size={13} color="var(--text-muted)" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const updated = [...slides];
                      updated[index].title = e.target.value;
                      setSlides(updated);
                    }}
                    placeholder="Slide header title"
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.65rem" }}
                  />

                  <textarea
                    rows={2}
                    value={slide.body}
                    onChange={(e) => {
                      const updated = [...slides];
                      updated[index].body = e.target.value;
                      setSlides(updated);
                    }}
                    placeholder="Slide explanation content..."
                    className="input-field"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.65rem" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ padding: "0.5rem 1.25rem" }}
            >
              <Send size={14} />
              <span>{isSubmitting ? "Submitting..." : "Submit for review (+25 XCR)"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── My Carousels Section Header ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#18181b" }}>
              My Carousels ({contentList.length})
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Carousels created by you and their peer-review status progress
            </p>
          </div>
        </div>

        {/* ── Pill Tab Bar ── */}
        <div className="tab-bar" style={{ gap: "0.35rem", margin: "0 0 1rem 0" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
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
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content Grid ── */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel" style={{ padding: "1.25rem", height: "160px" }}>
                <div className="skeleton" style={{ height: "16px", width: "50%", marginBottom: "0.75rem" }} />
                <div className="skeleton" style={{ height: "12px", width: "100%", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ height: "12px", width: "80%" }} />
              </div>
            ))}
          </div>
        ) : contentList.length === 0 ? (
          <div
            className="glass-panel detail-card-panel"
            style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}
          >
            <LayoutGrid size={28} color="var(--text-dim)" style={{ marginBottom: "0.5rem", display: "inline-block" }} />
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
              No carousels created yet
            </div>
            <div style={{ fontSize: "0.78rem" }}>
              Fill out the form above to create your first educational carousel and submit it for peer review!
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
            {contentList.map((item, i) => {
              const slideCount = item.slides?.length || item._count?.slides || 0;
              const statusLabel = STATUS_DISPLAY_MAP[item.status] || (item.status ? item.status.replace(/_/g, " ").toLowerCase() : "Ready to review");

              return (
                <div
                  key={item.id}
                  className="glass-panel animate-fade-in-up"
                  style={{
                    padding: "1.15rem",
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
                    {/* Status Badge + Slide Count */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                      <span className="badge">
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {slideCount} slides
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem", lineHeight: 1.35 }}>
                      <Link href={`/content/${item.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Research source reference */}
                    {item.researchPaper && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                        Paper: {item.researchPaper.title}
                      </div>
                    )}

                    {/* Hook preview */}
                    {item.hook && (
                      <p className="truncate-2" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {item.hook}
                      </p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.65rem",
                    borderTop: "1px solid var(--border-soft)",
                    marginTop: "0.65rem",
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Created by you
                    </span>

                    <Link
                      href={`/content/${item.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem" }}
                    >
                      <Eye size={12} />
                      <span>View details</span>
                    </Link>
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

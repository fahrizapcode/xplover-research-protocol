"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Coins,
  Send,
} from "lucide-react";

interface SlideInput {
  title: string;
  body: string;
}

function NewContentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedResearchId = searchParams.get("researchId");

  const [researchList, setResearchList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    researchId: preselectedResearchId || "",
    title: "",
    targetAudience: "DEVELOPER",
    contentAngle: "TECH_IMPACT",
    hook: "",
    headline: "",
    caption: "",
    cta: "",
    sources: [""],
  });

  const [slides, setSlides] = useState<SlideInput[]>([
    {
      title: "The core problem",
      body: "Explain the main friction point or bottleneck in simple, punchy language.",
    },
    {
      title: "The technological solution",
      body: "How this breakthrough methodology overcomes the limitation.",
    },
    {
      title: "Real-world benchmark",
      body: "Highlight the quantitative findings and comparative advantages.",
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadResearch() {
      try {
        const res = await api.research.list({ limit: 50 });
        if (res.success && res.data) {
          setResearchList(res.data);
          if (!formData.researchId && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, researchId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load research papers:", err);
      }
    }
    loadResearch();
  }, []);

  const addSlide = () => {
    setSlides([...slides, { title: `Slide ${slides.length + 1}`, body: "" }]);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    setSlides(newSlides);
  };

  const updateSlide = (index: number, field: "title" | "body", value: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const handleSubmit = async (submitForReview: boolean) => {
    setError(null);
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
        const contentId = res.data.id;
        if (submitForReview) {
          await api.content.submit(contentId);
        }
        router.push(`/content/${contentId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create carousel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <Link
          href="/content"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            textDecoration: "none",
            marginBottom: "0.75rem",
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to carousel library</span>
        </Link>

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
              Create educational carousel
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
              Structure complex papers into a sequential slide deck for developers and enthusiasts.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-soft)",
              color: "var(--text-primary)",
              fontWeight: 500,
              fontSize: "0.78rem",
            }}
          >
            <Coins size={14} color="var(--text-muted)" />
            <span>Reward: +25 XCR on approval</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-soft)",
            color: "#18181b",
            fontSize: "0.78rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Metadata Box */}
      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
          1. Research anchor & metadata
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Referenced scientific paper *
            </label>
            <select
              value={formData.researchId}
              onChange={(e) => setFormData({ ...formData, researchId: e.target.value })}
              className="input-field"
              style={{ cursor: "pointer" }}
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
              placeholder="e.g., ZK-Rollups Explained: How Ethereum Scales"
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
              style={{ cursor: "pointer" }}
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
              style={{ cursor: "pointer" }}
            >
              <option value="TECH_IMPACT">Technical breakthrough</option>
              <option value="PROBLEM_SOLVER">Problem & solution breakdown</option>
              <option value="COMPARATIVE">Comparative benchmark</option>
              <option value="BEGINNER_GUIDE">Beginner-friendly visual guide</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Opening hook / teaser line *
            </label>
            <input
              type="text"
              required
              value={formData.hook}
              onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
              placeholder="e.g., Why 90% of zkEVM rollups fail at peak concurrency — and the paper fixing it."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Slides Builder */}
      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
            2. Slide-by-slide storyline ({slides.length} slides)
          </h2>
          <button
            type="button"
            onClick={addSlide}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={13} />
            <span>Add slide</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {slides.map((s, idx) => (
            <div
              key={idx}
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  Slide {idx + 1} of {slides.length}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSlide(idx, "up")}
                    className="btn btn-ghost btn-icon"
                    style={{ padding: "0.2rem" }}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => moveSlide(idx, "down")}
                    className="btn btn-ghost btn-icon"
                    style={{ padding: "0.2rem" }}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={slides.length <= 1}
                    onClick={() => removeSlide(idx)}
                    className="btn btn-ghost btn-icon"
                    style={{ padding: "0.2rem" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={s.title}
                onChange={(e) => updateSlide(idx, "title", e.target.value)}
                placeholder="Slide headline / takeaway"
                className="input-field"
                style={{ fontSize: "0.825rem", fontWeight: 500 }}
              />

              <textarea
                rows={2}
                value={s.body}
                onChange={(e) => updateSlide(idx, "body", e.target.value)}
                placeholder="Slide core explanation, key metrics, or visual description..."
                className="input-field"
                style={{ resize: "vertical" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submission Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Link href="/content" className="btn btn-secondary btn-sm">
          Cancel
        </Link>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmit(true)}
          className="btn btn-primary btn-sm"
        >
          <Send size={13} />
          <span>{isSubmitting ? "Submitting..." : "Submit for review (+25 XCR)"}</span>
        </button>
      </div>
    </div>
  );
}

export default function NewContentPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading studio...</div>}>
      <NewContentForm />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, ArrowLeft, ArrowRight, Coins, AlertTriangle } from "lucide-react";

export default function NewResearchPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    paperUrl: "",
    publicationYear: new Date().getFullYear(),
    technologyCategory: "ARTIFICIAL_INTELLIGENCE",
    problem: "",
    approach: "",
    keyFindings: "",
    researcherInsight: "",
    whyItMatters: "",
    whatCommunityShouldLearn: "",
    unclearParts: "",
    discussionQuestions: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { label: "Artificial intelligence", value: "ARTIFICIAL_INTELLIGENCE" },
    { label: "Web3 & blockchain", value: "WEB3" },
    { label: "Cybersecurity", value: "CYBERSECURITY" },
    { label: "Quantum computing", value: "QUANTUM_COMPUTING" },
    { label: "Robotics & hardware", value: "ROBOTICS" },
    { label: "Emerging technologies", value: "EMERGING_TECHNOLOGIES" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.research.create({
        ...formData,
        publicationYear: Number(formData.publicationYear),
      });

      if (res.success && res.data) {
        router.push(`/research/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit research. Please check fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <Link
          href="/research"
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
          <span>Back to repository</span>
        </Link>

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
              Submit scientific paper
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
              Publish verified technical research to be adapted into educational carousel cards.
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
            <span>Reward: +10 XCR</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#dc2626",
            fontSize: "0.78rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={14} style={{ marginTop: "1px", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Basic Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Paper title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Decentralized Zero-Knowledge Proofs in Layer-2 Rollups"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Paper URL / ArXiv DOI *
            </label>
            <input
              type="url"
              required
              value={formData.paperUrl}
              onChange={(e) => setFormData({ ...formData, paperUrl: e.target.value })}
              placeholder="https://arxiv.org/abs/2401.xxxxx"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Technology category *
            </label>
            <select
              value={formData.technologyCategory}
              onChange={(e) => setFormData({ ...formData, technologyCategory: e.target.value })}
              className="input-field"
              style={{ cursor: "pointer" }}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Publication year
            </label>
            <input
              type="number"
              value={formData.publicationYear}
              onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Problem statement (The core scientific bottleneck) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="What limitation in current decentralized systems or machine learning did this paper address?"
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Methodological approach *
            </label>
            <textarea
              required
              rows={3}
              value={formData.approach}
              onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
              placeholder="How did the researchers tackle this? Experimental setup, mathematical proofs, or algorithmic novelties."
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Key findings & quantifiable benchmarks *
            </label>
            <textarea
              required
              rows={3}
              value={formData.keyFindings}
              onChange={(e) => setFormData({ ...formData, keyFindings: e.target.value })}
              placeholder="What were the outcomes? (e.g. 40% gas reduction, 99.4% accuracy under adversarial conditions)"
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Why this matters for builders & educators *
            </label>
            <textarea
              required
              rows={2}
              value={formData.whyItMatters}
              onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
              placeholder="Practical implications for real-world protocols..."
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              Researcher commentary *
            </label>
            <textarea
              required
              rows={2}
              value={formData.researcherInsight}
              onChange={(e) => setFormData({ ...formData, researcherInsight: e.target.value })}
              placeholder="Your perspective or insight on the implications of these findings..."
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, marginBottom: "0.35rem" }}>
              What should the community learn? *
            </label>
            <textarea
              required
              rows={2}
              value={formData.whatCommunityShouldLearn}
              onChange={(e) => setFormData({ ...formData, whatCommunityShouldLearn: e.target.value })}
              placeholder="Key takeaways for developers, researchers, and educators..."
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Link href="/research" className="btn btn-secondary btn-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm"
          >
            <span>{isSubmitting ? "Submitting paper..." : "Submit paper (+10 XCR)"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </form>
    </div>
  );
}

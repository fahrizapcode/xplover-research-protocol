"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Sparkles } from "lucide-react";

export interface Slide {
  id?: string;
  slideNumber: number;
  title: string;
  body: string;
}

interface CarouselSlideViewerProps {
  slides: Slide[];
  title?: string;
  hook?: string;
}

export default function CarouselSlideViewer({ slides, title, hook }: CarouselSlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const total = slides.length;
  const currentSlide = slides[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  if (!slides || slides.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        No slides available in this carousel.
      </div>
    );
  }

  return (
    <div
      className={`glass-panel ${isFullscreen ? "fixed inset-0 z-50 p-8 flex flex-col justify-center" : ""}`}
      style={{
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
        background: isFullscreen ? "rgba(5, 7, 12, 0.96)" : "var(--bg-card)",
        padding: "2rem",
        overflow: "hidden",
      }}
    >
      {/* Top Slide Header & Progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            className="badge badge-indigo"
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
          >
            Slide {currentIndex + 1} of {total}
          </span>
          {hook && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                maxWidth: "400px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {hook}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Progress Bars for each slide */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "2rem" }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background:
                i === currentIndex
                  ? "var(--accent-cyan)"
                  : i < currentIndex
                  ? "rgba(6, 182, 212, 0.55)"
                  : "rgba(255, 255, 255, 0.1)",
              opacity: i <= currentIndex ? 1 : 0.35,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Main Slide Content Canvas */}
      <div
        style={{
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(99, 102, 241, 0.05) 100%)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Sparkles size={16} color="var(--accent-indigo)" />
          <span style={{ fontSize: "0.8rem", color: "var(--accent-indigo)", fontWeight: 700, textTransform: "uppercase" }}>
            Card 0{currentSlide.slideNumber || currentIndex + 1}
          </span>
        </div>

        <h2
          style={{
            fontSize: "1.65rem",
            fontWeight: 800,
            marginBottom: "1.25rem",
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {currentSlide.title}
        </h2>

        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            whiteSpace: "pre-line",
          }}
        >
          {currentSlide.body}
        </p>
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "1.5rem",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: i === currentIndex ? "var(--accent-indigo)" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="btn btn-primary"
          style={{ opacity: currentIndex === total - 1 ? 0.3 : 1 }}
        >
          <span>Next Slide</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ShieldCheck, ExternalLink, Clock, AlertTriangle } from "lucide-react";

interface BlockchainBadgeProps {
  status: "CONFIRMED" | "PENDING" | "FAILED";
  txHash?: string | null;
  contributionType?: string;
  network?: string;
}

export default function BlockchainBadge({
  status,
  txHash,
  contributionType,
  network = "Arbitrum Sepolia",
}: BlockchainBadgeProps) {
  const explorerUrl = txHash ? `https://sepolia.arbiscan.io/tx/${txHash}` : null;

  if (status === "CONFIRMED") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.75rem",
          borderRadius: "var(--radius-full)",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#6ee7b7",
        }}
      >
        <ShieldCheck size={14} color="#10b981" />
        <span>On-Chain Verified</span>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Arbiscan"
            style={{
              color: "var(--accent-cyan)",
              display: "flex",
              alignItems: "center",
              marginLeft: "0.25rem",
            }}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.35rem 0.75rem",
          borderRadius: "var(--radius-full)",
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#fcd34d",
        }}
      >
        <Clock size={14} />
        <span>Attestation Pending</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.75rem",
        borderRadius: "var(--radius-full)",
        background: "rgba(244, 63, 94, 0.12)",
        border: "1px solid rgba(244, 63, 94, 0.3)",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#fda4af",
      }}
    >
      <AlertTriangle size={14} />
      <span>Attestation Off-Chain</span>
    </div>
  );
}

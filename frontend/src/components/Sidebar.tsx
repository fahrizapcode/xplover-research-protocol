"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import {
  LayoutDashboard,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
  Palette,
  Coins,
  Activity,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard",          href: "/",         icon: LayoutDashboard, roleAccess: ["ALL"] },
  { name: "Research hub",       href: "/research", icon: BookOpen,    roleAccess: ["ALL"],                     badge: "DeSci", actionHref: "/research/new" },
  { name: "Carousel studio",    href: "/content",  icon: LayoutGrid,  roleAccess: ["ALL"],                     actionHref: "/content/new" },
  { name: "Peer review queue",  href: "/reviews",  icon: CheckCircle2,roleAccess: ["PEER_REVIEWER","ADMIN"] },
  { name: "Visual design",      href: "/visual",   icon: Palette,     roleAccess: ["VISUAL_DESIGNER","ADMIN"] },
  { name: "XCR ledger",         href: "/xcr",      icon: Coins,       roleAccess: ["ALL"] },
  { name: "Activity trail",     href: "/activity", icon: Activity,    roleAccess: ["ALL"] },
  { name: "Admin center",       href: "/admin",    icon: ShieldAlert, roleAccess: ["ADMIN"],                   badge: "Governance" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, activeRole } = useAuth();
  const { sidebarOpen, closeSidebar, isMobile } = useUI();

  return (
    <>
      {/* Backdrop overlay (mobile) */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${sidebarOpen ? "backdrop-open" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`xplover-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        style={{
          width: "240px",
          minHeight: "calc(100vh - 72px)",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-soft)",
          padding: "1.25rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          position: "sticky",
          top: "72px",
          height: "calc(100vh - 72px)",
          overflowY: "auto",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
      >
        {/* Top Center Logo (mobile only — desktop shows logo in Navbar) */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "0.75rem",
              paddingBottom: "1.25rem",
            }}
          >
            <Link href="/" onClick={closeSidebar} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <img
                src="/logo.png"
                alt="Xplover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = document.getElementById("sidebar-fallback-title");
                  if (fallback) fallback.style.display = "block";
                }}
                style={{ height: "46px", width: "auto", objectFit: "contain", display: "block" }}
              />
              <span id="sidebar-fallback-title" style={{ display: "none", fontSize: "1.1rem", fontWeight: 600, fontFamily: "var(--font-heading)", color: "#18181b" }}>
                Xplover
              </span>
            </Link>
          </div>
        )}

        {/* Section label */}
        <div style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          fontFamily: "var(--font-heading)",
          color: "var(--text-muted)",
          padding: "0 0.5rem 0.5rem",
        }}>
          Core protocols
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {NAV_ITEMS.map((item) => {
            const hasAccess = item.roleAccess.includes("ALL") || item.roleAccess.includes(activeRole);
            if (!hasAccess && activeRole !== "ADMIN") return null;

            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            let canAct = true;
            if (item.name === "Research hub" && activeRole !== "RESEARCHER" && activeRole !== "ADMIN") canAct = false;
            if (item.name === "Carousel studio" && activeRole !== "CONTENT_CREATOR" && activeRole !== "ADMIN") canAct = false;

            return (
              <div key={item.href} style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "var(--radius-md)",
                    background: isActive ? "var(--bg-card)" : "transparent",
                    border: isActive ? "1px solid var(--border-soft)" : "1px solid transparent",
                    boxShadow: isActive ? "var(--shadow-xs)" : "none",
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={isMobile ? closeSidebar : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.5rem 0.65rem 0.5rem 0.75rem",
                      color: isActive ? "#18181b" : "var(--text-secondary)",
                      fontSize: "0.825rem",
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: "none",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Icon
                      size={15}
                      color={isActive ? "#18181b" : "var(--text-muted)"}
                      style={{ flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="badge" style={{ fontSize: "0.62rem", padding: "0.1rem 0.4rem" }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {item.actionHref && canAct && (
                    <Link
                      href={item.actionHref}
                      title="Create new"
                      onClick={isMobile ? closeSidebar : undefined}
                      style={{
                        padding: "0.35rem 0.45rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        marginRight: "0.2rem",
                        borderRadius: "var(--radius-sm)",
                        transition: "all 0.12s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#18181b";
                        (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <PlusCircle size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Network Status Card (Monochrome & Solid) */}
        <div style={{
          marginTop: "1rem",
          padding: "0.85rem",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              Arbitrum Sepolia
            </span>
            <span className="badge" style={{ marginLeft: "auto", fontSize: "0.6rem", padding: "0.08rem 0.35rem" }}>
              Live
            </span>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            On-chain attestation engine active. Peer review verified.
          </p>
          <a
            href="https://sepolia.arbiscan.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              textDecoration: "none",
              marginTop: "0.15rem",
            }}
          >
            <span>View on Arbiscan</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </aside>
    </>
  );
}

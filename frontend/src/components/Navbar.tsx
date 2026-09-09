"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, RoleName } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import {
  Wallet,
  ChevronDown,
  LogOut,
  UserCheck,
  Coins,
  Check,
  Zap,
  Menu,
  X,
} from "lucide-react";

/* ── Role config (Monochrome: Black, Gray, White) ── */
const ROLE_CONFIG: Record<RoleName, { label: string }> = {
  ADMIN:          { label: "Admin" },
  RESEARCHER:     { label: "Researcher" },
  CONTENT_CREATOR:{ label: "Content creator" },
  PEER_REVIEWER:  { label: "Peer reviewer" },
  VISUAL_DESIGNER:{ label: "Visual designer" },
};

const DEMO_ACCOUNTS = [
  { name: "Dr. Satoshi",   role: "RESEARCHER",      email: "satoshi@xplover.io" },
  { name: "Maya Lin",      role: "CONTENT_CREATOR", email: "maya@xplover.io" },
  { name: "Prof. Marcus",  role: "PEER_REVIEWER",   email: "marcus@xplover.io" },
  { name: "Sofia Rossi",   role: "VISUAL_DESIGNER", email: "sofia@xplover.io" },
  { name: "Admin Lead",    role: "ADMIN",            email: "admin@xplover.io" },
];

function Dropdown({
  open,
  children,
  align = "left",
}: {
  open: boolean;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  if (!open) return null;
  return (
    <div
      className="animate-fade-in-up"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        [align]: 0,
        minWidth: "210px",
        padding: "0.35rem",
        zIndex: 100,
        backgroundColor: "#ffffff",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {children}
    </div>
  );
}

function DropdownItem({
  onClick,
  children,
  active,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "0.45rem 0.65rem",
        background: active ? "var(--bg-elevated)" : "transparent",
        border: "none",
        borderRadius: "var(--radius-sm)",
        color: active ? "#18181b" : "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8125rem",
        fontWeight: active ? 600 : 400,
        transition: "all 0.12s ease",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-surface)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "0.7rem",
      fontWeight: 600,
      fontFamily: "var(--font-heading)",
      color: "var(--text-muted)",
      padding: "0.35rem 0.65rem 0.2rem",
    }}>
      {children}
    </div>
  );
}

export default function Navbar() {
  const { user, activeRole, setActiveRole, walletAddress, connectWallet, logout, quickLogin } = useAuth();
  const { toggleSidebar, sidebarOpen } = useUI();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const demoRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) setShowDemoMenu(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCfg = ROLE_CONFIG[activeRole] || { label: activeRole };

  return (
    <header style={{
      height: "72px",
      background: "#ffffff",
      borderBottom: "1px solid var(--border-soft)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div className="app-container" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>

        {/* ── Left: Hamburger + Desktop Logo + Persona Switcher ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop Logo only (hidden on mobile) */}
          <div className="navbar-brand-desktop">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              <img
                src="/logo.png"
                alt="Xplover"
                onError={(e) => {
                  // Fallback to minimal text if logo image is missing
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = document.getElementById("nav-fallback-title");
                  if (fallback) fallback.style.display = "block";
                }}
                style={{ height: "44px", width: "auto", objectFit: "contain", display: "block" }}
              />
              <span id="nav-fallback-title" style={{ display: "none", fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-heading)", color: "#18181b" }}>
                Xplover
              </span>
            </Link>
          </div>

          {/* Persona Switcher Dropdown (with extra right padding for the 'v' arrow) */}
          <div ref={demoRef} style={{ position: "relative" }} className="navbar-right-full">
            <button
              onClick={() => { setShowDemoMenu(!showDemoMenu); setShowRoleMenu(false); }}
              className="btn btn-secondary btn-sm"
              style={{
                gap: "0.5rem",
                paddingLeft: "0.85rem",
                paddingRight: "1.15rem",
              }}
            >
              <UserCheck size={14} color="var(--text-muted)" />
              <span style={{ fontSize: "0.78rem" }}>Switch persona</span>
              <ChevronDown
                size={12}
                color="var(--text-muted)"
                style={{
                  transform: showDemoMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                  marginLeft: "0.35rem",
                }}
              />
            </button>
            <Dropdown open={showDemoMenu} align="left">
              <DropdownLabel>Demo personas</DropdownLabel>
              {DEMO_ACCOUNTS.map((acc) => {
                const cfg = ROLE_CONFIG[acc.role as RoleName];
                return (
                  <DropdownItem key={acc.email} onClick={() => { quickLogin(acc.email); setShowDemoMenu(false); }}>
                    <span style={{
                      width: "24px", height: "24px", borderRadius: "4px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", color: "#18181b", flexShrink: 0, fontWeight: 600,
                      fontFamily: "var(--font-heading)",
                    }}>
                      {acc.name[0]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)" }}>{acc.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{cfg?.label || acc.role}</div>
                    </div>
                  </DropdownItem>
                );
              })}
            </Dropdown>
          </div>
        </div>

        {/* ── Right Controls (Desktop) ── */}
        <div className="navbar-right-full">
          {user ? (
            <>
              {/* Role Dropdown Button (with extra right padding for the 'v' arrow) */}
              <div ref={roleRef} style={{ position: "relative" }}>
                <button
                  onClick={() => { setShowRoleMenu(!showRoleMenu); setShowDemoMenu(false); }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    gap: "0.45rem",
                    paddingLeft: "0.85rem",
                    paddingRight: "1.15rem",
                  }}
                >
                  <span className="live-dot" />
                  <span style={{ fontSize: "0.78rem" }}>{activeCfg.label}</span>
                  <ChevronDown
                    size={12}
                    style={{
                      color: "var(--text-muted)",
                      transform: showRoleMenu ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      marginLeft: "0.35rem",
                    }}
                  />
                </button>
                <Dropdown open={showRoleMenu} align="right">
                  <DropdownLabel>Switch role view</DropdownLabel>
                  {user.roles.map((r) => {
                    const cfg = ROLE_CONFIG[r as RoleName];
                    const isActive = r === activeRole;
                    return (
                      <DropdownItem key={r} onClick={() => { setActiveRole(r as RoleName); setShowRoleMenu(false); }} active={isActive}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "#18181b" : "var(--border-medium)" }} />
                        <span style={{ flex: 1 }}>{cfg?.label || r}</span>
                        {isActive && <Check size={13} color="#18181b" />}
                      </DropdownItem>
                    );
                  })}
                </Dropdown>
              </div>

              {/* XCR Balance */}
              <Link href="/xcr" style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.35rem 0.75rem", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
                color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 500, textDecoration: "none",
                fontFamily: "var(--font-heading)",
              }}>
                <Coins size={13} color="var(--text-muted)" />
                <span>{user.xcrBalance} XCR</span>
              </Link>

              {/* Wallet */}
              <button onClick={connectWallet} className="btn btn-secondary btn-sm" style={{ gap: "0.4rem" }}>
                <Wallet size={13} color="var(--text-muted)" />
                {walletAddress ? (
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</span>
                ) : (
                  <span>Connect wallet</span>
                )}
              </button>

              {/* Avatar + Logout */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "var(--radius-sm)",
                  background: "#18181b",
                  color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-heading)",
                }}>
                  {user.name?.[0] || "U"}
                </div>
                <button onClick={logout} title="Sign out" className="btn btn-ghost btn-icon" style={{ padding: "0.4rem" }}>
                  <LogOut size={15} color="var(--text-muted)" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={() => quickLogin("admin@xplover.io")} className="btn btn-secondary btn-sm">
                <Zap size={13} color="var(--text-muted)" /> Quick demo
              </button>
              <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
            </div>
          )}
        </div>

        {/* ── Right Controls (Mobile Compact) ── */}
        <div className="navbar-right-mobile">
          {user ? (
            <>
              <Link href="/xcr" style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                padding: "0.3rem 0.55rem", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
                color: "var(--text-primary)", fontSize: "0.72rem", fontWeight: 500, textDecoration: "none",
                fontFamily: "var(--font-heading)",
              }}>
                <Coins size={11} color="var(--text-muted)" />
                <span>{user.xcrBalance}</span>
              </Link>

              <div style={{
                width: "28px", height: "28px", borderRadius: "var(--radius-sm)",
                background: "#18181b",
                color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-heading)",
              }}>
                {user.name?.[0] || "U"}
              </div>

              <button onClick={logout} className="btn btn-ghost btn-icon" style={{ padding: "0.35rem" }}>
                <LogOut size={14} color="var(--text-muted)" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
              Sign in
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

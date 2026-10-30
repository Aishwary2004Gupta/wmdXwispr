"use client";

import React from "react";
import {
  ArrowRightLeft,
  CloudLightning,
  Layers,
  Link as LinkIcon,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  activeTab: "matrix" | "composer" | "cardStudio" | "ledger";
  setActiveTab: (tab: "matrix" | "composer" | "cardStudio" | "ledger") => void;
  onOpenSimulate: () => void;
  onOpenDeployGuide: () => void;
  accountCount: number;
  routeCount: number;
  loopBlockedCount: number;
  onOpenConnectModal?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenSimulate,
  onOpenDeployGuide,
  accountCount,
  routeCount,
  loopBlockedCount,
  onOpenConnectModal,
}: HeaderProps) {
  return (
    <header style={{ marginBottom: "2.25rem", paddingTop: "1.25rem" }}>
      {/* Top Engine Status Command Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.55rem 1.25rem",
          background: "rgba(15, 19, 30, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius-full)",
          marginBottom: "1.75rem",
          fontSize: "0.825rem",
          backdropFilter: "blur(12px)",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div className="pulse-dot" />
          <span style={{ fontWeight: 600, color: "#f8fafc" }}>
            OmniSync · local demo
          </span>
          <span style={{ color: "var(--text-muted)" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>
            Posting integrations are not configured
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-emerald)" }}>
            <ShieldCheck size={14} />
            <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>
              Echo Guard: {loopBlockedCount} Echoes Prevented
            </span>
          </div>

        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 24px rgba(99, 102, 241, 0.4)",
              }}
            >
              <ArrowRightLeft size={22} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  Omni<span className="gradient-text-accent">Sync</span>
                </h1>
                <span className="badge badge-emerald" style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem" }}>
                  Demo Mode
                </span>
              </div>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", maxWidth: "620px" }}>
            Organize social profile links, preview cross-posts, and explore sync safeguards. Posts stay in this demo until official platform integrations are configured.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {onOpenConnectModal && (
            <button
              onClick={onOpenConnectModal}
              className="btn btn-primary"
              id="header-connect-url-btn"
            >
              <LinkIcon size={15} />
              <span>Add profile link</span>
            </button>
          )}

          <button
            onClick={onOpenSimulate}
            className="btn btn-accent"
            id="simulate-incoming-post-btn"
          >
            <Play size={15} fill="currentColor" />
            <span>Simulate Incoming Post</span>
          </button>

          <button
            onClick={onOpenDeployGuide}
            className="btn btn-outline"
            id="deploy-guide-btn"
          >
            <CloudLightning size={15} />
            <span>Deploy on Vercel</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`tab-btn ${activeTab === "matrix" ? "active" : ""}`}
          id="nav-tab-matrix"
        >
          <ArrowRightLeft size={15} />
          <span>Sync Matrix ({accountCount} accounts · {routeCount} routes)</span>
        </button>

        <button
          onClick={() => setActiveTab("composer")}
          className={`tab-btn ${activeTab === "composer" ? "active" : ""}`}
          id="nav-tab-composer"
        >
          <Layers size={15} />
          <span>Post Preview Composer</span>
        </button>

        <button
          onClick={() => setActiveTab("cardStudio")}
          className={`tab-btn ${activeTab === "cardStudio" ? "active" : ""}`}
          id="nav-tab-card-studio"
        >
          <Sparkles size={15} />
          <span>Tech Quote Card Studio (X ➔ IG)</span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          id="nav-tab-ledger"
        >
          <ShieldCheck size={15} />
          <span>Activity Ledger & Loop Guard</span>
        </button>
      </div>
    </header>
  );
}

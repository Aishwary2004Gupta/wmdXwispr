"use client";

import React, { useState } from "react";
import { SocialAccount, SyncRoute } from "@/types/sync";
import { PLATFORM_CONFIGS } from "@/lib/constants";
import AccountAvatar from "@/components/AccountAvatar";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Film,
  Globe,
  Link as LinkIcon,
  Lock,
  Plus,
  Play,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

interface SyncMatrixProps {
  accounts: SocialAccount[];
  routes: SyncRoute[];
  onDeleteAccount: (id: string) => void;
  onAddRoute: (sourceId: string, targetId: string, bidirectional: boolean) => void;
  onToggleRoute: (routeId: string) => void;
  onToggleBidirectional: (routeId: string) => void;
  onToggleAutoCard: (routeId: string) => void;
  onDeleteRoute: (routeId: string) => void;
  onQuickSimulateRoute?: (routeId: string) => void;
  onOpenConnectModal: (initialUrl?: string) => void;
}

export default function SyncMatrix({
  accounts,
  routes,
  onDeleteAccount,
  onAddRoute,
  onToggleRoute,
  onToggleBidirectional,
  onToggleAutoCard,
  onDeleteRoute,
  onQuickSimulateRoute,
  onOpenConnectModal,
}: SyncMatrixProps) {
  const [isAddBridgeOpen, setIsAddBridgeOpen] = useState(false);
  const [quickUrlInput, setQuickUrlInput] = useState("");

  // New bridge form state
  const [bridgeSource, setBridgeSource] = useState(accounts[0]?.id || "");
  const [bridgeTarget, setBridgeTarget] = useState(accounts[1]?.id || "");
  const [bridgeBidirectional, setBridgeBidirectional] = useState(true);
  const [bridgeError, setBridgeError] = useState("");

  // Quick URL submit handler
  const handleQuickUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrlInput.trim()) return;
    onOpenConnectModal(quickUrlInput.trim());
  };

  const handleCreateBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accounts.some((account) => account.id === bridgeSource) ||
      !accounts.some((account) => account.id === bridgeTarget) ||
      bridgeSource === bridgeTarget) {
      setBridgeError("Choose two different connected profiles to create a bridge.");
      return;
    }
    onAddRoute(bridgeSource, bridgeTarget, bridgeBidirectional);
    setBridgeError("");
    setIsAddBridgeOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
      {/* QUICK CONNECT HERO BAR: Link-to-Login in one simple step */}
      <section
        className="glass-panel"
        style={{
          padding: "1.75rem 2rem",
          background: "linear-gradient(135deg, rgba(15, 20, 32, 0.85) 0%, rgba(20, 26, 42, 0.75) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          boxShadow: "0 12px 36px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.12)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-blue">
              <Globe size={12} />
              <span>8 platforms + custom links</span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>•</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Add a profile link in seconds
            </span>
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
            Connect a social profile
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Paste a profile URL from X, Instagram, LinkedIn, Bluesky, Threads, YouTube, TikTok, GitHub, or another social network. Your link is saved in this browser; posting needs an official platform integration.
          </p>

          <form onSubmit={handleQuickUrlSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
              <Globe
                size={18}
                color="var(--accent-cyan)"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="url"
                placeholder="https://social.example/@you"
                value={quickUrlInput}
                onChange={(e) => setQuickUrlInput(e.target.value)}
                style={{
                  paddingLeft: "2.6rem",
                  paddingRight: "1rem",
                  background: "rgba(8, 10, 16, 0.8)",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  height: "46px",
                  fontSize: "0.925rem",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: "46px", padding: "0 1.5rem" }}
            >
              <LinkIcon size={17} />
              <span>Add Profile Link</span>
            </button>
          </form>

          {/* Quick presets footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supported:</span>
            {Object.values(PLATFORM_CONFIGS).map((conf) => (
              <span
                key={conf.id}
                style={{
                  fontSize: "0.75rem",
                  color: conf.color,
                  background: `${conf.color}15`,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  border: `1px solid ${conf.color}30`,
                }}
              >
                {conf.shortName}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: Connected Social Media Accounts */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={20} color="var(--primary)" />
              <span>Connected Social Accounts ({accounts.length})</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Profile links are stored in this browser. Publishing remains disabled until official integrations are added.
            </p>
          </div>

          <button
            onClick={() => onOpenConnectModal("")}
            className="btn btn-primary btn-sm"
            id="add-account-btn"
          >
            <Plus size={16} />
            <span>Connect Another Profile</span>
          </button>
        </div>

        {/* Account Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {accounts.length === 0 && (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>No profiles saved yet. Add a profile link to get started.</p>
              <button onClick={() => onOpenConnectModal("")} className="btn btn-primary">
                <Plus size={16} />
                <span>Add your first profile</span>
              </button>
            </div>
          )}
          {accounts.map((acc) => {
            const platformConfig = PLATFORM_CONFIGS[acc.platform] || PLATFORM_CONFIGS.twitter;

            return (
              <div
                key={acc.id}
                className="glass-panel"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  borderTop: `3px solid ${platformConfig.color}`,
                  background: "rgba(15, 19, 29, 0.75)",
                }}
              >
                <div>
                  {/* Top Bar: Profile Picture, Name, Handle, Platform badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <AccountAvatar src={acc.avatar} name={acc.name || acc.handle} size={52} color={platformConfig.color} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{acc.name}</span>
                          {acc.isVerifiedOwner && <CheckCircle2 size={16} color={platformConfig.color} />}
                        </div>
                        <a
                          href={acc.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-accent)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontFamily: "monospace",
                          }}
                        >
                          <span>{acc.handle}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <span
                      className="badge"
                      style={{
                        background: `${platformConfig.color}20`,
                        color: platformConfig.color,
                        border: `1px solid ${platformConfig.color}40`,
                      }}
                    >
                      {acc.platformName || platformConfig.shortName}
                    </span>
                  </div>

                  {/* Bio */}
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                      marginBottom: "1rem",
                      minHeight: "42px",
                    }}
                  >
                    {acc.bio || platformConfig.tagline}
                  </p>

                  {/* Verified Owner Ribbon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.55rem 0.85rem",
                      background: acc.isVerifiedOwner ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.07)",
                      border: `1px solid ${acc.isVerifiedOwner ? "rgba(16, 185, 129, 0.28)" : "rgba(245, 158, 11, 0.25)"}`,
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: acc.isVerifiedOwner ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
                      {acc.isVerifiedOwner ? <Lock size={13} /> : <LinkIcon size={13} />}
                      <span>{acc.badge || (acc.isVerifiedOwner ? "Verified owner" : "Profile link saved")}</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.72rem" }}>
                      {acc.isVerifiedOwner ? acc.verifiedSessionId || "Authorized" : "Authorization required to post"}
                    </span>
                  </div>

                  {/* Metrics Box */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      padding: "0.6rem 0.85rem",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>
                      Audience: <strong style={{ color: "var(--text-primary)" }}>{acc.followers}</strong>
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      Posts Synced: <strong style={{ color: "var(--text-primary)" }}>{acc.recentPostCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Footer: Live Session Light & Unlink Button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "0.85rem",
                    fontSize: "0.78rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="pulse-dot" style={{ backgroundColor: acc.isVerifiedOwner ? "var(--accent-emerald)" : "var(--accent-amber)" }} />
                    <span style={{ color: acc.isVerifiedOwner ? "var(--accent-emerald)" : "var(--accent-amber)", fontWeight: 600 }}>
                      {acc.isVerifiedOwner ? "Authorized" : "Link saved · not authorized"}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--accent-rose)", padding: "0.2rem 0.5rem" }}
                    title="Disconnect social media"
                  >
                    <Trash2 size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Multi-Way Sync Bridges Matrix */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeftRight size={20} color="var(--accent-cyan)" />
              <span>Multi-Platform Sync Bridges ({routes.length})</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Build local route previews and inspect how echo protection would handle duplicate posts. Nothing is published from this demo.
            </p>
          </div>

          <button
            onClick={() => {
              const sourceId = accounts[0]?.id || "";
              setBridgeSource(sourceId);
              setBridgeTarget(accounts.find((account) => account.id !== sourceId)?.id || "");
              setBridgeError("");
              setIsAddBridgeOpen(true);
            }}
            className="btn btn-accent btn-sm"
            id="add-bridge-btn"
            disabled={accounts.length < 2}
            title={accounts.length < 2 ? "Add two profiles before creating a bridge" : undefined}
          >
            <Plus size={16} />
            <span>Add Sync Bridge</span>
          </button>
        </div>

        {/* Bridges Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {routes.map((route) => {
            const srcAcc = accounts.find((a) => a.id === route.sourceAccountId);
            const tgtAcc = accounts.find((a) => a.id === route.targetAccountId);
            if (!srcAcc || !tgtAcc) return null;

            const srcConfig = PLATFORM_CONFIGS[srcAcc.platform] || PLATFORM_CONFIGS.twitter;
            const tgtConfig = PLATFORM_CONFIGS[tgtAcc.platform] || PLATFORM_CONFIGS.instagram;

            return (
              <div
                key={route.id}
                className="glass-panel"
                style={{
                  padding: "1.35rem 1.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  background: route.isEnabled
                    ? "rgba(18, 22, 33, 0.78)"
                    : "rgba(12, 14, 20, 0.4)",
                  opacity: route.isEnabled ? 1 : 0.65,
                }}
              >
                {/* Visual Route Flow Architecture */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "min(100%, 360px)", flexWrap: "wrap" }}>
                  {/* Source Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <AccountAvatar src={srcAcc.avatar} name={srcAcc.name} size={42} color={srcConfig.color} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{srcAcc.name}</div>
                      <span style={{ fontSize: "0.78rem", color: srcConfig.color }}>
                        {srcAcc.platformName || srcConfig.shortName} ({srcAcc.handle})
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow with Loop Guard Filter */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.2rem",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      {route.bidirectional ? (
                        <ArrowLeftRight size={16} color="var(--accent-cyan)" />
                      ) : (
                        <ArrowRight size={16} color="var(--primary)" />
                      )}
                      <span title="Loop Guard Protected"><ShieldCheck size={13} color="var(--accent-emerald)" /></span>
                    </div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      {route.bidirectional ? "BI-DIRECTIONAL" : "ONE-WAY"}
                    </span>
                  </div>

                  {/* Target Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <AccountAvatar src={tgtAcc.avatar} name={tgtAcc.name} size={42} color={tgtConfig.color} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{tgtAcc.name}</div>
                      <span style={{ fontSize: "0.78rem", color: tgtConfig.color }}>
                        {tgtAcc.platformName || tgtConfig.shortName} ({tgtAcc.handle})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature Controls & Toggles */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  {/* Media Support pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      color: "var(--accent-emerald)",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <Film size={12} />
                    <span>Media previews enabled</span>
                  </div>

                  {/* Bidirectional Toggle */}
                  <button
                    onClick={() => onToggleBidirectional(route.id)}
                    className={`btn btn-sm ${route.bidirectional ? "btn-outline" : "btn-ghost"}`}
                    style={{ fontSize: "0.78rem" }}
                    title="Toggle bidirectional sync"
                  >
                    <ArrowLeftRight size={14} />
                    <span>{route.bidirectional ? "Bidirectional" : "One-Way"}</span>
                  </button>

                  <button
                    onClick={() => onQuickSimulateRoute?.(route.id)}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: "0.78rem" }}
                    title="Add a local example event to the activity ledger"
                    disabled={!route.isEnabled}
                  >
                    <Play size={13} />
                    <span>Preview route</span>
                  </button>

                  {/* Auto Quote Card for Instagram */}
                  {(srcAcc.platform === "twitter" || tgtAcc.platform === "instagram") && (
                    <button
                      onClick={() => onToggleAutoCard(route.id)}
                      className={`btn btn-sm ${route.autoGenerateCard ? "btn-outline" : "btn-ghost"}`}
                      style={{
                        fontSize: "0.78rem",
                        color: route.autoGenerateCard ? "var(--accent-rose)" : "var(--text-muted)",
                      }}
                      title="When posting text on X, automatically synthesize an aesthetic 1080x1080 card for Instagram"
                    >
                      <Sparkles size={13} />
                      <span>{route.autoGenerateCard ? "Auto-Card: On" : "Auto-Card: Off"}</span>
                    </button>
                  )}

                  {/* Master Route Enable / Pause Switch */}
                  <label className="toggle-switch" title="Enable or pause this sync bridge">
                    <input
                      type="checkbox"
                      checked={route.isEnabled}
                      onChange={() => onToggleRoute(route.id)}
                    />
                    <span className="slider" />
                  </label>

                  {/* Delete Bridge */}
                  <button
                    onClick={() => onDeleteRoute(route.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--accent-rose)", padding: "0.4rem" }}
                    title="Remove bridge"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL: Configure New Bridge */}
      {isAddBridgeOpen && (
        <div className="modal-overlay" onClick={() => setIsAddBridgeOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>
              Configure a sync bridge
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Choose two saved profile links. This creates a local demo rule; it does not authorize or publish to either service.
            </p>

            <form onSubmit={handleCreateBridge} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Source profile (example post starts here)
                </label>
                <select
                  value={bridgeSource}
                  onChange={(e) => setBridgeSource(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({PLATFORM_CONFIGS[a.platform]?.name || a.platform} - {a.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Destination profile
                </label>
                <select
                  value={bridgeTarget}
                  onChange={(e) => setBridgeTarget(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({PLATFORM_CONFIGS[a.platform]?.name || a.platform} - {a.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Bi-directional preview</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                    Preview incoming posts in both directions with duplicate-loop protection
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={bridgeBidirectional}
                    onChange={(e) => setBridgeBidirectional(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              {bridgeError && <p className="connect-error" role="alert">{bridgeError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddBridgeOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  <Zap size={16} />
                  <span>Save Local Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

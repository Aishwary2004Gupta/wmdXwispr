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
  Plus,
  Play,
  ShieldCheck,
  ShieldAlert,
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
  authFeedback?: string;
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
  authFeedback,
}: SyncMatrixProps) {
  const [isAddBridgeOpen, setIsAddBridgeOpen] = useState(false);
  const [quickUrlInput, setQuickUrlInput] = useState("");

  // New bridge form state
  const [bridgeSource, setBridgeSource] = useState(accounts[0]?.id || "");
  const [bridgeTarget, setBridgeTarget] = useState(accounts[1]?.id || "");
  const [bridgeBidirectional, setBridgeBidirectional] = useState(true);
  const [bridgeError, setBridgeError] = useState("");
  const [authAccount, setAuthAccount] = useState<SocialAccount | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

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

  const handleAuthenticate = async () => {
    if (!authAccount) return;
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const response = await fetch(`/api/auth/${authAccount.platform}/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId: authAccount.id, profileUrl: authAccount.profileUrl }),
      });
      const payload = await response.json() as { authorizationUrl?: string; error?: string; missing?: string[]; callbackUrl?: string };
      if (!response.ok || !payload.authorizationUrl) {
        const setup = [
          payload.error || "Could not start official sign-in. Please try again.",
          ...(payload.missing?.length ? [`Missing server settings: ${payload.missing.join(", ")}.`] : []),
          ...(payload.callbackUrl ? [`Register this exact OAuth callback URL with the platform app: ${payload.callbackUrl}`] : []),
        ];
        setAuthMessage(setup.join("\n"));
        return;
      }
      window.location.assign(payload.authorizationUrl);
    } catch {
      setAuthMessage("Could not contact the sign-in service. Check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
      {authFeedback && (
        <div className="auth-feedback-notice" role="status">
          <ShieldCheck size={18} />
          <span>{authFeedback}</span>
        </div>
      )}
      {/* QUICK CONNECT HERO BAR: Link-to-Login in one simple step */}
      <section
        className="glass-panel"
        style={{
          padding: "1.75rem 2rem",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(239, 244, 255, 0.94) 100%)",
          border: "1px solid rgba(36, 85, 207, 0.2)",
          boxShadow: "0 12px 36px -6px rgba(34, 54, 92, 0.1)",
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
            background: "rgba(36, 85, 207, 0.1)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "800px", position: "relative" }}>
          <div className="auth-setup-notice" role="status">
            <ShieldAlert size={19} />
            <div>
              <strong>Saved links still need sign-in</strong>
              <p>A profile link alone does not prove account control. Sign in separately for each account; provider app credentials must be configured before its official sign-in can start. Publishing also needs a separate platform integration.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-blue">
              <Globe size={12} />
              <span>8 platforms + custom links</span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>•</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Save profile links for local previews
            </span>
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
            Add a social profile link
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
                  background: "rgba(255, 255, 255, 0.96)",
                  borderColor: "rgba(36, 85, 207, 0.2)",
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
            {Object.values(PLATFORM_CONFIGS).map((conf) => {
              const accent = conf.id === "twitter" || conf.id === "threads"
                ? "#48618a"
                : conf.id === "tiktok"
                ? "#176c73"
                : conf.color;
              return (
                <span
                  key={conf.id}
                  style={{
                    fontSize: "0.75rem",
                    color: accent,
                    background: "rgba(36, 85, 207, 0.06)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    border: "1px solid rgba(36, 85, 207, 0.14)",
                  }}
                >
                  {conf.shortName}
                </span>
              );
            })}
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
              <span>Saved Social Profiles ({accounts.length})</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Links are saved in this browser. Sign in separately to confirm account control; posting still needs a platform write integration.
            </p>
          </div>

          <button
            onClick={() => onOpenConnectModal("")}
            className="btn btn-primary btn-sm"
            id="add-account-btn"
          >
            <Plus size={16} />
            <span>Add Another Profile Link</span>
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
            const platformAccent = acc.platform === "twitter" || acc.platform === "threads"
              ? "#48618a"
              : acc.platform === "tiktok"
              ? "#176c73"
              : platformConfig.color;

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
                  borderTop: `3px solid ${platformAccent}`,
                  background: "rgba(255, 255, 255, 0.94)",
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
                      <AccountAvatar src={acc.avatar} name={acc.name || acc.handle} size={52} color={platformAccent} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{acc.name}</span>
                          {acc.isVerifiedOwner && <CheckCircle2 size={16} color={platformAccent} />}
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
                        background: "rgba(36, 85, 207, 0.08)",
                        color: "var(--primary)",
                        border: "1px solid rgba(36, 85, 207, 0.18)",
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

                  {/* Provider sign-in result */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.55rem 0.85rem",
                      background: acc.isVerifiedOwner ? "rgba(22, 130, 95, 0.08)" : acc.verificationOutcome === "mismatch" ? "rgba(190, 46, 70, 0.08)" : "rgba(169, 102, 24, 0.08)",
                      border: `1px solid ${acc.isVerifiedOwner ? "rgba(22, 130, 95, 0.25)" : acc.verificationOutcome === "mismatch" ? "rgba(190, 46, 70, 0.24)" : "rgba(169, 102, 24, 0.24)"}`,
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: acc.isVerifiedOwner ? "#126347" : acc.verificationOutcome === "mismatch" ? "#a82f45" : "#81500b", fontWeight: 600 }}>
                      {acc.isVerifiedOwner ? <CheckCircle2 size={13} /> : acc.verificationOutcome === "mismatch" ? <ShieldAlert size={13} /> : <LinkIcon size={13} />}
                      <span>{acc.isVerifiedOwner ? acc.badge || "Account link confirmed" : acc.verificationOutcome === "mismatch" ? "Account mismatch" : acc.verificationOutcome === "identity_only" ? "Signed in · profile not matched" : "Not authenticated"}</span>
                    </div>
                    <span style={{ color: "#526486", fontFamily: "var(--font-main)", fontSize: "0.72rem" }}>
                      {acc.verificationNote || (acc.isVerifiedOwner ? `Signed in as ${acc.verifiedSessionId || "this account"}` : "Sign in through the social network")}
                    </span>
                  </div>

                  {/* Metrics Box */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      padding: "0.6rem 0.85rem",
                      background: "rgba(235, 240, 250, 0.82)",
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
                  className="account-card-footer"
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
                    <span style={{ color: acc.isVerifiedOwner ? "var(--accent-emerald)" : acc.verificationOutcome === "mismatch" ? "var(--accent-rose)" : "var(--accent-amber)", fontWeight: 600 }}>
                      {acc.isVerifiedOwner ? "Account control confirmed" : acc.verificationOutcome === "mismatch" ? "Profile mismatch" : acc.verificationOutcome === "identity_only" ? "Signed in · link unconfirmed" : "Link saved · sign-in required"}
                    </span>
                  </div>

                  <div className="account-card-actions" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <button
                      type="button"
                      onClick={() => setAuthAccount(acc)}
                      className="btn btn-outline btn-sm"
                      title={`Sign in to ${acc.platformName || platformConfig.name} and compare its account handle`}
                    >
                      <ShieldCheck size={14} />
                      <span>{acc.isVerifiedOwner ? "Verify again" : "Sign in"}</span>
                    </button>
                    <button
                      onClick={() => onDeleteAccount(acc.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--accent-rose)", padding: "0.2rem 0.5rem" }}
                      title="Remove saved profile link"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
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
            const srcAccent = srcAcc.platform === "twitter" || srcAcc.platform === "threads"
              ? "#48618a"
              : srcAcc.platform === "tiktok"
              ? "#176c73"
              : srcConfig.color;
            const tgtAccent = tgtAcc.platform === "twitter" || tgtAcc.platform === "threads"
              ? "#48618a"
              : tgtAcc.platform === "tiktok"
              ? "#176c73"
              : tgtConfig.color;

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
                    ? "rgba(255, 255, 255, 0.94)"
                    : "rgba(241, 244, 250, 0.94)",
                  opacity: route.isEnabled ? 1 : 0.65,
                }}
              >
                {/* Visual Route Flow Architecture */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "min(100%, 360px)", flexWrap: "wrap" }}>
                  {/* Source Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <AccountAvatar src={srcAcc.avatar} name={srcAcc.name} size={42} color={srcAccent} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{srcAcc.name}</div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
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
                      background: "rgba(36, 85, 207, 0.06)",
                      border: "1px solid rgba(36, 85, 207, 0.14)",
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
                    <AccountAvatar src={tgtAcc.avatar} name={tgtAcc.name} size={42} color={tgtAccent} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{tgtAcc.name}</div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
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
                  background: "rgba(22, 130, 95, 0.1)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(22, 130, 95, 0.2)",
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
                  background: "rgba(36, 85, 207, 0.05)",
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

      {authAccount && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setAuthAccount(null)}>
          <section className="modal-content auth-requirements-modal" role="dialog" aria-modal="true" aria-labelledby="auth-requirements-title">
            <div className="connect-modal-header">
              <div className="connect-modal-title-wrap">
                <div className="connect-modal-icon"><ShieldAlert size={19} /></div>
                <div>
                  <h2 id="auth-requirements-title">Authenticate {authAccount.platformName || PLATFORM_CONFIGS[authAccount.platform]?.name || authAccount.platform}</h2>
                  <p>{authAccount.handle} · saved profile link</p>
                </div>
              </div>
              <button type="button" onClick={() => setAuthAccount(null)} className="btn btn-ghost btn-sm" aria-label="Close dialog">×</button>
            </div>
            <div className="auth-modal-message">
              <strong>Sign in on the official social network.</strong>
              <p>OmniSync will compare the account returned by {authAccount.platformName || PLATFORM_CONFIGS[authAccount.platform]?.name || authAccount.platform} with the handle in this saved profile link. A mismatch leaves the profile unverified.</p>
            </div>
            <ol className="auth-requirements-list">
              <li>Register a developer app and enable the network&apos;s read-only sign-in product.</li>
              <li>Set the app&apos;s client ID and secret on the server and register the callback URL.</li>
              <li>Sign in at the social network and approve the account details requested.</li>
            </ol>
            <p className="auth-security-note">Your password is entered only on the network&apos;s site. This check keeps no access token and does not turn on publishing. It confirms account control at sign-in time, not a person&apos;s legal identity.</p>
            {authMessage && <p className="connect-error auth-setup-error" role="alert">{authMessage}</p>}
            <div className="connect-actions">
              <button type="button" onClick={() => { setAuthAccount(null); setAuthMessage(""); }} className="btn btn-ghost">Close</button>
              <button type="button" onClick={handleAuthenticate} disabled={authBusy} className="btn btn-primary">
                <ShieldCheck size={16} />
                <span>{authBusy ? "Starting sign-in…" : `Continue to ${authAccount.platformName || PLATFORM_CONFIGS[authAccount.platform]?.shortName || authAccount.platform} sign-in`}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

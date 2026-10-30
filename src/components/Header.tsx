"use client";

import {
  Activity,
  ArrowRightLeft,
  CloudLightning,
  Layers,
  Link as LinkIcon,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AppTab = "matrix" | "composer" | "cardStudio" | "ledger";

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSimulate: () => void;
  onOpenDeployGuide: () => void;
  accountCount: number;
  routeCount: number;
  loopBlockedCount: number;
  onOpenConnectModal?: () => void;
}

const tabs: { id: AppTab; label: string; icon: typeof ArrowRightLeft }[] = [
  { id: "matrix", label: "Profiles & routes", icon: ArrowRightLeft },
  { id: "composer", label: "Post preview", icon: Layers },
  { id: "cardStudio", label: "Card studio", icon: Sparkles },
  { id: "ledger", label: "Activity", icon: Activity },
];

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
    <header className="site-header">
      <div className="site-topbar">
        <button className="brand-mark" type="button" onClick={() => setActiveTab("matrix")} aria-label="OmniSync home">
          <span className="brand-icon"><ArrowRightLeft size={17} /></span>
          <span>OmniSync</span>
          <span className="demo-pill">Local demo</span>
        </button>

        <div className="topbar-actions">
          <button type="button" onClick={onOpenDeployGuide} className="btn btn-ghost btn-sm deploy-link">
            <CloudLightning size={15} /> Deploy guide
          </button>
          {onOpenConnectModal && (
            <button type="button" onClick={onOpenConnectModal} className="btn btn-primary btn-sm" id="header-connect-url-btn">
              <LinkIcon size={15} /> Add a profile
            </button>
          )}
        </div>
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> SOCIAL WORKSPACE, MADE SIMPLE</span>
          <h1 id="hero-title" className="hero-title">Your voice,<br />in every place.</h1>
          <p className="hero-description">
            Keep your social profiles in one calm workspace. Draft once, preview each destination, and choose where your post belongs.
          </p>
          <div className="hero-actions">
            {onOpenConnectModal && (
              <button type="button" onClick={onOpenConnectModal} className="btn btn-primary" id="hero-connect-btn">
                <LinkIcon size={16} /> Connect a profile
              </button>
            )}
            <button type="button" onClick={() => setActiveTab("composer")} className="btn btn-outline">
              <Layers size={16} /> Write a post
            </button>
          </div>
          <p className="hero-note">Profile links and previews stay in this browser. No posts are published in demo mode.</p>

          <div className="hero-metrics" aria-label="Workspace summary">
            <div><strong>{accountCount}</strong><span>profiles</span></div>
            <span className="metric-divider" />
            <div><strong>{routeCount}</strong><span>routes</span></div>
            <span className="metric-divider" />
            <div className="guard-metric"><ShieldCheck size={16} /><strong>{loopBlockedCount}</strong><span>echoes blocked</span></div>
          </div>
        </div>

      </section>

      <div className="workspace-bar">
        <div className="workspace-tabs" role="tablist" aria-label="Workspace views">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`workspace-tab ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              <span>{id === "matrix" ? `Profiles & routes (${accountCount})` : label}</span>
            </button>
          ))}
        </div>
        <div className="workspace-actions">
          <span className="guard-status"><ShieldCheck size={15} /> Echo guard on</span>
          <button type="button" onClick={onOpenSimulate} className="btn btn-outline btn-sm" id="simulate-incoming-post-btn">
            <Play size={14} /> Simulate activity
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { MediaType, SocialAccount, SocialPlatform } from "@/types/sync";
import { CARD_THEMES, PLATFORM_CONFIGS, SAMPLE_MEDIA_LIBRARY } from "@/lib/constants";
import TechQuoteCard from "@/components/TechQuoteCard";
import AccountAvatar from "@/components/AccountAvatar";
import {
  Check,
  CheckCircle2,
  Film,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Play,
  Repeat2,
  Send,
  Share2,
  Sparkles,
  Terminal,
  Trash2,
  UploadCloud,
  Volume2,
} from "lucide-react";

interface UniversalComposerProps {
  accounts: SocialAccount[];
  onBroadcast: (post: {
    content: string;
    mediaType: MediaType;
    mediaUrl?: string;
    targetPlatforms: SocialPlatform[];
    generateCard: boolean;
    categoryTag: string;
    codeSnippet?: string;
  }) => void;
}

export default function UniversalComposer({
  accounts,
  onBroadcast,
}: UniversalComposerProps) {
  const [content, setContent] = useState(
    "Never rely solely on color to communicate state in UI design. Always pair color with an icon or clear text label so colorblind users have an effortless experience."
  );
  const [categoryTag, setCategoryTag] = useState("UI/UX Principle");
  const [showCode, setShowCode] = useState(true);
  const [codeSnippet, setCodeSnippet] = useState(
    "// Accessible UI badge component\n<StatusBadge state=\"success\" icon={<CheckCircle />} label=\"Deployed\" />"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(() =>
    Array.from(new Set(accounts.slice(0, 3).map((account) => account.platform))),
  );
  const [themeId, setThemeId] = useState("obsidian-tech");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Media Attachment State: 'card' (auto-card), 'image', 'gif', 'video'
  const [activeMediaType, setActiveMediaType] = useState<MediaType>("card");
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availablePlatforms = Array.from(new Set(accounts.map((account) => account.platform)));

  const twitterAccount = accounts.find((a) => a.platform === "twitter") || accounts[0] || {
    name: "Developer Studio",
    handle: "@developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    platform: "twitter" as SocialPlatform,
  };

  const instagramAccount = accounts.find((a) => a.platform === "instagram") || accounts[1] || accounts[0] || {
    name: "Visual Dev Lab",
    handle: "@visual.tech",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    platform: "instagram" as SocialPlatform,
  };

  const handleTogglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSelectedMediaUrl(url);

    if (file.type.includes("video")) {
      setActiveMediaType("video");
    } else if (file.type.includes("gif")) {
      setActiveMediaType("gif");
    } else {
      setActiveMediaType("image");
    }
  };

  const handleSelectSampleMedia = (item: (typeof SAMPLE_MEDIA_LIBRARY)[0]) => {
    setActiveMediaType(item.type);
    setSelectedMediaUrl(item.url);
  };

  const handleSend = () => {
    if (!content.trim() || selectedPlatforms.length === 0) return;
    setIsBroadcasting(true);

    setTimeout(() => {
      onBroadcast({
        content,
        mediaType: activeMediaType,
        mediaUrl: activeMediaType !== "card" ? selectedMediaUrl : undefined,
        targetPlatforms: selectedPlatforms,
        generateCard: activeMediaType === "card",
        categoryTag,
        codeSnippet: showCode ? codeSnippet : undefined,
      });
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    }, 1200);
  };

  const charCount = content.length;
  const isOverTwitterLimit = charCount > 280;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Broadcast Success Banner */}
      {broadcastSuccess && (
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "var(--radius-md)",
            color: "#6ee7b7",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "fadeIn 250ms ease-out",
          }}
        >
          <CheckCircle2 size={20} color="#10b981" />
          <div>
            <strong>Preview added to the local activity ledger.</strong> No post was sent to a social network.
          </div>
        </div>
      )}

      {/* Main Composer Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Input & Configuration */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Send size={18} color="var(--primary)" />
              <span>Post preview</span>
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              One draft, all platforms
            </span>
          </div>

          {/* Target Platforms Selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Destination profiles ({selectedPlatforms.length} selected)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {availablePlatforms.map((p) => {
                const conf = PLATFORM_CONFIGS[p];
                if (!conf) return null;
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleTogglePlatform(p)}
                    className="btn btn-sm"
                    style={{
                      background: isSelected ? `${conf.color}25` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? conf.color : "var(--border-subtle)"}`,
                      color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: conf.color,
                        display: "inline-block",
                      }}
                    />
                    <span>{conf.shortName}</span>
                    {isSelected && <Check size={13} color={conf.color} />}
                  </button>
                );
              })}
              {availablePlatforms.length === 0 && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                  Add a profile link in Sync Matrix to start a local preview.
                </p>
              )}
            </div>
          </div>

          {/* Text Editor */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Post Body & Tech/Design Insights
              </label>
              <div style={{ fontSize: "0.8rem", display: "flex", gap: "0.75rem" }}>
                <span style={{ color: isOverTwitterLimit ? "var(--accent-rose)" : "var(--text-secondary)" }}>
                  X: <strong>{charCount}</strong>/280 {isOverTwitterLimit && "(Auto-threaded)"}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  IG: <strong>{charCount}</strong>/2,200
                </span>
              </div>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your tech insight, design principle, or caption..."
              style={{
                lineHeight: 1.5,
                borderColor: isOverTwitterLimit ? "rgba(244, 63, 94, 0.4)" : undefined,
              }}
            />
          </div>

          {/* MEDIA ATTACHMENT SECTION */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Film size={15} color="var(--accent-cyan)" />
                <span>Attach Media (Image, GIF, Video, or Card)</span>
              </label>
              {selectedMediaUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMediaUrl("");
                    setActiveMediaType("card");
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--accent-rose)", padding: "0.1rem 0.4rem", fontSize: "0.75rem" }}
                >
                  <Trash2 size={12} />
                  <span>Remove Media</span>
                </button>
              )}
            </div>

            {/* Media Type Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setActiveMediaType("card")}
                className={`media-chip-btn ${activeMediaType === "card" ? "active" : ""}`}
              >
                <Sparkles size={14} color="var(--accent-rose)" />
                <span>Auto Tech Quote Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaType("video");
                  if (!selectedMediaUrl) setSelectedMediaUrl(SAMPLE_MEDIA_LIBRARY[0].url);
                }}
                className={`media-chip-btn ${activeMediaType === "video" ? "active" : ""}`}
              >
                <Film size={14} color="var(--accent-cyan)" />
                <span>Video / Reel (.mp4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaType("gif");
                  if (!selectedMediaUrl) setSelectedMediaUrl(SAMPLE_MEDIA_LIBRARY[1].url);
                }}
                className={`media-chip-btn ${activeMediaType === "gif" ? "active" : ""}`}
              >
                <Play size={14} color="var(--accent-violet)" />
                <span>Animated GIF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaType("image");
                  if (!selectedMediaUrl) setSelectedMediaUrl(SAMPLE_MEDIA_LIBRARY[2].url);
                }}
                className={`media-chip-btn ${activeMediaType === "image" ? "active" : ""}`}
              >
                <ImageIcon size={14} color="var(--accent-emerald)" />
                <span>Photo / Image</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="media-chip-btn"
                style={{ borderStyle: "dashed" }}
              >
                <UploadCloud size={14} />
                <span>Upload from Device</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.gif"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* Preset Samples Selector */}
            {activeMediaType !== "card" && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Quick Sample Media Presets:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {SAMPLE_MEDIA_LIBRARY.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleMedia(item)}
                      className="btn btn-outline btn-sm"
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        borderColor: selectedMediaUrl === item.url ? "var(--accent-cyan)" : undefined,
                      }}
                    >
                      {item.type.toUpperCase()}: {item.name.slice(0, 24)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Tag & Code Snippet Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Topic Category Tag
              </label>
              <select
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
              >
                <option value="Tech Architecture">Tech Architecture</option>
                <option value="UI/UX Principle">UI/UX Principle</option>
                <option value="Design Systems">Design Systems</option>
                <option value="CSS / Frontend">CSS / Frontend</option>
                <option value="Cloud & Vercel">Cloud & Vercel</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Quote Aesthetic Theme
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
              >
                {CARD_THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} ({theme.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Snippet Option */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <span>Include Code / Terminal Snippet</span>
              </label>
              <input
                type="checkbox"
                checked={showCode}
                onChange={(e) => setShowCode(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
            {showCode && (
              <textarea
                rows={3}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Code snippet or command..."
                className="font-mono"
                style={{ fontSize: "0.85rem", color: "#38bdf8" }}
              />
            )}
          </div>

          {/* Broadcast Action Button */}
          <button
            onClick={handleSend}
            disabled={isBroadcasting || !content.trim() || selectedPlatforms.length === 0}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
            id="broadcast-channels-btn"
          >
            {isBroadcasting ? (
              <>
                <div className="pulse-dot" style={{ backgroundColor: "#ffffff" }} />
                <span>Preparing local preview...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Save Local Preview</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Live Multi-Device Previews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Example post previews (X and Instagram)</span>
            </h3>
            <span className="badge badge-blue">Local preview only</span>
          </div>

          {/* 1. X (Twitter) Preview Card */}
          <div
            className="glass-panel"
            style={{
              padding: "1.25rem",
              background: "#050608",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#f8fafc" }}>
                X (TWITTER) NATIVE FEED
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Just now</span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <AccountAvatar src={twitterAccount.avatar} name={twitterAccount.name} size={42} color="#1d9bf0" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{twitterAccount.name}</span>
                  <CheckCircle2 size={15} color="#1d9bf0" fill="#1d9bf0" stroke="#000" />
                  <span style={{ color: "#71767b", fontSize: "0.85rem" }}>{twitterAccount.handle}</span>
                </div>

                <p style={{ fontSize: "0.95rem", lineHeight: 1.45, color: "#e7e9ea", marginBottom: "0.75rem" }}>
                  {isOverTwitterLimit ? `${content.slice(0, 240)}... (1/2)` : content}
                </p>

                {/* Media Component in X Card */}
                {activeMediaType === "video" && selectedMediaUrl && (
                  <div className="device-media-container">
                    <video
                      src={selectedMediaUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      style={{ width: "100%", maxHeight: "240px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {activeMediaType === "gif" && selectedMediaUrl && (
                  <div className="device-media-container">
                    <Image
                      src={selectedMediaUrl}
                      alt="Animated GIF"
                      width={960}
                      height={540}
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 720px"
                      style={{ width: "100%", maxHeight: "240px", objectFit: "cover" }}
                    />
                    <span className="gif-badge-pill">GIF</span>
                  </div>
                )}

                {activeMediaType === "image" && selectedMediaUrl && (
                  <div className="device-media-container">
                    <Image
                      src={selectedMediaUrl}
                      alt="Attached Photo"
                      width={960}
                      height={540}
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 720px"
                      style={{ width: "100%", maxHeight: "240px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {showCode && codeSnippet && (
                  <div
                    style={{
                      background: "#16181c",
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: "#7dd3fc",
                      marginBottom: "0.75rem",
                      border: "1px solid #2f3336",
                    }}
                  >
                    {codeSnippet}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#71767b",
                    fontSize: "0.8rem",
                    maxWidth: "360px",
                    paddingTop: "0.5rem",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <MessageCircle size={15} /> 24
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Repeat2 size={15} /> 68
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Heart size={15} /> 312
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Share2 size={15} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Instagram Preview Card */}
          <div
            className="glass-panel"
            style={{
              padding: "1.25rem",
              background: "#08090d",
              border: "1px solid rgba(225, 48, 108, 0.25)",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#e1306c" }}>
                INSTAGRAM {activeMediaType === "video" ? "REEL PREVIEW" : "FEED PREVIEW"}
              </span>
              <span className="badge badge-rose" style={{ fontSize: "0.68rem" }}>
                {activeMediaType === "video"
                  ? "Video / Reel Format"
                  : activeMediaType === "gif"
                  ? "Looped MP4 Reel"
                  : activeMediaType === "image"
                  ? "Photo Standard"
                  : "Auto-Card Synthesized"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <AccountAvatar src={instagramAccount.avatar} name={instagramAccount.name} size={34} color="#e1306c" />
              <div>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{instagramAccount.handle}</span>
                {activeMediaType === "video" && (
                  <div className="reel-audio-bar">
                    <Volume2 size={12} color="var(--accent-rose)" />
                    <span>Original Audio • Creative Tech Lab</span>
                  </div>
                )}
              </div>
            </div>

            {/* Media rendering for Instagram */}
            {activeMediaType === "video" && selectedMediaUrl && (
              <div className="device-media-container" style={{ maxHeight: "360px" }}>
                <video
                  src={selectedMediaUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  style={{ width: "100%", maxHeight: "360px", objectFit: "cover" }}
                />
              </div>
            )}

            {activeMediaType === "gif" && selectedMediaUrl && (
              <div className="device-media-container" style={{ maxHeight: "320px" }}>
                <Image
                  src={selectedMediaUrl}
                  alt="Instagram Looped Media"
                  width={960}
                  height={540}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 720px"
                  style={{ width: "100%", maxHeight: "320px", objectFit: "cover" }}
                />
                <span className="gif-badge-pill">REEL LOOP</span>
              </div>
            )}

            {activeMediaType === "image" && selectedMediaUrl && (
              <div className="device-media-container" style={{ maxHeight: "320px" }}>
                <Image
                  src={selectedMediaUrl}
                  alt="Instagram Feed Photo"
                  width={960}
                  height={540}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 720px"
                  style={{ width: "100%", maxHeight: "320px", objectFit: "cover" }}
                />
              </div>
            )}

            {activeMediaType === "card" && (
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <TechQuoteCard
                  text={content}
                  authorName={instagramAccount.name}
                  authorHandle={instagramAccount.handle}
                  authorAvatar={instagramAccount.avatar}
                  categoryTag={categoryTag}
                  themeId={themeId}
                  showCodeSnippet={showCode}
                  codeSnippet={codeSnippet}
                  scale={0.85}
                />
              </div>
            )}

            {/* Instagram Actions */}
            <div style={{ display: "flex", gap: "1rem", color: "#f8fafc", marginBottom: "0.5rem" }}>
              <Heart size={20} color="#f43f5e" fill="#f43f5e" />
              <MessageCircle size={20} />
              <Send size={20} />
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              <strong style={{ color: "var(--text-primary)" }}>{instagramAccount.handle}</strong>{" "}
              {content.slice(0, 110)}... #tech #design #coding #uiux
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

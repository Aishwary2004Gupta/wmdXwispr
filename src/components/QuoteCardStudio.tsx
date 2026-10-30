"use client";

import React, { useState } from "react";
import { SocialAccount } from "@/types/sync";
import { CARD_THEMES } from "@/lib/constants";
import TechQuoteCard from "./TechQuoteCard";
import { Copy, Download, Sparkles, Terminal } from "lucide-react";

interface QuoteCardStudioProps {
  account: SocialAccount;
}

export default function QuoteCardStudio({ account }: QuoteCardStudioProps) {
  const [text, setText] = useState(
    "Good design is obvious. Great design is transparent. When engineering UI systems, always design for predictability before novelty."
  );
  const [tag, setTag] = useState("Design Systems");
  const [themeId, setThemeId] = useState("obsidian-tech");
  const [hasCode, setHasCode] = useState(true);
  const [code, setCode] = useState(
    "export const tokens = {\n  radius: '16px',\n  blur: '24px',\n  transition: '300ms cubic-bezier(0.16, 1, 0.3, 1)'\n};"
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const presets = [
    {
      label: "UI/UX Principle",
      text: "Never use pure black (#000000) for text on a white background. Use #111827 or #18181b instead. It prevents eye strain and gives your UI a luxurious feel.",
      tag: "UI/UX Principle",
      themeId: "design-sunset",
      code: "const colors = {\n  primaryText: '#18181b',\n  surface: '#ffffff'\n};",
    },
    {
      label: "Next.js Architecture",
      text: "Next.js 15 Server Actions + Optimistic UI updates feel like magic when architected with proper error boundaries.",
      tag: "System Architecture",
      themeId: "obsidian-tech",
      code: "const [state, formAction] = useActionState(updateProfile, null);",
    },
    {
      label: "TypeScript Standard",
      text: "Avoid `any` at all costs. Using `unknown` forces type checking and keeps your refactors safe months down the line.",
      tag: "TypeScript Mastery",
      themeId: "emerald-matrix",
      code: "function safeParse(val: unknown): string {\n  if (typeof val === 'string') return val;\n  throw new Error('Invalid type');\n}",
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setText(p.text);
    setTag(p.tag);
    setThemeId(p.themeId);
    setCode(p.code);
    setHasCode(true);
  };

  const handleExport = (type: "png" | "clipboard") => {
    if (type === "clipboard") {
      navigator.clipboard.writeText(`"${text}" — by ${account?.name || "Author"}`);
      setExportNotice("Text & Quote Copied to Clipboard!");
    } else {
      setExportNotice("1080x1080 Instagram Graphic Synthesized!");
    }
    setTimeout(() => setExportNotice(null), 3000);
  };

  const safeAccount = account || {
    name: "Alex Dev & Design",
    handle: "@alex_creativetech",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} color="var(--accent-rose)" />
            <span>Tech & Design Auto-Card Studio</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Instagram requires media. When you cross-post text from X or LinkedIn to Instagram, OmniSync synthesizes this 1080x1080 asset automatically.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => handleExport("clipboard")} className="btn btn-outline btn-sm">
            <Copy size={14} />
            <span>Copy Text</span>
          </button>
          <button onClick={() => handleExport("png")} className="btn btn-accent btn-sm">
            <Download size={14} />
            <span>{exportNotice || "Export 1080x1080 Card"}</span>
          </button>
        </div>
      </div>

      {/* Preset Pill Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Load Preset:</span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* Editor Controls */}
        <div className="glass-panel" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Insight / Tip Text
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter design rule or technical tip..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Header Tagline / Domain
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Design Systems or System Architecture"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              Card Aesthetic & Theme
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {CARD_THEMES.map((theme) => {
                const isSelected = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    style={{
                      background: theme.bgGradient,
                      border: `2px solid ${isSelected ? theme.accentColor : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "12px",
                      padding: "0.75rem",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isSelected ? `0 0 16px ${theme.accentColor}40` : "none",
                      transition: "all 150ms ease",
                    }}
                  >
                    <div>{theme.name}</div>
                    <span style={{ fontSize: "0.72rem", opacity: 0.75, color: theme.accentColor }}>
                      {theme.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <span>Code Block Snippet</span>
              </label>
              <input
                type="checkbox"
                checked={hasCode}
                onChange={(e) => setHasCode(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
            {hasCode && (
              <textarea
                rows={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono"
                style={{ fontSize: "0.82rem", color: "#31527e" }}
              />
            )}
          </div>
        </div>

        {/* Live Card Graphic Output */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TechQuoteCard
            text={text}
            authorName={safeAccount.name}
            authorHandle={safeAccount.handle}
            authorAvatar={safeAccount.avatar}
            categoryTag={tag}
            themeId={themeId}
            showCodeSnippet={hasCode}
            codeSnippet={code}
            scale={1}
          />
        </div>
      </div>
    </div>
  );
}

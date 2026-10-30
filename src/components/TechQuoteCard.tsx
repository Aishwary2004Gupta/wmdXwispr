"use client";

import React from "react";
import { CARD_THEMES } from "@/lib/constants";
import AccountAvatar from "@/components/AccountAvatar";
import { CheckCircle2, Sparkles } from "lucide-react";

interface TechQuoteCardProps {
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  categoryTag?: string;
  themeId?: string;
  showCodeSnippet?: boolean;
  codeSnippet?: string;
  scale?: number;
}

export default function TechQuoteCard({
  text,
  authorName,
  authorHandle,
  authorAvatar,
  categoryTag = "Tech Architecture",
  themeId = "obsidian-tech",
  showCodeSnippet = false,
  codeSnippet = "const UI = () => <OptimizedExperience responsive />;",
  scale = 1,
}: TechQuoteCardProps) {
  const currentTheme = CARD_THEMES.find((t) => t.id === themeId) || CARD_THEMES[0];

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: "480px",
        minHeight: "480px",
        background: currentTheme.bgGradient,
        borderRadius: "24px",
        padding: "36px",
        color: currentTheme.textColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 2px 0 rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Subtle corner light aura */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: currentTheme.accentColor,
          opacity: 0.16,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Top Header: Author Info & Category Pill */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <AccountAvatar src={authorAvatar} name={authorName} size={52} color={currentTheme.accentColor} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>{authorName}</span>
                <CheckCircle2 size={16} color={currentTheme.accentColor} fill={currentTheme.accentColor} stroke="#000" />
              </div>
              <span style={{ fontSize: "0.85rem", opacity: 0.75, fontFamily: "monospace" }}>{authorHandle}</span>
            </div>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: currentTheme.badgeBg,
              border: `1px solid ${currentTheme.accentColor}44`,
              color: currentTheme.accentColor,
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              letterSpacing: "0.02em",
            }}
          >
            <Sparkles size={12} />
            <span>{categoryTag}</span>
          </div>
        </div>

        {/* Post Text Content */}
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            lineHeight: 1.55,
            letterSpacing: "-0.015em",
            marginBottom: "24px",
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0,0,0,0.4)",
          }}
        >
          &ldquo;{text || "Share your tech insight or UI principle here. OmniSync transforms it into a polished Instagram graphic."}&rdquo;
        </div>

        {/* Code Snippet Window */}
        {showCodeSnippet && codeSnippet && (
          <div
            style={{
              background: "rgba(0, 0, 0, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "20px",
              fontFamily: "'Fira Code', monospace",
              fontSize: "0.84rem",
              color: currentTheme.accentColor,
              position: "relative",
            }}
          >
            {/* Window control dots */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginLeft: "6px" }}>
                code_sample.tsx
              </span>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.5 }}>
              {codeSnippet}
            </pre>
          </div>
        )}
      </div>

      {/* Card Footer Watermark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "16px",
          fontSize: "0.78rem",
          opacity: 0.8,
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>OmniSync Auto-Card Engine</span>
        <span style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>1080 &times; 1080 Preview</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { MediaType, SocialAccount, SocialPlatform, SyncRoute } from "@/types/sync";
import { PLATFORM_CONFIGS, SAMPLE_MEDIA_LIBRARY } from "@/lib/constants";
import {
  Play,
  RotateCw,
  X,
  Zap,
} from "lucide-react";

interface SimulateSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  routes: SyncRoute[];
  onExecuteSimulation: (params: {
    sourcePlatform: SocialPlatform;
    content: string;
    mediaType: MediaType;
    mediaUrl?: string;
    isEchoTest: boolean;
  }) => {
    isEchoBlocked: boolean;
    syncedTargets: string[];
    fingerprint: string;
  };
}

export default function SimulateSyncModal({
  isOpen,
  onClose,
  accounts,
  routes,
  onExecuteSimulation,
}: SimulateSyncModalProps) {
  const [simSource, setSimSource] = useState<SocialPlatform>("twitter");
  const [simContent, setSimContent] = useState(
    "Design principle: Hierarchy is created through contrast, spacing, and weight—not by making everything bold. Keep 60% of your interface quiet so the key action speaks loudest."
  );
  const [simMediaType, setSimMediaType] = useState<MediaType>("card");
  const [simMediaUrl, setSimMediaUrl] = useState<string>("");
  const [isEchoTest, setIsEchoTest] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<string[]>([]);

  const presets = [
    {
      label: "Short Video / Reel Simulation",
      text: "Showcasing our new reactive glassmorphism component library in action. Smooth 60fps micro-animations.",
      mediaType: "video" as MediaType,
      mediaUrl: SAMPLE_MEDIA_LIBRARY[0].url,
      source: "instagram" as SocialPlatform,
    },
    {
      label: "Animated Coding GIF Simulation",
      text: "The feeling when all TypeScript errors resolve on the first compile without any `any` types.",
      mediaType: "gif" as MediaType,
      mediaUrl: SAMPLE_MEDIA_LIBRARY[1].url,
      source: "twitter" as SocialPlatform,
    },
    {
      label: "Tech Tip with Auto Quote Card",
      text: "Hierarchy is created through contrast, spacing, and weight—not by making everything bold.",
      mediaType: "card" as MediaType,
      mediaUrl: "",
      source: "twitter" as SocialPlatform,
    },
    {
      label: "Trigger Echo Loop Test",
      text: "Design Rule: Never use pure black (#000000) for text on a white background...",
      mediaType: "card" as MediaType,
      mediaUrl: "",
      source: "instagram" as SocialPlatform,
      isEcho: true,
    },
  ];

  const handleRun = () => {
    setIsRunning(true);
    setPipelineSteps([]);
    const steps = [
      `[1/5] Ingesting webhook payload from ${PLATFORM_CONFIGS[simSource]?.name || simSource}...`,
      `[2/5] Local demo: account authorization is not checked.`,
      `[3/5] Parsing payload media component [${simMediaType.toUpperCase()}] & text...`,
      `[4/5] Running Echo Guard against Sync Ledger fingerprint database...`,
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setPipelineSteps((prev) => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        const result = onExecuteSimulation({
          sourcePlatform: simSource,
          content: simContent,
          mediaType: simMediaType,
          mediaUrl: simMediaUrl || undefined,
          isEchoTest,
        });

        if (result.isEchoBlocked) {
          setPipelineSteps((prev) => [
            ...prev,
            `[5/5] 🛡️ ECHO BLOCKED: Incoming post matches active outbound sync. Infinite loop dropped!`,
          ]);
        } else {
          setPipelineSteps((prev) => [
            ...prev,
            `[5/5] ✅ Preview complete: ${result.syncedTargets.length ? `would target ${result.syncedTargets.join(", ")}` : "no matching sync route"}. No post was sent.`,
          ]);
        }

        setIsRunning(false);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: "1.3rem" }}>Simulate Incoming Social Post (All Media)</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.3rem" }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Run a local preview with sample text, images, or video. It exercises the loop guard using {accounts.length} saved profiles and {routes.length} bridge rules; it does not authenticate accounts or publish posts.
        </p>

        {/* Quick Presets */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Quick Sample Presets:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSimContent(preset.text);
                  setSimSource(preset.source);
                  setSimMediaType(preset.mediaType);
                  setSimMediaUrl(preset.mediaUrl);
                  setIsEchoTest(Boolean(preset.isEcho));
                }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Origin Platform (Where did you post?)
              </label>
              <select
                value={simSource}
                onChange={(e) => setSimSource(e.target.value as SocialPlatform)}
              >
                {Object.values(PLATFORM_CONFIGS).map((conf) => (
                  <option key={conf.id} value={conf.id}>
                    {conf.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Attached Media Type
              </label>
              <select
                value={simMediaType}
                onChange={(e) => setSimMediaType(e.target.value as MediaType)}
              >
                <option value="card">Text Tweet (Auto Quote Card for IG)</option>
                <option value="video">Short Video / Reel (.mp4)</option>
                <option value="gif">Animated GIF</option>
                <option value="image">Photo / Screenshot</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Post Body / Caption
            </label>
            <textarea
              rows={3}
              value={simContent}
              onChange={(e) => setSimContent(e.target.value)}
              placeholder="What are you posting on your phone?"
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Simulate Loop Echo Condition</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Simulate an immediate repost to test Echo Guard duplicate prevention
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isEchoTest}
                onChange={(e) => setIsEchoTest(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Animated Terminal Runner */}
        {pipelineSteps.length > 0 && (
          <div
            style={{
              padding: "1rem",
              background: "#08090d",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontFamily: "monospace",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ color: "var(--accent-cyan)", marginBottom: "0.5rem", fontWeight: 700 }}>
              &gt; OmniSync Engine Pipeline Execution:
            </div>
            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  color: step.includes("🛡️")
                    ? "var(--accent-violet)"
                    : step.includes("✅")
                    ? "var(--accent-emerald)"
                    : "var(--text-secondary)",
                }}
              >
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Close
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !simContent.trim()}
            className="btn btn-accent"
          >
            {isRunning ? (
              <>
                <RotateCw size={15} className="spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>Execute Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

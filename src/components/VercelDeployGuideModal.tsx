"use client";

import React from "react";
import { Cloud, ExternalLink, Github, Info, X } from "lucide-react";

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VercelDeployGuideModal({ isOpen, onClose }: VercelDeployGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="deploy-guide-title" style={{ maxWidth: "680px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <Cloud size={22} color="var(--primary)" />
            <h2 id="deploy-guide-title" style={{ fontSize: "1.25rem" }}>Publish the demo with Vercel</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close deployment guide">
            <X size={18} />
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
          This is a Next.js demo. Vercel can build and host it from a Git repository; the connected project will deploy previews for pushes and production from its configured production branch.
        </p>

        <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1.25rem" }}>
          <div className="glass-panel" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.35rem" }}>
              <Github size={17} color="var(--text-primary)" />
              <strong>1. Push the project to GitHub</strong>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Create a repository, add this folder as the project root, and push the finished branch. A public repository makes the source code visible to everyone.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.35rem" }}>
              <Cloud size={17} color="var(--accent-cyan)" />
              <strong>2. Import it into Vercel</strong>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Choose <b>New Project</b>, import the GitHub repository, confirm the Next.js settings, then deploy. No environment variables are required for this demo.
            </p>
          </div>
        </div>

        <div className="connect-notice" style={{ marginBottom: "1.25rem" }}>
          <Info size={17} />
          <p>
            Profile links, routes, and activity are stored in the visitor&apos;s browser. This build has no database, platform OAuth, or publishing integration; composer and sync actions are local simulations. Do not add platform secrets until a secure server-side OAuth flow is implemented.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a href="https://vercel.com/docs/git" target="_blank" rel="noreferrer" className="btn btn-outline">
            <span>Vercel Git deployment guide</span>
            <ExternalLink size={14} />
          </a>
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </section>
    </div>
  );
}

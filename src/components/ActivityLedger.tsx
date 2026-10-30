"use client";

import React, { useState } from "react";
import { SyncPostLog } from "@/types/sync";
import { PLATFORM_CONFIGS } from "@/lib/constants";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ActivityLedgerProps {
  logs: SyncPostLog[];
  onClearLogs: () => void;
}

export default function ActivityLedger({ logs, onClearLogs }: ActivityLedgerProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    const matchesSearch =
      log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sourceHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.fingerprint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const echoBlockedCount = logs.filter((l) => l.status === "loop_blocked").length;
  const simulatedCount = logs.filter((l) => l.status === "simulated").length;
  const simulatedLogs = logs.filter((l) => l.status === "simulated");
  const averageSimulatedLatency = simulatedLogs.length
    ? Math.round(simulatedLogs.reduce((total, log) => total + log.latencyMs, 0) / simulatedLogs.length)
    : 0;

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Ledger Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Local Previews</span>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{simulatedCount}</div>
          <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan)" }}>Nothing sent to social platforms</span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Infinite Echoes Blocked</span>
            <ShieldCheck size={18} color="var(--accent-violet)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-violet)" }}>
            {echoBlockedCount}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Saved from duplicate loop crashes</span>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Average Preview Time</span>
            <Zap size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{averageSimulatedLatency}ms</div>
          <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan)" }}>Sampled local simulation time</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, maxWidth: "420px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search activity by text, handle, or fingerprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2.3rem", fontSize: "0.875rem" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", background: "rgba(36, 85, 207, 0.06)", borderRadius: "var(--radius-md)", padding: "0.2rem" }}>
            <button
              onClick={() => setFilterStatus("all")}
              className={`btn btn-sm ${filterStatus === "all" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setFilterStatus("simulated")}
              className={`btn btn-sm ${filterStatus === "simulated" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
            >
              Previews
            </button>
            <button
              onClick={() => setFilterStatus("loop_blocked")}
              className={`btn btn-sm ${filterStatus === "loop_blocked" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
            >
              Echoes Blocked
            </button>
          </div>

          <button onClick={onClearLogs} className="btn btn-ghost btn-sm" style={{ color: "var(--text-muted)" }}>
            Clear Ledger
          </button>
        </div>
      </div>

      {/* Logs Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {filteredLogs.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            No log events match your filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const srcConf = PLATFORM_CONFIGS[log.sourcePlatform] || PLATFORM_CONFIGS.twitter;
            const tgtConf = PLATFORM_CONFIGS[log.targetPlatform] || PLATFORM_CONFIGS.instagram;
            const isBlocked = log.status === "loop_blocked";
            const isSimulated = log.status === "simulated";
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="glass-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  borderLeft: `4px solid ${
                    isBlocked
                      ? "var(--accent-violet)"
                      : isSimulated
                      ? "var(--accent-cyan)"
                      : log.status === "synced"
                      ? "var(--accent-emerald)"
                      : "var(--accent-rose)"
                  }`,
                  cursor: "pointer",
                }}
                onClick={() => toggleExpand(log.id)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {srcConf.shortName} ({log.sourceHandle})
                    </span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {tgtConf.shortName} ({log.targetHandle})
                    </span>

                    {log.mediaType && log.mediaType !== "none" && (
                      <span
                        className="badge"
                        style={{
                          fontSize: "0.68rem",
                          background:
                            log.mediaType === "video"
                              ? "rgba(6, 182, 212, 0.15)"
                              : log.mediaType === "gif"
                              ? "rgba(139, 92, 246, 0.15)"
                              : log.mediaType === "image"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(244, 63, 94, 0.15)",
                          color:
                            log.mediaType === "video"
                              ? "var(--accent-cyan)"
                              : log.mediaType === "gif"
                              ? "var(--accent-violet)"
                              : log.mediaType === "image"
                              ? "var(--accent-emerald)"
                              : "var(--accent-rose)",
                          border: "1px solid currentColor",
                        }}
                      >
                        {log.mediaType.toUpperCase()}
                      </span>
                    )}

                    {log.cardGenerated && (
                      <span className="badge badge-rose" style={{ fontSize: "0.68rem" }}>
                        Auto-Card Synthesized
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={13} />
                      {log.timestamp}
                    </span>

                    <span
                      className={`badge ${
                        isBlocked ? "badge-violet" : isSimulated ? "badge-blue" : "badge-emerald"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {isBlocked ? (
                        <>
                          <ShieldAlert size={12} />
                          <span>ECHO BLOCKED</span>
                        </>
                      ) : isSimulated ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>SIMULATED ({log.latencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} />
                          <span>SYNCED ({log.latencyMs}ms)</span>
                        </>
                      )}
                    </span>

                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                <p style={{ fontSize: "0.925rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
                  &ldquo;{log.content}&rdquo;
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "0.5rem",
                  }}
                >
                  <span>
                    {log.details || `Fingerprint: ${log.fingerprint} verified against ledger`}
                  </span>
                  <span className="font-mono" style={{ opacity: 0.7 }}>
                    {log.fingerprint}
                  </span>
                </div>

                {/* Expanded Inspection Drawer */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "1rem",
                      background: "rgba(239, 244, 255, 0.94)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(36, 85, 207, 0.16)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                      [Ledger Payload Inspection]
                    </div>
                    <div>Source: {log.sourcePlatform} ({log.sourceHandle})</div>
                    <div>Target: {log.targetPlatform} ({log.targetHandle})</div>
                    <div>Content Fingerprint: {log.fingerprint}</div>
                    <div>Latency: {log.latencyMs}ms</div>
                    <div>Status: {log.status}</div>
                    <div style={{ color: isBlocked ? "var(--accent-violet)" : "var(--accent-emerald)" }}>
                      Guard Verification: {isBlocked ? "Duplicate detected in 15min window; suppressed." : "Unique fingerprint; verified."}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

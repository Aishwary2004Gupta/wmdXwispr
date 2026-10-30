"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import SyncMatrix from "@/components/SyncMatrix";
import UniversalComposer from "@/components/UniversalComposer";
import QuoteCardStudio from "@/components/QuoteCardStudio";
import ActivityLedger from "@/components/ActivityLedger";
import SimulateSyncModal from "@/components/SimulateSyncModal";
import VercelDeployGuideModal from "@/components/VercelDeployGuideModal";
import ConnectSocialModal from "@/components/ConnectSocialModal";
import {
  INITIAL_ACCOUNTS,
  INITIAL_LOGS,
  INITIAL_ROUTES,
  PLATFORM_CONFIGS,
} from "@/lib/constants";
import { MediaType, SocialAccount, SocialPlatform, SyncPostLog, SyncRoute } from "@/types/sync";
import {
  checkEchoGuard,
  generateContentFingerprint,
} from "@/lib/loopGuard";
import {
  ArrowRightLeft,
  ShieldCheck,
} from "lucide-react";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPlatform = (value: unknown): value is SocialPlatform =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(PLATFORM_CONFIGS, value);

function readAccounts(value: unknown): SocialAccount[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SocialAccount =>
    isRecord(item) &&
    typeof item.id === "string" &&
    isPlatform(item.platform) &&
    typeof item.name === "string" &&
    typeof item.handle === "string" &&
    typeof item.profileUrl === "string" &&
    typeof item.avatar === "string" &&
    typeof item.followers === "string" &&
    typeof item.recentPostCount === "number" &&
    ["active", "paused", "error"].includes(String(item.status)) &&
    typeof item.isVerifiedOwner === "boolean" &&
    ["oauth", "profile_link", "session", "bio_proof"].includes(String(item.authProvider)) &&
    typeof item.lastVerifiedAt === "string",
  ).map((account) => ({
    ...account,
    // This project has no platform OAuth implementation; old demo credentials were simulated.
    isVerifiedOwner: false,
    authProvider: "profile_link",
    lastVerifiedAt: "Not connected",
    verifiedSessionId: undefined,
    verificationMethod: undefined,
    badge: account.badge === "Verified Owner" ? "Profile link saved" : account.badge,
  }));
}

function readRoutes(value: unknown, accountIds: Set<string>): SyncRoute[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SyncRoute =>
    isRecord(item) &&
    typeof item.id === "string" &&
    typeof item.sourceAccountId === "string" && accountIds.has(item.sourceAccountId) &&
    typeof item.targetAccountId === "string" && accountIds.has(item.targetAccountId) &&
    item.sourceAccountId !== item.targetAccountId &&
    typeof item.isEnabled === "boolean" &&
    typeof item.bidirectional === "boolean" &&
    typeof item.autoGenerateCard === "boolean" &&
    typeof item.splitThreads === "boolean" &&
    typeof item.preserveHashtags === "boolean" &&
    typeof item.syncDelaySeconds === "number" &&
    typeof item.supportMedia === "boolean",
  );
}

function readLogs(value: unknown): SyncPostLog[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SyncPostLog =>
    isRecord(item) &&
    typeof item.id === "string" &&
    typeof item.timestamp === "string" &&
    isPlatform(item.sourcePlatform) &&
    isPlatform(item.targetPlatform) &&
    typeof item.sourceHandle === "string" &&
    typeof item.targetHandle === "string" &&
    typeof item.content === "string" &&
    ["none", "image", "gif", "video", "card"].includes(String(item.mediaType)) &&
    ["simulated", "synced", "loop_blocked", "processing", "failed"].includes(String(item.status)) &&
    typeof item.fingerprint === "string" &&
    typeof item.latencyMs === "number" &&
    typeof item.cardGenerated === "boolean",
  ).map((log) => log.status === "synced"
    ? { ...log, status: "simulated", details: `Imported demo record. ${log.details || "No post was sent."}` }
    : log);
}

export default function Home() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);
  const [routes, setRoutes] = useState<SyncRoute[]>(INITIAL_ROUTES);
  const [logs, setLogs] = useState<SyncPostLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<"matrix" | "composer" | "cardStudio" | "ledger">("matrix");
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectInitialUrl, setConnectInitialUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load state after hydration, validating stored data before using it.
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const savedAccounts = localStorage.getItem("omnisync_accounts");
        const savedRoutes = localStorage.getItem("omnisync_routes");
        const savedLogs = localStorage.getItem("omnisync_logs");

        if (savedAccounts !== null) {
          const parsedAccounts = readAccounts(JSON.parse(savedAccounts));
          setAccounts(parsedAccounts);
          setRoutes(readRoutes(savedRoutes === null ? [] : JSON.parse(savedRoutes), new Set(parsedAccounts.map((account) => account.id))));
        } else if (savedRoutes !== null) {
          setRoutes(readRoutes(JSON.parse(savedRoutes), new Set(INITIAL_ACCOUNTS.map((account) => account.id))));
        }
        if (savedLogs !== null) setLogs(readLogs(JSON.parse(savedLogs)));
      } catch (e) {
        console.warn("Storage sync error:", e);
      } finally {
        setMounted(true);
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("omnisync_accounts", JSON.stringify(accounts));
      localStorage.setItem("omnisync_routes", JSON.stringify(routes));
      localStorage.setItem("omnisync_logs", JSON.stringify(logs));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [accounts, routes, logs, mounted]);

  const handleOpenConnectModal = (url?: string) => {
    setConnectInitialUrl(url || "");
    setIsConnectModalOpen(true);
  };

  // Account handlers
  const handleAddAccount = (accountData: Omit<SocialAccount, "id" | "connectedAt" | "recentPostCount">) => {
    const newAcc: SocialAccount = {
      ...accountData,
      id: `acc_${accountData.platform}_${Date.now()}`,
      connectedAt: "Just now",
      recentPostCount: 0,
    };
    setAccounts((prev) => [newAcc, ...prev]);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setRoutes((prev) => prev.filter((r) => r.sourceAccountId !== id && r.targetAccountId !== id));
  };

  // Route handlers
  const handleAddRoute = (sourceAccountId: string, targetAccountId: string, bidirectional: boolean) => {
    const newRoute: SyncRoute = {
      id: `route_${Date.now()}`,
      sourceAccountId,
      targetAccountId,
      isEnabled: true,
      bidirectional,
      autoGenerateCard: true,
      splitThreads: true,
      preserveHashtags: true,
      syncDelaySeconds: 0,
      supportMedia: true,
    };
    setRoutes((prev) => [newRoute, ...prev]);
  };

  const handleToggleRoute = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleToggleBidirectional = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, bidirectional: !r.bidirectional } : r))
    );
  };

  const handleToggleAutoCard = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, autoGenerateCard: !r.autoGenerateCard } : r))
    );
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  // Broadcast Handler (from Universal Composer)
  const handleBroadcast = (post: {
    content: string;
    mediaType: MediaType;
    mediaUrl?: string;
    targetPlatforms: SocialPlatform[];
    generateCard: boolean;
    categoryTag: string;
    codeSnippet?: string;
  }) => {
    const fingerprint = generateContentFingerprint(post.content, post.mediaUrl);
    const newLogs: SyncPostLog[] = [];

    for (const targetPlatform of post.targetPlatforms) {
      const tgtAccount = accounts.find((a) => a.platform === targetPlatform) || accounts[0];
      const isCard = targetPlatform === "instagram" && post.generateCard;
      const targetPlatformName = tgtAccount?.platformName || PLATFORM_CONFIGS[targetPlatform]?.name || targetPlatform;

      let detailMsg = `Local demo preview for ${targetPlatformName}; no post was sent.`;
      if (post.mediaType === "video") {
        detailMsg = targetPlatform === "instagram"
          ? "Previewed as an Instagram Reel. No video was uploaded."
          : "Previewed as a video post. No video was uploaded.";
      } else if (post.mediaType === "gif") {
        detailMsg = targetPlatform === "instagram"
          ? "Previewed as a looped Reel. No media was uploaded."
          : "Previewed with animated GIF media. No media was uploaded.";
      } else if (post.mediaType === "image") {
        detailMsg = "Previewed with an image attachment. No media was uploaded.";
      } else if (isCard) {
        detailMsg = `Previewed an auto-generated 1080x1080 ${post.categoryTag} card. Nothing was published.`;
      }

      newLogs.push({
        id: `log_${Date.now()}_${targetPlatform}`,
        timestamp: "Just now",
        sourcePlatform: "twitter", // Origin
        targetPlatform,
        sourceHandle: accounts[0]?.handle || "@alex_creativetech",
        targetHandle: tgtAccount?.handle || `@${targetPlatform}_user`,
        content: post.content,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        status: "simulated",
        fingerprint,
        latencyMs: Math.floor(Math.random() * 300) + 180,
        cardGenerated: isCard,
        details: detailMsg,
      });
    }

    setLogs((prev) => [...newLogs, ...prev]);
  };

  // Simulate Incoming Post Handler (testing incoming mobile post)
  const handleExecuteSimulation = (params: {
    sourcePlatform: SocialPlatform;
    content: string;
    mediaType: MediaType;
    mediaUrl?: string;
    isEchoTest: boolean;
  }, routeFilterId?: string) => {
    const fingerprint = generateContentFingerprint(params.content, params.mediaUrl);
    const srcAccount = accounts.find((a) => a.platform === params.sourcePlatform) || accounts[0];

    // Find active routes originating from this platform or bidirectional routes
    const matchingRoutes = routes.filter((r) => {
      if (routeFilterId && r.id !== routeFilterId) return false;
      if (!r.isEnabled) return false;
      const sAcc = accounts.find((a) => a.id === r.sourceAccountId);
      const tAcc = accounts.find((a) => a.id === r.targetAccountId);
      if (!sAcc || !tAcc) return false;

      const direct = sAcc.platform === params.sourcePlatform;
      const reverse = r.bidirectional && tAcc.platform === params.sourcePlatform;
      return direct || reverse;
    });

    // Check if this post is an echo of an automated sync
    const echoCheck = checkEchoGuard(
      fingerprint,
      params.sourcePlatform,
      logs.map((l) => ({
        fingerprint: l.fingerprint,
        sourcePlatform: l.sourcePlatform,
        targetPlatform: l.targetPlatform,
        timestamp: Date.now() - 60000,
      }))
    );

    const isEchoBlocked = params.isEchoTest || echoCheck.isEcho;

    if (isEchoBlocked) {
      const blockedLog: SyncPostLog = {
        id: `log_${Date.now()}_echo`,
        timestamp: "Just now",
        sourcePlatform: params.sourcePlatform,
        targetPlatform: params.sourcePlatform === "instagram" ? "twitter" : "instagram",
        sourceHandle: srcAccount?.handle || "@user",
        targetHandle: accounts[0]?.handle || "@alex_creativetech",
        content: params.content,
        mediaType: params.mediaType,
        mediaUrl: params.mediaUrl,
        status: "loop_blocked",
        fingerprint,
        latencyMs: 14,
        cardGenerated: false,
        details: `Echo Guard Intervention: Content & ${params.mediaType.toUpperCase()} fingerprint matched recent outbound sync. Duplicate post dropped to prevent infinite recursion loop.`,
      };
      setLogs((prev) => [blockedLog, ...prev]);
      return {
        isEchoBlocked: true,
        syncedTargets: [],
        fingerprint,
      };
    }

    // Process valid sync
    const syncedTargets: string[] = [];
    const newLogs: SyncPostLog[] = [];

    matchingRoutes.forEach((route) => {
      const sAcc = accounts.find((a) => a.id === route.sourceAccountId)!;
      const tAcc = accounts.find((a) => a.id === route.targetAccountId)!;
      const targetAcc = sAcc.platform === params.sourcePlatform ? tAcc : sAcc;

      const targetPlatformName = targetAcc.platformName || PLATFORM_CONFIGS[targetAcc.platform]?.name || targetAcc.platform;
      syncedTargets.push(targetPlatformName);

      const isCard = targetAcc.platform === "instagram" && params.mediaType === "card" && route.autoGenerateCard;

      let syncDetail = `Local demo preview for ${targetPlatformName}; no post was sent.`;
      if (params.mediaType === "video") {
        syncDetail = targetAcc.platform === "instagram"
          ? "Incoming video previewed as an Instagram Reel. No video was uploaded."
          : "Incoming video previewed. No video was uploaded.";
      } else if (params.mediaType === "gif") {
        syncDetail = targetAcc.platform === "instagram"
          ? "Animated GIF previewed as a Reel. No media was uploaded."
          : "Animated GIF previewed. No media was uploaded.";
      } else if (isCard) {
        syncDetail = "Text post previewed as a Tech & Design graphic card. Nothing was published.";
      }

      newLogs.push({
        id: `log_${Date.now()}_${targetAcc.platform}`,
        timestamp: "Just now",
        sourcePlatform: params.sourcePlatform,
        targetPlatform: targetAcc.platform,
        sourceHandle: srcAccount?.handle || "@user",
        targetHandle: targetAcc.handle,
        content: params.content,
        mediaType: params.mediaType,
        mediaUrl: params.mediaUrl,
        status: "simulated",
        fingerprint,
        latencyMs: Math.floor(Math.random() * 450) + 200,
        cardGenerated: isCard,
        details: syncDetail,
      });
    });

    if (newLogs.length > 0) {
      setLogs((prev) => [...newLogs, ...prev]);
    }

    return {
      isEchoBlocked: false,
      syncedTargets,
      fingerprint,
    };
  };

  const handleQuickSimulateRoute = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;
    const sAcc = accounts.find((a) => a.id === route.sourceAccountId);
    if (!sAcc) return;
    handleExecuteSimulation({
      sourcePlatform: sAcc.platform,
      content: "Quick sync test: OmniSync multi-way active bridge firing live.",
      mediaType: "card",
      isEchoTest: false,
    }, routeId);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const loopBlockedCount = logs.filter((l) => l.status === "loop_blocked").length;

  return (
    <main className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulate={() => setIsSimulateOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        accountCount={accounts.length}
        routeCount={routes.length}
        loopBlockedCount={loopBlockedCount}
        onOpenConnectModal={() => handleOpenConnectModal("")}
      />

      {/* Tab Panels */}
      {activeTab === "matrix" && (
        <SyncMatrix
          accounts={accounts}
          routes={routes}
          onDeleteAccount={handleDeleteAccount}
          onAddRoute={handleAddRoute}
          onToggleRoute={handleToggleRoute}
          onToggleBidirectional={handleToggleBidirectional}
          onToggleAutoCard={handleToggleAutoCard}
          onDeleteRoute={handleDeleteRoute}
          onQuickSimulateRoute={handleQuickSimulateRoute}
          onOpenConnectModal={handleOpenConnectModal}
        />
      )}

      {activeTab === "composer" && (
        <UniversalComposer
          accounts={accounts}
          onBroadcast={handleBroadcast}
        />
      )}

      {activeTab === "cardStudio" && (
        <QuoteCardStudio
          account={accounts.find((a) => a.platform === "twitter") || accounts[0]}
        />
      )}

      {activeTab === "ledger" && (
        <ActivityLedger
          logs={logs}
          onClearLogs={handleClearLogs}
        />
      )}

      {/* Single Root Connect Social Modal */}
      {isConnectModalOpen && (
        <ConnectSocialModal
          isOpen
          onClose={() => setIsConnectModalOpen(false)}
          onAddAccount={handleAddAccount}
          existingAccounts={accounts}
          initialUrl={connectInitialUrl}
        />
      )}

      <SimulateSyncModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        accounts={accounts}
        routes={routes}
        onExecuteSimulation={handleExecuteSimulation}
      />

      <VercelDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          paddingTop: "3rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowRightLeft size={12} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>OmniSync Platform</span>
          <span>• Built for Vercel Serverless & Meta Graph API</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <button
            onClick={() => setIsDeployGuideOpen(true)}
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--accent-cyan)", padding: 0 }}
          >
            Deploy on Vercel Free
          </button>
          <span>•</span>
          <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <ShieldCheck size={14} /> Infinite Loop Guard Active
          </span>
        </div>
      </footer>
    </main>
  );
}

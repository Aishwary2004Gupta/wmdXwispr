import { SocialPlatform } from "@/types/sync";

export interface LedgerEntry {
  fingerprint: string;
  sourcePlatform: SocialPlatform;
  targetPlatform: SocialPlatform;
  timestamp: number;
}

// In-memory ledger for active session (also backed by localStorage in client)
const activeLedger: LedgerEntry[] = [
  {
    fingerprint: "hash_4f89b1",
    sourcePlatform: "twitter",
    targetPlatform: "instagram",
    timestamp: Date.now() - 12 * 60 * 1000,
  },
];

/**
 * Creates a deterministic content hash/fingerprint from text and optional media
 */
export function generateContentFingerprint(text: string, mediaUrl?: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  let hash = 0;
  const combined = `${normalized}:${mediaUrl || "none"}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Evaluates whether an incoming post is an echo of an automated outbound post
 */
export function checkEchoGuard(
  fingerprint: string,
  incomingPlatform: SocialPlatform,
  ledger: LedgerEntry[] = activeLedger,
  windowMs: number = 15 * 60 * 1000 // 15-minute protection window
): { isEcho: boolean; reason?: string } {
  const now = Date.now();

  const match = ledger.find((entry) => {
    const isRecent = now - entry.timestamp < windowMs;
    // An echo occurs if incomingPlatform was the target of a recent sync
    const isTargetEcho = entry.targetPlatform === incomingPlatform && entry.fingerprint === fingerprint;
    // Or if the content fingerprint already exists on the same platform
    const isDuplicate = entry.sourcePlatform === incomingPlatform && entry.fingerprint === fingerprint;
    return isRecent && (isTargetEcho || isDuplicate);
  });

  if (match) {
    return {
      isEcho: true,
      reason: `Echo Guard Blocked: This post matches an automated sync to ${match.targetPlatform} sent ${Math.round(
        (now - match.timestamp) / 1000
      )}s ago. Infinite loop prevented!`,
    };
  }

  return { isEcho: false };
}

/**
 * Formats and validates text according to platform character limits and conventions
 */
export function adaptContentForPlatform(
  text: string,
  targetPlatform: SocialPlatform,
  options: {
    splitThreads?: boolean;
    preserveHashtags?: boolean;
  } = {}
): {
  adaptedText: string;
  isThreaded: boolean;
  threads?: string[];
  needsMediaCard: boolean;
} {
  // Instagram requires media
  const needsMediaCard = targetPlatform === "instagram";

  if (targetPlatform === "twitter") {
    const limit = 280;
    if (text.length > limit) {
      if (options.splitThreads) {
        // Split into chunks of ~260 chars with [1/n] pagination
        const words = text.split(" ");
        const chunks: string[] = [];
        let currentChunk = "";

        for (const word of words) {
          if ((currentChunk + " " + word).trim().length > 250) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk = (currentChunk + " " + word).trim();
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        const threads = chunks.map((chunk, idx) => `${chunk} (${idx + 1}/${chunks.length})`);
        return {
          adaptedText: threads[0],
          isThreaded: true,
          threads,
          needsMediaCard,
        };
      } else {
        return {
          adaptedText: text.slice(0, 277) + "...",
          isThreaded: false,
          needsMediaCard,
        };
      }
    }
  }

  return {
    adaptedText: text,
    isThreaded: false,
    needsMediaCard,
  };
}

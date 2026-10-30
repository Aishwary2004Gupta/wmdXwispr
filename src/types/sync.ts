export type SocialPlatform =
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'bluesky'
  | 'threads'
  | 'youtube'
  | 'tiktok'
  | 'github'
  | 'other';

export type MediaType = 'none' | 'image' | 'gif' | 'video' | 'card';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  platformName?: string;
  name: string;
  handle: string;
  avatar: string;
  profileUrl: string;
  connectedAt: string;
  status: 'active' | 'paused' | 'error';
  followers: string;
  recentPostCount: number;
  badge?: string;
  bio?: string;
  isVerifiedOwner: boolean;
  authProvider: 'oauth' | 'profile_link' | 'session' | 'bio_proof';
  lastVerifiedAt: string;
  verifiedSessionId?: string;
  verificationMethod?: 'oauth_login' | 'browser_session' | 'bio_proof';
  proofToken?: string;
}

export interface SyncRoute {
  id: string;
  sourceAccountId: string;
  targetAccountId: string;
  isEnabled: boolean;
  bidirectional: boolean;
  autoGenerateCard: boolean; // Turn text into visual card for media-only platforms (Instagram)
  splitThreads: boolean; // Split long text into thread for Twitter/X
  preserveHashtags: boolean;
  syncDelaySeconds: number;
  supportMedia: boolean; // Synchronize images, gifs, and video files
}

export interface SyncPostLog {
  id: string;
  timestamp: string;
  sourcePlatform: SocialPlatform;
  targetPlatform: SocialPlatform;
  sourceHandle: string;
  targetHandle: string;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  status: 'simulated' | 'synced' | 'loop_blocked' | 'processing' | 'failed';
  fingerprint: string;
  latencyMs: number;
  cardGenerated: boolean;
  details?: string;
}

export interface QuoteCardSettings {
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  categoryTag: string; // e.g. "Tech Architecture" or "Design System"
  themeId: string;
  showCodeSnippet: boolean;
  codeSnippet?: string;
}

export interface CardTheme {
  id: string;
  name: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  badgeBg: string;
  category: 'tech' | 'design' | 'minimal' | 'cyberpunk' | 'editorial';
}

export interface MediaAttachment {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  name: string;
  sizeMb?: number;
  durationSec?: number;
}

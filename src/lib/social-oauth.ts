import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SocialPlatform } from "@/types/sync";

export type OAuthPlatform = Exclude<SocialPlatform, "other" | "bluesky">;
export type VerificationOutcome = "matched" | "mismatch" | "identity_only";

export interface OAuthAttempt {
  state: string;
  accountId: string;
  platform: OAuthPlatform;
  expectedHandle: string;
  profileUrl: string;
  verifier?: string;
  expiresAt: number;
}

export interface VerifiedAccount {
  accountId: string;
  platform: OAuthPlatform;
  providerSubject: string;
  providerUsername?: string;
  providerName?: string;
  expectedHandle: string;
  outcome: VerificationOutcome;
  checkedAt: string;
  expiresAt: number;
}

interface OAuthProvider {
  clientIdEnv: string;
  clientSecretEnv: string;
  clientIdParam: "client_id" | "client_key";
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  usePkce: boolean;
  authorizeParams?: Record<string, string>;
}

const providers: Record<OAuthPlatform, OAuthProvider> = {
  twitter: {
    clientIdEnv: "X_CLIENT_ID", clientSecretEnv: "X_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://twitter.com/i/oauth2/authorize", tokenUrl: "https://api.x.com/2/oauth2/token",
    scopes: ["users.read"], usePkce: true,
  },
  instagram: {
    clientIdEnv: "INSTAGRAM_CLIENT_ID", clientSecretEnv: "INSTAGRAM_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://www.instagram.com/oauth/authorize", tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["instagram_business_basic"], usePkce: false,
  },
  linkedin: {
    clientIdEnv: "LINKEDIN_CLIENT_ID", clientSecretEnv: "LINKEDIN_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization", tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile"], usePkce: false,
  },
  threads: {
    clientIdEnv: "THREADS_CLIENT_ID", clientSecretEnv: "THREADS_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://threads.net/oauth/authorize", tokenUrl: "https://graph.threads.net/oauth/access_token",
    scopes: ["threads_basic"], usePkce: false,
  },
  youtube: {
    clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"], usePkce: true,
    authorizeParams: { access_type: "online", prompt: "select_account consent" },
  },
  tiktok: {
    clientIdEnv: "TIKTOK_CLIENT_KEY", clientSecretEnv: "TIKTOK_CLIENT_SECRET", clientIdParam: "client_key",
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/", tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "user.info.profile"], usePkce: true,
    authorizeParams: { disable_auto_auth: "1" },
  },
  github: {
    clientIdEnv: "GITHUB_CLIENT_ID", clientSecretEnv: "GITHUB_CLIENT_SECRET", clientIdParam: "client_id",
    authorizeUrl: "https://github.com/login/oauth/authorize", tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["read:user"], usePkce: false,
  },
};

const allowedHosts: Record<OAuthPlatform, string[]> = {
  twitter: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  threads: ["threads.net", "www.threads.net"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  github: ["github.com", "www.github.com"],
};

const randomId = (length = 32) => randomBytes(length).toString("base64url");
const base64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");

export function getProvider(platform: OAuthPlatform): OAuthProvider {
  return providers[platform];
}

export function getProviderCredentialVariableNames(platform: OAuthPlatform) {
  const provider = getProvider(platform);
  return [provider.clientIdEnv, provider.clientSecretEnv] as const;
}

export function getProviderCredentials(platform: OAuthPlatform) {
  const provider = getProvider(platform);
  const clientId = process.env[provider.clientIdEnv]?.trim();
  const clientSecret = process.env[provider.clientSecretEnv]?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function getAuthBaseUrl() {
  const value = process.env.OMNISYNC_AUTH_BASE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAuthSecret() {
  const secret = process.env.OMNISYNC_AUTH_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function callbackUrl(baseUrl: string, platform: OAuthPlatform) {
  return new URL(`/api/auth/${platform}/callback`, baseUrl).toString();
}

export function isOAuthPlatform(platform: string): platform is OAuthPlatform {
  return Object.prototype.hasOwnProperty.call(providers, platform);
}

export function validateProfile(platform: OAuthPlatform, profileUrl: string) {
  try {
    const url = new URL(profileUrl);
    if (url.protocol !== "https:" || !allowedHosts[platform].includes(url.hostname.toLowerCase())) return null;
    if (url.username || url.password) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    if (["twitter", "instagram", "threads", "tiktok", "github"].includes(platform) && parts.length !== 1) return null;
    if (platform === "linkedin" && (parts.length !== 2 || parts[0].toLowerCase() !== "in")) return null;
    if (platform === "youtube" && !(
      (parts.length === 1 && parts[0].startsWith("@")) ||
      (parts.length === 2 && ["channel", "c", "user"].includes(parts[0].toLowerCase()))
    )) return null;
    if (platform === "github" && ["settings", "login", "join", "features", "orgs", "topics"].includes(parts[0].toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

export function expectedHandleFromUrl(profileUrl: URL, platform: OAuthPlatform) {
  const path = profileUrl.pathname.split("/").filter(Boolean);
  if (platform === "linkedin" && path[0]?.toLowerCase() === "in") return path[1] || "";
  if (platform === "youtube" && path[0]?.toLowerCase() === "channel") return path[1] || "";
  if (platform === "youtube" && path[0]?.toLowerCase() === "c") return path[1] || "";
  if (platform === "youtube" && path[0]?.toLowerCase() === "user") return path[1] || "";
  return (path[0] || "").replace(/^@/, "");
}

export function buildAuthorizationUrl(input: {
  platform: OAuthPlatform;
  clientId: string;
  redirectUri: string;
  state: string;
  verifier?: string;
}) {
  const provider = getProvider(input.platform);
  const url = new URL(provider.authorizeUrl);
  url.searchParams.set(provider.clientIdParam, input.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", provider.scopes.join(" "));
  url.searchParams.set("state", input.state);
  if (provider.usePkce && input.verifier) {
    url.searchParams.set("code_challenge", createHash("sha256").update(input.verifier).digest("base64url"));
    url.searchParams.set("code_challenge_method", "S256");
  }
  for (const [key, value] of Object.entries(provider.authorizeParams || {})) url.searchParams.set(key, value);
  return url.toString();
}

export function createOAuthAttempt(input: Omit<OAuthAttempt, "state" | "expiresAt">) {
  const provider = getProvider(input.platform);
  return {
    ...input,
    state: randomId(32),
    ...(provider.usePkce ? { verifier: randomId(48) } : {}),
    expiresAt: Date.now() + 10 * 60 * 1000,
  } satisfies OAuthAttempt;
}

export function signPayload<T extends object>(payload: T) {
  const secret = getAuthSecret();
  if (!secret) throw new Error("OMNISYNC_AUTH_SECRET must contain at least 32 characters.");
  const encoded = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function readSignedPayload<T>(value: string | undefined): T | null {
  if (!value) return null;
  const secret = getAuthSecret();
  if (!secret) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, "base64url"); } catch { return null; }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T & { expiresAt?: number };
    if (typeof parsed.expiresAt === "number" && parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function oauthStateCookieName(platform: OAuthPlatform) {
  return `omnisync_oauth_state_${platform}`;
}

export function accountVerificationCookieName(accountId: string) {
  return `omnisync_verified_${accountId}`;
}

async function readJson(response: Response) {
  if (!response.ok) throw new Error("The social network could not complete sign-in. Check its developer app and try again.");
  return response.json() as Promise<Record<string, unknown>>;
}

async function exchangeToken(platform: OAuthPlatform, code: string, redirectUri: string, verifier: string | undefined, credentials: { clientId: string; clientSecret: string }) {
  const provider = getProvider(platform);
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  if (provider.clientIdParam === "client_key") form.set("client_key", credentials.clientId);
  else form.set("client_id", credentials.clientId);
  form.set("client_secret", credentials.clientSecret);
  if (verifier) form.set("code_verifier", verifier);
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded", accept: "application/json" };
  if (platform === "twitter") {
    const basic = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
    headers.authorization = `Basic ${basic}`;
    form.delete("client_id");
    form.delete("client_secret");
  }
  if (platform === "github") headers.accept = "application/json";
  const response = await fetch(provider.tokenUrl, { method: "POST", headers, body: form, cache: "no-store" });
  const data = await readJson(response);
  const token = typeof data.access_token === "string" ? data.access_token : "";
  if (!token) throw new Error("The social network returned no access token.");
  return token;
}

async function fetchIdentity(platform: OAuthPlatform, token: string) {
  const bearer = { authorization: `Bearer ${token}` };
  let data: Record<string, unknown>;
  if (platform === "twitter") {
    const response = await fetch("https://api.x.com/2/users/me?user.fields=profile_image_url", { headers: bearer, cache: "no-store" });
    const payload = await readJson(response);
    data = (payload.data && typeof payload.data === "object" ? payload.data : {}) as Record<string, unknown>;
    return { subject: data.id, username: data.username, name: data.name };
  }
  if (platform === "instagram") {
    const url = new URL("https://graph.instagram.com/me");
    url.searchParams.set("fields", "user_id,username");
    const payload = await readJson(await fetch(url, { headers: bearer, cache: "no-store" }));
    return { subject: payload.user_id || payload.id, username: payload.username, name: payload.username };
  }
  if (platform === "threads") {
    const url = new URL("https://graph.threads.net/v1.0/me");
    url.searchParams.set("fields", "id,username");
    const payload = await readJson(await fetch(url, { headers: bearer, cache: "no-store" }));
    return { subject: payload.id, username: payload.username, name: payload.username };
  }
  if (platform === "linkedin") {
    const payload = await readJson(await fetch("https://api.linkedin.com/v2/userinfo", { headers: bearer, cache: "no-store" }));
    return { subject: payload.sub, username: undefined, name: payload.name };
  }
  if (platform === "youtube") {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "id,snippet");
    url.searchParams.set("mine", "true");
    const payload = await readJson(await fetch(url, { headers: bearer, cache: "no-store" }));
    const channel = Array.isArray(payload.items) ? payload.items[0] as Record<string, unknown> | undefined : undefined;
    if (!channel) throw new Error("No YouTube channel was returned by this Google account.");
    const snippet = channel.snippet && typeof channel.snippet === "object" ? channel.snippet as Record<string, unknown> : {};
    return { subject: channel.id, username: snippet.customUrl, name: snippet.title };
  }
  if (platform === "tiktok") {
    const url = new URL("https://open.tiktokapis.com/v2/user/info/");
    url.searchParams.set("fields", "open_id,username,display_name,avatar_url");
    const payload = await readJson(await fetch(url, { headers: { ...bearer, "content-type": "application/json" }, cache: "no-store" }));
    const body = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : {};
    data = body.user && typeof body.user === "object" ? body.user as Record<string, unknown> : {};
    return { subject: data.open_id, username: data.username, name: data.display_name };
  }
  const payload = await readJson(await fetch("https://api.github.com/user", {
    headers: { ...bearer, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" }, cache: "no-store",
  }));
  return { subject: payload.id, username: payload.login, name: payload.name || payload.login };
}

export async function completeOAuth(platform: OAuthPlatform, code: string, attempt: OAuthAttempt, redirectUri: string, credentials: { clientId: string; clientSecret: string }): Promise<VerifiedAccount> {
  const token = await exchangeToken(platform, code, redirectUri, attempt.verifier, credentials);
  const identity = await fetchIdentity(platform, token);
  const subject = typeof identity.subject === "string" || typeof identity.subject === "number" ? String(identity.subject) : "";
  const username = typeof identity.username === "string" ? identity.username.replace(/^@/, "") : undefined;
  const name = typeof identity.name === "string" ? identity.name : undefined;
  if (!subject) throw new Error("The social network did not return an account identifier.");

  let outcome: VerificationOutcome;
  if (platform === "linkedin") {
    outcome = "identity_only";
  } else if (platform === "youtube" && new URL(attempt.profileUrl).pathname.split("/").filter(Boolean)[0]?.toLowerCase() === "channel") {
    outcome = username && username.replace(/^@/, "").toLowerCase() === attempt.expectedHandle.toLowerCase()
      ? "matched"
      : subject.toLowerCase() === attempt.expectedHandle.toLowerCase() ? "matched" : "mismatch";
  } else if (!username) {
    outcome = "identity_only";
  } else {
    const normalize = (value: string) => value.trim().replace(/^@/, "").replace(/\/$/, "").toLowerCase();
    outcome = normalize(username) === normalize(attempt.expectedHandle) ? "matched" : "mismatch";
  }
  return {
    accountId: attempt.accountId,
    platform,
    providerSubject: subject,
    ...(username ? { providerUsername: username } : {}),
    ...(name ? { providerName: name } : {}),
    expectedHandle: attempt.expectedHandle,
    outcome,
    checkedAt: new Date().toISOString(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  };
}

export function callbackResultUrl(baseUrl: string, result: "matched" | "mismatch" | "identity_only" | "error", platform: OAuthPlatform) {
  const url = new URL("/", baseUrl);
  url.searchParams.set("social_auth", result);
  url.searchParams.set("platform", platform);
  return url;
}

export function isSupportedProfileHost(platform: OAuthPlatform, hostname: string) {
  return allowedHosts[platform].includes(hostname.toLowerCase());
}

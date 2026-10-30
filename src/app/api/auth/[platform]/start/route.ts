import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  callbackUrl,
  createOAuthAttempt,
  expectedHandleFromUrl,
  getAuthBaseUrl,
  getAuthSecret,
  getProviderCredentialVariableNames,
  getProviderCredentials,
  isOAuthPlatform,
  oauthStateCookieName,
  signPayload,
  validateProfile,
} from "@/lib/social-oauth";

export const runtime = "nodejs";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform: rawPlatform } = await context.params;
  if (!isOAuthPlatform(rawPlatform)) {
    const explanation = rawPlatform === "bluesky"
      ? "Bluesky uses AT Protocol OAuth, which needs a separate client metadata and DPoP setup that this project does not implement yet."
      : "This profile type does not support a generic OAuth sign-in. Choose one of the listed platforms with a registered developer app.";
    return NextResponse.json({ error: explanation }, { status: 501 });
  }

  const credentials = getProviderCredentials(rawPlatform);
  const baseUrl = getAuthBaseUrl();
  const requiredProviderVariables = getProviderCredentialVariableNames(rawPlatform);
  const missing: string[] = requiredProviderVariables.filter((name) => !process.env[name]?.trim());
  if (!getAuthSecret()) missing.push("OMNISYNC_AUTH_SECRET (at least 32 characters)");
  if (!baseUrl) missing.push("OMNISYNC_AUTH_BASE_URL (valid site origin)");
  if (missing.length || !credentials || !baseUrl) {
    return NextResponse.json({
      error: `Official sign-in for ${rawPlatform} is not configured on this server.`,
      missing,
      ...(baseUrl ? { callbackUrl: callbackUrl(baseUrl, rawPlatform) } : {}),
    }, { status: 503 });
  }

  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "The sign-in request was invalid." }, { status: 400 });
  }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "The sign-in request was invalid." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const accountId = typeof body.accountId === "string" ? body.accountId : "";
  const profileUrlValue = typeof body.profileUrl === "string" ? body.profileUrl : "";
  if (!/^acc_[a-z0-9_-]{1,100}$/i.test(accountId)) {
    return NextResponse.json({ error: "The saved profile identifier is invalid. Remove and add the profile again." }, { status: 400 });
  }
  if (profileUrlValue.length > 2048) return NextResponse.json({ error: "The profile link is too long." }, { status: 400 });
  const profileUrl = validateProfile(rawPlatform, profileUrlValue);
  if (!profileUrl) {
    return NextResponse.json({ error: "The saved profile link does not match this social network. Edit the link before signing in." }, { status: 400 });
  }
  const expectedHandle = expectedHandleFromUrl(profileUrl, rawPlatform);
  if (!expectedHandle) return NextResponse.json({ error: "Could not read an account name from this profile link." }, { status: 400 });

  const attempt = createOAuthAttempt({
    accountId,
    platform: rawPlatform,
    expectedHandle,
    profileUrl: profileUrl.toString(),
  });
  const redirectUri = callbackUrl(baseUrl, rawPlatform);
  const authorizationUrl = buildAuthorizationUrl({
    platform: rawPlatform,
    clientId: credentials.clientId,
    redirectUri,
    state: attempt.state,
    verifier: attempt.verifier,
  });
  const response = NextResponse.json({ authorizationUrl }, { headers: { "cache-control": "no-store" } });
  response.cookies.set(oauthStateCookieName(rawPlatform), signPayload(attempt), {
    ...cookieOptions,
    path: `/api/auth/${rawPlatform}/callback`,
    maxAge: 10 * 60,
  });
  return response;
}

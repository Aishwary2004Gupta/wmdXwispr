import { NextRequest, NextResponse } from "next/server";
import {
  accountVerificationCookieName,
  callbackResultUrl,
  callbackUrl,
  completeOAuth,
  getAuthBaseUrl,
  getProviderCredentials,
  isOAuthPlatform,
  oauthStateCookieName,
  readSignedPayload,
  signPayload,
  type OAuthAttempt,
} from "@/lib/social-oauth";

export const runtime = "nodejs";

const stateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform: rawPlatform } = await context.params;
  if (!isOAuthPlatform(rawPlatform)) return NextResponse.json({ error: "Unsupported sign-in platform." }, { status: 404 });

  const baseUrl = getAuthBaseUrl();
  const result = (outcome: "matched" | "mismatch" | "identity_only" | "error") => {
    const response = NextResponse.redirect(callbackResultUrl(baseUrl || request.nextUrl.origin, outcome, rawPlatform));
    response.cookies.set(oauthStateCookieName(rawPlatform), "", { ...stateCookieOptions, path: `/api/auth/${rawPlatform}/callback`, maxAge: 0 });
    response.headers.set("cache-control", "no-store");
    return response;
  };
  if (!baseUrl) {
    const response = NextResponse.json({ error: "Social sign-in is not configured for this deployment." }, { status: 503 });
    response.cookies.set(oauthStateCookieName(rawPlatform), "", { ...stateCookieOptions, path: `/api/auth/${rawPlatform}/callback`, maxAge: 0 });
    return response;
  }

  const attempt = readSignedPayload<OAuthAttempt>(request.cookies.get(oauthStateCookieName(rawPlatform))?.value);
  const returnedState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError || !attempt || attempt.platform !== rawPlatform || !returnedState || returnedState !== attempt.state || !code || code.length > 4096) {
    return result("error");
  }

  const credentials = getProviderCredentials(rawPlatform);
  if (!credentials) return result("error");
  try {
    const verified = await completeOAuth(rawPlatform, code, attempt, callbackUrl(baseUrl, rawPlatform), credentials);
    const response = result(verified.outcome);
    response.cookies.set(accountVerificationCookieName(verified.accountId), signPayload(verified), {
      ...stateCookieOptions,
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch {
    return result("error");
  }
}

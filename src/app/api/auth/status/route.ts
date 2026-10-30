import { NextRequest, NextResponse } from "next/server";
import {
  accountVerificationCookieName,
  readSignedPayload,
  type VerifiedAccount,
} from "@/lib/social-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const verified = request.cookies.getAll()
    .filter((cookie) => cookie.name.startsWith("omnisync_verified_acc_"))
    .map((cookie) => readSignedPayload<VerifiedAccount>(cookie.value))
    .filter((item): item is VerifiedAccount => Boolean(item && item.accountId && item.platform && item.outcome));
  return NextResponse.json({ verified: verified.map((item) => ({
    accountId: item.accountId,
    platform: item.platform,
    providerUsername: item.providerUsername,
    providerName: item.providerName,
    expectedHandle: item.expectedHandle,
    outcome: item.outcome,
    checkedAt: item.checkedAt,
  })) }, { headers: { "cache-control": "no-store" } });
}

export async function DELETE(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("accountId") || "";
  if (!/^acc_[a-z0-9_-]{1,100}$/i.test(accountId)) return NextResponse.json({ error: "Invalid account." }, { status: 400 });
  const response = NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
  response.cookies.set(accountVerificationCookieName(accountId), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

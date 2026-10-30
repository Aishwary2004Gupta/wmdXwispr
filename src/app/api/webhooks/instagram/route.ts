import { NextRequest, NextResponse } from "next/server";

// Meta Webhook Verification Handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!VERIFY_TOKEN) {
    return NextResponse.json({ error: "Instagram webhook is not configured." }, { status: 503 });
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden: verification token mismatch" }, { status: 403 });
}

// Ingest Instagram Media Published Webhook Event
export async function POST() {
  return NextResponse.json(
    { error: "Instagram webhook processing is not configured." },
    { status: 501 },
  );
}

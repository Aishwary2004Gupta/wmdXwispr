import { NextRequest, NextResponse } from "next/server";

// Vercel Cron worker triggered every 10 minutes (or via QStash)
export async function GET(req: NextRequest) {
  // Validate authorization header for Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Sync polling is not configured." }, { status: 503 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  return NextResponse.json({ error: "Sync polling is not implemented." }, { status: 501 });
}

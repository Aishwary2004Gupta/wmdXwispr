import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Publishing is not configured.",
      message: "Connect an official platform OAuth integration before enabling social publishing.",
    },
    { status: 501 },
  );
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@recruiting/db";
import { eq } from "drizzle-orm";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"].join(" ");

export async function GET() {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return NextResponse.redirect(url.toString());
}

export async function DELETE() {
  const [row] = await db.select().from(settings).limit(1);
  if (row) {
    await db
      .update(settings)
      .set({ googleConnected: false, googleRefreshToken: null })
      .where(eq(settings.id, row.id));
  }
  return NextResponse.json({ data: { disconnected: true }, error: null });
}

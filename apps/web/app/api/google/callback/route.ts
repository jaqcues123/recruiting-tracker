import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@recruiting/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.refresh_token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_refresh_token`);
  }

  const [existing] = await db.select().from(settings).limit(1);
  if (existing) {
    await db
      .update(settings)
      .set({ googleConnected: true, googleRefreshToken: tokenData.refresh_token })
      .where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({
      googleConnected: true,
      googleRefreshToken: tokenData.refresh_token,
    });
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=true`);
}

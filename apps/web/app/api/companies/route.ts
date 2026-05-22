import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

const createSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(companies).where(eq(companies.userId, userId)).orderBy(companies.name);
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const [company] = await db.insert(companies).values({ ...parsed.data, userId }).returning();
  return NextResponse.json({ data: company, error: null }, { status: 201 });
}

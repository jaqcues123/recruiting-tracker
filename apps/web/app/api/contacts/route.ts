import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

const createSchema = z.object({
  companyId: z.number().int().optional(),
  roleId: z.number().int().optional(),
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedinUrl: z.string().optional(),
  relationshipStrength: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  lastContacted: z.string().datetime().nullish(),
  nextFollowup: z.string().datetime().nullish(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(contacts.nextFollowup);
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
  const { lastContacted, nextFollowup, ...rest } = parsed.data;
  const [contact] = await db
    .insert(contacts)
    .values({
      ...rest,
      userId,
      lastContacted: lastContacted ? new Date(lastContacted) : null,
      nextFollowup: nextFollowup ? new Date(nextFollowup) : null,
    })
    .returning();
  return NextResponse.json({ data: contact, error: null }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@recruiting/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  linkedinUrl: z.string().optional(),
  relationshipStrength: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  lastContacted: z.string().datetime().nullish(),
  nextFollowup: z.string().datetime().nullish(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { lastContacted, nextFollowup, ...rest } = parsed.data;
  const [updated] = await db
    .update(contacts)
    .set({
      ...rest,
      ...(lastContacted !== undefined ? { lastContacted: lastContacted ? new Date(lastContacted) : null } : {}),
      ...(nextFollowup !== undefined ? { nextFollowup: nextFollowup ? new Date(nextFollowup) : null } : {}),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .returning();
  if (!updated) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
  return NextResponse.json({ data: { id }, error: null });
}

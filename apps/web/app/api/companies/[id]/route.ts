import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@recruiting/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
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
  const [updated] = await db
    .update(companies)
    .set(parsed.data)
    .where(and(eq(companies.id, id), eq(companies.userId, userId)))
    .returning();
  if (!updated) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(companies).where(and(eq(companies.id, id), eq(companies.userId, userId)));
  return NextResponse.json({ data: { id }, error: null });
}

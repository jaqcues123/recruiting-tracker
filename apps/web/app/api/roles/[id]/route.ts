import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  status: z.string().optional(),
  priority: z.number().int().min(1).max(3).optional(),
  applicationDeadline: z.string().datetime().nullish(),
  notes: z.string().optional(),
  archived: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  const [role] = await db.select().from(roles).where(eq(roles.id, id));
  if (!role) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: role, error: null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { applicationDeadline, ...rest } = parsed.data;
  const [updated] = await db
    .update(roles)
    .set({
      ...rest,
      ...(applicationDeadline !== undefined
        ? { applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null }
        : {}),
    })
    .where(eq(roles.id, id))
    .returning();
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(roles).where(eq(roles.id, id));
  return NextResponse.json({ data: { id }, error: null });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@recruiting/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  status: z.string().optional(),
  priority: z.coerce.number().int().min(1).max(3).optional(),
  applicationDeadline: z.string().datetime().nullish(),
  notes: z.string().optional(),
  archived: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  const [role] = await db.select().from(roles).where(and(eq(roles.id, id), eq(roles.userId, userId)));
  if (!role) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: role, error: null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten() },
        { status: 400 }
      );
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
      .where(and(eq(roles.id, id), eq(roles.userId, userId)))
      .returning();
    if (!updated) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error("PATCH /api/roles/[id] error:", err);
    return NextResponse.json(
      { data: null, error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(roles).where(and(eq(roles.id, id), eq(roles.userId, userId)));
  return NextResponse.json({ data: { id }, error: null });
}

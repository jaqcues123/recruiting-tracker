import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checklistItems } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().nullish(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { dueDate, ...rest } = parsed.data;
  const [updated] = await db
    .update(checklistItems)
    .set({
      ...rest,
      ...(parsed.data.completed ? { completedAt: new Date() } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    })
    .where(eq(checklistItems.id, id))
    .returning();
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  return NextResponse.json({ data: { id }, error: null });
}

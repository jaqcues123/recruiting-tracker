import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const [updated] = await db.update(companies).set(parsed.data).where(eq(companies.id, id)).returning();
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await db.delete(companies).where(eq(companies.id, id));
  return NextResponse.json({ data: { id }, error: null });
}

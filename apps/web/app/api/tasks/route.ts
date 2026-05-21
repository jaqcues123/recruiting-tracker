import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checklistItems } from "@recruiting/db";
import { z } from "zod";

const createSchema = z.object({
  checklistId: z.number().int(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullish(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const rows = await db.select().from(checklistItems);
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { dueDate, ...rest } = parsed.data;
  const [item] = await db
    .insert(checklistItems)
    .values({
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning();
  return NextResponse.json({ data: item, error: null }, { status: 201 });
}

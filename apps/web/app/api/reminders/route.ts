import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reminders } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  sourceType: z.enum(["task", "contact", "event"]),
  sourceId: z.number().int(),
  sendAt: z.string().datetime(),
});

export async function GET() {
  const rows = await db.select().from(reminders).where(eq(reminders.sent, false));
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const [reminder] = await db
    .insert(reminders)
    .values({ ...parsed.data, sendAt: new Date(parsed.data.sendAt) })
    .returning();
  return NextResponse.json({ data: reminder, error: null }, { status: 201 });
}

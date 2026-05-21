import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@recruiting/db";
import { z } from "zod";

const createSchema = z.object({
  roleId: z.number().int().optional(),
  title: z.string().min(1),
  eventType: z
    .enum([
      "phone_screen",
      "case_interview",
      "final_round",
      "networking",
      "deadline",
      "milestone",
      "note",
      "info_session",
      "interview",
      "reminder",
      "followup",
      "other",
    ])
    .default("other"),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().nullish(),
  notes: z.string().optional(),
});

export async function GET() {
  const rows = await db.select().from(events).orderBy(events.startAt);
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { startAt, endAt, ...rest } = parsed.data;
  const [event] = await db
    .insert(events)
    .values({
      ...rest,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
    })
    .returning();
  return NextResponse.json({ data: event, error: null }, { status: 201 });
}

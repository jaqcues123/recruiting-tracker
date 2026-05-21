import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@recruiting/db";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.number().int().optional(),
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
  const rows = await db.select().from(contacts).orderBy(contacts.nextFollowup);
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
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
      lastContacted: lastContacted ? new Date(lastContacted) : null,
      nextFollowup: nextFollowup ? new Date(nextFollowup) : null,
    })
    .returning();
  return NextResponse.json({ data: contact, error: null }, { status: 201 });
}

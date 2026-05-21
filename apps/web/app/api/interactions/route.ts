import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interactions, contacts } from "@recruiting/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  contactId: z.number().int(),
  type: z.enum(["email", "call", "coffee_chat", "linkedin", "event", "other"]).default("other"),
  notes: z.string().optional(),
  interactionDate: z.string().datetime().optional(),
  nextFollowup: z.string().datetime().nullish(),
});

export async function GET(req: NextRequest) {
  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) {
    return NextResponse.json({ data: [], error: null });
  }
  const rows = await db
    .select()
    .from(interactions)
    .where(eq(interactions.contactId, parseInt(contactId, 10)))
    .orderBy(desc(interactions.interactionDate));
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }
  const { interactionDate, nextFollowup, ...rest } = parsed.data;
  const [interaction] = await db
    .insert(interactions)
    .values({
      ...rest,
      interactionDate: interactionDate ? new Date(interactionDate) : new Date(),
      nextFollowup: nextFollowup ? new Date(nextFollowup) : null,
    })
    .returning();

  // Update lastContacted on the contact, and nextFollowup if provided
  await db
    .update(contacts)
    .set({
      lastContacted: interaction.interactionDate,
      ...(nextFollowup ? { nextFollowup: new Date(nextFollowup) } : {}),
    })
    .where(eq(contacts.id, parsed.data.contactId));

  return NextResponse.json({ data: interaction, error: null }, { status: 201 });
}

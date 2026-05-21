import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@recruiting/db";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ data: { id }, error: null });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@recruiting/db";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
  return NextResponse.json({ data: { id }, error: null });
}

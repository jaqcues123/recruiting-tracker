import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleChecklists, checklistItems } from "@recruiting/db";
import { z } from "zod";

const createSchema = z.object({
  roleId: z.number().int(),
  defaultItems: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const { roleId, defaultItems = [] } = parsed.data;

  const [checklist] = await db
    .insert(roleChecklists)
    .values({ roleId, templateName: "Default" })
    .returning();

  if (defaultItems.length > 0) {
    await db.insert(checklistItems).values(
      defaultItems.map((title, i) => ({
        checklistId: checklist.id,
        title,
        sortOrder: i,
      }))
    );
  }

  return NextResponse.json({ data: checklist, error: null }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, roleChecklists, checklistItems } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const DEFAULT_CHECKLIST_ITEMS = [
  "Resume tailored",
  "Cover letter",
  "Networking outreach complete",
  "Application submitted",
  "Technical prep",
  "Behavioral prep",
  "Thank-you email",
];

const createSchema = z.object({
  companyId: z.number().int(),
  title: z.string().min(1),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  status: z.string().default("Targeted"),
  priority: z.number().int().min(1).max(3).optional(),
  applicationDeadline: z.string().datetime().nullish(),
  notes: z.string().optional(),
});

export async function GET() {
  const rows = await db.select().from(roles).where(eq(roles.archived, false)).orderBy(roles.createdAt);
  return NextResponse.json({ data: rows, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const { applicationDeadline, ...rest } = parsed.data;
  const [role] = await db
    .insert(roles)
    .values({
      ...rest,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
    })
    .returning();

  // Auto-generate default checklist
  const [checklist] = await db
    .insert(roleChecklists)
    .values({ roleId: role.id, templateName: "Default" })
    .returning();

  await db.insert(checklistItems).values(
    DEFAULT_CHECKLIST_ITEMS.map((title, i) => ({
      checklistId: checklist.id,
      title,
      sortOrder: i,
    }))
  );

  return NextResponse.json({ data: role, error: null }, { status: 201 });
}

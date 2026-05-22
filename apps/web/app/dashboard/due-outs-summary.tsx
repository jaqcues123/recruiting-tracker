import { db } from "@/lib/db";
import { checklistItems, roleChecklists, roles, companies } from "@recruiting/db";
import { and, asc, eq, isNotNull, lte } from "drizzle-orm";
import { formatDate } from "@recruiting/utils";
import Link from "next/link";

export async function DueOutsSummary({ userId }: { userId: string }) {
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const items = await db
    .select({
      id: checklistItems.id,
      title: checklistItems.title,
      dueDate: checklistItems.dueDate,
      roleId: roles.id,
      roleTitle: roles.title,
      companyName: companies.name,
    })
    .from(checklistItems)
    .innerJoin(roleChecklists, eq(checklistItems.checklistId, roleChecklists.id))
    .innerJoin(roles, eq(roleChecklists.roleId, roles.id))
    .leftJoin(companies, eq(roles.companyId, companies.id))
    .where(
      and(
        eq(checklistItems.completed, false),
        isNotNull(checklistItems.dueDate),
        lte(checklistItems.dueDate, weekFromNow),
        eq(roles.userId, userId)
      )
    )
    .orderBy(asc(checklistItems.dueDate))
    .limit(5);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Due This Week</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing due in the next 7 days.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <Link href={`/roles/${item.roleId}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.companyName} — {item.roleTitle}
                </p>
              </div>
              <span className="text-muted-foreground">{formatDate(item.dueDate)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

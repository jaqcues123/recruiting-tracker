import { db } from "@/lib/db";
import { checklistItems, roleChecklists, roles, companies } from "@recruiting/db";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { formatDate } from "@recruiting/utils";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/get-user-id";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/sign-in");

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const items = await db
    .select({
      id: checklistItems.id,
      title: checklistItems.title,
      dueDate: checklistItems.dueDate,
      completed: checklistItems.completed,
      roleId: roles.id,
      roleTitle: roles.title,
      companyName: companies.name,
    })
    .from(checklistItems)
    .innerJoin(roleChecklists, eq(checklistItems.checklistId, roleChecklists.id))
    .innerJoin(roles, eq(roleChecklists.roleId, roles.id))
    .leftJoin(companies, eq(roles.companyId, companies.id))
    .where(
      and(eq(checklistItems.completed, false), isNotNull(checklistItems.dueDate), eq(roles.userId, userId))
    )
    .orderBy(asc(checklistItems.dueDate));

  const overdue = items.filter((i) => i.dueDate! < now);
  const today = items.filter((i) => {
    const d = i.dueDate!;
    return d >= now && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  });
  const thisWeek = items.filter((i) => {
    const d = i.dueDate!;
    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) && d <= weekFromNow;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Due Outs</h1>
        <p className="text-muted-foreground">Single source of truth for all pending tasks.</p>
      </div>

      <TaskGroup title="Overdue" items={overdue} variant="red" />
      <TaskGroup title="Due Today" items={today} variant="orange" />
      <TaskGroup title="Due This Week" items={thisWeek} variant="blue" />

      {overdue.length === 0 && today.length === 0 && thisWeek.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          All caught up! No pending tasks due soon.
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  items,
  variant,
}: {
  title: string;
  items: {
    id: number;
    title: string;
    dueDate: Date | null;
    roleId: number;
    roleTitle: string;
    companyName: string | null;
  }[];
  variant?: "red" | "orange" | "blue";
}) {
  if (items.length === 0) return null;

  const headerColor =
    variant === "red"
      ? "border-red-200 bg-red-50"
      : variant === "orange"
      ? "border-orange-200 bg-orange-50"
      : "border-blue-200 bg-blue-50";

  const dotColor =
    variant === "red" ? "bg-red-500" : variant === "orange" ? "bg-orange-500" : "bg-blue-500";

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className={`border-b px-4 py-3 font-semibold flex items-center gap-2 ${headerColor}`}>
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        {title} ({items.length})
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0 text-sm">
            <div>
              <p className="font-medium">{item.title}</p>
              <Link
                href={`/roles/${item.roleId}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                {item.companyName} — {item.roleTitle}
              </Link>
            </div>
            <span className="text-muted-foreground text-xs">{formatDate(item.dueDate)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

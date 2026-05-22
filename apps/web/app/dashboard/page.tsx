import { db } from "@/lib/db";
import { checklistItems, contacts, interactions, roles, roleChecklists } from "@recruiting/db";
import { and, count, eq, gte, lt, ne } from "drizzle-orm";
import { DashboardMetrics } from "./dashboard-metrics";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { DueOutsSummary } from "./due-outs-summary";
import { getCurrentUserId } from "@/lib/auth/get-user-id";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getMetrics(userId: string) {
  const now = new Date();

  const [
    rolesTargeted,
    applicationsSubmitted,
    overdueTasks,
    networkingCalls,
  ] = await Promise.all([
    db.select({ count: count() }).from(roles).where(and(eq(roles.archived, false), eq(roles.userId, userId))),
    db
      .select({ count: count() })
      .from(roles)
      .where(
        and(
          ne(roles.status, "Targeted"),
          ne(roles.status, "Networking"),
          eq(roles.archived, false),
          eq(roles.userId, userId)
        )
      ),
    db
      .select({ count: count() })
      .from(checklistItems)
      .innerJoin(roleChecklists, eq(checklistItems.checklistId, roleChecklists.id))
      .innerJoin(roles, eq(roleChecklists.roleId, roles.id))
      .where(and(eq(checklistItems.completed, false), lt(checklistItems.dueDate, now), eq(roles.userId, userId))),
    db
      .select({ count: count() })
      .from(interactions)
      .innerJoin(contacts, eq(interactions.contactId, contacts.id))
      .where(
        and(
          eq(contacts.userId, userId),
          gte(interactions.interactionDate, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        )
      ),
  ]);

  return {
    rolesTargeted: rolesTargeted[0].count,
    applicationsSubmitted: applicationsSubmitted[0].count,
    overdueTasks: overdueTasks[0].count,
    networkingCalls: networkingCalls[0].count,
  };
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/sign-in");

  const metrics = await getMetrics(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your recruiting pipeline at a glance.</p>
      </div>

      <DashboardMetrics metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DueOutsSummary userId={userId} />
        <UpcomingDeadlines userId={userId} />
      </div>
    </div>
  );
}

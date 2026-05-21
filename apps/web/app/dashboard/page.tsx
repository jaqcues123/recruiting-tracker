import { db } from "@/lib/db";
import { checklistItems, companies, interactions, roles } from "@recruiting/db";
import { and, count, eq, gte, lt, lte, ne } from "drizzle-orm";
import { DashboardMetrics } from "./dashboard-metrics";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { DueOutsSummary } from "./due-outs-summary";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    rolesTargeted,
    applicationsSubmitted,
    overdueTasks,
    networkingCalls,
  ] = await Promise.all([
    db.select({ count: count() }).from(roles).where(eq(roles.archived, false)),
    db
      .select({ count: count() })
      .from(roles)
      .where(
        and(
          ne(roles.status, "Targeted"),
          ne(roles.status, "Networking"),
          eq(roles.archived, false)
        )
      ),
    db
      .select({ count: count() })
      .from(checklistItems)
      .where(and(eq(checklistItems.completed, false), lt(checklistItems.dueDate, now))),
    db
      .select({ count: count() })
      .from(interactions)
      .where(gte(interactions.interactionDate, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))),
  ]);

  return {
    rolesTargeted: rolesTargeted[0].count,
    applicationsSubmitted: applicationsSubmitted[0].count,
    overdueTasks: overdueTasks[0].count,
    networkingCalls: networkingCalls[0].count,
  };
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your recruiting pipeline at a glance.</p>
      </div>

      <DashboardMetrics metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DueOutsSummary />
        <UpcomingDeadlines />
      </div>
    </div>
  );
}

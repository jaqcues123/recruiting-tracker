import { db } from "@/lib/db";
import { roles, companies } from "@recruiting/db";
import { and, asc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { formatDate } from "@recruiting/utils";
import Link from "next/link";

export async function UpcomingDeadlines() {
  const now = new Date();
  const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const upcoming = await db
    .select({
      id: roles.id,
      title: roles.title,
      companyName: companies.name,
      applicationDeadline: roles.applicationDeadline,
    })
    .from(roles)
    .leftJoin(companies, eq(roles.companyId, companies.id))
    .where(
      and(
        isNotNull(roles.applicationDeadline),
        gte(roles.applicationDeadline, now),
        lte(roles.applicationDeadline, twoWeeksOut),
        eq(roles.archived, false)
      )
    )
    .orderBy(asc(roles.applicationDeadline))
    .limit(5);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Upcoming Deadlines (14 days)</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">No deadlines in the next two weeks.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <Link href={`/roles/${r.id}`} className="font-medium hover:underline">
                {r.companyName} — {r.title}
              </Link>
              <span className="text-muted-foreground">{formatDate(r.applicationDeadline)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

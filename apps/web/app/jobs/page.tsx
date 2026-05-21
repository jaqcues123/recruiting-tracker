import { db } from "@/lib/db";
import { companies, roles } from "@recruiting/db";
import { eq, ne } from "drizzle-orm";
import Link from "next/link";
import { ROLE_STATUS_COLORS, formatDate } from "@recruiting/utils";
import { AddJobButton } from "./add-job-button";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const rows = await db
    .select({
      id: roles.id,
      title: roles.title,
      status: roles.status,
      applicationDeadline: roles.applicationDeadline,
      location: roles.location,
      priority: roles.priority,
      companyName: companies.name,
      companyId: companies.id,
    })
    .from(roles)
    .leftJoin(companies, eq(roles.companyId, companies.id))
    .where(ne(roles.archived, true))
    .orderBy(roles.applicationDeadline, roles.createdAt);

  const byStatus = (s: string) => rows.filter((r) => r.status === s);
  const active = rows.filter((r) => !["Offer", "Closed"].includes(r.status));
  const closed = rows.filter((r) => ["Offer", "Closed"].includes(r.status));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">{active.length} active · {rows.length} total</p>
        </div>
        <AddJobButton />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No jobs yet. Add your first one!
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {r.companyName}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/roles/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                  {r.location && (
                    <span className="ml-1.5 text-xs text-muted-foreground">{r.location}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ROLE_STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(r.applicationDeadline)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

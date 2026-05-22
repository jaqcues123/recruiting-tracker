import { db } from "@/lib/db";
import { companies, roles } from "@recruiting/db";
import { and, eq, ne } from "drizzle-orm";
import Link from "next/link";
import { ROLE_STATUS_COLORS, formatDate } from "@recruiting/utils";
import { AddJobButton } from "./add-job-button";
import { getCurrentUserId } from "@/lib/auth/get-user-id";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/sign-in");

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
    .where(and(ne(roles.archived, true), eq(roles.userId, userId)))
    .orderBy(roles.applicationDeadline, roles.createdAt);

  const active = rows.filter((r) => !["Offer", "Closed"].includes(r.status));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            {active.length} active · {rows.length} total
          </p>
        </div>
        <AddJobButton />
      </div>

      {rows.length === 0 && (
        <div className="rounded-lg border bg-card shadow-sm px-4 py-8 text-center text-sm text-muted-foreground">
          No jobs yet. Add your first one!
        </div>
      )}

      {/* Mobile: tappable card list (no horizontal scroll) */}
      {rows.length > 0 && (
        <ul className="md:hidden rounded-lg border bg-card shadow-sm divide-y">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/roles/${r.id}`}
                className="flex items-center justify-between px-4 py-3.5 active:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.companyName}
                    {r.location ? ` · ${r.location}` : ""}
                  </p>
                  {r.applicationDeadline && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {formatDate(r.applicationDeadline)}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    ROLE_STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Desktop: full table */}
      {rows.length > 0 && (
        <div className="hidden md:block rounded-lg border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{r.companyName}</td>
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(r.applicationDeadline)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

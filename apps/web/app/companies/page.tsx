import { db } from "@/lib/db";
import { companies, roles } from "@recruiting/db";
import { count, eq, ne, and } from "drizzle-orm";
import Link from "next/link";
import { AddCompanyButton } from "./add-company-button";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      industry: companies.industry,
      createdAt: companies.createdAt,
      roleCount: count(roles.id),
    })
    .from(companies)
    .leftJoin(roles, eq(roles.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(companies.name);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">{rows.length} companies tracked</p>
        </div>
        <AddCompanyButton />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Industry</th>
              <th className="px-4 py-3 font-medium text-center">Roles</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No companies yet. Add your first one!
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.industry ?? "—"}</td>
                <td className="px-4 py-3 text-center">{c.roleCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
                    c.createdAt
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

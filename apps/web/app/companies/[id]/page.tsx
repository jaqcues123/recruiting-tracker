import { db } from "@/lib/db";
import { companies, roles } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ROLE_STATUS_COLORS } from "@recruiting/utils";
import { AddRoleButton } from "./add-role-button";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);
  if (isNaN(companyId)) notFound();

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) notFound();

  const companyRoles = await db
    .select()
    .from(roles)
    .where(eq(roles.companyId, companyId))
    .orderBy(roles.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/companies" className="hover:underline">Companies</Link>
            <span>/</span>
            <span>{company.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
          {company.industry && (
            <p className="text-muted-foreground">{company.industry}</p>
          )}
        </div>
        <AddRoleButton companyId={companyId} />
      </div>

      {company.notes && (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">{company.notes}</div>
      )}

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3 font-semibold">Roles ({companyRoles.length})</div>
        {companyRoles.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No roles yet. Add one above.</p>
        ) : (
          <ul>
            {companyRoles.map((role) => (
              <li key={role.id} className="border-b last:border-0">
                <Link
                  href={`/roles/${role.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{role.title}</p>
                    {role.location && (
                      <p className="text-xs text-muted-foreground">{role.location}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ROLE_STATUS_COLORS[role.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {role.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

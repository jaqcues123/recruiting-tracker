import { db } from "@/lib/db";
import { checklistItems, companies, contacts, events, roleChecklists, roles } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ROLE_STATUS_COLORS, formatDate } from "@recruiting/utils";
import { ChecklistSection } from "./checklist-section";
import { RoleStatusSelect } from "./role-status-select";

export const dynamic = "force-dynamic";

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roleId = parseInt(id, 10);
  if (isNaN(roleId)) notFound();

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  if (!role) notFound();

  const [company] = await db.select().from(companies).where(eq(companies.id, role.companyId));

  const [checklist] = await db
    .select()
    .from(roleChecklists)
    .where(eq(roleChecklists.roleId, roleId));

  const items = checklist
    ? await db
        .select()
        .from(checklistItems)
        .where(eq(checklistItems.checklistId, checklist.id))
        .orderBy(checklistItems.sortOrder)
    : [];

  const relatedContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.companyId, role.companyId));

  const roleEvents = await db.select().from(events).where(eq(events.roleId, roleId));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/companies" className="hover:underline">Companies</Link>
          <span>/</span>
          <Link href={`/companies/${company?.id}`} className="hover:underline">{company?.name}</Link>
          <span>/</span>
          <span>{role.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{role.title}</h1>
            <p className="text-muted-foreground">{company?.name}{role.location ? ` · ${role.location}` : ""}</p>
          </div>
          <RoleStatusSelect roleId={role.id} currentStatus={role.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p className="font-medium">{formatDate(role.applicationDeadline)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Priority</p>
          <p className="font-medium">{role.priority === 1 ? "High" : role.priority === 2 ? "Medium" : "Low"}</p>
        </div>
        {role.jobUrl && (
          <div className="col-span-2">
            <p className="text-muted-foreground">Job Posting</p>
            <a href={role.jobUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline truncate block">
              View posting
            </a>
          </div>
        )}
      </div>

      {role.notes && (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">{role.notes}</div>
      )}

      {/* Checklist */}
      <ChecklistSection roleId={roleId} checklist={checklist ?? null} items={items} />

      {/* Contacts */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3 font-semibold">
          Contacts at {company?.name} ({relatedContacts.length})
        </div>
        {relatedContacts.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No contacts logged yet.</p>
        ) : (
          <ul>
            {relatedContacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0 text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                </div>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Events */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3 font-semibold">Events / Timeline ({roleEvents.length})</div>
        {roleEvents.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No events scheduled.</p>
        ) : (
          <ul>
            {roleEvents.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0 text-sm">
                <p className="font-medium">{ev.title}</p>
                <span className="text-muted-foreground">{formatDate(ev.startAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

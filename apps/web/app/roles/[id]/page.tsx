import { db } from "@/lib/db";
import { checklistItems, companies, contacts, events, roleChecklists, roles } from "@recruiting/db";
import { and, eq, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@recruiting/utils";
import { ChecklistSection } from "./checklist-section";
import { ContactsSection } from "./contacts-section";
import { TimelineSection } from "./timeline-section";
import { RoleStatusSelect } from "./role-status-select";
import { RolePrioritySelect } from "./role-priority-select";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

export const dynamic = "force-dynamic";

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/sign-in");

  const { id } = await params;
  const roleId = parseInt(id, 10);
  if (isNaN(roleId)) notFound();

  const [role] = await db.select().from(roles).where(and(eq(roles.id, roleId), eq(roles.userId, userId)));
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

  // Role-specific contacts (added from this role page)
  const roleContacts = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.roleId, roleId), eq(contacts.userId, userId)));

  // Company-wide contacts that aren't tied to a specific role
  const companyContacts = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.companyId, role.companyId), isNull(contacts.roleId), eq(contacts.userId, userId)));

  const roleEvents = await db
    .select()
    .from(events)
    .where(and(eq(events.roleId, roleId), eq(events.userId, userId)))
    .orderBy(events.startAt);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/jobs" className="hover:underline">Jobs</Link>
          <span>/</span>
          <span>{role.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{role.title}</h1>
            <p className="text-muted-foreground">
              {company?.name}{role.location ? ` · ${role.location}` : ""}
            </p>
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
          <p className="text-muted-foreground mb-1">Priority</p>
          <RolePrioritySelect roleId={role.id} currentPriority={role.priority} />
        </div>
        {role.jobUrl && (
          <div className="col-span-2">
            <p className="text-muted-foreground">Job Posting</p>
            <a
              href={role.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline truncate block"
            >
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

      {/* Timeline / Events */}
      <TimelineSection
        roleId={roleId}
        initialEvents={roleEvents.map((e) => ({
          ...e,
          startAt: e.startAt,
          endAt: e.endAt,
          notes: e.notes ?? null,
        }))}
      />

      {/* Contacts */}
      <ContactsSection
        roleId={roleId}
        companyId={role.companyId}
        companyName={company?.name ?? ""}
        roleContacts={roleContacts.map((c) => ({
          ...c,
          lastContacted: c.lastContacted,
          nextFollowup: c.nextFollowup,
        }))}
        companyContacts={companyContacts.map((c) => ({
          ...c,
          lastContacted: c.lastContacted,
          nextFollowup: c.nextFollowup,
        }))}
      />
    </div>
  );
}

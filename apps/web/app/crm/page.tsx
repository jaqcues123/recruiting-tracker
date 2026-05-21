import { db } from "@/lib/db";
import { contacts, companies } from "@recruiting/db";
import { eq, asc, isNotNull, lte } from "drizzle-orm";
import { formatDate, formatRelative } from "@recruiting/utils";
import { AddContactButton } from "./add-contact-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const now = new Date();

  const allContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      title: contacts.title,
      email: contacts.email,
      linkedinUrl: contacts.linkedinUrl,
      companyName: companies.name,
      companyId: contacts.companyId,
      relationshipStrength: contacts.relationshipStrength,
      lastContacted: contacts.lastContacted,
      nextFollowup: contacts.nextFollowup,
      notes: contacts.notes,
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .orderBy(asc(contacts.nextFollowup));

  const needsFollowup = allContacts.filter(
    (c) => c.nextFollowup && c.nextFollowup <= now
  );
  const upcomingFollowups = allContacts.filter(
    (c) => c.nextFollowup && c.nextFollowup > now
  );
  const noFollowup = allContacts.filter((c) => !c.nextFollowup);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Networking CRM</h1>
          <p className="text-muted-foreground">{allContacts.length} contacts</p>
        </div>
        <AddContactButton />
      </div>

      <ContactSection title="Needs Follow-up" contacts={needsFollowup} highlight="red" />
      <ContactSection title="Upcoming Follow-ups" contacts={upcomingFollowups} highlight="blue" />
      <ContactSection title="Recently Contacted / No Follow-up Set" contacts={noFollowup} />
    </div>
  );
}

function ContactSection({
  title,
  contacts: rows,
  highlight,
}: {
  title: string;
  contacts: {
    id: number;
    name: string;
    title: string | null;
    email: string | null;
    linkedinUrl: string | null;
    companyName: string | null;
    relationshipStrength: number | null;
    lastContacted: Date | null;
    nextFollowup: Date | null;
  }[];
  highlight?: "red" | "blue";
}) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b px-4 py-3 font-semibold flex items-center gap-2">
        {highlight === "red" && <span className="h-2 w-2 rounded-full bg-red-500" />}
        {highlight === "blue" && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        {title} ({rows.length})
      </div>
      <ul>
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0 text-sm">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.title}{c.companyName ? ` · ${c.companyName}` : ""}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {c.nextFollowup && <p>Follow-up: {formatDate(c.nextFollowup)}</p>}
              {c.lastContacted && <p>Last: {formatRelative(c.lastContacted)}</p>}
              {"⭐".repeat(c.relationshipStrength ?? 1)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { db } from "@/lib/db";
import { events, roles, companies } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { CalendarView } from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startAt: events.startAt,
      endAt: events.endAt,
      roleTitle: roles.title,
      companyName: companies.name,
    })
    .from(events)
    .leftJoin(roles, eq(events.roleId, roles.id))
    .leftJoin(companies, eq(roles.companyId, companies.id));

  const serialized = allEvents.map((e) => ({
    ...e,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">All deadlines, interviews, and follow-ups.</p>
      </div>
      <CalendarView events={serialized} />
    </div>
  );
}

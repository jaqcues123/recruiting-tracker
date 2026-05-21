"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalEvent {
  id: number;
  title: string;
  eventType: string;
  startAt: string;
  endAt: string | null;
  roleTitle: string | null;
  companyName: string | null;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  deadline: "#ef4444",
  interview: "#3b82f6",
  reminder: "#f59e0b",
  followup: "#8b5cf6",
  info_session: "#10b981",
  other: "#6b7280",
};

export function CalendarView({ events }: { events: CalEvent[] }) {
  const fcEvents = events.map((e) => ({
    id: String(e.id),
    title: e.companyName ? `${e.companyName}: ${e.title}` : e.title,
    start: e.startAt,
    end: e.endAt ?? undefined,
    backgroundColor: EVENT_TYPE_COLORS[e.eventType] ?? EVENT_TYPE_COLORS.other,
    borderColor: "transparent",
    textColor: "#fff",
  }));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={fcEvents}
        editable={false}
        height="auto"
      />
    </div>
  );
}

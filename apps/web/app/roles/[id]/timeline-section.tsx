"use client";

import { useState } from "react";
import {
  Phone,
  ClipboardList,
  Award,
  Coffee,
  CalendarX,
  CheckCircle2,
  FileText,
  Info,
  Circle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "@recruiting/utils";

interface RoleEvent {
  id: number;
  roleId: number | null;
  title: string;
  eventType: string;
  startAt: Date;
  endAt: Date | null;
  notes: string | null;
}

interface Props {
  roleId: number;
  initialEvents: RoleEvent[];
}

const EVENT_TYPE_META: Record<string, { label: string; Icon: React.FC<{ className?: string }> }> = {
  phone_screen: { label: "Phone Screen", Icon: Phone },
  case_interview: { label: "Case Interview", Icon: ClipboardList },
  final_round: { label: "Final Round", Icon: Award },
  networking: { label: "Coffee Chat", Icon: Coffee },
  deadline: { label: "Deadline", Icon: CalendarX },
  milestone: { label: "Milestone", Icon: CheckCircle2 },
  note: { label: "Note", Icon: FileText },
  info_session: { label: "Info Session", Icon: Info },
  // legacy
  interview: { label: "Interview", Icon: ClipboardList },
  reminder: { label: "Reminder", Icon: Circle },
  followup: { label: "Follow-up", Icon: Circle },
  other: { label: "Other", Icon: Circle },
};

function getEventMeta(type: string) {
  return EVENT_TYPE_META[type] ?? EVENT_TYPE_META.other;
}

const TODAY = new Date().toISOString().split("T")[0];

export function TimelineSection({ roleId, initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [adding, setAdding] = useState(false);
  const [eventType, setEventType] = useState("phone_screen");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(TODAY);
  const [eventTime, setEventTime] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const now = new Date();
  const upcoming = events.filter((e) => e.startAt >= now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = events.filter((e) => e.startAt < now).sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    setSaving(true);

    const dateStr = eventTime
      ? `${eventDate}T${eventTime}:00.000Z`
      : `${eventDate}T12:00:00.000Z`;

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roleId,
        title: eventTitle.trim(),
        eventType,
        startAt: dateStr,
        notes: eventNotes.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (data.data) {
      setEvents((prev) => [...prev, { ...data.data, startAt: new Date(data.data.startAt), endAt: data.data.endAt ? new Date(data.data.endAt) : null }]);
    }
    setEventTitle("");
    setEventTime("");
    setEventNotes("");
    setAdding(false);
    setSaving(false);
  }

  async function handleDelete(eventId: number) {
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  function resetForm() {
    setEventType("phone_screen");
    setEventTitle("");
    setEventDate(TODAY);
    setEventTime("");
    setEventNotes("");
    setAdding(false);
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-semibold">Timeline ({events.length})</span>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Upcoming events */}
      {upcoming.length === 0 && past.length === 0 && !adding && (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          No timeline entries yet. Add interviews, deadlines, or notes.
        </p>
      )}

      {upcoming.map((ev) => (
        <EventRow key={ev.id} event={ev} onDelete={handleDelete} />
      ))}

      {/* Past events collapsible */}
      {past.length > 0 && (
        <>
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-muted-foreground hover:bg-muted/30 border-t"
          >
            {showPast ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showPast ? "Hide" : "Show"} {past.length} past {past.length === 1 ? "entry" : "entries"}
          </button>
          {showPast && past.map((ev) => (
            <EventRow key={ev.id} event={ev} onDelete={handleDelete} past />
          ))}
        </>
      )}

      {/* Add event form */}
      {adding && (
        <form onSubmit={handleAdd} className="border-t px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="phone_screen">Phone Screen</option>
                <option value="case_interview">Case Interview</option>
                <option value="final_round">Final Round</option>
                <option value="networking">Coffee Chat / Networking</option>
                <option value="info_session">Info Session</option>
                <option value="deadline">Application Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="note">Note</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Title *</label>
              <input
                autoFocus
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                placeholder="e.g. Round 1 with HR"
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Time (optional)</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Notes</label>
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                rows={2}
                placeholder="Any details about this event…"
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={resetForm} className="rounded-md border px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !eventTitle.trim() || !eventDate}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function EventRow({
  event,
  onDelete,
  past,
}: {
  event: RoleEvent;
  onDelete: (id: number) => void;
  past?: boolean;
}) {
  const { label, Icon } = getEventMeta(event.eventType);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b last:border-0 ${past ? "opacity-60" : ""}`}>
      <div
        className="flex items-start gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-muted/20"
        onClick={() => event.notes && setExpanded((v) => !v)}
      >
        <div className="shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {label} · {formatDate(event.startAt)}
          </p>
          {expanded && event.notes && (
            <p className="mt-1.5 text-xs text-foreground/80 whitespace-pre-wrap">{event.notes}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
          className="shrink-0 text-muted-foreground/40 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

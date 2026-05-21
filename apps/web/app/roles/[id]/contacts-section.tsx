"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, Phone, Mail, Coffee, Linkedin, Calendar, Circle } from "lucide-react";
import { formatDate, formatRelative, initials } from "@recruiting/utils";

interface Contact {
  id: number;
  name: string;
  title: string | null;
  email: string | null;
  companyId: number | null;
  roleId: number | null;
  lastContacted: Date | null;
  nextFollowup: Date | null;
}

interface Interaction {
  id: number;
  contactId: number;
  type: string;
  notes: string | null;
  interactionDate: Date;
  nextFollowup: Date | null;
}

interface Props {
  roleId: number;
  companyId: number;
  companyName: string;
  roleContacts: Contact[];
  companyContacts: Contact[];
}

const INTERACTION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  coffee_chat: Coffee,
  linkedin: Linkedin,
  event: Calendar,
  other: Circle,
};

const INTERACTION_LABELS: Record<string, string> = {
  call: "Call",
  email: "Email",
  coffee_chat: "Coffee Chat",
  linkedin: "LinkedIn",
  event: "Event",
  other: "Other",
};

const TODAY = new Date().toISOString().split("T")[0];

export function ContactsSection({ roleId, companyId, companyName, roleContacts: initial, companyContacts }: Props) {
  const [contacts, setContacts] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [interactionMap, setInteractionMap] = useState<Record<number, Interaction[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loggingForId, setLoggingForId] = useState<number | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);

  // Add contact form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Log interaction form state
  const [logType, setLogType] = useState("call");
  const [logDate, setLogDate] = useState(TODAY);
  const [logNotes, setLogNotes] = useState("");
  const [logFollowup, setLogFollowup] = useState("");
  const [logSaving, setLogSaving] = useState(false);

  async function expandContact(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!interactionMap[id]) {
      setLoadingId(id);
      const res = await fetch(`/api/interactions?contactId=${id}`);
      const data = await res.json();
      setInteractionMap((prev) => ({
        ...prev,
        [id]: (data.data ?? []).map((i: Interaction & { interactionDate: string; nextFollowup: string | null }) => ({
          ...i,
          interactionDate: new Date(i.interactionDate),
          nextFollowup: i.nextFollowup ? new Date(i.nextFollowup) : null,
        })),
      }));
      setLoadingId(null);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        roleId,
        name: name.trim(),
        title: title.trim() || undefined,
        email: email.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (data.data) {
      setContacts((prev) => [
        ...prev,
        { ...data.data, lastContacted: null, nextFollowup: null },
      ]);
    }
    setName("");
    setTitle("");
    setEmail("");
    setAdding(false);
    setSaving(false);
  }

  async function handleLogInteraction(contactId: number, e: React.FormEvent) {
    e.preventDefault();
    setLogSaving(true);
    const res = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId,
        type: logType,
        notes: logNotes.trim() || undefined,
        interactionDate: logDate ? new Date(logDate).toISOString() : new Date().toISOString(),
        nextFollowup: logFollowup ? new Date(logFollowup).toISOString() : null,
      }),
    });
    const data = await res.json();
    if (data.data) {
      const newInteraction: Interaction = {
        ...data.data,
        interactionDate: new Date(data.data.interactionDate),
        nextFollowup: data.data.nextFollowup ? new Date(data.data.nextFollowup) : null,
      };
      setInteractionMap((prev) => ({
        ...prev,
        [contactId]: [newInteraction, ...(prev[contactId] ?? [])],
      }));
      // Update contact's lastContacted + nextFollowup in local state
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? {
                ...c,
                lastContacted: newInteraction.interactionDate,
                ...(logFollowup ? { nextFollowup: new Date(logFollowup) } : {}),
              }
            : c
        )
      );
    }
    setLogType("call");
    setLogDate(TODAY);
    setLogNotes("");
    setLogFollowup("");
    setLoggingForId(null);
    setLogSaving(false);
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-semibold">Contacts ({contacts.length})</span>
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

      {contacts.length === 0 && !adding && (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          No contacts for this role yet. Add anyone you're networking with.
        </p>
      )}

      {/* Role-specific contacts */}
      {contacts.map((c) => {
        const isExpanded = expandedId === c.id;
        const isLogging = loggingForId === c.id;
        const contactInteractions = interactionMap[c.id] ?? [];
        const followupOverdue = c.nextFollowup && c.nextFollowup < new Date();

        return (
          <div key={c.id} className="border-b last:border-0">
            {/* Contact row */}
            <button
              onClick={() => expandContact(c.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
            >
              {/* Avatar */}
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {c.lastContacted && (
                    <span className="text-xs text-muted-foreground">
                      Last: {formatRelative(c.lastContacted)}
                    </span>
                  )}
                  {c.nextFollowup && (
                    <span className={`text-xs font-medium ${followupOverdue ? "text-red-600" : "text-blue-600"}`}>
                      {followupOverdue ? "Overdue · " : "Follow-up: "}
                      {formatDate(c.nextFollowup)}
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
              )}
            </button>

            {/* Expanded: interaction log + log form */}
            {isExpanded && (
              <div className="bg-muted/20 px-4 pb-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-xs text-primary hover:underline block mb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.email}
                  </a>
                )}

                {/* Interaction log */}
                {loadingId === c.id ? (
                  <p className="text-xs text-muted-foreground py-2">Loading…</p>
                ) : contactInteractions.length > 0 ? (
                  <div className="space-y-1.5 mb-3">
                    {contactInteractions.map((int) => {
                      const Icon = INTERACTION_ICONS[int.type] ?? Circle;
                      return (
                        <div key={int.id} className="flex items-start gap-2 text-xs">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">{INTERACTION_LABELS[int.type] ?? int.type}</span>
                            <span className="text-muted-foreground"> · {formatDate(int.interactionDate)}</span>
                            {int.notes && (
                              <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">{int.notes}</p>
                            )}
                            {int.nextFollowup && (
                              <p className="text-blue-600 mt-0.5">
                                → Follow-up: {formatDate(int.nextFollowup)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">No interactions logged yet.</p>
                )}

                {/* Log interaction */}
                {isLogging ? (
                  <form
                    onSubmit={(e) => handleLogInteraction(c.id, e)}
                    className="space-y-2 border rounded-lg p-3 bg-background"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Type</label>
                        <select
                          value={logType}
                          onChange={(e) => setLogType(e.target.value)}
                          className="w-full rounded border px-2 py-1.5 text-xs bg-background focus:outline-none"
                        >
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="coffee_chat">Coffee Chat</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="event">Event</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Date</label>
                        <input
                          type="date"
                          value={logDate}
                          onChange={(e) => setLogDate(e.target.value)}
                          className="w-full rounded border px-2 py-1.5 text-xs bg-background focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                      <textarea
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        rows={2}
                        placeholder="What did you discuss?"
                        className="w-full rounded border px-2 py-1.5 text-xs bg-background focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Next Follow-up</label>
                      <input
                        type="date"
                        value={logFollowup}
                        onChange={(e) => setLogFollowup(e.target.value)}
                        className="w-full rounded border px-2 py-1.5 text-xs bg-background focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => { setLoggingForId(null); setLogType("call"); setLogDate(TODAY); setLogNotes(""); setLogFollowup(""); }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={logSaving}
                        className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {logSaving ? "Saving…" : "Log"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setLoggingForId(c.id)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 font-medium"
                  >
                    <Plus className="h-3 w-3" />
                    Log interaction
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add contact form */}
      {adding && (
        <form onSubmit={handleAddContact} className="px-4 py-3 space-y-2 border-t">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name *"
              required
              className="flex-1 text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            />
            <button type="button" onClick={() => { setAdding(false); setName(""); setTitle(""); setEmail(""); }} className="text-muted-foreground shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title / Role (optional)"
            className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add Contact"}
          </button>
        </form>
      )}

      {/* Company contacts (other roles / legacy) */}
      {companyContacts.length > 0 && (
        <div className="border-t">
          <button
            onClick={() => setCompanyOpen((v) => !v)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-muted-foreground hover:bg-muted/20"
          >
            {companyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {companyOpen ? "Hide" : "Show"} {companyContacts.length} other {companyContacts.length === 1 ? "contact" : "contacts"} at {companyName}
          </button>
          {companyOpen && (
            <ul>
              {companyContacts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-t px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {initials(c.name)}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                    </div>
                  </div>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline">
                      {c.email}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

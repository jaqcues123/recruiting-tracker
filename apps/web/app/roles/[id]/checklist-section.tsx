"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { formatDate, getDueStatus } from "@recruiting/utils";

interface ChecklistItem {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completed: boolean;
  sortOrder: number;
}

interface Checklist {
  id: number;
  roleId: number;
  templateName: string | null;
}

interface Props {
  roleId: number;
  checklist: Checklist | null;
  items: ChecklistItem[];
}

const DEFAULT_ITEMS = [
  "Resume tailored",
  "Cover letter",
  "Networking outreach complete",
  "Application submitted",
  "Technical prep",
  "Behavioral prep",
  "Thank-you email",
];

const DUE_STATUS_COLORS = {
  overdue: "text-red-600 font-medium",
  today: "text-orange-500 font-medium",
  this_week: "text-blue-600",
  upcoming: "text-muted-foreground",
};

export function ChecklistSection({ roleId, checklist, items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingDueDate, setEditingDueDate] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function toggleItem(itemId: number, completed: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: !completed } : i))
    );
    await fetch(`/api/tasks/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
  }

  async function setDueDate(itemId: number, dueDate: string | null) {
    const isoDate = dueDate ? new Date(dueDate).toISOString() : null;
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, dueDate: dueDate ? new Date(dueDate) : null } : i
      )
    );
    setEditingDueDate(null);
    await fetch(`/api/tasks/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: isoDate }),
    });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !checklist) return;
    const body: Record<string, unknown> = { checklistId: checklist.id, title: newTitle };
    if (newDueDate) body.dueDate = new Date(newDueDate).toISOString();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setItems((prev) => [
      ...prev,
      { ...data.data, dueDate: data.data.dueDate ? new Date(data.data.dueDate) : null },
    ]);
    setNewTitle("");
    setNewDueDate("");
  }

  async function initChecklist() {
    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, defaultItems: DEFAULT_ITEMS }),
    });
    startTransition(() => router.refresh());
  }

  const completed = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <span className="font-semibold">Checklist</span>
          {items.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {completed}/{items.length} done
            </span>
          )}
        </div>
        {items.length > 0 && (
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(completed / items.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {!checklist ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">No checklist yet.</p>
          <button
            onClick={initChecklist}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Generate Default Checklist
          </button>
        </div>
      ) : (
        <>
          <ul>
            {items.map((item) => {
              const status = item.dueDate && !item.completed ? getDueStatus(item.dueDate) : null;
              const isEditing = editingDueDate === item.id;

              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b px-4 py-3 last:border-0 text-sm"
                >
                  {/* Checkbox — stops propagation so it doesn't open the date picker */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(item.id, item.completed);
                    }}
                    className="shrink-0 mt-0.5"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Tapping title area toggles the date picker */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() =>
                        setEditingDueDate(isEditing ? null : item.id)
                      }
                      className="w-full text-left"
                    >
                      <span
                        className={item.completed ? "line-through text-muted-foreground" : ""}
                      >
                        {item.title}
                      </span>
                      {!isEditing && (
                        <div className="mt-0.5">
                          {item.dueDate ? (
                            <span
                              className={`text-xs ${
                                status ? DUE_STATUS_COLORS[status] : "text-muted-foreground"
                              }`}
                            >
                              {status === "overdue" ? "Overdue · " : ""}
                              {formatDate(item.dueDate)}
                            </span>
                          ) : (
                            !item.completed && (
                              <span className="text-xs text-muted-foreground/50">
                                Tap to add due date
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </button>

                    {/* Inline date picker when editing */}
                    {isEditing && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="date"
                          autoFocus
                          defaultValue={
                            item.dueDate
                              ? item.dueDate.toISOString().split("T")[0]
                              : ""
                          }
                          className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          onChange={(e) => setDueDate(item.id, e.target.value || null)}
                        />
                        {item.dueDate && (
                          <button
                            onClick={() => setDueDate(item.id, null)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                        <button
                          onClick={() => setEditingDueDate(null)}
                          className="text-muted-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Add new item row */}
          <form onSubmit={addItem} className="border-t px-4 py-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add task..."
                className="flex-1 text-sm border-0 outline-none bg-transparent"
              />
              <button type="submit" className="text-primary shrink-0">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {newTitle && (
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs border rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Due date (optional)"
              />
            )}
          </form>
        </>
      )}
    </div>
  );
}

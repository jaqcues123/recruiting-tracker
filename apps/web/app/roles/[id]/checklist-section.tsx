"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { formatDate } from "@recruiting/utils";

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

export function ChecklistSection({ roleId, checklist, items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [newTitle, setNewTitle] = useState("");
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

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !checklist) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklistId: checklist.id, title: newTitle }),
    });
    const data = await res.json();
    setItems((prev) => [...prev, data.data]);
    setNewTitle("");
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
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b px-4 py-3 last:border-0 text-sm"
              >
                <button onClick={() => toggleItem(item.id, item.completed)} className="shrink-0">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <span className={item.completed ? "line-through text-muted-foreground flex-1" : "flex-1"}>
                  {item.title}
                </span>
                {item.dueDate && (
                  <span className="text-xs text-muted-foreground">{formatDate(item.dueDate)}</span>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={addItem} className="flex gap-2 border-t px-4 py-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add task..."
              className="flex-1 text-sm border-0 outline-none bg-transparent"
            />
            <button type="submit" className="text-primary">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

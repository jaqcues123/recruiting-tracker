"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export function ChecklistTemplateEditor({ defaultItems }: { defaultItems: string[] }) {
  const [items, setItems] = useState(defaultItems);
  const [newItem, setNewItem] = useState("");

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, newItem.trim()]);
    setNewItem("");
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-muted/30">
            {item}
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add template item..."
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        Template changes apply to new roles only. Existing checklists are unaffected.
      </p>
    </div>
  );
}

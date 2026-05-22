"use client";

import { useState, useTransition } from "react";
import { updateRolePriority } from "./actions";

const PRIORITY_OPTIONS = [
  { value: 1, label: "High", className: "bg-red-100 text-red-700" },
  { value: 2, label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  { value: 3, label: "Low", className: "bg-slate-100 text-slate-600" },
];

export function RolePrioritySelect({
  roleId,
  currentPriority,
}: {
  roleId: number;
  currentPriority: number | null;
}) {
  const [priority, setPriority] = useState(currentPriority ?? 3);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = parseInt(e.target.value, 10);
    const prev = priority;
    setPriority(val);
    setError(false);

    startTransition(async () => {
      try {
        await updateRolePriority(roleId, val);
      } catch {
        setPriority(prev);
        setError(true);
      }
    });
  }

  const current = PRIORITY_OPTIONS.find((o) => o.value === priority) ?? PRIORITY_OPTIONS[2];

  return (
    <div>
      <select
        value={priority}
        onChange={handleChange}
        disabled={isPending}
        className={`rounded-full border-0 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary disabled:opacity-60 ${current.className}`}
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 mt-1">Failed to save — please try again.</p>
      )}
    </div>
  );
}

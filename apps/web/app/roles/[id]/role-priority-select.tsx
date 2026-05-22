"use client";

import { useState } from "react";

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

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = parseInt(e.target.value, 10);
    setPriority(val);
    await fetch(`/api/roles/${roleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: val }),
    });
  }

  const current = PRIORITY_OPTIONS.find((o) => o.value === priority) ?? PRIORITY_OPTIONS[2];

  return (
    <select
      value={priority}
      onChange={handleChange}
      className={`rounded-full border-0 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary ${current.className}`}
    >
      {PRIORITY_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

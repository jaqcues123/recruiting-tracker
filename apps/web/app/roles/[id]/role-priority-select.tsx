"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = parseInt(e.target.value, 10);
    const prev = priority;
    setPriority(val);
    setError(false);

    const res = await fetch(`/api/roles/${roleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: val }),
    });

    if (!res.ok) {
      // Revert optimistic update if the save failed
      setPriority(prev);
      setError(true);
      return;
    }

    router.refresh();
  }

  const current = PRIORITY_OPTIONS.find((o) => o.value === priority) ?? PRIORITY_OPTIONS[2];

  return (
    <div>
      <select
        value={priority}
        onChange={handleChange}
        className={`rounded-full border-0 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary ${current.className}`}
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

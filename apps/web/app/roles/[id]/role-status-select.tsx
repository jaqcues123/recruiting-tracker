"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { roleStatusEnum } from "@recruiting/db";
import { ROLE_STATUS_COLORS } from "@recruiting/utils";

export function RoleStatusSelect({ roleId, currentStatus }: { roleId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await fetch(`/api/roles/${roleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      className={`rounded-full border-0 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary ${
        ROLE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {roleStatusEnum.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

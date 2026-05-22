"use client";

import { useState, useTransition } from "react";
import { roleStatusEnum } from "@recruiting/db";
import { ROLE_STATUS_COLORS } from "@recruiting/utils";
import { updateRoleStatus } from "./actions";

export function RoleStatusSelect({ roleId, currentStatus }: { roleId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);

    startTransition(async () => {
      await updateRoleStatus(roleId, newStatus);
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-full border-0 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary disabled:opacity-60 ${
        ROLE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {roleStatusEnum.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

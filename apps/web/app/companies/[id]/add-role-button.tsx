"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { roleStatusEnum } from "@recruiting/db";

export function AddRoleButton({ companyId }: { companyId: number }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("Targeted");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        title,
        location,
        jobUrl,
        status,
        applicationDeadline: deadline || null,
      }),
    });
    setLoading(false);
    setOpen(false);
    setTitle("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        + Add Role
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <form
            onSubmit={handleSubmit}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-lg bg-white p-6 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold">Add Role</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Role Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Associate"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job URL</label>
              <input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                {roleStatusEnum.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {loading ? "Saving..." : "Add Role"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

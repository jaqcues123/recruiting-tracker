"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleStatusEnum } from "@recruiting/db";

interface Company {
  id: number;
  name: string;
}

export function AddJobButton() {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("Targeted");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetch("/api/companies")
        .then((r) => r.json())
        .then((d) => setCompanies(d.data ?? []));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !title.trim()) return;
    setLoading(true);

    // Find existing company (case-insensitive) or create new one
    const match = companies.find(
      (c) => c.name.toLowerCase() === companyName.trim().toLowerCase()
    );
    let companyId = match?.id;

    if (!companyId) {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName.trim() }),
      });
      const data = await res.json();
      companyId = data.data.id;
    }

    await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        title: title.trim(),
        location: location.trim() || undefined,
        jobUrl: jobUrl.trim() || undefined,
        status,
        applicationDeadline: deadline
          ? new Date(deadline).toISOString()
          : null,
      }),
    });

    setLoading(false);
    setOpen(false);
    resetForm();
    router.refresh();
  }

  function resetForm() {
    setCompanyName("");
    setTitle("");
    setLocation("");
    setJobUrl("");
    setStatus("Targeted");
    setDeadline("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        + Add Job
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/20">
          <form
            onSubmit={handleSubmit}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-lg bg-card p-6 pb-safe shadow-xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <h2 className="text-lg font-semibold">Add Job</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input
                list="company-list"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="e.g. McKinsey & Company"
                required
              />
              <datalist id="company-list">
                {companies.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground mt-1">
                Type to search existing companies or enter a new one.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="e.g. Associate"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
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
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                placeholder="e.g. New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job Posting URL</label>
              <input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setOpen(false); resetForm(); }}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {loading ? "Saving…" : "Add Job"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

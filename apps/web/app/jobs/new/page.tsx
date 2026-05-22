"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleStatusEnum } from "@recruiting/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Company {
  id: number;
  name: string;
}

export default function NewJobPage() {
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
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => setCompanies(d.data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !title.trim()) return;
    setLoading(true);

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
        applicationDeadline: deadline ? new Date(deadline).toISOString() : null,
      }),
    });

    router.push("/jobs");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Jobs
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Add Job</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Company *</label>
          <input
            list="company-list"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="e.g. McKinsey & Company"
            required
          />
          <datalist id="company-list">
            {companies.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground mt-1">
            Type to search existing or enter a new company name.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Role Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="e.g. Associate"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Stage</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {roleStatusEnum.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Application Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. New York, NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Job Posting URL</label>
          <input
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className="w-full rounded-md border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/jobs"
            className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Saving…" : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

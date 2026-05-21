import type { DueStatus } from "@recruiting/types";

// ─── Date helpers ──────────────────────────────────────────────────────────────

export function getDueStatus(dueDate: Date): DueStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 7) return "this_week";
  return "upcoming";
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    date
  );
}

export function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

// ─── String helpers ────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Priority labels ───────────────────────────────────────────────────────────

export const PRIORITY_LABELS: Record<number, string> = {
  1: "High",
  2: "Medium",
  3: "Low",
};

export const ROLE_STATUS_COLORS: Record<string, string> = {
  Targeted: "bg-slate-100 text-slate-700",
  Networking: "bg-blue-100 text-blue-700",
  Applied: "bg-yellow-100 text-yellow-700",
  "Interview 1": "bg-orange-100 text-orange-700",
  "Interview 2": "bg-orange-200 text-orange-800",
  "Final Round": "bg-purple-100 text-purple-700",
  Offer: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
};

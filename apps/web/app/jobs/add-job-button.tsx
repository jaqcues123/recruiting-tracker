import Link from "next/link";

export function AddJobButton() {
  return (
    <Link
      href="/jobs/new"
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      + Add Job
    </Link>
  );
}

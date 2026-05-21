import { db } from "@/lib/db";
import { settings } from "@recruiting/db";
import { GoogleConnectButton } from "./google-connect-button";
import { ChecklistTemplateEditor } from "./checklist-template-editor";

export const dynamic = "force-dynamic";

const DEFAULT_CHECKLIST_ITEMS = [
  "Resume tailored",
  "Cover letter",
  "Networking outreach complete",
  "Application submitted",
  "Technical prep",
  "Behavioral prep",
  "Thank-you email",
];

export default async function SettingsPage() {
  const [userSettings] = await db.select().from(settings).limit(1);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your integrations and preferences.</p>
      </div>

      {/* Google Calendar */}
      <section className="rounded-lg border bg-card p-6 shadow-sm space-y-3">
        <h2 className="font-semibold">Google Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Sync your recruiting events to Google Calendar. This is optional — the internal
          calendar is always available.
        </p>
        <GoogleConnectButton connected={userSettings?.googleConnected ?? false} />
      </section>

      {/* Email notifications */}
      <section className="rounded-lg border bg-card p-6 shadow-sm space-y-3">
        <h2 className="font-semibold">Email Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Daily digest emails are sent at 7am via Inngest + Resend. Make sure{" "}
          <code className="text-xs bg-muted rounded px-1">RESEND_API_KEY</code> and{" "}
          <code className="text-xs bg-muted rounded px-1">INNGEST_EVENT_KEY</code> are set in your
          Vercel environment.
        </p>
      </section>

      {/* Default checklist template */}
      <section className="rounded-lg border bg-card p-6 shadow-sm space-y-3">
        <h2 className="font-semibold">Default Checklist Template</h2>
        <p className="text-sm text-muted-foreground">
          These items are auto-generated when you add a new role.
        </p>
        <ChecklistTemplateEditor defaultItems={DEFAULT_CHECKLIST_ITEMS} />
      </section>
    </div>
  );
}

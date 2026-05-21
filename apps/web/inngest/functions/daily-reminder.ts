import { inngest } from "../client";
import { db } from "@/lib/db";
import { checklistItems, contacts, roleChecklists, roles, companies } from "@recruiting/db";
import { and, asc, eq, isNotNull, lte } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.DIGEST_EMAIL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

export const dailyReminder = inngest.createFunction(
  { id: "daily-reminder-email", name: "Daily Reminder Email" },
  { cron: "0 7 * * *" },
  async ({ step }) => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [overdueTasks, todayTasks, followups] = await step.run("fetch-data", async () => {
      const overdue = await db
        .select({
          title: checklistItems.title,
          dueDate: checklistItems.dueDate,
          roleTitle: roles.title,
          companyName: companies.name,
        })
        .from(checklistItems)
        .innerJoin(roleChecklists, eq(checklistItems.checklistId, roleChecklists.id))
        .innerJoin(roles, eq(roleChecklists.roleId, roles.id))
        .leftJoin(companies, eq(roles.companyId, companies.id))
        .where(and(eq(checklistItems.completed, false), isNotNull(checklistItems.dueDate), lte(checklistItems.dueDate, now)))
        .orderBy(asc(checklistItems.dueDate));

      const today = await db
        .select({
          title: checklistItems.title,
          dueDate: checklistItems.dueDate,
          roleTitle: roles.title,
          companyName: companies.name,
        })
        .from(checklistItems)
        .innerJoin(roleChecklists, eq(checklistItems.checklistId, roleChecklists.id))
        .innerJoin(roles, eq(roleChecklists.roleId, roles.id))
        .leftJoin(companies, eq(roles.companyId, companies.id))
        .where(and(eq(checklistItems.completed, false), isNotNull(checklistItems.dueDate), lte(checklistItems.dueDate, todayEnd)))
        .orderBy(asc(checklistItems.dueDate));

      const fu = await db
        .select({ name: contacts.name, nextFollowup: contacts.nextFollowup })
        .from(contacts)
        .where(and(isNotNull(contacts.nextFollowup), lte(contacts.nextFollowup, weekEnd)));

      return { overdue, today, followups: fu };
    });

    if (overdueTasks.length === 0 && todayTasks.length === 0 && followups.length === 0) {
      return { skipped: true, reason: "nothing-due" };
    }

    await step.run("send-email", async () => {
      const lines: string[] = ["<h2>Your Daily Recruiting Digest</h2>"];

      if (overdueTasks.length > 0) {
        lines.push("<h3 style='color:red'>Overdue</h3><ul>");
        overdueTasks.forEach((t) => {
          lines.push(`<li><b>${t.title}</b> — ${t.companyName} / ${t.roleTitle}</li>`);
        });
        lines.push("</ul>");
      }

      if (todayTasks.length > 0) {
        lines.push("<h3>Due Today</h3><ul>");
        todayTasks.forEach((t) => {
          lines.push(`<li><b>${t.title}</b> — ${t.companyName} / ${t.roleTitle}</li>`);
        });
        lines.push("</ul>");
      }

      if (followups.length > 0) {
        lines.push("<h3>Follow-ups Due This Week</h3><ul>");
        followups.forEach((f) => {
          lines.push(`<li>${f.name}</li>`);
        });
        lines.push("</ul>");
      }

      await resend.emails.send({
        from: "recruiting@yourdomain.com",
        to: TO_EMAIL,
        subject: `Recruiting Digest — ${now.toDateString()}`,
        html: lines.join(""),
      });
    });

    return { sent: true };
  }
);

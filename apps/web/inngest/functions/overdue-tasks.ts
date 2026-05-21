import { inngest } from "../client";
import { db } from "@/lib/db";
import { checklistItems } from "@recruiting/db";
import { and, count, eq, isNotNull, lt } from "drizzle-orm";

// Runs every hour to pre-compute overdue count (could be used for a badge or alert)
export const overdueTasks = inngest.createFunction(
  { id: "overdue-task-recalculation", name: "Overdue Task Recalculation" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const result = await step.run("count-overdue", async () => {
      const [row] = await db
        .select({ count: count() })
        .from(checklistItems)
        .where(
          and(
            eq(checklistItems.completed, false),
            isNotNull(checklistItems.dueDate),
            lt(checklistItems.dueDate, new Date())
          )
        );
      return row.count;
    });

    return { overdueCount: result };
  }
);

import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { dailyReminder } from "@/inngest/functions/daily-reminder";
import { overdueTasks } from "@/inngest/functions/overdue-tasks";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyReminder, overdueTasks],
});

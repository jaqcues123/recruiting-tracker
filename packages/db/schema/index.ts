import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── companies ────────────────────────────────────────────────────────────────
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── roles ────────────────────────────────────────────────────────────────────
export const roleStatusEnum = [
  "Targeted",
  "Networking",
  "Applied",
  "Interview 1",
  "Interview 2",
  "Final Round",
  "Offer",
  "Closed",
] as const;
export type RoleStatus = (typeof roleStatusEnum)[number];

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  jobUrl: text("job_url"),
  status: varchar("status", { length: 50 }).notNull().default("Targeted"),
  priority: integer("priority").default(3), // 1=high, 2=med, 3=low
  applicationDeadline: timestamp("application_deadline"),
  notes: text("notes"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── role_checklists ──────────────────────────────────────────────────────────
export const roleChecklists = pgTable("role_checklists", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  templateName: varchar("template_name", { length: 100 }).default("Default"),
});

// ─── checklist_items ──────────────────────────────────────────────────────────
export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id")
    .notNull()
    .references(() => roleChecklists.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// ─── contacts ─────────────────────────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  // Optional: ties a contact to a specific role (role-specific networking)
  roleId: integer("role_id").references(() => roles.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  email: varchar("email", { length: 255 }),
  linkedinUrl: text("linkedin_url"),
  relationshipStrength: integer("relationship_strength").default(1), // 1–5
  notes: text("notes"),
  lastContacted: timestamp("last_contacted"),
  nextFollowup: timestamp("next_followup"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── interactions ─────────────────────────────────────────────────────────────
export const interactionTypeEnum = [
  "email",
  "call",
  "coffee_chat",
  "linkedin",
  "event",
  "other",
] as const;
export type InteractionType = (typeof interactionTypeEnum)[number];

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull().default("other"),
  notes: text("notes"),
  interactionDate: timestamp("interaction_date").defaultNow().notNull(),
  nextFollowup: timestamp("next_followup"),
});

// ─── events ───────────────────────────────────────────────────────────────────
export const eventTypeEnum = [
  "phone_screen",
  "case_interview",
  "final_round",
  "networking",
  "deadline",
  "milestone",
  "note",
  "info_session",
  // legacy values kept for backward compat
  "interview",
  "reminder",
  "followup",
  "other",
] as const;
export type EventType = (typeof eventTypeEnum)[number];

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull().default("other"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  notes: text("notes"),
  externalCalendarId: text("external_calendar_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── reminders ────────────────────────────────────────────────────────────────
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  sourceType: varchar("source_type", { length: 50 }).notNull(), // "task" | "contact" | "event"
  sourceId: integer("source_id").notNull(),
  sendAt: timestamp("send_at").notNull(),
  sent: boolean("sent").default(false).notNull(),
});

// ─── settings ─────────────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  googleConnected: boolean("google_connected").default(false).notNull(),
  googleRefreshToken: text("google_refresh_token"),
  notificationPreferences: text("notification_preferences").default("{}"),
});

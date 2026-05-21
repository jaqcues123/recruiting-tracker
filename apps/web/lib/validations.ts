import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export const roleSchema = z.object({
  companyId: z.number().int(),
  title: z.string().min(1, "Role title is required"),
  location: z.string().optional(),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.string().default("Targeted"),
  priority: z.number().int().min(1).max(3).default(3),
  applicationDeadline: z.string().datetime().nullish(),
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  companyId: z.number().int().optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  linkedinUrl: z.string().optional(),
  relationshipStrength: z.number().int().min(1).max(5).default(1),
  notes: z.string().optional(),
  nextFollowup: z.string().datetime().nullish(),
});

export const checklistItemSchema = z.object({
  checklistId: z.number().int(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullish(),
  sortOrder: z.number().int().default(0),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;

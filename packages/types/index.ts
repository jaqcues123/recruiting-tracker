// Re-export schema enums for use across the app
export type { RoleStatus, InteractionType, EventType } from "@recruiting/db";

// ─── API response shapes ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Company ───────────────────────────────────────────────────────────────────

export interface CompanyWithRoleSummary {
  id: number;
  name: string;
  industry: string | null;
  notes: string | null;
  roleCount: number;
  activeRoleCount: number;
  createdAt: Date;
}

// ─── Role ──────────────────────────────────────────────────────────────────────

export interface RoleWithCompany {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  location: string | null;
  jobUrl: string | null;
  status: string;
  priority: number | null;
  applicationDeadline: Date | null;
  notes: string | null;
  archived: boolean;
  createdAt: Date;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  rolesTargeted: number;
  applicationsSubmitted: number;
  interviewsCompleted: number;
  networkingCalls: number;
  overdueTasks: number;
  responseRate: number;
}

// ─── Due Outs ──────────────────────────────────────────────────────────────────

export type DueStatus = "overdue" | "today" | "this_week" | "upcoming";

export interface DueOutItem {
  id: number;
  title: string;
  dueDate: Date;
  status: DueStatus;
  roleId: number | null;
  roleTitle: string | null;
  companyName: string | null;
}

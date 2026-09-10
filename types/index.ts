// ============================================================
// HRMS — Shared TypeScript Types & Enums
// All business types are defined here and imported across the app
// ============================================================

// ── Data Scopes ──────────────────────────────────────────────
export enum DataScope {
  SELF = 'SELF',
  DIRECT_REPORTS = 'DIRECT_REPORTS',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  LOCATION = 'LOCATION',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  ORGANIZATION = 'ORGANIZATION',
  GLOBAL = 'GLOBAL',
}

// ── Permission Actions ────────────────────────────────────────
export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  CANCEL = 'CANCEL',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  ASSIGN = 'ASSIGN',
  REASSIGN = 'REASSIGN',
  PROCESS = 'PROCESS',
  FINALIZE = 'FINALIZE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  CONFIGURE = 'CONFIGURE',
  PUBLISH = 'PUBLISH',
  ARCHIVE = 'ARCHIVE',
}

// ── System Role Slugs ─────────────────────────────────────────
export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  GLOBAL_ADMIN = 'global_admin',
  HR_ADMIN = 'hr_admin',
  HR_EXECUTIVE = 'hr_executive',
  HR_MANAGER = 'hr_manager',
  PAYROLL_ADMIN = 'payroll_admin',
  PAYROLL_MANAGER = 'payroll_manager',
  ATTENDANCE_ADMIN = 'attendance_admin',
  PERFORMANCE_ADMIN = 'performance_admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  PROJECT_ADMIN = 'project_admin',
  ASSET_MANAGER = 'asset_manager',
  EXPENSE_MANAGER = 'expense_manager',
  TRAVEL_DESK_MANAGER = 'travel_desk_manager',
  FINANCE = 'finance',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

// ── Employee Status ───────────────────────────────────────────
export enum EmployeeStatus {
  PREBOARDING = 'PREBOARDING',
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
  ABSCONDED = 'ABSCONDED',
}

// ── Employee History Event Types ──────────────────────────────
export enum EmployeeHistoryEvent {
  HIRE = 'HIRE',
  PROMOTION = 'PROMOTION',
  TRANSFER = 'TRANSFER',
  DEPARTMENT_CHANGE = 'DEPARTMENT_CHANGE',
  DESIGNATION_CHANGE = 'DESIGNATION_CHANGE',
  MANAGER_CHANGE = 'MANAGER_CHANGE',
  LOCATION_CHANGE = 'LOCATION_CHANGE',
  SALARY_REVISION = 'SALARY_REVISION',
  CONFIRMATION = 'CONFIRMATION',
  RESIGNATION = 'RESIGNATION',
  TERMINATION = 'TERMINATION',
  REHIRE = 'REHIRE',
  STATUS_CHANGE = 'STATUS_CHANGE',
}

// ── Workflow Status ───────────────────────────────────────────
export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  ON_HOLD = 'ON_HOLD',
}

// ── Approval Step Status ──────────────────────────────────────
export enum ApprovalStepStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
  DELEGATED = 'DELEGATED',
}

// ── Policy Types ──────────────────────────────────────────────
export enum PolicyType {
  LEAVE = 'LEAVE',
  ATTENDANCE = 'ATTENDANCE',
  EXPENSE = 'EXPENSE',
  TRAVEL = 'TRAVEL',
  PAYROLL = 'PAYROLL',
  OVERTIME = 'OVERTIME',
  WFH = 'WFH',
  SHIFT = 'SHIFT',
  PROBATION = 'PROBATION',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
}

// ── Subscription Status ───────────────────────────────────────
export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// ── Audit Action Types ────────────────────────────────────────
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  FINALIZE = 'FINALIZE',
}

// ── API Response Types ────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── Pagination Query ──────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Session User ──────────────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isSuperAdmin: boolean;
  organizationId?: string;
  organizationName?: string;
  roles: string[];          // role slugs
  permissions: string[];    // "MODULE:SUBMODULE:ACTION" strings
}

// ── Navigation Types ──────────────────────────────────────────
export interface NavItem {
  id: string;
  slug: string;
  label: string;
  icon: string;
  href: string;
  children?: NavItem[];
  badge?: number;
}

// ── Dashboard Stat ────────────────────────────────────────────
export interface DashboardStat {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

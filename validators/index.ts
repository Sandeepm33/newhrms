// ============================================================
// HRMS — Zod Validators
// Shared between frontend (form validation) and backend (API)
// ============================================================

import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationId: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  organizationName: z.string().min(2, 'Organization name is required'),
  country: z.string().default('India'),
});

// ── Organization ──────────────────────────────────────────────
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  country: z.string().default('India'),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  gstin: z.string().optional(),
  pan: z.string().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ── Employee ──────────────────────────────────────────────────
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Invalid email').optional(),
  workEmail: z.string().email('Invalid work email').optional(),
  employeeCode: z.string().optional(),
  joiningDate: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  locationId: z.string().optional(),
  reportingManagerId: z.string().optional(),
  employmentTypeId: z.string().optional(),
  businessUnitId: z.string().optional(),
  legalEntityId: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// ── Department ────────────────────────────────────────────────
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  headEmployeeId: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

// ── Location ──────────────────────────────────────────────────
export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  code: z.string().optional(),
  type: z.enum(['OFFICE', 'BRANCH', 'REMOTE', 'WAREHOUSE', 'FACTORY']).optional(),
  timezone: z.string().default('Asia/Kolkata'),
  isHQ: z.boolean().default(false),
  address: z
    .object({
      line1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
});

// ── Designation ───────────────────────────────────────────────
export const createDesignationSchema = z.object({
  name: z.string().min(1, 'Designation name is required'),
  code: z.string().optional(),
  level: z.number().min(1).max(20).optional(),
  departmentId: z.string().optional(),
});

// ── Role ──────────────────────────────────────────────────────
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  parentRoleId: z.string().optional(),
});

// ── Pagination ────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

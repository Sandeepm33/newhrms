// ============================================================
// HRMS — Employee Service
// Business logic — calls repository, applies rules, logs audits
// ============================================================

import connectDB from '@/lib/mongodb';
import { logAudit } from '@/lib/audit';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { AuditAction, EmployeeHistoryEvent } from '@/types';
import {
  findEmployees,
  findEmployeeById,
  createEmployee,
  updateEmployee,
  softDeleteEmployee,
  countEmployeesByStatus,
} from '@/repositories/employeeRepository';
import type { CreateEmployeeInput } from '@/validators';
import type { SessionUser } from '@/types';

export async function listEmployees(
  user: SessionUser,
  options: {
    page: number; limit: number; skip: number;
    search: string; sortBy: string; sortOrder: 1 | -1;
    departmentId?: string; locationId?: string; status?: string;
  }
) {
  await connectDB();
  return findEmployees(user.organizationId!, options);
}

export async function getEmployee(user: SessionUser, employeeId: string) {
  await connectDB();
  const employee = await findEmployeeById(employeeId, user.organizationId!);
  if (!employee) throw new NotFoundError('Employee');
  return employee;
}

export async function addEmployee(user: SessionUser, data: CreateEmployeeInput) {
  await connectDB();
  const { Employee } = await import('@/models/Employee');
  const orgId = user.organizationId!;

  if (data.employeeCode) {
    const existing = await Employee.findOne({ organizationId: orgId, employeeCode: data.employeeCode });
    if (existing) throw new ConflictError(`Employee code "${data.employeeCode}" already exists`);
  }

  if (data.workEmail) {
    const { EmployeeContact } = await import('@/models/Employee');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingContact = await EmployeeContact.findOne({
      organizationId: orgId,
      workEmail: data.workEmail.toLowerCase(),
    } as any);
    if (existingContact) throw new ConflictError(`Work email "${data.workEmail}" is already in use`);
  }

  const employeeId = await createEmployee(orgId, data, user.id);

  await logAudit({
    organizationId: orgId,
    userId: user.id,
    userEmail: user.email,
    action: AuditAction.CREATE,
    module: 'employees',
    submodule: 'employee-directory',
    recordId: employeeId,
    recordType: 'Employee',
    after: { name: `${data.firstName} ${data.lastName}`, code: data.employeeCode },
  });

  return { employeeId };
}

export async function editEmployee(
  user: SessionUser,
  employeeId: string,
  data: Partial<CreateEmployeeInput>
) {
  await connectDB();
  const orgId = user.organizationId!;

  const before = await findEmployeeById(employeeId, orgId);
  if (!before) throw new NotFoundError('Employee');

  const updated = await updateEmployee(employeeId, orgId, data, user.id);
  if (!updated) throw new NotFoundError('Employee');

  const hasOrgChange = data.departmentId ?? data.designationId ?? data.locationId ?? data.reportingManagerId;

  if (hasOrgChange) {
    const { EmployeeHistory } = await import('@/models/Employee');
    await EmployeeHistory.create({
      employeeId,
      organizationId: orgId,
      eventType: EmployeeHistoryEvent.TRANSFER,
      effectiveDate: new Date(),
      from: before as Record<string, unknown>,
      to: data as Record<string, unknown>,
      approvedBy: user.id,
      remarks: 'Updated via employee profile edit',
    });
  }

  await logAudit({
    organizationId: orgId,
    userId: user.id,
    userEmail: user.email,
    action: AuditAction.UPDATE,
    module: 'employees',
    submodule: 'employee-directory',
    recordId: employeeId,
    recordType: 'Employee',
    before: before as Record<string, unknown>,
    after: data as Record<string, unknown>,
  });

  return { success: true };
}

export async function removeEmployee(user: SessionUser, employeeId: string) {
  await connectDB();
  const orgId = user.organizationId!;

  const employee = await findEmployeeById(employeeId, orgId);
  if (!employee) throw new NotFoundError('Employee');

  await softDeleteEmployee(employeeId, orgId);

  await logAudit({
    organizationId: orgId,
    userId: user.id,
    userEmail: user.email,
    action: AuditAction.DELETE,
    module: 'employees',
    submodule: 'employee-directory',
    recordId: employeeId,
    recordType: 'Employee',
    before: employee as Record<string, unknown>,
  });

  return { success: true };
}

export async function getEmployeeStats(user: SessionUser) {
  await connectDB();
  const orgId = user.organizationId!;

  const statusCounts = await countEmployeesByStatus(orgId);
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const active = statusCounts['ACTIVE'] ?? 0;
  const onProbation = statusCounts['PROBATION'] ?? 0;
  const onNotice = statusCounts['NOTICE_PERIOD'] ?? 0;

  const { Employee } = await import('@/models/Employee');
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newHires = await Employee.countDocuments({
    organizationId: orgId,
    joiningDate: { $gte: startOfMonth },
    isActive: true,
  });

  return { total, active, onProbation, onNotice, newHiresThisMonth: newHires, statusBreakdown: statusCounts };
}

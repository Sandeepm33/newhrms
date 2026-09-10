// ============================================================
// HRMS — Employee [id] API Route
// GET    /api/employees/:id — get single employee
// PATCH  /api/employees/:id — update employee
// DELETE /api/employees/:id — soft delete
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/permissions';
import { getOrgIdFromSession } from '@/lib/tenant';
import { updateEmployeeSchema } from '@/validators';
import { getEmployee, editEmployee, removeEmployee } from '@/services/employeeService';
import type { SessionUser } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'employees', 'VIEW', 'employee-directory');
    getOrgIdFromSession(user);

    const employee = await getEmployee(user, id);
    return successResponse(employee, 'Employee retrieved');
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'employees', 'EDIT', 'employee-directory');
    getOrgIdFromSession(user);

    const body = await req.json() as unknown;
    const data = updateEmployeeSchema.parse(body);

    const result = await editEmployee(user, id, data);
    return successResponse(result, 'Employee updated successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'employees', 'DELETE', 'employee-directory');
    getOrgIdFromSession(user);

    const result = await removeEmployee(user, id);
    return successResponse(result, 'Employee deactivated successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

// ============================================================
// HRMS — Employees API Route
// GET  /api/employees  — list with pagination, search, filter
// POST /api/employees  — create employee
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError, parsePaginationQuery, buildPagination } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/permissions';
import { getOrgIdFromSession } from '@/lib/tenant';
import { createEmployeeSchema } from '@/validators';
import { listEmployees, addEmployee } from '@/services/employeeService';
import type { SessionUser } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'employees', 'VIEW', 'employee-directory');
    getOrgIdFromSession(user); // validates org context

    const { searchParams } = req.nextUrl;
    const pagination = parsePaginationQuery(searchParams);

    const { employees, total } = await listEmployees(user, {
      ...pagination,
      departmentId: searchParams.get('departmentId') ?? undefined,
      locationId: searchParams.get('locationId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    });

    return successResponse(
      employees,
      'Employees retrieved',
      200,
      buildPagination(pagination.page, pagination.limit, total)
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'employees', 'CREATE', 'employee-directory');
    getOrgIdFromSession(user);

    const body = await req.json() as unknown;
    const data = createEmployeeSchema.parse(body);

    const result = await addEmployee(user, data);

    return successResponse(result, 'Employee created successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

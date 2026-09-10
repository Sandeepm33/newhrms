import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError, parsePaginationQuery, buildPagination } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/permissions';
import { getOrgIdFromSession, withTenantFilter } from '@/lib/tenant';
import { createDepartmentSchema } from '@/validators';
import connectDB from '@/lib/mongodb';
import { AuditAction } from '@/types';
import type { SessionUser } from '@/types';
import type { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    requirePermission(user, 'organization', 'VIEW', 'departments');
    const orgId = getOrgIdFromSession(user);

    await connectDB();
    const { Department } = await import('@/models/OrgStructure');
    const { searchParams } = req.nextUrl;
    const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(searchParams);

    const filter = withTenantFilter({ isActive: true } as Record<string, unknown>, orgId);
    if (search) {
      (filter as Record<string, unknown>)['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryFilter = filter as any;

    const [data, total] = await Promise.all([
      Department.find(queryFilter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Department.countDocuments(queryFilter),
    ]);

    return successResponse(data, 'Departments retrieved', 200, buildPagination(page, limit, total));
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
    requirePermission(user, 'organization', 'CREATE', 'departments');
    const orgId = getOrgIdFromSession(user);

    await connectDB();
    const { Department } = await import('@/models/OrgStructure');
    const { logAudit } = await import('@/lib/audit');

    const body = await req.json() as unknown;
    const data = createDepartmentSchema.parse(body);

    const dept = await Department.create({ ...data, organizationId: orgId, createdBy: user.id });
    const deptId = dept._id as Types.ObjectId;

    await logAudit({
      organizationId: orgId,
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.CREATE,
      module: 'organization',
      submodule: 'departments',
      recordId: deptId.toString(),
      recordType: 'Department',
      after: { name: dept.name },
    });

    return successResponse(dept, 'Department created', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

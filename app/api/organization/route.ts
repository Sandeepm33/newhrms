import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectDB from '@/lib/mongodb';
import type { SessionUser } from '@/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }
    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectDB();
    const { Organization } = await import('@/models/Organization');
    const { Department, Location, Designation } = await import('@/models/OrgStructure');
    const { Employee } = await import('@/models/Employee');

    const org = await Organization.findById(orgId).lean();
    if (!org) {
      return handleApiError({ statusCode: 404, message: 'Organization not found', code: 'NOT_FOUND' });
    }

    const [deptCount, locCount, desigCount, empCount] = await Promise.all([
      Department.countDocuments({ organizationId: orgId, isActive: true }),
      Location.countDocuments({ organizationId: orgId, isActive: true }),
      Designation.countDocuments({ organizationId: orgId, isActive: true }),
      Employee.countDocuments({ organizationId: orgId, isActive: true }),
    ]);

    return successResponse(
      {
        ...org,
        stats: {
          departments: deptCount,
          locations: locCount,
          designations: desigCount,
          employees: empCount,
        },
      },
      'Organization details retrieved'
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }
    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectDB();
    const { Organization } = await import('@/models/Organization');
    const body = (await req.json()) as Record<string, unknown>;

    const updated = await Organization.findByIdAndUpdate(orgId, { $set: body }, { new: true }).lean();

    return successResponse(updated, 'Organization updated successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

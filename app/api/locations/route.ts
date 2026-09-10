import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError, parsePaginationQuery, buildPagination } from '@/lib/apiResponse';
import { getOrgIdFromSession, withTenantFilter } from '@/lib/tenant';
import connectDB from '@/lib/mongodb';
import type { SessionUser } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);
    await connectDB();
    const { Location } = await import('@/models/OrgStructure');
    const { searchParams } = req.nextUrl;
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationQuery(searchParams);
    const filter = withTenantFilter({ isActive: true } as Record<string, unknown>, orgId);
    const [data, total] = await Promise.all([
      Location.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      Location.countDocuments(filter),
    ]);
    return successResponse(data, 'Locations retrieved', 200, buildPagination(page, limit, total));
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);
    await connectDB();
    const { Location } = await import('@/models/OrgStructure');
    const body = await req.json() as Record<string, unknown>;
    const loc = await Location.create({ ...body, organizationId: orgId });
    return successResponse(loc, 'Location created', 201);
  } catch (err) { return handleApiError(err); }
}

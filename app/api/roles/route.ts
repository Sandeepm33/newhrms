// ============================================================
// HRMS — Roles & Permissions API Route
// GET  /api/roles — list system and organization roles
// POST /api/roles — create custom role
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { Role, UserRole } from '@/models';
import type { SessionUser } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    const roles = await Role.find({
      $or: [{ organizationId: orgId }, { isSystem: true }],
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Calculate user assignments count per role
    const userRoleCounts = await UserRole.aggregate([
      { $match: { organizationId: orgId, isActive: true } },
      { $group: { _id: '$roleId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    userRoleCounts.forEach((rc) => countMap.set(rc._id.toString(), rc.count));

    const formattedRoles = roles.map((r) => ({
      ...r,
      assignedUsersCount: countMap.get(r._id.toString()) || (r.isSystem ? 1 : 0),
    }));

    return successResponse(formattedRoles, 'Roles retrieved', 200);
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
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    const body = await req.json();
    const { name, description, color } = body as {
      name: string;
      description?: string;
      color?: string;
    };

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const newRole = new Role({
      organizationId: orgId,
      name,
      slug,
      description,
      color: color || '#6366f1',
      isSystem: false,
      isActive: true,
    });

    await newRole.save();

    return successResponse(newRole, 'Custom role created successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

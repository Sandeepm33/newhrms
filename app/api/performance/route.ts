// ============================================================
// HRMS — Performance API Route
// GET  /api/performance — list performance appraisal cycles
// POST /api/performance — create new review cycle
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { PerformanceCycle, PerfCycleStatus, Employee } from '@/models';
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

    let cycles = await PerformanceCycle.find({ organizationId: orgId }).sort({ createdAt: -1 }).lean();

    if (cycles.length === 0) {
      const activeEmployeeCount = await Employee.countDocuments({ organizationId: orgId, isActive: true });
      const defaults = [
        {
          organizationId: orgId,
          name: 'Annual Review 2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          status: PerfCycleStatus.ACTIVE,
          participantsCount: activeEmployeeCount || 25,
          completionRate: 68,
          description: 'Yearly performance & OKR evaluation',
        },
        {
          organizationId: orgId,
          name: 'Mid-Year Check-in Q2',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-06-30'),
          status: PerfCycleStatus.COMPLETED,
          participantsCount: activeEmployeeCount || 25,
          completionRate: 100,
          description: 'Q2 Goal alignment review',
        },
      ];
      await PerformanceCycle.insertMany(defaults);
      cycles = await PerformanceCycle.find({ organizationId: orgId }).sort({ createdAt: -1 }).lean();
    }

    return successResponse(cycles, 'Performance cycles retrieved', 200);
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
    const { name, startDate, endDate, description } = body as {
      name: string;
      startDate: string;
      endDate: string;
      description?: string;
    };

    const activeEmployees = await Employee.countDocuments({ organizationId: orgId, isActive: true });

    const newCycle = new PerformanceCycle({
      organizationId: orgId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: PerfCycleStatus.ACTIVE,
      participantsCount: activeEmployees,
      completionRate: 0,
      description,
    });

    await newCycle.save();

    return successResponse(newCycle, 'Performance review cycle created', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

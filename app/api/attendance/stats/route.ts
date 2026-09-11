// ============================================================
// HRMS — Attendance Stats API Route
// GET /api/attendance/stats — stats for today's workforce
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { Attendance, AttendanceStatus, Employee } from '@/models';
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

    const totalEmployees = await Employee.countDocuments({ organizationId: orgId, isActive: true });

    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const todayAttendances = await Attendance.find({
      organizationId: orgId,
      date: todayMidnight,
    }).lean();

    const presentCount = todayAttendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
    ).length;

    const lateCount = todayAttendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const onLeaveCount = todayAttendances.filter((a) => a.status === AttendanceStatus.ON_LEAVE).length;
    const absentCount = Math.max(0, totalEmployees - presentCount - onLeaveCount);

    const stats = {
      totalEmployees,
      presentCount,
      lateCount,
      onLeaveCount,
      absentCount,
      attendancePercentage: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0,
    };

    return successResponse(stats, 'Attendance stats retrieved', 200);
  } catch (err) {
    return handleApiError(err);
  }
}

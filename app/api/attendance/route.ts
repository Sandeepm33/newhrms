// ============================================================
// HRMS — Attendance API Route
// GET  /api/attendance — list attendance logs
// POST /api/attendance — clock in / clock out / regularization
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { Attendance, AttendanceStatus, Employee, EmployeePersonal } from '@/models';
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

    const { searchParams } = req.nextUrl;
    const dateParam = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    const filter: Record<string, unknown> = { organizationId: orgId };

    if (dateParam) {
      const targetDate = new Date(dateParam);
      const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    const attendances = await Attendance.find(filter)
      .sort({ date: -1, clockIn: -1 })
      .lean();

    // Populate employee details
    const employeeIds = Array.from(new Set(attendances.map((a) => a.employeeId.toString())));
    const employees = await Employee.find({ _id: { $in: employeeIds } }).lean();
    const personals = await EmployeePersonal.find({ employeeId: { $in: employeeIds } }).lean();

    const empMap = new Map();
    employees.forEach((emp) => {
      const p = personals.find((pers) => pers.employeeId.toString() === emp._id.toString());
      empMap.set(emp._id.toString(), {
        code: emp.employeeCode,
        name: p ? `${p.firstName} ${p.lastName}` : 'Employee',
      });
    });

    const formatted = attendances.map((att) => ({
      ...att,
      employee: empMap.get(att.employeeId.toString()) || { code: 'N/A', name: 'Unknown' },
    }));

    return successResponse(formatted, 'Attendance records retrieved', 200);
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
    const { action, notes, location } = body as {
      action: 'CLOCK_IN' | 'CLOCK_OUT' | 'REGULARIZATION';
      notes?: string;
      location?: { lat?: number; lng?: number; address?: string };
    };

    // Find current employee profile linked to user session or fallback to admin employee
    let employee = await Employee.findOne({ organizationId: orgId, userId: user.id }).lean();
    if (!employee) {
      employee = await Employee.findOne({ organizationId: orgId }).lean();
    }

    if (!employee) {
      return handleApiError({ statusCode: 400, message: 'No employee record linked to user session', code: 'NO_EMPLOYEE' });
    }

    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let attendance = await Attendance.findOne({
      organizationId: orgId,
      employeeId: employee._id,
      date: todayMidnight,
    });

    if (action === 'CLOCK_IN') {
      if (attendance && attendance.clockIn) {
        return handleApiError({ statusCode: 400, message: 'Already clocked in for today', code: 'ALREADY_CLOCKED_IN' });
      }

      const isLate = now.getHours() > 10; // Simple threshold e.g. 10 AM

      if (!attendance) {
        attendance = new Attendance({
          organizationId: orgId,
          employeeId: employee._id,
          date: todayMidnight,
          clockIn: now,
          status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          notes,
          location,
        });
      } else {
        attendance.clockIn = now;
        attendance.status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
      }
      await attendance.save();
      return successResponse(attendance, 'Clocked in successfully', 200);
    }

    if (action === 'CLOCK_OUT') {
      if (!attendance || !attendance.clockIn) {
        return handleApiError({ statusCode: 400, message: 'Must clock in before clocking out', code: 'NOT_CLOCKED_IN' });
      }

      attendance.clockOut = now;
      const diffMs = now.getTime() - new Date(attendance.clockIn).getTime();
      attendance.totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

      await attendance.save();
      return successResponse(attendance, 'Clocked out successfully', 200);
    }

    return handleApiError({ statusCode: 400, message: 'Invalid action', code: 'BAD_REQUEST' });
  } catch (err) {
    return handleApiError(err);
  }
}

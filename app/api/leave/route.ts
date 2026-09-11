// ============================================================
// HRMS — Leave Management API Route
// GET   /api/leave — list leave requests & balances
// POST  /api/leave — submit new leave request
// PATCH /api/leave — approve, reject, or cancel leave request
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { LeaveRequest, LeaveType, LeaveBalance, LeaveStatus, Employee, EmployeePersonal } from '@/models';
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
    const status = searchParams.get('status');

    // Ensure system default leave types exist for this organization
    let leaveTypes = await LeaveType.find({ organizationId: orgId }).lean();
    if (leaveTypes.length === 0) {
      const defaults = [
        { name: 'Casual Leave', code: 'CL', daysPerYear: 12, isPaid: true },
        { name: 'Sick Leave', code: 'SL', daysPerYear: 10, isPaid: true },
        { name: 'Earned Leave', code: 'EL', daysPerYear: 15, isPaid: true },
        { name: 'Maternity / Paternity', code: 'ML', daysPerYear: 90, isPaid: true },
      ];
      await LeaveType.insertMany(defaults.map((d) => ({ ...d, organizationId: orgId })));
      leaveTypes = await LeaveType.find({ organizationId: orgId }).lean();
    }

    const filter: Record<string, unknown> = { organizationId: orgId };
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 }).lean();

    // Populate employee & leave type details
    const employeeIds = Array.from(new Set(requests.map((r) => r.employeeId.toString())));
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

    const leaveTypeMap = new Map();
    leaveTypes.forEach((lt) => leaveTypeMap.set(lt._id.toString(), lt));

    const formattedRequests = requests.map((r) => ({
      ...r,
      employee: empMap.get(r.employeeId.toString()) || { code: 'N/A', name: 'Unknown' },
      leaveType: leaveTypeMap.get(r.leaveTypeId.toString()) || { name: 'Leave', code: 'LV' },
    }));

    // Find current employee for leave balances
    let currentEmployee = await Employee.findOne({ organizationId: orgId, userId: user.id }).lean();
    if (!currentEmployee) {
      currentEmployee = await Employee.findOne({ organizationId: orgId }).lean();
    }

    let balances: unknown[] = [];
    if (currentEmployee) {
      const currentYear = new Date().getFullYear();
      balances = await LeaveBalance.find({
        organizationId: orgId,
        employeeId: currentEmployee._id,
        year: currentYear,
      }).lean();

      // Seed default balances if missing
      if (balances.length === 0 && leaveTypes.length > 0) {
        const seedBalances = leaveTypes.map((lt) => ({
          organizationId: orgId,
          employeeId: currentEmployee!._id,
          leaveTypeId: lt._id,
          year: currentYear,
          allocatedDays: lt.daysPerYear,
          usedDays: 0,
          pendingDays: 0,
          remainingDays: lt.daysPerYear,
        }));
        await LeaveBalance.insertMany(seedBalances);
        balances = await LeaveBalance.find({
          organizationId: orgId,
          employeeId: currentEmployee._id,
          year: currentYear,
        }).lean();
      }
    }

    const formattedBalances = balances.map((b: any) => ({
      ...b,
      leaveType: leaveTypeMap.get(b.leaveTypeId.toString()) || { name: 'Leave', code: 'LV' },
    }));

    return successResponse(
      { requests: formattedRequests, balances: formattedBalances, leaveTypes },
      'Leave data retrieved successfully',
      200
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
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    const body = await req.json();
    const { leaveTypeId, startDate, endDate, reason, isHalfDay, halfDaySession } = body as {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
      isHalfDay?: boolean;
      halfDaySession?: 'FIRST_HALF' | 'SECOND_HALF';
    };

    let employee = await Employee.findOne({ organizationId: orgId, userId: user.id }).lean();
    if (!employee) {
      employee = await Employee.findOne({ organizationId: orgId }).lean();
    }

    if (!employee) {
      return handleApiError({ statusCode: 400, message: 'No employee record found', code: 'NO_EMPLOYEE' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (isHalfDay) totalDays = 0.5;

    const newRequest = new LeaveRequest({
      organizationId: orgId,
      employeeId: employee._id,
      leaveTypeId,
      startDate: start,
      endDate: end,
      totalDays,
      isHalfDay: !!isHalfDay,
      halfDaySession,
      reason,
      status: LeaveStatus.PENDING,
    });

    await newRequest.save();

    return successResponse(newRequest, 'Leave request submitted successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    const body = await req.json();
    const { requestId, status, rejectionReason } = body as {
      requestId: string;
      status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
      rejectionReason?: string;
    };

    const leaveReq = await LeaveRequest.findOne({ _id: requestId, organizationId: orgId });
    if (!leaveReq) {
      return handleApiError({ statusCode: 444, message: 'Leave request not found', code: 'NOT_FOUND' });
    }

    leaveReq.status = status as LeaveStatus;
    if (rejectionReason) leaveReq.rejectionReason = rejectionReason;

    await leaveReq.save();

    // If approved, update LeaveBalance
    if (status === 'APPROVED') {
      const year = new Date(leaveReq.startDate).getFullYear();
      await LeaveBalance.updateOne(
        { organizationId: orgId, employeeId: leaveReq.employeeId, leaveTypeId: leaveReq.leaveTypeId, year },
        {
          $inc: {
            usedDays: leaveReq.totalDays,
            remainingDays: -leaveReq.totalDays,
          },
        }
      );
    }

    return successResponse(leaveReq, `Leave request ${status.toLowerCase()} successfully`, 200);
  } catch (err) {
    return handleApiError(err);
  }
}

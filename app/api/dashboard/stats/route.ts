// ============================================================
// HRMS — Dashboard Stats API
// All counts from real MongoDB aggregation — never hardcoded
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import type { SessionUser } from '@/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    await connectDB();

    if (user.isSuperAdmin) {
      const { Organization } = await import('@/models/Organization');
      const { User } = await import('@/models/User');
      const { Employee } = await import('@/models/Employee');

      const [totalOrgs, activeOrgs, totalUsers, totalEmployees] = await Promise.all([
        Organization.countDocuments({}),
        Organization.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true }),
        Employee.countDocuments({ isActive: true }),
      ]);

      return successResponse({
        role: 'SUPER_ADMIN',
        stats: [
          { label: 'Total Organizations', value: totalOrgs, icon: 'Building2', color: 'blue' },
          { label: 'Active Organizations', value: activeOrgs, icon: 'CheckCircle', color: 'green' },
          { label: 'Platform Users', value: totalUsers, icon: 'Users', color: 'purple' },
          { label: 'Total Employees', value: totalEmployees, icon: 'UserCheck', color: 'orange' },
        ],
      }, 'Dashboard stats loaded');
    }

    const orgId = getOrgIdFromSession(user);
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const { Employee } = await import('@/models/Employee');

    const employeeStats = await Employee.aggregate([
      { $match: { organizationId: orgObjectId, isActive: true } },
      {
        $facet: {
          total: [{ $count: 'n' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          newThisMonth: [
            {
              $match: {
                joiningDate: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
            { $count: 'n' },
          ],
          byDepartment: [
            { $group: { _id: '$departmentId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'departments',
                localField: '_id',
                foreignField: '_id',
                as: 'dept',
              },
            },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            { $project: { name: '$dept.name', count: 1 } },
          ],
        },
      },
    ]);

    const stats = employeeStats[0] as {
      total?: [{ n: number }];
      byStatus?: Array<{ _id: string; count: number }>;
      newThisMonth?: [{ n: number }];
      byDepartment?: Array<{ name?: string; count: number }>;
    } | undefined;

    const totalEmployees = stats?.total?.[0]?.n ?? 0;
    const activeCount = stats?.byStatus?.find((s) => s._id === 'ACTIVE')?.count ?? 0;
    const newHires = stats?.newThisMonth?.[0]?.n ?? 0;

    const isManager = user.roles.includes('manager');
    const isHR =
      user.roles.includes('hr_manager') ||
      user.roles.includes('hr_admin') ||
      user.roles.includes('hr_executive');
    const isGlobalAdmin = user.roles.includes('global_admin');

    if (isGlobalAdmin || isHR) {
      return successResponse({
        role: 'ADMIN',
        stats: [
          { label: 'Total Employees', value: totalEmployees, icon: 'Users', color: 'blue' },
          { label: 'Active Employees', value: activeCount, icon: 'UserCheck', color: 'green' },
          { label: 'New Hires This Month', value: newHires, icon: 'UserPlus', color: 'purple' },
          {
            label: 'On Notice Period',
            value: stats?.byStatus?.find((s) => s._id === 'NOTICE_PERIOD')?.count ?? 0,
            icon: 'UserMinus',
            color: 'orange',
          },
        ],
        departmentBreakdown: stats?.byDepartment ?? [],
        statusBreakdown: stats?.byStatus ?? [],
      }, 'Dashboard stats loaded');
    }

    if (isManager) {
      const { User: UserModel } = await import('@/models/User');
      const myUser = await UserModel.findOne({ email: user.email }).lean();
      let directReports = 0;

      if (myUser) {
        const myEmployee = await Employee.findOne({
          organizationId: orgObjectId,
          userId: myUser._id,
        }).lean();
        if (myEmployee) {
          directReports = await Employee.countDocuments({
            organizationId: orgObjectId,
            reportingManagerId: myEmployee._id,
            isActive: true,
          });
        }
      }

      return successResponse({
        role: 'MANAGER',
        stats: [
          { label: 'My Direct Reports', value: directReports, icon: 'Users', color: 'blue' },
        ],
      }, 'Dashboard stats loaded');
    }

    return successResponse({ role: 'EMPLOYEE', stats: [] }, 'Dashboard stats loaded');
  } catch (err) {
    return handleApiError(err);
  }
}

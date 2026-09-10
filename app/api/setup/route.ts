// ============================================================
// HRMS — Initial Setup API
// Creates the first Super Admin + Organization
// Idempotent — safe to call multiple times
// ============================================================

import { NextRequest } from 'next/server';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { registerSchema } from '@/validators';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { SubscriptionStatus, DataScope } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { User } = await import('@/models/User');
    const { Organization } = await import('@/models/Organization');
    const { Role } = await import('@/models/Role');
    const { UserRole } = await import('@/models/UserRole');
    const { Module, Permission, RolePermission } = await import('@/models/Permission');

    const existingAdmin = await User.findOne({ isSuperAdmin: true }).lean();
    if (existingAdmin) {
      return successResponse({ alreadySetup: true }, 'Setup already completed', 200);
    }

    const body = await req.json() as unknown;
    const data = registerSchema.parse(body);

    const slug =
      data.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now()}`;

    const org = await Organization.create({
      name: data.organizationName,
      slug,
      country: data.country,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      settings: {
        enabledModules: ['dashboard', 'employees', 'attendance', 'leave', 'payroll'],
        maxEmployees: 1000,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        fiscalYearStart: 4,
        dateFormat: 'DD/MM/YYYY',
        workingDays: [1, 2, 3, 4, 5],
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
      },
    });

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      email: data.email,
      passwordHash,
      name: data.name,
      isSuperAdmin: true,
      isActive: true,
      isEmailVerified: true,
      organizationIds: [org._id],
    });

    // Seed system roles
    const systemRoles = [
      { slug: 'super_admin', name: 'Super Admin', sortOrder: 1 },
      { slug: 'global_admin', name: 'Global Admin', sortOrder: 2 },
      { slug: 'hr_admin', name: 'HR Admin', sortOrder: 3 },
      { slug: 'hr_executive', name: 'HR Executive', sortOrder: 4 },
      { slug: 'hr_manager', name: 'HR Manager', sortOrder: 5 },
      { slug: 'payroll_admin', name: 'Payroll Admin', sortOrder: 6 },
      { slug: 'payroll_manager', name: 'Payroll Manager', sortOrder: 7 },
      { slug: 'attendance_admin', name: 'Attendance Admin', sortOrder: 8 },
      { slug: 'performance_admin', name: 'Performance Admin', sortOrder: 9 },
      { slug: 'recruiter', name: 'Recruiter', sortOrder: 10 },
      { slug: 'hiring_manager', name: 'Hiring Manager', sortOrder: 11 },
      { slug: 'project_admin', name: 'Project Admin', sortOrder: 12 },
      { slug: 'asset_manager', name: 'Asset Manager', sortOrder: 13 },
      { slug: 'expense_manager', name: 'Expense Manager', sortOrder: 14 },
      { slug: 'travel_desk_manager', name: 'Travel Desk Manager', sortOrder: 15 },
      { slug: 'finance', name: 'Finance', sortOrder: 16 },
      { slug: 'manager', name: 'Manager', sortOrder: 17 },
      { slug: 'employee', name: 'Employee', sortOrder: 18 },
    ];

    const createdRoles: Record<string, import('mongoose').Types.ObjectId> = {};
    for (const roleData of systemRoles) {
      const existing = await Role.findOne({ slug: roleData.slug, organizationId: null }).lean();
      let roleId: import('mongoose').Types.ObjectId;
      if (existing) {
        roleId = existing._id as import('mongoose').Types.ObjectId;
      } else {
        const created = await Role.create({
          ...roleData,
          isSystem: true,
          organizationId: undefined,  // system roles have no org
          isActive: true,
        });
        roleId = created._id as import('mongoose').Types.ObjectId;
      }
      createdRoles[roleData.slug] = roleId;
    }

    const globalAdminRoleId = createdRoles['global_admin'];
    if (globalAdminRoleId) {
      await UserRole.create({
        userId: user._id,
        organizationId: org._id,
        roleId: globalAdminRoleId,
        scope: DataScope.ORGANIZATION,
        isActive: true,
        assignedBy: user._id,
        assignedAt: new Date(),
      });
    }

    // Seed modules from registry
    const { MODULES } = await import('@/config/modules');
    for (const mod of MODULES) {
      let moduleDoc = await Module.findOne({ slug: mod.slug }).lean();
      if (!moduleDoc) {
        moduleDoc = await Module.create({
          slug: mod.slug,
          name: mod.name,
          icon: mod.icon,
          route: mod.route,
          group: mod.group,
          sortOrder: mod.sortOrder,
          isSystem: true,
          isActive: true,
        });
      }
      const moduleId = moduleDoc._id as import('mongoose').Types.ObjectId;

      if (mod.submodules) {
        for (const sub of mod.submodules) {
          let subDoc = await Module.findOne({ slug: sub.slug }).lean();
          if (!subDoc) {
            subDoc = await Module.create({
              slug: sub.slug,
              name: sub.name,
              icon: sub.icon,
              route: sub.route,
              parentModuleId: moduleId,
              isSystem: true,
              isActive: true,
              sortOrder: 1,
            });
          }
          const submoduleId = subDoc._id as import('mongoose').Types.ObjectId;

          for (const action of sub.actions) {
            let perm = await Permission.findOne({
              moduleId,
              submoduleId,
              action,
            }).lean();

            if (!perm) {
              perm = await Permission.create({ moduleId, submoduleId, action });
            }
            const permId = perm._id as import('mongoose').Types.ObjectId;

            if (globalAdminRoleId) {
              await RolePermission.updateOne(
                { roleId: globalAdminRoleId, permissionId: permId },
                { $setOnInsert: { roleId: globalAdminRoleId, permissionId: permId, isGranted: true } },
                { upsert: true }
              );
            }
          }
        }
      }
    }

    return successResponse(
      {
        userId: (user._id as import('mongoose').Types.ObjectId).toString(),
        organizationId: (org._id as import('mongoose').Types.ObjectId).toString(),
        email: user.email,
      },
      'Setup completed successfully! You can now log in.',
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  try {
    await connectDB();
    const { User } = await import('@/models/User');
    const existingAdmin = await User.findOne({ isSuperAdmin: true }).lean();
    return successResponse({ isSetupComplete: !!existingAdmin }, 'Setup status checked');
  } catch (err) {
    return handleApiError(err);
  }
}

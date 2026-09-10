import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Organization } from '@/models/Organization';
import { Employee } from '@/models/Employee';
import { Plan } from '@/models/Plan';
import { User } from '@/models/User';
import { Role } from '@/models/Role';
import { UserRole } from '@/models/UserRole';
import { assertSuperAdminAccess } from '@/lib/tenant';
import { SubscriptionStatus, DataScope } from '@/types';
import bcrypt from 'bcryptjs';
import type { SessionUser } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    const orgs = await Organization.find().sort({ createdAt: -1 }).lean();
    const plans = await Plan.find().lean();
    const planMap = new Map(plans.map((p) => [p.slug, p]));

    // Aggregate employee counts per organization
    const employeeCounts = await Employee.aggregate([
      { $group: { _id: '$organizationId', count: { $sum: 1 } } },
    ]);
    const empCountMap = new Map(employeeCounts.map((ec) => [ec._id.toString(), ec.count]));

    const enrichedOrgs = orgs.map((org) => {
      const plan = planMap.get(org.planId || 'starter');
      return {
        ...org,
        employeeCount: empCountMap.get(org._id.toString()) || 0,
        planName: plan?.name || 'Custom Plan',
        monthlyPrice: plan?.monthlyPrice || 0,
        enabledModulesCount: org.settings?.enabledModules?.length || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedOrgs,
      message: 'Organizations retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch organizations' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    const body = await req.json();
    const {
      organizationName,
      slug: customSlug,
      country = 'India',
      planId = 'growth',
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    if (!organizationName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required organization or admin user fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this admin email already exists' },
        { status: 400 }
      );
    }

    const plan = await Plan.findOne({ slug: planId });
    const finalEnabledModules =
      Array.isArray(body.enabledModules) && body.enabledModules.length > 0
        ? body.enabledModules
        : plan?.includedModules || ['dashboard', 'organization', 'employees', 'attendance', 'leave', 'payroll'];

    const finalMaxEmployees =
      body.maxEmployees ? Number(body.maxEmployees) : plan?.maxEmployees || 100;

    const orgSlug =
      customSlug ||
      organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now().toString().slice(-4)}`;

    // 1. Create Organization
    const newOrg = await Organization.create({
      name: organizationName,
      slug: orgSlug,
      country,
      planId: planId || 'custom',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      settings: {
        enabledModules: finalEnabledModules,
        maxEmployees: finalMaxEmployees,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        fiscalYearStart: 4,
        dateFormat: 'DD/MM/YYYY',
        workingDays: [1, 2, 3, 4, 5],
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
      },
      isActive: true,
    });


    // 2. Create Company Admin User
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const newAdminUser = await User.create({
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: adminName,
      isSuperAdmin: false,
      isActive: true,
      isEmailVerified: true,
      organizationIds: [newOrg._id],
    });

    // 3. Assign Global Admin role
    let globalAdminRole = await Role.findOne({ slug: 'global_admin', isSystem: true });
    if (!globalAdminRole) {
      globalAdminRole = await Role.create({
        slug: 'global_admin',
        name: 'Global Admin',
        isSystem: true,
        isActive: true,
      });
    }


    await UserRole.create({
      userId: newAdminUser._id,
      organizationId: newOrg._id,
      roleId: globalAdminRole._id,
      scope: DataScope.ORGANIZATION,
      isActive: true,
      assignedBy: session.user.id,
      assignedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        organization: newOrg,
        adminUser: {
          id: newAdminUser._id,
          name: newAdminUser.name,
          email: newAdminUser.email,
        },
      },
      message: 'Organization and Company Admin user created successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create organization & company admin' },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    const body = await req.json();
    const { organizationId, planId, enabledModules, maxEmployees, subscriptionStatus, isActive, isSuspended, suspensionReason } = body;

    if (!organizationId) {
      return NextResponse.json({ success: false, message: 'Organization ID is required' }, { status: 400 });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ success: false, message: 'Organization not found' }, { status: 404 });
    }

    const updateFields: Record<string, any> = {};

    if (planId !== undefined) updateFields.planId = planId;
    if (subscriptionStatus !== undefined) updateFields.subscriptionStatus = subscriptionStatus;
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (isSuspended !== undefined) updateFields.isSuspended = Boolean(isSuspended);
    if (suspensionReason !== undefined) updateFields.suspensionReason = suspensionReason;

    if (enabledModules !== undefined || maxEmployees !== undefined) {
      updateFields.settings = {
        ...org.settings,
        ...(enabledModules !== undefined ? { enabledModules: Array.isArray(enabledModules) ? enabledModules : [] } : {}),
        ...(maxEmployees !== undefined ? { maxEmployees: Number(maxEmployees) } : {}),
      };
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedOrg,
      message: 'Organization modules and subscription updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update organization' },
      { status: error.status || 500 }
    );
  }
}

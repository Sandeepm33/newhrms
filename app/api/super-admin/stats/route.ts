import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Organization } from '@/models/Organization';
import { Employee } from '@/models/Employee';
import { Plan } from '@/models/Plan';
import { MODULES } from '@/config/modules';
import { assertSuperAdminAccess } from '@/lib/tenant';
import type { SessionUser } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    const [orgs, plans, totalEmployees] = await Promise.all([
      Organization.find().lean(),
      Plan.find().lean(),
      Employee.countDocuments(),
    ]);

    const planMap = new Map(plans.map((p) => [p.slug, p]));

    let totalMRR = 0;
    let activeOrgs = 0;
    let trialOrgs = 0;
    let suspendedOrgs = 0;
    const moduleUsageMap = new Map<string, number>();

    // Initialize all 48 modules in map
    MODULES.forEach((m) => moduleUsageMap.set(m.slug, 0));

    orgs.forEach((org) => {
      if (org.subscriptionStatus === 'ACTIVE') activeOrgs++;
      else if (org.subscriptionStatus === 'TRIAL') trialOrgs++;
      if (org.isSuspended) suspendedOrgs++;

      // Estimate MRR from plan
      const plan = planMap.get(org.planId || 'starter');
      if (plan && org.subscriptionStatus === 'ACTIVE') {
        totalMRR += plan.monthlyPrice || 0;
      }

      // Count enabled modules
      const enabled = org.settings?.enabledModules || [];
      enabled.forEach((modSlug) => {
        moduleUsageMap.set(modSlug, (moduleUsageMap.get(modSlug) || 0) + 1);
      });
    });

    const moduleAdoption = Array.from(moduleUsageMap.entries())
      .map(([slug, count]) => {
        const modDef = MODULES.find((m) => m.slug === slug);
        return {
          slug,
          name: modDef?.name || slug,
          group: modDef?.group || 'Other',
          activeTenants: count,
          adoptionPercentage: orgs.length > 0 ? Math.round((count / orgs.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.activeTenants - a.activeTenants);

    return NextResponse.json({
      success: true,
      data: {
        totalOrganizations: orgs.length,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalEmployees,
        totalMRR,
        totalARR: totalMRR * 12,
        moduleAdoption,
      },
      message: 'Super admin platform stats retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch platform stats' },
      { status: error.status || 500 }
    );
  }
}

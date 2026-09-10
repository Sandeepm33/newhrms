import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Plan } from '@/models/Plan';
import { assertSuperAdminAccess } from '@/lib/tenant';
import type { SessionUser } from '@/types';

// Default SaaS Plan seeds if database is empty
const DEFAULT_PLANS = [
  {
    name: 'Starter Tier',
    slug: 'starter',
    description: 'Perfect for small teams and startups getting started with core HR.',
    monthlyPrice: 2999,
    annualPrice: 29990,
    currency: 'INR',
    maxEmployees: 25,
    includedModules: ['dashboard', 'organization', 'employees', 'ess', 'documents', 'attendance', 'leave', 'holidays'],
    features: ['Up to 25 Employees', 'Core Employee Directory', 'Attendance & Leave Tracking', 'Self Service Portal', 'Email Support'],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'Growth & Business',
    slug: 'growth',
    description: 'Complete HR automation for growing companies with payroll and hiring.',
    monthlyPrice: 7999,
    annualPrice: 79990,
    currency: 'INR',
    maxEmployees: 100,
    includedModules: [
      'dashboard', 'organization', 'employees', 'ess', 'documents', 'lifecycle', 'helpdesk', 'announcements',
      'attendance', 'leave', 'shifts', 'overtime', 'timesheets', 'wfh', 'holidays',
      'payroll', 'compensation', 'tax', 'expenses', 'recruitment', 'onboarding', 'performance', 'goals'
    ],
    features: ['Up to 100 Employees', 'Automated Payroll & Statutory', 'Talent Acquisition & Hiring', 'Performance & OKRs', 'Priority Support'],
    isPopular: true,
    isActive: true,
  },
  {
    name: 'Enterprise Scale',
    slug: 'enterprise',
    description: 'All 48 modules included with advanced analytics, custom workflows, and PSA.',
    monthlyPrice: 19999,
    annualPrice: 199990,
    currency: 'INR',
    maxEmployees: 500,
    includedModules: [
      'dashboard', 'organization', 'employees', 'ess', 'documents', 'lifecycle', 'helpdesk', 'announcements',
      'attendance', 'leave', 'shifts', 'overtime', 'timesheets', 'wfh', 'holidays',
      'payroll', 'compensation', 'tax', 'expenses', 'loans', 'reimbursements', 'fnf',
      'recruitment', 'career-portal', 'referrals', 'bgv', 'onboarding', 'performance', 'goals', 'feedback', 'lms', 'skills', 'career', 'rewards',
      'engagement', 'social', 'travel', 'assets', 'projects', 'resources', 'analytics', 'reports', 'ai-intelligence',
      'roles-permissions', 'workflows-config', 'audit', 'settings'
    ],
    features: ['Up to 500 Employees', 'Full 48 Business Modules', 'Custom Workflows & Approval Inbox', 'Project Management & PSA', 'Dedicated Account Manager'],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'Ultimate Unlimited',
    slug: 'ultimate',
    description: 'Unlimited capacity for enterprise organizations with dedicated infrastructure.',
    monthlyPrice: 49999,
    annualPrice: 499990,
    currency: 'INR',
    maxEmployees: 5000,
    includedModules: [
      'dashboard', 'organization', 'employees', 'ess', 'documents', 'lifecycle', 'helpdesk', 'announcements',
      'attendance', 'leave', 'shifts', 'overtime', 'timesheets', 'wfh', 'holidays',
      'payroll', 'compensation', 'tax', 'expenses', 'loans', 'reimbursements', 'fnf',
      'recruitment', 'career-portal', 'referrals', 'bgv', 'onboarding', 'performance', 'goals', 'feedback', 'lms', 'skills', 'career', 'rewards',
      'engagement', 'social', 'travel', 'assets', 'projects', 'resources', 'analytics', 'reports', 'ai-intelligence',
      'roles-permissions', 'workflows-config', 'audit', 'settings', 'super-admin'
    ],
    features: ['Unlimited Employees', 'Custom Integrations & SLAs', 'AI Intelligence Engine', '24/7 Phone & Slack Support'],
    isPopular: false,
    isActive: true,
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    let plans = await Plan.find().sort({ monthlyPrice: 1 }).lean();

    // Auto-seed default plans if empty
    if (plans.length === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
      plans = await Plan.find().sort({ monthlyPrice: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      data: plans,
      message: 'Subscription plans retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch plans' },
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
    const { name, slug, description, monthlyPrice, annualPrice, maxEmployees, includedModules, features, isPopular } = body;

    if (!name || !monthlyPrice || !maxEmployees) {
      return NextResponse.json({ success: false, message: 'Missing required plan fields' }, { status: 400 });
    }

    const planSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Plan.findOne({ slug: planSlug });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Plan with this slug already exists' }, { status: 400 });
    }

    const newPlan = await Plan.create({
      name,
      slug: planSlug,
      description: description || '',
      monthlyPrice: Number(monthlyPrice),
      annualPrice: Number(annualPrice || monthlyPrice * 10),
      currency: 'INR',
      maxEmployees: Number(maxEmployees),
      includedModules: Array.isArray(includedModules) ? includedModules : [],
      features: Array.isArray(features) ? features : [],
      isPopular: Boolean(isPopular),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: newPlan,
      message: 'Plan created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create plan' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    assertSuperAdminAccess(session.user as SessionUser);
    await connectDB();

    const body = await req.json();
    const { id, name, description, monthlyPrice, annualPrice, maxEmployees, includedModules, features, isPopular, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Plan ID is required' }, { status: 400 });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          description,
          monthlyPrice: Number(monthlyPrice),
          annualPrice: Number(annualPrice),
          maxEmployees: Number(maxEmployees),
          includedModules: Array.isArray(includedModules) ? includedModules : [],
          features: Array.isArray(features) ? features : [],
          isPopular: Boolean(isPopular),
          isActive: Boolean(isActive),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Plan updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update plan' },
      { status: error.status || 500 }
    );
  }
}

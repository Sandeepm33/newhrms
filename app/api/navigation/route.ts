// ============================================================
// HRMS — Navigation API
// Returns permission-filtered module tree for the sidebar
// Resolves organization enabledModules strictly per tenant licensing
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { MODULES } from '@/config/modules';
import connectDB from '@/lib/mongodb';
import { Organization } from '@/models/Organization';
import type { SessionUser, NavItem } from '@/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;

    // Load Organization enabled modules if user belongs to an org and is not platform super admin
    let enabledModules: string[] | null = null;

    if (user.organizationId && !user.isSuperAdmin) {
      await connectDB();
      const org = await Organization.findById(user.organizationId).select('settings').lean();
      if (org?.settings?.enabledModules && Array.isArray(org.settings.enabledModules)) {
        enabledModules = org.settings.enabledModules;
      } else {
        enabledModules = [];
      }
    }

    const isOrgAdmin =
      user.isSuperAdmin ||
      user.roles?.some((r) => ['global_admin', 'org_admin', 'company_admin', 'admin', 'hr_admin'].includes(r)) ||
      !user.permissions ||
      user.permissions.length === 0 ||
      user.permissions.includes('*');

    const navItems: NavItem[] = [];

    for (const mod of MODULES) {
      // Super Admin module is only for platform super admins
      if (mod.slug === 'super-admin') {
        if (user.isSuperAdmin) {
          navItems.push({
            id: mod.slug,
            slug: mod.slug,
            label: mod.name,
            icon: mod.icon,
            href: mod.route,
          });
        }
        continue;
      }

      // STRICT CHECK: If organization has enabledModules defined, only allow modules present in that array
      if (enabledModules !== null && !enabledModules.includes(mod.slug)) {
        continue;
      }

      // Check if user has VIEW permission for this module
      const hasViewPermission =
        isOrgAdmin ||
        (user.permissions &&
          user.permissions.some(
            (p) => p.startsWith(`${mod.slug}:`) && (p.endsWith(':VIEW') || p.endsWith(':*'))
          ));

      if (!hasViewPermission) continue;

      const navItem: NavItem = {
        id: mod.slug,
        slug: mod.slug,
        label: mod.name,
        icon: mod.icon,
        href: mod.route,
      };

      // Filter submodules
      if (mod.submodules && mod.submodules.length > 0) {
        const allowedSubs: NavItem[] = [];
        for (const sub of mod.submodules) {
          const hasSubView =
            isOrgAdmin ||
            (user.permissions &&
              (user.permissions.includes(`${mod.slug}:${sub.slug}:VIEW`) ||
                user.permissions.includes(`${mod.slug}:*:VIEW`)));

          if (hasSubView) {
            allowedSubs.push({
              id: sub.slug,
              slug: sub.slug,
              label: sub.name,
              icon: sub.icon,
              href: sub.route,
            });
          }
        }
        if (allowedSubs.length > 0) {
          navItem.children = allowedSubs;
        }
      }

      navItems.push(navItem);
    }

    // Group by module group
    const grouped = navItems.reduce(
      (acc, item) => {
        const mod = MODULES.find((m) => m.slug === item.slug);
        const group = mod?.group ?? 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group]!.push(item);
        return acc;
      },
      {} as Record<string, NavItem[]>
    );

    return successResponse({ items: navItems, grouped }, 'Navigation loaded');
  } catch (err) {
    return handleApiError(err);
  }
}

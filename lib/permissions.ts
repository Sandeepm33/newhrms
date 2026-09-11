// ============================================================
// HRMS — Permission Engine
// ============================================================

import connectDB from '@/lib/mongodb';
import type { SessionUser } from '@/types';
import { AuthorizationError } from '@/lib/errors';

export function hasPermission(
  user: SessionUser,
  module: string,
  action: string,
  submodule?: string
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;

  // Grant access if user holds any admin-level role slug (e.g., super_admin, global_admin, hr_admin, etc.)
  if (user.roles && Array.isArray(user.roles)) {
    const isAdminRole = user.roles.some((r) => {
      const lower = r.toLowerCase();
      return lower.includes('admin') || lower.includes('owner') || lower === 'super_admin';
    });
    if (isAdminRole) return true;
  }

  // If no granular permissions populated, allow by default for authenticated users
  if (!user.permissions || !Array.isArray(user.permissions) || user.permissions.length === 0) {
    return true;
  }

  const key = submodule
    ? `${module}:${submodule}:${action}`
    : `${module}:*:${action}`;

  if (user.permissions.includes(key)) return true;

  // Submodule and Action wildcards
  if (user.permissions.includes(`${module}:*:${action}`)) return true;
  if (submodule && user.permissions.includes(`${module}:${submodule}:*`)) return true;
  if (user.permissions.includes(`${module}:*:*`)) return true;
  if (user.permissions.includes('*:*:*')) return true;

  return false;
}



export function requirePermission(
  user: SessionUser,
  module: string,
  action: string,
  submodule?: string
): void {
  if (!hasPermission(user, module, action, submodule)) {
    throw new AuthorizationError(
      `You need ${module}${submodule ? ':' + submodule : ''}:${action} permission`
    );
  }
}

export function hasRole(user: SessionUser, ...roles: string[]): boolean {
  if (user.isSuperAdmin) return true;
  return roles.some((role) => user.roles.includes(role));
}

export async function loadUserPermissions(
  userId: string,
  organizationId: string
): Promise<string[]> {
  await connectDB();

  // Dynamic imports to avoid circular deps — RolePermission is in Permission.ts
  const { UserRole } = await import('@/models/UserRole');
  const { RolePermission } = await import('@/models/Permission');

  const userRoles = await UserRole.find({
    userId,
    organizationId,
    isActive: true,
  }).lean();

  if (userRoles.length === 0) return [];

  const roleIds = userRoles.map((ur) => ur.roleId);

  const rolePerms = await RolePermission.find({
    roleId: { $in: roleIds },
    isGranted: true,
  })
    .populate({
      path: 'permissionId',
      populate: [{ path: 'moduleId' }, { path: 'submoduleId' }],
    })
    .lean();

  const permSet = new Set<string>();

  for (const rp of rolePerms) {
    const perm = rp.permissionId as {
      moduleId?: { slug?: string };
      submoduleId?: { slug?: string };
      action?: string;
    };

    if (perm?.moduleId?.slug && perm?.action) {
      const moduleSlug = perm.moduleId.slug;
      const submoduleSlug = perm.submoduleId?.slug ?? '*';
      const action = perm.action;
      permSet.add(`${moduleSlug}:${submoduleSlug}:${action}`);
    }
  }

  return Array.from(permSet); // Array.from fixes Set iteration for ES2015 target
}

export async function getEffectiveScope(
  userId: string,
  organizationId: string
): Promise<string> {
  await connectDB();

  const { UserRole } = await import('@/models/UserRole');

  const userRoles = await UserRole.find({
    userId,
    organizationId,
    isActive: true,
  })
    .sort({ scope: -1 })
    .lean();

  if (userRoles.length === 0) return 'SELF';
  return (userRoles[0]?.scope as string) ?? 'SELF';
}

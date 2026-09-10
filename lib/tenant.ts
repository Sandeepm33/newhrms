// ============================================================
// HRMS — Tenant Isolation Utility
// NEVER trusts organizationId from request body/params
// Always derives tenant context from the server session
// ============================================================

import { AuthorizationError, TenantError } from '@/lib/errors';
import type { SessionUser } from '@/types';

/**
 * Derives the organizationId from the authenticated session.
 * Throws if the user is not associated with an organization
 * (Super Admins without an org context use a different path).
 */
export function getOrgIdFromSession(user: SessionUser): string {
  if (!user.organizationId) {
    throw new AuthorizationError(
      'No organization context found in session. Please select an organization.'
    );
  }
  return user.organizationId;
}

/**
 * Validates that a record belongs to the user's organization.
 * Used in repositories before returning sensitive data.
 */
export function assertTenantOwnership(
  recordOrgId: string | undefined | null,
  sessionOrgId: string,
  resourceName = 'Resource'
): void {
  if (!recordOrgId) {
    throw new TenantError(`${resourceName} has no organization association`);
  }
  if (recordOrgId.toString() !== sessionOrgId.toString()) {
    throw new TenantError(
      `${resourceName} does not belong to your organization`
    );
  }
}

/**
 * Builds a tenant-safe MongoDB filter.
 * Always injects organizationId from session, ignores any client-provided value.
 */
export function tenantFilter(sessionOrgId: string): { organizationId: string } {
  return { organizationId: sessionOrgId };
}

/**
 * Merges a user query with mandatory tenant filter.
 * This ensures tenant isolation on every query without repetition.
 */
export function withTenantFilter(
  query: Record<string, unknown>,
  sessionOrgId: string
): Record<string, unknown> {
  // Explicitly override any organizationId the client may have injected
  return { ...query, organizationId: sessionOrgId };
}

/**
 * For Super Admins who can access any org — validates they have
 * explicit Super Admin flag before allowing cross-tenant access.
 */
export function assertSuperAdminAccess(user: SessionUser): void {
  if (!user.isSuperAdmin) {
    throw new AuthorizationError('Super Admin access required');
  }
}

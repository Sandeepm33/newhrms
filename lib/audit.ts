// ============================================================
// HRMS — Audit Log Utility
// Fire-and-forget — never blocks the request
// All sensitive mutations must call logAudit()
// ============================================================

import connectDB from '@/lib/mongodb';
import { AuditAction } from '@/types';
import { AuditLog } from '@/models';

interface AuditParams {
  organizationId?: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  module: string;
  submodule?: string;
  recordId?: string;
  recordType?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  result?: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
}

/**
 * Writes an immutable audit log entry.
 * Called from the service layer after significant actions.
 * Uses fire-and-forget pattern — errors are logged but never thrown.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      ...params,
      result: params.result ?? 'SUCCESS',
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit failures must NEVER propagate — only log to console
    console.error('[Audit] Failed to write audit log:', err);
  }
}

/**
 * Convenience wrapper for UPDATE actions — automatically captures before/after.
 */
export async function logUpdate(
  base: Omit<AuditParams, 'action'>,
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Promise<void> {
  await logAudit({ ...base, action: AuditAction.UPDATE, before, after });
}

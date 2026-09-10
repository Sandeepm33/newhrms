// ============================================================
// HRMS — Workflow & Approval Models
// Reusable engine for Leave, Expense, Recruitment, Payroll etc.
// Built in Phase 1 so every module can consume it consistently
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { WorkflowStatus, ApprovalStepStatus } from '@/types';

// ── Workflow Definition ───────────────────────────────────────
export interface IWorkflowStep {
  stepNumber: number;
  name: string;
  approverType: 'ROLE' | 'USER' | 'REPORTING_MANAGER' | 'DEPARTMENT_HEAD' | 'DYNAMIC';
  approverRoleId?: mongoose.Types.ObjectId;
  approverUserId?: mongoose.Types.ObjectId;
  dynamicApproverKey?: string; // e.g. "reportingManager", "hrManager"
  escalationHours?: number;
  isParallel?: boolean;
  conditions?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
    value: unknown;
  }>;
}

export interface IWorkflow extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  triggerModule: string;  // e.g. "leave", "expense", "offer"
  triggerEvent: string;   // e.g. "SUBMITTED", "CREATED"
  isActive: boolean;
  isDefault: boolean;
  steps: IWorkflowStep[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStepSchema = new Schema<IWorkflowStep>(
  {
    stepNumber: { type: Number, required: true },
    name: { type: String, required: true },
    approverType: {
      type: String,
      enum: ['ROLE', 'USER', 'REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'DYNAMIC'],
      required: true,
    },
    approverRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    approverUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    dynamicApproverKey: String,
    escalationHours: { type: Number, default: 48 },
    isParallel: { type: Boolean, default: false },
    conditions: [
      {
        field: String,
        operator: { type: String, enum: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte'] },
        value: Schema.Types.Mixed,
      },
    ],
  },
  { _id: false }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    description: String,
    triggerModule: { type: String, required: true, index: true },
    triggerEvent: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    steps: [WorkflowStepSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'workflows' }
);

WorkflowSchema.index({ organizationId: 1, triggerModule: 1, isActive: 1 });
WorkflowSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

// ── Workflow Approval Instance ────────────────────────────────
export interface IApprovalStep {
  stepNumber: number;
  stepName: string;
  approverId?: mongoose.Types.ObjectId;
  approverName?: string;
  status: ApprovalStepStatus;
  actionedAt?: Date;
  comments?: string;
  attachments?: string[];
  dueBy?: Date;
}

export interface IWorkflowApproval extends Document {
  _id: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  requestType: string;   // e.g. "LEAVE_REQUEST", "EXPENSE_CLAIM"
  requestId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  currentStepNumber: number;
  status: WorkflowStatus;
  steps: IApprovalStep[];
  completedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalStepSchema = new Schema<IApprovalStep>(
  {
    stepNumber: Number,
    stepName: String,
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    approverName: String,
    status: {
      type: String,
      enum: Object.values(ApprovalStepStatus),
      default: ApprovalStepStatus.PENDING,
    },
    actionedAt: Date,
    comments: String,
    attachments: [String],
    dueBy: Date,
  },
  { _id: false }
);

const WorkflowApprovalSchema = new Schema<IWorkflowApproval>(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    requestType: { type: String, required: true, index: true },
    requestId: { type: Schema.Types.ObjectId, required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentStepNumber: { type: Number, default: 1 },
    status: {
      type: String,
      enum: Object.values(WorkflowStatus),
      default: WorkflowStatus.PENDING,
      index: true,
    },
    steps: [ApprovalStepSchema],
    completedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true, collection: 'workflowApprovals' }
);

WorkflowApprovalSchema.index({ organizationId: 1, status: 1 });
WorkflowApprovalSchema.index({ requestedBy: 1, status: 1 });

// ── Policy Model ──────────────────────────────────────────────
export interface IPolicy extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  type: string;
  name: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  rules: Array<{
    key: string;
    value: unknown;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
    description?: string;
  }>;
  appliesTo: {
    scope: string;
    scopeTargetIds: mongoose.Types.ObjectId[];
  };
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    type: { type: String, required: true, index: true },
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    effectiveFrom: Date,
    effectiveTo: Date,
    rules: [
      {
        key: { type: String, required: true },
        value: Schema.Types.Mixed,
        dataType: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array'] },
        description: String,
      },
    ],
    appliesTo: {
      scope: { type: String, default: 'ORGANIZATION' },
      scopeTargetIds: [{ type: Schema.Types.ObjectId }],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'policies' }
);

PolicySchema.index({ organizationId: 1, type: 1, isActive: 1 });

// ── AuditLog (Immutable) ──────────────────────────────────────
export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  action: string;
  module: string;
  submodule?: string;
  recordId?: mongoose.Types.ObjectId;
  recordType?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  result: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String, required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    submodule: String,
    recordId: { type: Schema.Types.ObjectId },
    recordType: String,
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    result: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    // No updatedAt — audit logs are immutable
    timestamps: false,
    collection: 'auditLogs',
  }
);

AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ module: 1, action: 1, timestamp: -1 });

// ── Notification ──────────────────────────────────────────────
const NotificationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    referenceId: Schema.Types.ObjectId,
    referenceType: String,
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
  },
  { timestamps: true, collection: 'notifications' }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

// ── Model Exports ─────────────────────────────────────────────
export const Workflow: Model<IWorkflow> =
  mongoose.models['Workflow'] ?? mongoose.model<IWorkflow>('Workflow', WorkflowSchema);

export const WorkflowApproval: Model<IWorkflowApproval> =
  mongoose.models['WorkflowApproval'] ??
  mongoose.model<IWorkflowApproval>('WorkflowApproval', WorkflowApprovalSchema);

export const Policy: Model<IPolicy> =
  mongoose.models['Policy'] ?? mongoose.model<IPolicy>('Policy', PolicySchema);

export const AuditLog: Model<IAuditLog> =
  mongoose.models['AuditLog'] ?? mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const Notification =
  mongoose.models['Notification'] ?? mongoose.model('Notification', NotificationSchema);

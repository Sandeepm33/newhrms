// ============================================================
// HRMS — Leave Management Models
// Tracks leave types, requests, approvals, and balances
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// ── Leave Type Schema ─────────────────────────────────────────
export interface ILeaveType extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code: string; // e.g. CL, SL, EL, ML
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema = new Schema<ILeaveType>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    daysPerYear: { type: Number, required: true, default: 12 },
    isPaid: { type: Boolean, default: true },
    carryForwardAllowed: { type: Boolean, default: false },
    maxCarryForwardDays: { type: Number, default: 0 },
    requiresApproval: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'leaveTypes' }
);

LeaveTypeSchema.index({ organizationId: 1, code: 1 }, { unique: true });

// ── Leave Request Schema ──────────────────────────────────────
export interface ILeaveRequest extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDaySession?: 'FIRST_HALF' | 'SECOND_HALF';
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDaySession: { type: String, enum: ['FIRST_HALF', 'SECOND_HALF'] },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
      index: true,
    },
    appliedAt: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true, collection: 'leaveRequests' }
);

LeaveRequestSchema.index({ organizationId: 1, employeeId: 1, startDate: 1 });
LeaveRequestSchema.index({ organizationId: 1, status: 1 });

// ── Leave Balance Schema ──────────────────────────────────────
export interface ILeaveBalance extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    allocatedDays: { type: Number, required: true, default: 12 },
    usedDays: { type: Number, default: 0 },
    pendingDays: { type: Number, default: 0 },
    remainingDays: { type: Number, required: true, default: 12 },
  },
  { timestamps: true, collection: 'leaveBalances' }
);

LeaveBalanceSchema.index({ organizationId: 1, employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

export const LeaveType: Model<ILeaveType> =
  mongoose.models['LeaveType'] ?? mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export const LeaveRequest: Model<ILeaveRequest> =
  mongoose.models['LeaveRequest'] ?? mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export const LeaveBalance: Model<ILeaveBalance> =
  mongoose.models['LeaveBalance'] ?? mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);

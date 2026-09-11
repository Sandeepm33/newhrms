// ============================================================
// HRMS — Payroll Model
// Tracks monthly payroll processing cycles and salary disbursements
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IPayrollRun extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  period: string; // e.g. "September 2026"
  totalGross: number;
  statutoryDeductions: number;
  netPayable: number;
  payeesCount: number;
  status: PayrollStatus;
  processedDate: Date;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollRunSchema = new Schema<IPayrollRun>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    period: { type: String, required: true },
    totalGross: { type: Number, required: true, default: 0 },
    statutoryDeductions: { type: Number, default: 0 },
    netPayable: { type: Number, required: true, default: 0 },
    payeesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(PayrollStatus),
      default: PayrollStatus.COMPLETED,
    },
    processedDate: { type: Date, default: Date.now },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'payrollRuns' }
);

PayrollRunSchema.index({ organizationId: 1, period: 1 });

export const PayrollRun: Model<IPayrollRun> =
  mongoose.models['PayrollRun'] ?? mongoose.model<IPayrollRun>('PayrollRun', PayrollRunSchema);

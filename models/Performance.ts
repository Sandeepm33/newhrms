// ============================================================
// HRMS — Performance Model
// Tracks appraisal cycles, reviews, and evaluation metrics
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export enum PerfCycleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface IPerformanceCycle extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  status: PerfCycleStatus;
  participantsCount: number;
  completionRate: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceCycleSchema = new Schema<IPerformanceCycle>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(PerfCycleStatus),
      default: PerfCycleStatus.ACTIVE,
    },
    participantsCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true, collection: 'performanceCycles' }
);

PerformanceCycleSchema.index({ organizationId: 1, status: 1 });

export const PerformanceCycle: Model<IPerformanceCycle> =
  mongoose.models['PerformanceCycle'] ??
  mongoose.model<IPerformanceCycle>('PerformanceCycle', PerformanceCycleSchema);

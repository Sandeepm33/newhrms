// ============================================================
// HRMS — Recruitment Model
// Tracks job requisitions, vacancies, and applicant pipelines
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
}

export interface IJobRequisition extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  title: string;
  department: string;
  location: string;
  openingsCount: number;
  applicantsCount: number;
  status: JobStatus;
  postedDate: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobRequisitionSchema = new Schema<IJobRequisition>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, default: 'General' },
    location: { type: String, default: 'Headquarters' },
    openingsCount: { type: Number, required: true, default: 1 },
    applicantsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },
    postedDate: { type: Date, default: Date.now },
    description: { type: String },
  },
  { timestamps: true, collection: 'jobRequisitions' }
);

JobRequisitionSchema.index({ organizationId: 1, status: 1 });

export const JobRequisition: Model<IJobRequisition> =
  mongoose.models['JobRequisition'] ??
  mongoose.model<IJobRequisition>('JobRequisition', JobRequisitionSchema);

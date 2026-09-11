// ============================================================
// HRMS — Attendance Model
// Tracks employee daily clock-in/out, hours worked, and status
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LATE = 'LATE',
  OVERTIME = 'OVERTIME',
  ON_LEAVE = 'ON_LEAVE',
}

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date; // Midnight UTC date of entry
  clockIn?: Date;
  clockOut?: Date;
  breakDurationMinutes: number;
  totalHours: number;
  status: AttendanceStatus;
  ipAddress?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  notes?: string;
  isRegularized: boolean;
  regularizationReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true, index: true },
    clockIn: { type: Date },
    clockOut: { type: Date },
    breakDurationMinutes: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      index: true,
    },
    ipAddress: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    notes: { type: String },
    isRegularized: { type: Boolean, default: false },
    regularizationReason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'attendances' }
);

AttendanceSchema.index({ organizationId: 1, employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ organizationId: 1, date: 1, status: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.models['Attendance'] ?? mongoose.model<IAttendance>('Attendance', AttendanceSchema);

// ============================================================
// HRMS — Organization Model
// Root multi-tenant entity — all other data hangs off this
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { SubscriptionStatus } from '@/types';

export interface IOrganizationSettings {
  enabledModules: string[];
  maxEmployees: number;
  currency: string;
  timezone: string;
  language: string;
  fiscalYearStart: number; // 1-12 (month)
  dateFormat: string;
  workingDays: number[];   // 0=Sun, 1=Mon, ..., 6=Sat
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string;   // "18:00"
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  country: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  planId?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry?: Date;
  trialEndsAt?: Date;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  settings: IOrganizationSettings;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: [true, 'Organization name is required'], trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: { type: String },
    website: { type: String },
    industry: { type: String },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    country: { type: String, required: true, default: 'India' },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    contactEmail: { type: String, lowercase: true },
    contactPhone: { type: String },
    gstin: { type: String },
    pan: { type: String },
    cin: { type: String },
    planId: { type: String },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIAL,
      index: true,
    },
    subscriptionExpiry: { type: Date },
    trialEndsAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    settings: {
      enabledModules: { type: [String], default: ['employees', 'attendance', 'leave'] },
      maxEmployees: { type: Number, default: 100 },
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      language: { type: String, default: 'en' },
      fiscalYearStart: { type: Number, default: 4 }, // April
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri
      workingHoursStart: { type: String, default: '09:00' },
      workingHoursEnd: { type: String, default: '18:00' },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'organizations',
  }
);

OrganizationSchema.index({ isActive: 1, subscriptionStatus: 1 });

export const Organization: Model<IOrganization> =
  mongoose.models['Organization'] ??
  mongoose.model<IOrganization>('Organization', OrganizationSchema);

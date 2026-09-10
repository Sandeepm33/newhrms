import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxEmployees: number;
  includedModules: string[]; // array of module slugs from config/modules.ts
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: [true, 'Plan name is required'], trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: '' },
    monthlyPrice: { type: Number, required: true, default: 0 },
    annualPrice: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    maxEmployees: { type: Number, required: true, default: 50 },
    includedModules: { type: [String], default: [] },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: 'plans',
  }
);

export const Plan: Model<IPlan> =
  mongoose.models['Plan'] ?? mongoose.model<IPlan>('Plan', PlanSchema);

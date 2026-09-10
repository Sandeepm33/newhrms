// ============================================================
// HRMS — User Model
// Authentication identity — separate from Employee profile
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
  organizationIds: mongoose.Types.ObjectId[];
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    avatar: { type: String },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false, index: true },
    organizationIds: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Compound index for org membership queries
UserSchema.index({ organizationIds: 1, isActive: 1 });

export const User: Model<IUser> =
  mongoose.models['User'] ?? mongoose.model<IUser>('User', UserSchema);

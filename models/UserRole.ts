// ============================================================
// HRMS — UserRole Model (Scoped)
// User → Role → Org + DataScope + ScopeTarget
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { DataScope } from '@/types';

export interface IUserRole extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  scope: DataScope;
  scopeTargetId?: mongoose.Types.ObjectId;
  scopeTargetType?: 'Department' | 'Location' | 'BusinessUnit' | 'LegalEntity' | 'Team';
  isActive: boolean;
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt: Date;
  expiresAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserRoleSchema = new Schema<IUserRole>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    scope: {
      type: String,
      enum: Object.values(DataScope),
      default: DataScope.ORGANIZATION,
    },
    scopeTargetId: { type: Schema.Types.ObjectId },
    scopeTargetType: {
      type: String,
      enum: ['Department', 'Location', 'BusinessUnit', 'LegalEntity', 'Team'],
    },
    isActive: { type: Boolean, default: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'userRoles',
  }
);

UserRoleSchema.index({ userId: 1, organizationId: 1, isActive: 1 });
UserRoleSchema.index({ organizationId: 1, roleId: 1 });

export const UserRole: Model<IUserRole> =
  mongoose.models['UserRole'] ?? mongoose.model<IUserRole>('UserRole', UserRoleSchema);

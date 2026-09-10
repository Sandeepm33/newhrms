// ============================================================
// HRMS — Role Model
// System roles (18 built-in) + Custom roles per organization
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId; // null = system role
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  color?: string;
  icon?: string;
  parentRoleId?: mongoose.Types.ObjectId;
  sortOrder: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    isSystem: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
    color: { type: String },
    icon: { type: String },
    parentRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    sortOrder: { type: Number, default: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

// Unique slug per org (system roles have null orgId)
RoleSchema.index({ slug: 1, organizationId: 1 }, { unique: true });

export const Role: Model<IRole> =
  mongoose.models['Role'] ?? mongoose.model<IRole>('Role', RoleSchema);

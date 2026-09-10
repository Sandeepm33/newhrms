// ============================================================
// HRMS — Module & SubModule Models
// Powers the dynamic sidebar and permission system
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  icon: string;
  route: string;
  parentModuleId?: mongoose.Types.ObjectId;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  group?: string; // e.g. "Core HR", "Payroll", "Recruitment"
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'LayoutDashboard' },
    route: { type: String, required: true },
    parentModuleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    isSystem: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 100 },
    group: { type: String },
  },
  { timestamps: true, collection: 'modules' }
);

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  submoduleId?: mongoose.Types.ObjectId;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    submoduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    action: { type: String, required: true, uppercase: true },
    description: { type: String },
  },
  { timestamps: true, collection: 'permissions' }
);

PermissionSchema.index({ moduleId: 1, submoduleId: 1, action: 1 }, { unique: true });

export interface IRolePermission extends Document {
  _id: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  permissionId: mongoose.Types.ObjectId;
  isGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
  {
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: 'Permission', required: true },
    isGranted: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'rolePermissions' }
);

RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export const Module: Model<IModule> =
  mongoose.models['Module'] ?? mongoose.model<IModule>('Module', ModuleSchema);

export const Permission: Model<IPermission> =
  mongoose.models['Permission'] ??
  mongoose.model<IPermission>('Permission', PermissionSchema);

export const RolePermission: Model<IRolePermission> =
  mongoose.models['RolePermission'] ??
  mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);

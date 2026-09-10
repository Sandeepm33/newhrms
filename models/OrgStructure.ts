// ============================================================
// HRMS — Organization Structure Models
// Department, Team, Location, BusinessUnit, LegalEntity,
// Designation, EmploymentType
// All tenant-isolated with organizationId
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Department ────────────────────────────────────────────────
export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;
  parentDepartmentId?: mongoose.Types.ObjectId;
  headEmployeeId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String },
    parentDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    headEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'departments' }
);
DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ organizationId: 1, isActive: 1 });

// ── Team ──────────────────────────────────────────────────────
export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  leadEmployeeId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    leadEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'teams' }
);
TeamSchema.index({ organizationId: 1, isActive: 1 });

// ── Location ──────────────────────────────────────────────────
export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  type?: 'OFFICE' | 'BRANCH' | 'REMOTE' | 'WAREHOUSE' | 'FACTORY';
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  timezone?: string;
  isHQ: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String },
    type: { type: String, enum: ['OFFICE', 'BRANCH', 'REMOTE', 'WAREHOUSE', 'FACTORY'] },
    address: { line1: String, city: String, state: String, country: String, pincode: String },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isHQ: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'locations' }
);
LocationSchema.index({ organizationId: 1, isActive: 1 });

// ── Business Unit ─────────────────────────────────────────────
export interface IBusinessUnit extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessUnitSchema = new Schema<IBusinessUnit>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'businessUnits' }
);
BusinessUnitSchema.index({ organizationId: 1, isActive: 1 });

// ── Legal Entity ──────────────────────────────────────────────
export interface ILegalEntity extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  registrationNumber?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LegalEntitySchema = new Schema<ILegalEntity>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String },
    gstin: { type: String },
    pan: { type: String },
    tan: { type: String },
    cin: { type: String },
    country: { type: String, default: 'India' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'legalEntities' }
);

// ── Designation ───────────────────────────────────────────────
export interface IDesignation extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  level?: number; // 1=junior, 10=C-suite
  departmentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignationSchema = new Schema<IDesignation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String },
    level: { type: Number, min: 1, max: 20 },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'designations' }
);
DesignationSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// ── Employment Type ───────────────────────────────────────────
export interface IEmploymentType extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  isFullTime: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmploymentTypeSchema = new Schema<IEmploymentType>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String },
    isFullTime: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'employmentTypes' }
);

// ── Model Exports ─────────────────────────────────────────────
export const Department: Model<IDepartment> =
  mongoose.models['Department'] ?? mongoose.model<IDepartment>('Department', DepartmentSchema);

export const Team: Model<ITeam> =
  mongoose.models['Team'] ?? mongoose.model<ITeam>('Team', TeamSchema);

export const Location: Model<ILocation> =
  mongoose.models['Location'] ?? mongoose.model<ILocation>('Location', LocationSchema);

export const BusinessUnit: Model<IBusinessUnit> =
  mongoose.models['BusinessUnit'] ??
  mongoose.model<IBusinessUnit>('BusinessUnit', BusinessUnitSchema);

export const LegalEntity: Model<ILegalEntity> =
  mongoose.models['LegalEntity'] ??
  mongoose.model<ILegalEntity>('LegalEntity', LegalEntitySchema);

export const Designation: Model<IDesignation> =
  mongoose.models['Designation'] ??
  mongoose.model<IDesignation>('Designation', DesignationSchema);

export const EmploymentType: Model<IEmploymentType> =
  mongoose.models['EmploymentType'] ??
  mongoose.model<IEmploymentType>('EmploymentType', EmploymentTypeSchema);

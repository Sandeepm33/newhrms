// ============================================================
// HRMS — Employee Core Model + Sub-domain Collections
// Core document is lean; sensitive fields in separate collections
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { EmployeeStatus } from '@/types';

// ── Employee Core ─────────────────────────────────────────────
export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  employeeCode: string;
  status: EmployeeStatus;
  departmentId?: mongoose.Types.ObjectId;
  designationId?: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  businessUnitId?: mongoose.Types.ObjectId;
  legalEntityId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  reportingManagerId?: mongoose.Types.ObjectId;
  employmentTypeId?: mongoose.Types.ObjectId;
  joiningDate?: Date;
  confirmationDate?: Date;
  probationEndDate?: Date;
  noticePeriodDays?: number;
  exitDate?: Date;
  exitReason?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    employeeCode: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE,
      index: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    designationId: { type: Schema.Types.ObjectId, ref: 'Designation' },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit' },
    legalEntityId: { type: Schema.Types.ObjectId, ref: 'LegalEntity' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    reportingManagerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employmentTypeId: { type: Schema.Types.ObjectId, ref: 'EmploymentType' },
    joiningDate: { type: Date },
    confirmationDate: { type: Date },
    probationEndDate: { type: Date },
    noticePeriodDays: { type: Number, default: 30 },
    exitDate: { type: Date },
    exitReason: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'employees' }
);

EmployeeSchema.index({ organizationId: 1, employeeCode: 1 }, { unique: true });
EmployeeSchema.index({ organizationId: 1, status: 1, isActive: 1 });
EmployeeSchema.index({ organizationId: 1, reportingManagerId: 1 });
EmployeeSchema.index({ organizationId: 1, departmentId: 1 });

// ── Employee Personal Info ────────────────────────────────────
export interface IEmployeePersonal extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  displayName?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  nationality?: string;
  bloodGroup?: string;
  personalEmail?: string;
  personalPhone?: string;
  avatar?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeePersonalSchema = new Schema<IEmployeePersonal>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    displayName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    maritalStatus: { type: String, enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] },
    nationality: { type: String },
    bloodGroup: { type: String },
    personalEmail: { type: String, lowercase: true },
    personalPhone: { type: String },
    avatar: { type: String },
    aadhaarNumber: { type: String, select: false },
    panNumber: { type: String },
    passportNumber: { type: String, select: false },
    drivingLicense: { type: String },
  },
  { timestamps: true, collection: 'employeePersonals' }
);

EmployeePersonalSchema.index({ organizationId: 1 });
// Full text search on names
EmployeePersonalSchema.index({ firstName: 'text', lastName: 'text', displayName: 'text' });

// ── Employee Contact ──────────────────────────────────────────
export interface IEmployeeContact extends Document {
  employeeId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  workEmail?: string;
  workPhone?: string;
  extension?: string;
  currentAddress?: {
    line1?: string; city?: string; state?: string; country?: string; pincode?: string;
  };
  permanentAddress?: {
    line1?: string; city?: string; state?: string; country?: string; pincode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeContactSchema = new Schema<IEmployeeContact>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    workEmail: { type: String, lowercase: true },
    workPhone: { type: String },
    extension: { type: String },
    currentAddress: { line1: String, city: String, state: String, country: String, pincode: String },
    permanentAddress: { line1: String, city: String, state: String, country: String, pincode: String },
  },
  { timestamps: true, collection: 'employeeContacts' }
);

// ── Employee Emergency Contact ────────────────────────────────
const EmergencyContactSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String },
    address: String,
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'employeeEmergencyContacts' }
);

// ── Employee Bank Account (sensitive — restricted permission) ─
const EmployeeBankAccountSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, select: false },
    ifscCode: { type: String, required: true },
    accountType: { type: String, enum: ['SAVINGS', 'CURRENT'] },
    accountHolderName: { type: String, required: true },
    isPrimary: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'employeeBankAccounts' }
);

// ── Employee Education ────────────────────────────────────────
const EmployeeEducationSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: { type: String },
    startYear: Number,
    endYear: Number,
    grade: String,
    documentKey: String,
  },
  { timestamps: true, collection: 'employeeEducations' }
);

// ── Employee Experience ───────────────────────────────────────
const EmployeeExperienceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    companyName: { type: String, required: true },
    designation: String,
    department: String,
    startDate: Date,
    endDate: Date,
    isCurrentEmployer: { type: Boolean, default: false },
    description: String,
    documentKey: String,
  },
  { timestamps: true, collection: 'employeeExperiences' }
);

// ── Employee Document ─────────────────────────────────────────
const EmployeeDocumentSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    category: { type: String },
    fileKey: { type: String, required: true },
    fileName: String,
    fileSize: Number,
    mimeType: String,
    expiryDate: Date,
    isVerified: { type: Boolean, default: false },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'employeeDocuments' }
);

EmployeeDocumentSchema.index({ organizationId: 1, employeeId: 1 });

// ── Employee History (Business transitions) ───────────────────
export interface IEmployeeHistory extends Document {
  employeeId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  eventType: string;
  effectiveDate: Date;
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  approvedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  workflowApprovalId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EmployeeHistorySchema = new Schema<IEmployeeHistory>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    eventType: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    from: { type: Schema.Types.Mixed, default: {} },
    to: { type: Schema.Types.Mixed, default: {} },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    workflowApprovalId: { type: Schema.Types.ObjectId, ref: 'WorkflowApproval' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // immutable
    collection: 'employeeHistories',
  }
);

EmployeeHistorySchema.index({ employeeId: 1, effectiveDate: -1 });

// ── Compensation History ──────────────────────────────────────
const CompensationHistorySchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    effectiveDate: { type: Date, required: true },
    ctcAnnual: Number,
    grossMonthly: Number,
    netMonthly: Number,
    components: [{ name: String, amount: Number, type: String }],
    revisionReason: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    workflowApprovalId: { type: Schema.Types.ObjectId, ref: 'WorkflowApproval' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // immutable
    collection: 'compensationHistories',
  }
);

// ── Model Exports ─────────────────────────────────────────────
export const Employee: Model<IEmployee> =
  mongoose.models['Employee'] ?? mongoose.model<IEmployee>('Employee', EmployeeSchema);

export const EmployeePersonal: Model<IEmployeePersonal> =
  mongoose.models['EmployeePersonal'] ??
  mongoose.model<IEmployeePersonal>('EmployeePersonal', EmployeePersonalSchema);

export const EmployeeContact =
  mongoose.models['EmployeeContact'] ??
  mongoose.model('EmployeeContact', EmployeeContactSchema);

export const EmployeeEmergencyContact =
  mongoose.models['EmployeeEmergencyContact'] ??
  mongoose.model('EmployeeEmergencyContact', EmergencyContactSchema);

export const EmployeeBankAccount =
  mongoose.models['EmployeeBankAccount'] ??
  mongoose.model('EmployeeBankAccount', EmployeeBankAccountSchema);

export const EmployeeEducation =
  mongoose.models['EmployeeEducation'] ??
  mongoose.model('EmployeeEducation', EmployeeEducationSchema);

export const EmployeeExperience =
  mongoose.models['EmployeeExperience'] ??
  mongoose.model('EmployeeExperience', EmployeeExperienceSchema);

export const EmployeeDocument =
  mongoose.models['EmployeeDocument'] ??
  mongoose.model('EmployeeDocument', EmployeeDocumentSchema);

export const EmployeeHistory: Model<IEmployeeHistory> =
  mongoose.models['EmployeeHistory'] ??
  mongoose.model<IEmployeeHistory>('EmployeeHistory', EmployeeHistorySchema);

export const CompensationHistory =
  mongoose.models['CompensationHistory'] ??
  mongoose.model('CompensationHistory', CompensationHistorySchema);

// ============================================================
// HRMS — Employee Repository
// All MongoDB queries — no business logic, pure data access
// ============================================================

import mongoose from 'mongoose';
import { Employee, EmployeePersonal, EmployeeContact } from '@/models/Employee';
import { withTenantFilter } from '@/lib/tenant';
import type { CreateEmployeeInput } from '@/validators';

export interface EmployeeListResult {
  employees: unknown[];
  total: number;
}

const $unwindPreserve = (path: string) => ({
  $unwind: { path, preserveNullAndEmptyArrays: true },
});

export async function findEmployees(
  orgId: string,
  options: {
    page: number;
    limit: number;
    skip: number;
    search: string;
    sortBy: string;
    sortOrder: 1 | -1;
    departmentId?: string;
    locationId?: string;
    status?: string;
  }
): Promise<EmployeeListResult> {
  const baseFilter = withTenantFilter({} as Record<string, unknown>, orgId);

  if (options.status) baseFilter['status'] = options.status;
  if (options.departmentId)
    baseFilter['departmentId'] = new mongoose.Types.ObjectId(options.departmentId);
  if (options.locationId)
    baseFilter['locationId'] = new mongoose.Types.ObjectId(options.locationId);

  const pipeline: mongoose.PipelineStage[] = [
    { $match: baseFilter },
    {
      $lookup: {
        from: 'employeePersonals',
        localField: '_id',
        foreignField: 'employeeId',
        as: 'personal',
      },
    },
    $unwindPreserve('$personal'),
  ];

  if (options.search) {
    pipeline.push({
      $match: {
        $or: [
          { 'personal.firstName': { $regex: options.search, $options: 'i' } },
          { 'personal.lastName': { $regex: options.search, $options: 'i' } },
          { 'personal.displayName': { $regex: options.search, $options: 'i' } },
          { employeeCode: { $regex: options.search, $options: 'i' } },
          { 'personal.personalEmail': { $regex: options.search, $options: 'i' } },
        ],
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const [countResult] = await Employee.aggregate(countPipeline);
  const total = (countResult as { total?: number } | undefined)?.total ?? 0;

  pipeline.push(
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    $unwindPreserve('$department'),
    {
      $lookup: {
        from: 'designations',
        localField: 'designationId',
        foreignField: '_id',
        as: 'designation',
      },
    },
    $unwindPreserve('$designation'),
    {
      $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location',
      },
    },
    $unwindPreserve('$location'),
    {
      $sort: {
        'personal.firstName': options.sortOrder,
      },
    },
    { $skip: options.skip },
    { $limit: options.limit },
    {
      $project: {
        _id: 1,
        employeeCode: 1,
        status: 1,
        joiningDate: 1,
        isActive: 1,
        createdAt: 1,
        'personal.firstName': 1,
        'personal.lastName': 1,
        'personal.displayName': 1,
        'personal.avatar': 1,
        'personal.gender': 1,
        'personal.personalEmail': 1,
        'department.name': 1,
        'department._id': 1,
        'designation.name': 1,
        'designation._id': 1,
        'location.name': 1,
        'location._id': 1,
      },
    }
  );

  const employees = await Employee.aggregate(pipeline);
  return { employees, total };
}

export async function findEmployeeById(
  employeeId: string,
  orgId: string
): Promise<unknown | null> {
  const filter = withTenantFilter(
    { _id: new mongoose.Types.ObjectId(employeeId) } as Record<string, unknown>,
    orgId
  );

  const pipeline: mongoose.PipelineStage[] = [
    { $match: filter },
    {
      $lookup: { from: 'employeePersonals', localField: '_id', foreignField: 'employeeId', as: 'personal' },
    },
    $unwindPreserve('$personal'),
    {
      $lookup: { from: 'employeeContacts', localField: '_id', foreignField: 'employeeId', as: 'contact' },
    },
    $unwindPreserve('$contact'),
    {
      $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'department' },
    },
    $unwindPreserve('$department'),
    {
      $lookup: { from: 'designations', localField: 'designationId', foreignField: '_id', as: 'designation' },
    },
    $unwindPreserve('$designation'),
    {
      $lookup: { from: 'locations', localField: 'locationId', foreignField: '_id', as: 'location' },
    },
    $unwindPreserve('$location'),
    {
      $lookup: {
        from: 'employees',
        localField: 'reportingManagerId',
        foreignField: '_id',
        as: 'manager',
        pipeline: [
          { $lookup: { from: 'employeePersonals', localField: '_id', foreignField: 'employeeId', as: 'personal' } },
          { $unwind: { path: '$personal', preserveNullAndEmptyArrays: true } },
        ],
      },
    },
    $unwindPreserve('$manager'),
  ];

  const [employee] = await Employee.aggregate(pipeline);
  return employee ?? null;
}

export async function createEmployee(
  orgId: string,
  data: CreateEmployeeInput,
  createdById: string
): Promise<string> {
  let { employeeCode } = data;
  if (!employeeCode) {
    const count = await Employee.countDocuments({ organizationId: orgId });
    employeeCode = `EMP${String(count + 1).padStart(4, '0')}`;
  }

  const employee = await Employee.create({
    organizationId: orgId,
    employeeCode,
    joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
    departmentId: data.departmentId
      ? new mongoose.Types.ObjectId(data.departmentId)
      : undefined,
    designationId: data.designationId
      ? new mongoose.Types.ObjectId(data.designationId)
      : undefined,
    locationId: data.locationId
      ? new mongoose.Types.ObjectId(data.locationId)
      : undefined,
    reportingManagerId: data.reportingManagerId
      ? new mongoose.Types.ObjectId(data.reportingManagerId)
      : undefined,
    employmentTypeId: data.employmentTypeId
      ? new mongoose.Types.ObjectId(data.employmentTypeId)
      : undefined,
    businessUnitId: data.businessUnitId
      ? new mongoose.Types.ObjectId(data.businessUnitId)
      : undefined,
    legalEntityId: data.legalEntityId
      ? new mongoose.Types.ObjectId(data.legalEntityId)
      : undefined,
    createdBy: new mongoose.Types.ObjectId(createdById),
  });

  await EmployeePersonal.create({
    employeeId: employee._id,
    organizationId: orgId,
    firstName: data.firstName,
    lastName: data.lastName,
    displayName: `${data.firstName} ${data.lastName}`,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    personalEmail: data.personalEmail,
    personalPhone: data.phone,
  });

  await EmployeeContact.create({
    employeeId: employee._id,
    organizationId: orgId,
    workEmail: data.workEmail,
  });

  return (employee._id as mongoose.Types.ObjectId).toString();
}

export async function updateEmployee(
  employeeId: string,
  orgId: string,
  data: Partial<CreateEmployeeInput>,
  updatedById: string
): Promise<boolean> {
  const filter = withTenantFilter(
    { _id: new mongoose.Types.ObjectId(employeeId) } as Record<string, unknown>,
    orgId
  );

  const updateData: Record<string, unknown> = { updatedBy: updatedById };
  if (data.departmentId)
    updateData['departmentId'] = new mongoose.Types.ObjectId(data.departmentId);
  if (data.designationId)
    updateData['designationId'] = new mongoose.Types.ObjectId(data.designationId);
  if (data.locationId)
    updateData['locationId'] = new mongoose.Types.ObjectId(data.locationId);
  if (data.reportingManagerId)
    updateData['reportingManagerId'] = new mongoose.Types.ObjectId(data.reportingManagerId);
  if (data.joiningDate) updateData['joiningDate'] = new Date(data.joiningDate);

  const result = await Employee.updateOne(
    filter as never,
    { $set: updateData }
  );

  if (data.firstName ?? data.lastName ?? data.gender ?? data.personalEmail) {
    const personalUpdate: Record<string, unknown> = {};
    if (data.firstName) personalUpdate['firstName'] = data.firstName;
    if (data.lastName) personalUpdate['lastName'] = data.lastName;
    if (data.firstName && data.lastName)
      personalUpdate['displayName'] = `${data.firstName} ${data.lastName}`;
    if (data.gender) personalUpdate['gender'] = data.gender;
    if (data.personalEmail) personalUpdate['personalEmail'] = data.personalEmail;

    await EmployeePersonal.updateOne(
      { employeeId: new mongoose.Types.ObjectId(employeeId) },
      { $set: personalUpdate }
    );
  }

  return result.matchedCount > 0;
}

export async function softDeleteEmployee(
  employeeId: string,
  orgId: string
): Promise<boolean> {
  const filter = withTenantFilter(
    { _id: new mongoose.Types.ObjectId(employeeId) } as Record<string, unknown>,
    orgId
  );
  const result = await Employee.updateOne(
    filter as never,
    { $set: { isActive: false, status: 'TERMINATED' } }
  );
  return result.matchedCount > 0;
}

export async function countEmployeesByStatus(
  orgId: string
): Promise<Record<string, number>> {
  const result = await Employee.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(orgId), isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {};
  for (const r of result as Array<{ _id: string; count: number }>) {
    counts[r._id] = r.count;
  }
  return counts;
}

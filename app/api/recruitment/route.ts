// ============================================================
// HRMS — Recruitment API Route
// GET  /api/recruitment — list job openings & applicant stats
// POST /api/recruitment — post new job requisition
// ============================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/apiResponse';
import { getOrgIdFromSession } from '@/lib/tenant';
import connectMongo from '@/lib/mongodb';
import { JobRequisition, JobStatus } from '@/models';
import type { SessionUser } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    let jobs = await JobRequisition.find({ organizationId: orgId }).sort({ createdAt: -1 }).lean();

    if (jobs.length === 0) {
      const defaults = [
        {
          organizationId: orgId,
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'Headquarters',
          openingsCount: 3,
          applicantsCount: 42,
          status: JobStatus.OPEN,
          postedDate: new Date('2026-08-15'),
        },
        {
          organizationId: orgId,
          title: 'HR Operations Lead',
          department: 'Human Resources',
          location: 'Remote',
          openingsCount: 1,
          applicantsCount: 18,
          status: JobStatus.OPEN,
          postedDate: new Date('2026-08-20'),
        },
      ];
      await JobRequisition.insertMany(defaults);
      jobs = await JobRequisition.find({ organizationId: orgId }).sort({ createdAt: -1 }).lean();
    }

    const totalOpenings = jobs.reduce((sum, j) => sum + (j.status === JobStatus.OPEN ? j.openingsCount : 0), 0);
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantsCount, 0);

    return successResponse(
      {
        jobs,
        stats: {
          activeJobs: jobs.filter((j) => j.status === JobStatus.OPEN).length,
          totalOpenings,
          totalApplicants,
        },
      },
      'Recruitment data retrieved',
      200
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return handleApiError({ statusCode: 401, message: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    const user = session.user as SessionUser;
    const orgId = getOrgIdFromSession(user);

    await connectMongo();

    const body = await req.json();
    const { title, department, location, openingsCount, description } = body as {
      title: string;
      department?: string;
      location?: string;
      openingsCount?: number;
      description?: string;
    };

    const newJob = new JobRequisition({
      organizationId: orgId,
      title,
      department: department || 'Engineering',
      location: location || 'Headquarters',
      openingsCount: Number(openingsCount) || 1,
      applicantsCount: 0,
      status: JobStatus.OPEN,
      postedDate: new Date(),
      description,
    });

    await newJob.save();

    return successResponse(newJob, 'Job requisition posted successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}

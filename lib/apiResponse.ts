// ============================================================
// HRMS — API Response Utilities
// ============================================================

import { NextResponse } from 'next/server';
import type { ApiSuccess, ApiError } from '@/types';
import { AppError, ValidationError } from '@/lib/errors';
import { ZodError, type ZodIssue } from 'zod';

export function successResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: ApiSuccess<T>['pagination']
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = { success: true, data, message };
  if (pagination) body.pagination = pagination;
  return NextResponse.json(body, { status: statusCode });
}

export function errorResponse(
  message: string,
  code: string,
  statusCode = 500,
  errors?: ApiError['errors']
): NextResponse<ApiError> {
  const body: ApiError = { success: false, message, code };
  if (errors?.length) body.errors = errors;
  return NextResponse.json(body, { status: statusCode });
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('[API Error]', error);

  if (error instanceof ZodError) {
    const errors = error.issues.map((e: ZodIssue) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse('Validation failed', 'VALIDATION_ERROR', 422, errors);
  }

  if (error instanceof AppError) {
    const body: ApiError = {
      success: false,
      message: error.message,
      code: error.code,
    };
    if (error instanceof ValidationError && error.errors.length > 0) {
      body.errors = error.errors;
    }
    return NextResponse.json(body, { status: error.statusCode });
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  ) {
    return errorResponse('A record with this value already exists', 'DUPLICATE_KEY', 409);
  }

  // Handle plain objects passed from route handlers
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error &&
    'code' in error
  ) {
    const e = error as { statusCode: number; message: string; code: string };
    return errorResponse(e.message, e.code, e.statusCode);
  }

  return errorResponse('An unexpected error occurred', 'INTERNAL_ERROR', 500);
}

export function buildPagination(
  page: number,
  limit: number,
  total: number
): ApiSuccess<unknown>['pagination'] {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasMore: page < totalPages };
}

export function parsePaginationQuery(searchParams: URLSearchParams): {
  page: number; limit: number; skip: number;
  search: string; sortBy: string; sortOrder: 1 | -1;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const skip = (page - 1) * limit;
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  return { page, limit, skip, search, sortBy, sortOrder };
}

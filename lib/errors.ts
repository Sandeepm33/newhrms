// ============================================================
// HRMS — Error Classes
// Structured errors that propagate cleanly through the stack
// ============================================================

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'A conflict occurred with the existing data') {
    super(message, 'CONFLICT', 409);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message = 'Validation failed',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.errors = errors;
  }
}

export class TenantError extends AppError {
  constructor(message = 'Tenant access violation') {
    super(message, 'TENANT_VIOLATION', 403);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 'RATE_LIMIT', 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'A database error occurred') {
    super(message, 'DATABASE_ERROR', 500, false);
  }
}

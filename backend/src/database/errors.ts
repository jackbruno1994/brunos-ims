import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, code: string = 'DATABASE_ERROR', isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    this.name = 'DatabaseError';

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, DatabaseError);
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

// Map Prisma errors to application errors
export function handlePrismaError(error: unknown): DatabaseError {
  // Prisma v5 error types - check if they exist before using
  const PrismaClientKnownRequestError = (Prisma as any).PrismaClientKnownRequestError;
  const PrismaClientUnknownRequestError = (Prisma as any).PrismaClientUnknownRequestError;
  const PrismaClientRustPanicError = (Prisma as any).PrismaClientRustPanicError;
  const PrismaClientInitializationError = (Prisma as any).PrismaClientInitializationError;
  const PrismaClientValidationError = (Prisma as any).PrismaClientValidationError;

  if (PrismaClientKnownRequestError && error instanceof PrismaClientKnownRequestError) {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        // Unique constraint violation
        return new ConflictError(`Unique constraint violation: ${prismaError.meta?.target}`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Record');
      
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError(`Foreign key constraint violation: ${prismaError.meta?.field_name}`);
      
      case 'P2014':
        // Invalid ID
        return new ValidationError('Invalid ID provided');
      
      case 'P2000':
        // Value too long
        return new ValidationError('Value too long for database field');
      
      case 'P2001':
        // Record not found in where condition
        return new NotFoundError('Record');
      
      case 'P2004':
        // Constraint failed
        return new ValidationError(`Database constraint failed: ${prismaError.message}`);
      
      default:
        return new DatabaseError(`Database error: ${prismaError.message}`, prismaError.code);
    }
  }

  if (PrismaClientUnknownRequestError && error instanceof PrismaClientUnknownRequestError) {
    return new DatabaseError('Unknown database error occurred', 'UNKNOWN_ERROR');
  }

  if (PrismaClientRustPanicError && error instanceof PrismaClientRustPanicError) {
    return new DatabaseError('Database engine error', 'ENGINE_ERROR', false);
  }

  if (PrismaClientInitializationError && error instanceof PrismaClientInitializationError) {
    return new DatabaseError('Database initialization error', 'INIT_ERROR', false);
  }

  if (PrismaClientValidationError && error instanceof PrismaClientValidationError) {
    const prismaError = error as any;
    return new ValidationError(`Validation error: ${prismaError.message}`);
  }

  // If it's already a DatabaseError, return as is
  if (error instanceof DatabaseError) {
    return error;
  }

  // For any other error
  return new DatabaseError(
    error instanceof Error ? error.message : 'Unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

// Database operation result wrapper
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: DatabaseError;
}

// Safe database operation wrapper
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<DatabaseResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const dbError = handlePrismaError(error);
    console.error('Database operation failed:', dbError);
    return { success: false, error: dbError };
  }
}

// Retry wrapper for database operations
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on validation errors or operational errors
      const dbError = handlePrismaError(error);
      if (dbError.isOperational && dbError.code !== 'ENGINE_ERROR') {
        throw dbError;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      console.warn(`Database operation failed, retrying... (${attempt}/${maxRetries})`);
    }
  }

  throw handlePrismaError(lastError!);
}
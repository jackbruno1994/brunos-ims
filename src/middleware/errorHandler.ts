import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../utils';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    res.status(400).json(createErrorResponse(
      error.message,
      'Validation error'
    ));
    return;
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    res.status(409).json(createErrorResponse(
      'Duplicate entry',
      'Resource already exists'
    ));
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json(createErrorResponse(
      'Invalid ID format',
      'Bad request'
    ));
    return;
  }

  // Default error
  res.status(500).json(createErrorResponse(
    'Internal server error',
    'Something went wrong'
  ));
};
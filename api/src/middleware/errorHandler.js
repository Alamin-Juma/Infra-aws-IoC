import Prisma from '@prisma/client';

const { PrismaClientKnownRequestError, PrismaClientValidationError } = Prisma;

const ERROR_TYPES = {
  P2002: { status: 409, message: 'Conflict: Unique constraint violation' },
  P2003: { status: 400, message: 'Bad Request: Foreign key constraint failed' },
  P2025: { status: 404, message: 'Not Found: Record does not exist' },

  VALIDATION_ERROR: { status: 400, message: 'Bad Request: Validation error' },
  UNAUTHORIZED: {
    status: 401,
    message: 'Unauthorized: Authentication required',
  },
  FORBIDDEN: { status: 403, message: 'Forbidden: Insufficient permissions' },
  NOT_FOUND: { status: 404, message: 'Not Found: Resource does not exist' },
  CONFLICT: { status: 409, message: 'Conflict: Resource already exists' },
  SERVER_ERROR: { status: 500, message: 'Internal Server Error' },
};

class AppError extends Error {
  constructor(type, message, details = null) {
    super(message || ERROR_TYPES[type]?.message || 'Application error');
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.status = ERROR_TYPES[type]?.status || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let errorResponse = {
    success: false,
    message: 'Internal Server Error',
  };

  if (err instanceof AppError) {
    statusCode = err.status;
    errorResponse.message = err.message;
    if (err.details) {
      errorResponse.details = err.details;
    }
  } else if (err instanceof PrismaClientKnownRequestError) {
    const prismaError = ERROR_TYPES[err.code];
    if (prismaError) {
      statusCode = prismaError.status;
      errorResponse.message = prismaError.message;
    }
    errorResponse.code = err.code;
  } else if (err instanceof PrismaClientValidationError) {
    statusCode = 400;
    errorResponse.message = 'Invalid data format or schema violation';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.message = err.message;
    errorResponse.details = err.errors;
  } else {
    if (process.env.NODE_ENV === 'production') {
      errorResponse.message = 'Internal Server Error';
    } else {
      errorResponse.message = err.message || 'Internal Server Error';
      errorResponse.stack = err.stack;
    }
  }

  res.status(statusCode).json(errorResponse);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    'NOT_FOUND',
    `Route ${req?.originalUrl} not found`,
  );
  next(error);
};

export { AppError, errorHandler, asyncHandler, notFoundHandler };

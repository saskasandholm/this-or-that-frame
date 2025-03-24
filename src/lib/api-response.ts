import { NextResponse } from 'next/server';
import AsyncErrorHandler, { StandardizedError } from './AsyncErrorHandler';

/**
 * HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * API error codes
 */
export const ApiErrorCode = {
  // Authentication & Authorization errors (1000-1999)
  UNAUTHORIZED: 'AUTH_001',
  INVALID_TOKEN: 'AUTH_002',
  TOKEN_EXPIRED: 'AUTH_003',
  INSUFFICIENT_PERMISSIONS: 'AUTH_004',
  
  // Validation errors (2000-2999)
  VALIDATION_FAILED: 'VAL_001',
  REQUIRED_FIELD_MISSING: 'VAL_002',
  INVALID_FORMAT: 'VAL_003',
  
  // Resource errors (3000-3999)
  RESOURCE_NOT_FOUND: 'RES_001',
  RESOURCE_ALREADY_EXISTS: 'RES_002',
  RESOURCE_CONFLICT: 'RES_003',
  
  // Database errors (4000-4999)
  DATABASE_ERROR: 'DB_001',
  QUERY_FAILED: 'DB_002',
  CONNECTION_ERROR: 'DB_003',
  
  // External service errors (5000-5999)
  EXTERNAL_SERVICE_ERROR: 'EXT_001',
  RATE_LIMIT_EXCEEDED: 'EXT_002',
  INTEGRATION_ERROR: 'EXT_003',
  
  // Wallet/Frame errors (6000-6999)
  WALLET_CONNECTION_ERROR: 'WALLET_001',
  FRAME_ERROR: 'FRAME_001',
  
  // General errors (9000-9999)
  INTERNAL_SERVER_ERROR: 'GEN_001',
  NOT_IMPLEMENTED: 'GEN_002',
  BAD_REQUEST: 'GEN_003',
};

/**
 * API response structure for success case
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * API response structure for error case
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    validation?: Record<string, string[]>;
  };
  timestamp: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function createSuccessResponse<T = any>(data: T): NextResponse<ApiSuccessResponse<T>> {
  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(responseBody, { status: HttpStatus.OK });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  options?: {
    code?: string;
    status?: number;
    details?: any;
    validation?: Record<string, string[]>;
  }
): NextResponse<ApiErrorResponse> {
  const { 
    code = ApiErrorCode.INTERNAL_SERVER_ERROR,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details,
    validation,
  } = options || {};
  
  const responseBody: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(validation && { validation }),
    },
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(responseBody, { status });
}

/**
 * Handle API errors with appropriate responses
 */
export function handleApiError(
  error: unknown, 
  context?: string
): NextResponse<ApiErrorResponse> {
  // Use AsyncErrorHandler to standardize the error
  const standardizedError = AsyncErrorHandler.handleError(error, context);
  
  // Map error category to appropriate status code and error code
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let code = ApiErrorCode.INTERNAL_SERVER_ERROR;
  
  switch (standardizedError.category) {
    case AsyncErrorHandler.Category.AUTHENTICATION:
      status = HttpStatus.UNAUTHORIZED;
      code = ApiErrorCode.UNAUTHORIZED;
      break;
      
    case AsyncErrorHandler.Category.AUTHORIZATION:
      status = HttpStatus.FORBIDDEN;
      code = ApiErrorCode.INSUFFICIENT_PERMISSIONS;
      break;
      
    case AsyncErrorHandler.Category.VALIDATION:
      status = HttpStatus.BAD_REQUEST;
      code = ApiErrorCode.VALIDATION_FAILED;
      break;
      
    case AsyncErrorHandler.Category.DATABASE:
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ApiErrorCode.DATABASE_ERROR;
      break;
      
    case AsyncErrorHandler.Category.NETWORK:
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = ApiErrorCode.EXTERNAL_SERVICE_ERROR;
      break;
      
    case AsyncErrorHandler.Category.WALLET:
      status = HttpStatus.BAD_REQUEST;
      code = ApiErrorCode.WALLET_CONNECTION_ERROR;
      break;
      
    case AsyncErrorHandler.Category.FRAME:
      status = HttpStatus.BAD_REQUEST;
      code = ApiErrorCode.FRAME_ERROR;
      break;
      
    case AsyncErrorHandler.Category.API:
    default:
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ApiErrorCode.INTERNAL_SERVER_ERROR;
      break;
  }
  
  // Log error in development/test environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(`API Error [${code}]: ${standardizedError.message}`);
    if (standardizedError.originalError) {
      console.error('Original error:', standardizedError.originalError);
    }
  }
  
  // Extract field validation errors if available
  let validation: Record<string, string[]> | undefined;
  
  if (standardizedError.originalError && 
      typeof standardizedError.originalError === 'object' && 
      standardizedError.originalError !== null) {
    
    // Handle various validation error formats
    if ('fieldErrors' in standardizedError.originalError) {
      const fieldErrors = (standardizedError.originalError as any).fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        validation = Object.entries(fieldErrors).reduce((acc, [field, error]) => {
          acc[field] = Array.isArray(error) ? error : [error as string];
          return acc;
        }, {} as Record<string, string[]>);
      }
    } else if ('errors' in standardizedError.originalError) {
      const errors = (standardizedError.originalError as any).errors;
      if (errors && typeof errors === 'object') {
        validation = errors;
      }
    }
  }
  
  // Create the error response
  return createErrorResponse(standardizedError.message, {
    code,
    status,
    details: process.env.NODE_ENV !== 'production' 
      ? { context: standardizedError.context }
      : undefined,
    validation,
  });
}

/**
 * Create a not found response
 */
export function createNotFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(`${resource} not found`, {
    code: ApiErrorCode.RESOURCE_NOT_FOUND,
    status: HttpStatus.NOT_FOUND,
  });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  validation: Record<string, string[]>,
  message: string = 'Validation failed'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, {
    code: ApiErrorCode.VALIDATION_FAILED,
    status: HttpStatus.BAD_REQUEST,
    validation,
  });
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, {
    code: ApiErrorCode.UNAUTHORIZED,
    status: HttpStatus.UNAUTHORIZED,
  });
}

/**
 * Create a forbidden response
 */
export function createForbiddenResponse(
  message: string = 'Insufficient permissions'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, {
    code: ApiErrorCode.INSUFFICIENT_PERMISSIONS,
    status: HttpStatus.FORBIDDEN,
  });
}

/**
 * Create a conflict response
 */
export function createConflictResponse(
  message: string = 'Resource already exists'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, {
    code: ApiErrorCode.RESOURCE_ALREADY_EXISTS,
    status: HttpStatus.CONFLICT,
  });
}

/**
 * Create a no content response (for successful operations with no response data)
 */
export function createNoContentResponse(): NextResponse {
  return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
} 
/**
 * Validation utilities for API endpoints
 *
 * This file contains validation functions for common input parameters
 * in API endpoints, such as topic IDs, button indices, and frame message data.
 */

import { NextRequest } from 'next/server';

/**
 * Error class for validation errors
 */
export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates that a topic ID is a valid string
 * @param topicId The topic ID to validate
 * @returns The validated topic ID
 * @throws ValidationError if the topic ID is invalid
 */
export function validateTopicId(topicId: any): string {
  if (!topicId) {
    throw new ValidationError('Topic ID is required');
  }

  if (typeof topicId !== 'string') {
    throw new ValidationError('Topic ID must be a string');
  }

  // Additional validation if needed (e.g., format checking)

  return topicId;
}

/**
 * Validates that a button index is a valid number
 * @param buttonIndex The button index to validate
 * @returns The validated button index
 * @throws ValidationError if the button index is invalid
 */
export function validateButtonIndex(buttonIndex: any): number {
  if (buttonIndex === undefined || buttonIndex === null) {
    throw new ValidationError('Button index is required');
  }

  const parsed = Number(buttonIndex);

  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new ValidationError('Button index must be an integer');
  }

  if (parsed < 1 || parsed > 4) {
    throw new ValidationError('Button index must be between 1 and 4');
  }

  return parsed;
}

/**
 * Validates that a FID (Farcaster ID) is a valid number
 * @param fid The FID to validate
 * @returns The validated FID
 * @throws ValidationError if the FID is invalid
 */
export function validateFid(fid: any): number | undefined {
  if (fid === undefined || fid === null) {
    return undefined; // FID is optional
  }

  const parsed = Number(fid);

  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError('FID must be a positive integer');
  }

  return parsed;
}

/**
 * Validates a frame message request body
 * @param body The request body to validate
 * @returns The validated frame message data
 * @throws ValidationError if the frame message data is invalid
 */
export async function validateFrameMessage(req: NextRequest): Promise<{
  buttonIndex: number;
  fid?: number;
  castId?: {
    fid: number;
    hash: string;
  };
  inputText?: string;
}> {
  let body;

  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }

  if (!body) {
    throw new ValidationError('Request body is required');
  }

  // Validate untrustedData
  if (!body.untrustedData || typeof body.untrustedData !== 'object') {
    throw new ValidationError('Missing or invalid untrustedData');
  }

  // Validate buttonIndex
  const buttonIndex = validateButtonIndex(body.untrustedData.buttonIndex);

  // Validate FID if present
  let fid: number | undefined;
  if (body.untrustedData.fid !== undefined) {
    fid = validateFid(body.untrustedData.fid);
  }

  // Validate castId if present
  let castId: { fid: number; hash: string } | undefined;
  if (
    body.untrustedData.castId &&
    typeof body.untrustedData.castId === 'object' &&
    body.untrustedData.castId.fid !== undefined &&
    body.untrustedData.castId.hash !== undefined
  ) {
    castId = {
      fid: validateFid(body.untrustedData.castId.fid) as number,
      hash: String(body.untrustedData.castId.hash),
    };
  }

  // Get inputText if present
  let inputText: string | undefined;
  if (body.untrustedData.inputText !== undefined) {
    inputText = String(body.untrustedData.inputText);
  }

  return { buttonIndex, fid, castId, inputText };
}

/**
 * Button type constants for consistent button handling
 */
export const BUTTON_TYPES = {
  OPTION_A: 1,
  OPTION_B: 2,
  VIEW_DETAILS: 3,
  ADMIN: 4,
  VOTE_AGAIN: 3,
};

/**
 * Extracts and validates query parameters from a request
 * @param req The Next.js request
 * @param paramName The name of the parameter to extract
 * @param isRequired Whether the parameter is required
 * @param validator Optional validator function
 * @returns The validated parameter value
 * @throws ValidationError if the parameter is invalid
 */
export function getQueryParam(
  req: NextRequest,
  paramName: string,
  isRequired: boolean = false,
  validator?: (value: string) => any
): string | undefined {
  const url = new URL(req.url);
  const value = url.searchParams.get(paramName);

  if (isRequired && !value) {
    throw new ValidationError(`${paramName} parameter is required`);
  }

  if (value && validator) {
    try {
      return validator(value);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      // Safe handling of unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      throw new ValidationError(`Invalid ${paramName} parameter: ${errorMessage}`);
    }
  }

  return value || undefined;
}

/**
 * Helper for error responses
 * @param error The error object
 * @returns An object with status and error details
 */
export function formatErrorResponse(error: any) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return {
    status: statusCode,
    body: {
      error: message,
    },
  };
}

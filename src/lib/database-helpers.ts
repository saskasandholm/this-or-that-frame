import { Prisma, PrismaClient } from '@prisma/client';
import { prisma, safeDbOperation } from './prisma';
import errorLogger, { ErrorSeverity } from './errorLogger';
import AsyncErrorHandler from './AsyncErrorHandler';

/**
 * Execute a database transaction with proper error handling
 * @param operations Function containing operations to execute in transaction
 * @param fallbackValue Optional value to return if transaction fails
 * @param context Context identifier for error logging
 */
export async function safeTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  fallbackValue?: T,
  context: string = 'transaction'
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      try {
        return await operations(tx);
      } catch (error) {
        errorLogger.log(error, `database:${context}`, ErrorSeverity.ERROR);
        throw error; // Re-throw to trigger transaction rollback
      }
    });
  } catch (error) {
    errorLogger.log(error, `transaction:${context}`, ErrorSeverity.ERROR);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Standardize and re-throw the error
    const standardizedError = AsyncErrorHandler.handleDatabaseError(error, context);
    throw new Error(standardizedError.message, { cause: error });
  }
}

/**
 * Reset the connection pool if database connections are having issues
 * @returns Promise that resolves when connection pool is reset
 */
export async function resetConnectionPool(): Promise<void> {
  try {
    await prisma.$disconnect();
    
    // Small delay to allow connections to fully close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force a new connection by making a simple query
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`;
    
    // Log success - use log with INFO severity instead of info method
    errorLogger.log(
      'Database connection pool successfully reset',
      'database:reset',
      ErrorSeverity.INFO
    );
  } catch (error) {
    errorLogger.log(error, 'database:reset-failed', ErrorSeverity.CRITICAL);
    throw error;
  }
}

/**
 * Check if the database is available and responsive
 * @returns Boolean indicating if database is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    // Try a simple query with a short timeout
    await Promise.race([
      prisma.$executeRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database health check timed out')), 2000)
      )
    ]);
    return true;
  } catch (error) {
    // Use log with ERROR severity instead of error method
    errorLogger.log(error, 'database:health-check', ErrorSeverity.ERROR);
    return false;
  }
}

/**
 * Retry a database operation with exponential backoff
 * @param operation Function to retry
 * @param options Retry options
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    context?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 2000,
    factor = 2,
    context = 'retry-operation'
  } = options;
  
  let lastError: unknown;
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Log retry attempt without additional metadata
      errorLogger.log(
        error, 
        `database:${context} (attempt ${attempt}/${maxRetries})`, 
        ErrorSeverity.WARNING
      );
      
      if (attempt < maxRetries) {
        // Calculate next backoff delay
        delay = Math.min(delay * factor, maxDelay);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  errorLogger.log(
    lastError, 
    `database:${context}-failed after ${maxRetries} attempts`, 
    ErrorSeverity.ERROR
  );
  
  throw lastError;
} 
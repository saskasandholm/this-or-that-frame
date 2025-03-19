import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { trackError } from '@/lib/error-tracking';

// Add global type declaration for prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to avoid creating multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma as PrismaClient;
}

/**
 * Health check endpoint to verify system status.
 * Checks database connectivity and other critical system components.
 */
export async function GET(_req: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get service information
    const buildVersion = process.env.BUILD_VERSION || '1.0.0';
    const buildDate = process.env.BUILD_DATE || new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';

    // Construct health status
    const status = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: buildVersion,
      buildDate,
      environment,
      components: {
        database: 'connected',
        api: 'operational',
      },
    };

    // Return success response
    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    // Log the error to Sentry
    trackError(error as Error, {
      context: 'Health check endpoint',
      path: '/api/health',
    });

    // Determine database status
    let databaseStatus = 'error';
    if (error instanceof Error) {
      databaseStatus = `error: ${error.message}`;
    }

    // Return error response
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        components: {
          database: databaseStatus,
          api: 'operational',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

/**
 * Farcaster Authentication Configuration
 *
 * This file centralizes the configuration for Farcaster Auth
 * to ensure consistency between client and server.
 */

// Get the app domain from environment or default to localhost
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';

// The URL for login (used for SIWE verification)
export const SIWE_URI = process.env.NEXT_PUBLIC_SIWE_URI || 'http://localhost:3000/login';

// Auth Kit Client Configuration
export const authKitConfig = {
  domain: APP_DOMAIN,
  siweUri: SIWE_URI,
  rpcUrl: 'https://mainnet.optimism.io',
  relay: 'https://relay.farcaster.xyz',
  version: 'v1',
};

// Get all possible domain options for verification
// This is needed because the domain might be different in different environments
export function getDomainOptions(): string[] {
  // Create an array of possible domains to try
  const domains = [
    APP_DOMAIN,
    APP_DOMAIN.replace(/^https?:\/\//, ''), // Without protocol
    'localhost',
    'localhost:3000',
  ].filter(Boolean);

  return Array.from(new Set(domains));
}

// Helper to detect mobile devices
export function isMobile(userAgent: string): boolean {
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

// Cookie configuration
export const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export const MOBILE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: true, // Must be secure for SameSite=None
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export const CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

export const MOBILE_CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

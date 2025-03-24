import { prisma } from '@/lib/prisma';
import errorLogger, { ErrorSeverity } from './errorLogger';

/**
 * Interface representing an admin user with role and permissions
 */
export interface AdminUser {
  fid: number;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

/**
 * Default permissions for different admin roles
 */
export const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'SUPER_ADMIN': {
    manageTopics: true,
    manageUsers: true,
    manageAdmins: true,
    viewStats: true,
    moderateContent: true,
    manageSettings: true
  },
  'EDITOR': {
    manageTopics: true,
    viewStats: true,
    moderateContent: true,
    manageUsers: false,
    manageAdmins: false,
    manageSettings: false
  },
  'MODERATOR': {
    moderateContent: true,
    viewStats: true,
    manageTopics: false,
    manageUsers: false,
    manageAdmins: false,
    manageSettings: false
  }
};

/**
 * Map permission string to role and permissions object
 * @param permissionString The permission string from the database
 * @returns Object with role and permissions
 */
function mapPermissionStringToRole(permissionString: string): { role: string, permissions: Record<string, boolean> } {
  // If it's a known role, use the default permissions
  if (permissionString === 'SUPER_ADMIN' || permissionString === 'EDITOR' || permissionString === 'MODERATOR') {
    return {
      role: permissionString,
      permissions: DEFAULT_PERMISSIONS[permissionString]
    };
  }
  
  // For older 'moderate' permission or unknown permissions
  if (permissionString === 'moderate') {
    return {
      role: 'MODERATOR', 
      permissions: DEFAULT_PERMISSIONS['MODERATOR']
    };
  }
  
  // Default to MODERATOR with limited permissions
  return {
    role: 'MODERATOR',
    permissions: {
      moderateContent: true,
      viewStats: true,
      manageTopics: false,
      manageUsers: false,
      manageAdmins: false,
      manageSettings: false
    }
  };
}

/**
 * Verify if a user is an admin and get their permissions
 * @param fid The Farcaster ID of the user
 * @returns Promise with AdminUser object or null if not an admin
 */
export async function verifyAdminAccess(fid: number): Promise<AdminUser | null> {
  if (!fid) {
    errorLogger.log('No FID provided', 'verifyAdminAccess', ErrorSeverity.ERROR);
    return null;
  }
  
  try {
    errorLogger.log(`Checking admin access for FID: ${fid}`, 'verifyAdminAccess', ErrorSeverity.INFO);
    
    const admin = await prisma.admin.findFirst({
      where: {
        fid,
        isActive: true,
      },
    });
    
    if (!admin) {
      errorLogger.log(`No active admin found for FID: ${fid}`, 'verifyAdminAccess', ErrorSeverity.INFO);
      return null;
    }
    
    errorLogger.log(`Found admin record: ${JSON.stringify({
      fid: admin.fid,
      permissions: admin.permissions,
      isActive: admin.isActive
    })}`, 'verifyAdminAccess', ErrorSeverity.INFO);
    
    // Map the permission string to role and permissions object
    const { role, permissions } = mapPermissionStringToRole(admin.permissions);
    
    return {
      fid: admin.fid,
      role,
      permissions,
      isActive: admin.isActive
    };
  } catch (error) {
    errorLogger.log(error, 'verifyAdminAccess', ErrorSeverity.ERROR);
    return null;
  }
}

/**
 * Check if admin has a specific permission
 * @param admin The admin user object
 * @param permission The permission to check
 * @returns boolean indicating if the admin has the permission
 */
export function hasPermission(admin: AdminUser | null, permission: string): boolean {
  if (!admin) return false;
  
  // Super admins have all permissions
  if (admin.role === 'SUPER_ADMIN') return true;
  
  // Check specific permission
  return admin.permissions[permission] === true;
}

/**
 * Initialize a user as super admin
 * This should only be called in a controlled environment (e.g., script)
 */
export async function initializeSuperAdmin(fid: number): Promise<AdminUser | null> {
  try {
    if (!fid) {
      errorLogger.log('Invalid FID provided', 'initializeSuperAdmin', ErrorSeverity.ERROR);
      return null;
    }
    
    // Check if any admins exist
    const adminCount = await prisma.admin.count();
    
    // For security, only create first admin if none exist
    if (adminCount > 0) {
      errorLogger.log('Admin users already exist, skipping initialization', 'initializeSuperAdmin', ErrorSeverity.INFO);
      return null;
    }
    
    // Create super admin with all permissions
    const admin = await prisma.admin.create({
      data: {
        fid,
        isActive: true,
        permissions: 'SUPER_ADMIN'
      }
    });
    
    // Map the permission string to role and permissions object
    const { role, permissions } = mapPermissionStringToRole(admin.permissions);
    
    return {
      fid: admin.fid,
      role,
      permissions,
      isActive: admin.isActive
    };
  } catch (error) {
    errorLogger.log(error, 'initializeSuperAdmin', ErrorSeverity.ERROR);
    return null;
  }
} 
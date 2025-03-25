# Admin System Implementation Plan

*Last Updated: March 25, 2025*


## Current State of Admin Features

The application currently has a basic admin system with the following features:

### Database Schema
The current schema includes an `Admin` table with:
- `id`: Auto-incrementing primary key
- `fid`: Farcaster ID (unique) of the admin
- `permissions`: String field with values 'moderate' or 'full_admin'
- `isActive`: Boolean flag to enable/disable admin access
- `createdBy`: Optional FID of the admin who created this admin
- Standard timestamps (`createdAt`, `updatedAt`)

### Authentication Logic
1. Admin status is verified through the `isAdmin()` utility function that:
   - Checks if a user exists in the Admin table
   - Verifies the user is active
   - Validates permission level ('moderate' or 'full_admin')

2. First-admin initialization is handled through `initializeFirstAdmin()` which:
   - Creates the first admin automatically if no admins exist
   - Grants 'full_admin' permissions to the first user

### API Routes
Current admin API routes support:
- **GET /api/admin**: Check admin status or list all admins
- **POST /api/admin**: Add a new admin (requires full_admin permissions)
- **DELETE /api/admin**: Remove an admin (requires full_admin permissions)
- **PATCH /api/admin**: Update admin permissions (requires full_admin permissions)

### Admin UI Components
The application includes admin components such as:
- **PaginatedTopicsTable**: For managing topics with pagination
- **SubmissionModeration**: For reviewing user submissions
- **UserActivityTable**: For viewing user activity logs

### Current Limitations
1. No granular permission system (only 'moderate' or 'full_admin')
2. Limited role-based access control
3. No clear admin dashboard or navigation structure
4. No middleware for protecting admin routes server-side
5. Client-side only authentication checks

## Proposed Enhancement Plan

### 1. Architecture Overview

The enhanced admin system will feature:
1. FID-based authentication using Farcaster Auth Kit
2. Database-stored roles and permissions with granular access control
3. Server-side route protection with middleware
4. A comprehensive admin dashboard with modular features

### 2. Database Schema Enhancement

```prisma
model Admin {
  id          Int      @id @default(autoincrement())
  fid         Int      @unique
  isActive    Boolean  @default(true)
  role        String   @default("EDITOR") // "SUPER_ADMIN", "EDITOR", "MODERATOR"
  permissions Json     // Store granular permissions as a JSON object
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   Int?     // FID of the admin who created this admin

  @@index([fid])
  @@index([role])
}
```

Key changes:
- Replace string `permissions` with role-based system
- Add JSON `permissions` field for granular access control
- Additional index on role for performance

### 3. Authentication & Authorization Flow

#### Server-Side Implementation:

```typescript
// src/lib/admin-auth.ts
export interface AdminUser {
  fid: number;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

// Verify if a user is an admin
export async function verifyAdminAccess(fid: number): Promise<AdminUser | null>

// Check specific permission
export function hasPermission(admin: AdminUser | null, permission: string): boolean
```

#### Client-Side Hook:

```typescript
// src/hooks/useAdmin.ts
export interface AdminState {
  isAdmin: boolean;
  role: string | null;
  permissions: Record<string, boolean>;
  isLoading: boolean;
}

export function useAdmin(): AdminState
```

### 4. API Routes Implementation

New API routes for admin management:
- **GET /api/admin/verify**: Verify admin status
- **GET /api/admin/users**: Get users with pagination and filtering
- **GET /api/admin/users/[fid]**: Get detailed information about a specific user
- **GET /api/admin/dashboard**: Get dashboard statistics
- **POST /api/admin/admins**: Add new admin
- **PATCH /api/admin/admins/[fid]**: Update admin permissions
- **GET /api/admin/topics**: Get topics with pagination and filtering
- **POST /api/admin/topics**: Create a new topic
- **GET /api/admin/topics/[id]**: Get a specific topic
- **PATCH /api/admin/topics/[id]**: Update a topic
- **DELETE /api/admin/topics/[id]**: Delete a topic

### 5. Server-Side Admin Components

Key components:
- **Admin Layout**: Common layout with navigation and authentication checks
- **Admin Dashboard**: Overview of system statistics and recent activity
- **Topic Management**: Enhanced tools for managing topics
  - Topic listing with filtering and pagination
  - Create new topics
  - Edit existing topics
  - Delete topics (with safeguards for topics with votes)
- **User Management**: Tools for viewing and managing users
  - User listing with filtering and pagination
  - Detailed user profiles with activity history
  - User voting history and streak information
  - User submission statistics
- **Admin Management**: Interface for managing admin accounts and permissions

### 6. Client-Side Protection

`AdminProtectedRoute` component to restrict access based on permissions:
- Verifies admin status client-side
- Checks specific permissions
- Redirects unauthorized users
- Shows appropriate loading states

### 7. Admin Initialization

Script to set up your FID (7806) as the initial SUPER_ADMIN:

```typescript
// scripts/init-admin.js
const SUPER_ADMIN_FID = 7806; // Your FID

// Create super admin with full permissions
await prisma.admin.create({
  data: {
    fid: SUPER_ADMIN_FID,
    isActive: true,
    role: 'SUPER_ADMIN',
    permissions: {
      manageTopics: true,
      manageUsers: true,
      manageAdmins: true,
      viewStats: true,
      moderateContent: true
    }
  }
});
```

### 8. Admin Features

Comprehensive admin features including:
- Dashboard with key metrics
- Topic management with scheduling
- User management and activity tracking
- Submission moderation
- Admin user management
- Application settings

## Implementation Roadmap

### Phase 1: Foundation
- [x] Update Admin database schema
- [x] Create admin authentication utilities
- [x] Set up middleware for route protection
- [x] Initialize you (FID: 7806) as SUPER_ADMIN

### Phase 2: Core Admin Features
- [x] Implement admin layout and navigation sidebar
- [x] Create admin dashboard with key metrics
- [x] Enhance topic management features
  - [x] Topic listing with filtering
  - [x] Create new topics
  - [x] Edit existing topics
  - [x] Delete topics with safeguards
- [x] Build user management interface
  - [x] User listing with filtering
  - [x] User detail view
  - [x] User activity tracking

### Phase 3: Advanced Features
- [ ] Create admin user management
- [ ] Implement granular permissions system
- [ ] Add content moderation tools
- [ ] Develop scheduling system

### Phase 4: Polish and Documentation
- [ ] Add comprehensive error handling
- [ ] Implement audit logging
- [ ] Create admin user documentation
- [ ] Performance optimizations

## Security Considerations

1. **Defense in Depth**: Multiple verification layers (client and server)
2. **Least Privilege**: Granular permissions system
3. **Audit Trails**: Logging of all admin actions
4. **Rate Limiting**: Protection against brute force attacks
5. **Input Validation**: Strict validation of all inputs
6. **Error Handling**: Secure error messages that don't leak information

## Benefits of the New Admin System

1. **Scalability**: Support for multiple admin roles and users
2. **Security**: Improved authentication and authorization
3. **Usability**: Intuitive interface for admin tasks
4. **Maintainability**: Modular, well-documented code
5. **Extensibility**: Easy to add new features and permissions 

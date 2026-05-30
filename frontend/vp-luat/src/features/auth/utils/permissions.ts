// RBAC Permission System for VP Luật

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'LAWYER'
  | 'CRM_STAFF'
  | 'MARKETING'
  | 'VIEWER';

export type Permission =
  | 'dashboard:read'
  | 'bookings:read'
  | 'bookings:write'
  | 'bookings:delete'
  | 'leads:read'
  | 'leads:write'
  | 'leads:delete'
  | 'leads:assign'
  | 'posts:read'
  | 'posts:write'
  | 'posts:publish'
  | 'posts:delete'
  | 'services:read'
  | 'services:write'
  | 'services:delete'
  | 'lawyers:read'
  | 'lawyers:write'
  | 'lawyers:delete'
  | 'reviews:moderate'
  | 'chatbot:read_logs'
  | 'chatbot:config'
  | 'newsletter:read'
  | 'newsletter:send'
  | 'landing_pages:read'
  | 'landing_pages:write'
  | 'landing_pages:publish'
  | 'landing_pages:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'settings:read'
  | 'settings:write';

// All permissions for SUPER_ADMIN
const ALL_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'bookings:read', 'bookings:write', 'bookings:delete',
  'leads:read', 'leads:write', 'leads:delete', 'leads:assign',
  'posts:read', 'posts:write', 'posts:publish', 'posts:delete',
  'services:read', 'services:write', 'services:delete',
  'lawyers:read', 'lawyers:write', 'lawyers:delete',
  'reviews:moderate',
  'chatbot:read_logs', 'chatbot:config',
  'newsletter:read', 'newsletter:send',
  'landing_pages:read', 'landing_pages:write', 'landing_pages:publish', 'landing_pages:delete',
  'users:read', 'users:write', 'users:delete',
  'settings:read', 'settings:write',
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: [
    'dashboard:read',
    'bookings:read', 'bookings:write', 'bookings:delete',
    'leads:read', 'leads:write', 'leads:delete', 'leads:assign',
    'posts:read', 'posts:write', 'posts:publish', 'posts:delete',
    'services:read', 'services:write', 'services:delete',
    'lawyers:read', 'lawyers:write', 'lawyers:delete',
    'reviews:moderate',
    'chatbot:read_logs', 'chatbot:config',
    'newsletter:read', 'newsletter:send',
    'landing_pages:read', 'landing_pages:write', 'landing_pages:publish', 'landing_pages:delete',
    'users:read', 'users:write',
    'settings:read', 'settings:write',
  ],
  EDITOR: [
    'posts:read', 'posts:write', 'posts:publish',
    'landing_pages:read', 'landing_pages:write',
  ],
  LAWYER: [
    'dashboard:read',
    'bookings:read', 'bookings:write',
    'leads:read',
  ],
  CRM_STAFF: [
    'dashboard:read',
    'bookings:read', 'bookings:write',
    'leads:read', 'leads:write',
  ],
  MARKETING: [
    'posts:read', 'posts:write',
    'landing_pages:read', 'landing_pages:write',
  ],
  VIEWER: [
    'dashboard:read',
  ],
};

export function can(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (role === 'SUPER_ADMIN') return true;
  return (permissions as Permission[]).includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => can(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => can(role, p));
}

export function getPermissions(role: Role): Permission[] {
  if (role === 'SUPER_ADMIN') {
    return ALL_PERMISSIONS;
  }
  return ROLE_PERMISSIONS[role];
}

export const RoleDisplayNames: Record<Role, string> = {
  SUPER_ADMIN: 'Quản trị viên cao cấp',
  ADMIN: 'Quản trị viên',
  EDITOR: 'Biên tập viên',
  LAWYER: 'Luật sư',
  CRM_STAFF: 'Nhân viên CRM',
  MARKETING: 'Nhân viên Marketing',
  VIEWER: 'Người xem',
};

// Valid roles set for O(1) lookup
const VALID_ROLES = new Set<Role>([
  'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'LAWYER', 'CRM_STAFF', 'MARKETING', 'VIEWER'
]);

// Valid permissions set for O(1) lookup
const VALID_PERMISSIONS = new Set<Permission>(ALL_PERMISSIONS);

// Validate and sanitize role from external source
export function validateRole(role: unknown): Role {
  if (typeof role === 'string' && VALID_ROLES.has(role as Role)) {
    return role as Role;
  }
  return 'VIEWER'; // Safe default
}

// Validate and sanitize permissions from external source
export function validatePermissions(permissions: unknown): Permission[] {
  if (!Array.isArray(permissions)) {
    return [];
  }
  return permissions.filter(
    (p): p is Permission => typeof p === 'string' && VALID_PERMISSIONS.has(p as Permission)
  );
}

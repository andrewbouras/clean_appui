export type Permission = 
  | 'dashboard:read'
  | 'questions:read'
  | 'questions:write'
  | 'admin:access'
  | 'profile:read'
  | 'profile:write';

export type Role = 'user' | 'admin' | 'instructor';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: ['dashboard:read', 'questions:read', 'profile:read', 'profile:write'],
  instructor: [
    'dashboard:read',
    'questions:read',
    'questions:write',
    'profile:read',
    'profile:write'
  ],
  admin: [
    'dashboard:read',
    'questions:read',
    'questions:write',
    'admin:access',
    'profile:read',
    'profile:write'
  ]
};

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasRole(
  userPermissions: Permission[],
  role: Role
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.every(permission => 
    userPermissions.includes(permission)
  );
} 
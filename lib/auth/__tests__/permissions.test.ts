import { hasPermission, hasRole, ROLE_PERMISSIONS } from '../permissions';
import type { Permission, Role } from '../permissions';

describe('Permission System', () => {
  const userPermissions: Permission[] = [
    'dashboard:read',
    'questions:read',
    'profile:read',
    'profile:write'
  ];

  describe('hasPermission', () => {
    it('should return true for granted permissions', () => {
      expect(hasPermission(userPermissions, 'dashboard:read')).toBe(true);
    });

    it('should return false for missing permissions', () => {
      expect(hasPermission(userPermissions, 'admin:access')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should correctly identify user role', () => {
      expect(hasRole(userPermissions, 'user')).toBe(true);
    });

    it('should return false for higher roles', () => {
      expect(hasRole(userPermissions, 'admin')).toBe(false);
    });
  });
}); 
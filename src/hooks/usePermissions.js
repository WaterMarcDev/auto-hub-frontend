import { useAuth } from './useAuth';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getUserRole,
  isAdmin,
  isManagerOrAbove,
  isStaffOrAbove
} from '../utils/rbac';

/**
 * Hook for checking user permissions
 * @returns {Object} Permission checking functions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean}
     */
    can: (permission) => hasPermission(user, permission),

    /**
     * Check if user has any of the specified permissions
     * @param {Array<string>} permissions - Array of permissions
     * @returns {boolean}
     */
    canAny: (permissions) => hasAnyPermission(user, permissions),

    /**
     * Check if user has all of the specified permissions
     * @param {Array<string>} permissions - Array of permissions
     * @returns {boolean}
     */
    canAll: (permissions) => hasAllPermissions(user, permissions),

    /**
     * Get user's role
     * @returns {string|null}
     */
    role: getUserRole(user),

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin: isAdmin(user),

    /**
     * Check if user is manager or above
     * @returns {boolean}
     */
    isManagerOrAbove: isManagerOrAbove(user),

    /**
     * Check if user is staff or above
     * @returns {boolean}
     */
    isStaffOrAbove: isStaffOrAbove(user),

    /**
     * Current user object
     */
    user
  };
};

export default usePermissions;

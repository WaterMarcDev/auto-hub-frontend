// Role-based Access Control (RBAC) Utilities

// Define user roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  FRONT_DESK: 'front-desk'
};

// Define permissions for each role
export const PERMISSIONS = {
  // Check-In & Checkout (Front Desk)
  CHECK_IN: {
    VIEW: 'check-in:view',
    CREATE: 'check-in:create',
    UPDATE: 'check-in:update',
    CHECKOUT: 'check-in:checkout'
  },
  
  // Waiver
  WAIVER: {
    VIEW: 'waiver:view',
    CREATE: 'waiver:create',
    UPDATE: 'waiver:update',
    DELETE: 'waiver:delete'
  },

  // Car Intake (Staff)
  CAR_INTAKE: {
    VIEW: 'car-intake:view',
    CREATE: 'car-intake:create',
    UPDATE: 'car-intake:update',
    DELETE: 'car-intake:delete',
    BULK_UPLOAD: 'car-intake:bulk-upload'
  },

  // Car Inventory (Staff)
  CAR_INVENTORY: {
    VIEW: 'car-inventory:view',
    CREATE: 'car-inventory:create',
    UPDATE: 'car-inventory:update',
    DELETE: 'car-inventory:delete'
  },

  // Part Inventory (Staff)
  PART_INVENTORY: {
    VIEW: 'part-inventory:view',
    CREATE: 'part-inventory:create',
    UPDATE: 'part-inventory:update',
    DELETE: 'part-inventory:delete'
  },

  // Scrap (Staff)
  SCRAP: {
    VIEW: 'scrap:view',
    CREATE: 'scrap:create',
    UPDATE: 'scrap:update',
    DELETE: 'scrap:delete'
  },

  // Sellers & Buyers (Manager+)
  SELLER: {
    VIEW: 'seller:view',
    CREATE: 'seller:create',
    UPDATE: 'seller:update',
    DELETE: 'seller:delete'
  },

  BUYER: {
    VIEW: 'buyer:view',
    CREATE: 'buyer:create',
    UPDATE: 'buyer:update',
    DELETE: 'buyer:delete'
  },

  // Master Data (Manager+)
  MAKE: {
    VIEW: 'make:view',
    CREATE: 'make:create',
    UPDATE: 'make:update',
    DELETE: 'make:delete'
  },

  MODEL: {
    VIEW: 'model:view',
    CREATE: 'model:create',
    UPDATE: 'model:update',
    DELETE: 'model:delete'
  },

  TRIM: {
    VIEW: 'trim:view',
    CREATE: 'trim:create',
    UPDATE: 'trim:update',
    DELETE: 'trim:delete'
  },

  PART: {
    VIEW: 'part:view',
    CREATE: 'part:create',
    UPDATE: 'part:update',
    DELETE: 'part:delete'
  },

  ELEMENT: {
    VIEW: 'element:view',
    CREATE: 'element:create',
    UPDATE: 'element:update',
    DELETE: 'element:delete'
  },

  // Dashboard
  DASHBOARD: {
    VIEW: 'dashboard:view'
  }
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
  [ROLES.FRONT_DESK]: [
    // Check-In & Checkout only
    PERMISSIONS.CHECK_IN.VIEW,
    PERMISSIONS.CHECK_IN.CREATE,
    PERMISSIONS.CHECK_IN.UPDATE,
    PERMISSIONS.CHECK_IN.CHECKOUT,
    PERMISSIONS.WAIVER.VIEW,
    PERMISSIONS.WAIVER.CREATE,
    PERMISSIONS.DASHBOARD.VIEW
  ],

  [ROLES.STAFF]: [
    // Car Intake, Inventories, Scrap
    PERMISSIONS.CAR_INTAKE.VIEW,
    PERMISSIONS.CAR_INTAKE.CREATE,
    PERMISSIONS.CAR_INTAKE.UPDATE,
    PERMISSIONS.CAR_INTAKE.DELETE,
    PERMISSIONS.CAR_INVENTORY.VIEW,
    PERMISSIONS.CAR_INVENTORY.CREATE,
    PERMISSIONS.CAR_INVENTORY.UPDATE,
    PERMISSIONS.CAR_INVENTORY.DELETE,
    PERMISSIONS.PART_INVENTORY.VIEW,
    PERMISSIONS.PART_INVENTORY.CREATE,
    PERMISSIONS.PART_INVENTORY.UPDATE,
    PERMISSIONS.PART_INVENTORY.DELETE,
    PERMISSIONS.SCRAP.VIEW,
    PERMISSIONS.SCRAP.CREATE,
    PERMISSIONS.SCRAP.UPDATE,
    PERMISSIONS.SCRAP.DELETE,
    PERMISSIONS.DASHBOARD.VIEW
  ],

  [ROLES.MANAGER]: [
    // All access except bulk upload
    PERMISSIONS.CHECK_IN.VIEW,
    PERMISSIONS.CHECK_IN.CREATE,
    PERMISSIONS.CHECK_IN.UPDATE,
    PERMISSIONS.CHECK_IN.CHECKOUT,
    PERMISSIONS.WAIVER.VIEW,
    PERMISSIONS.WAIVER.CREATE,
    PERMISSIONS.WAIVER.UPDATE,
    PERMISSIONS.WAIVER.DELETE,
    PERMISSIONS.CAR_INTAKE.VIEW,
    PERMISSIONS.CAR_INTAKE.CREATE,
    PERMISSIONS.CAR_INTAKE.UPDATE,
    PERMISSIONS.CAR_INTAKE.DELETE,
    // NO BULK_UPLOAD for manager
    PERMISSIONS.CAR_INVENTORY.VIEW,
    PERMISSIONS.CAR_INVENTORY.CREATE,
    PERMISSIONS.CAR_INVENTORY.UPDATE,
    PERMISSIONS.CAR_INVENTORY.DELETE,
    PERMISSIONS.PART_INVENTORY.VIEW,
    PERMISSIONS.PART_INVENTORY.CREATE,
    PERMISSIONS.PART_INVENTORY.UPDATE,
    PERMISSIONS.PART_INVENTORY.DELETE,
    PERMISSIONS.SCRAP.VIEW,
    PERMISSIONS.SCRAP.CREATE,
    PERMISSIONS.SCRAP.UPDATE,
    PERMISSIONS.SCRAP.DELETE,
    PERMISSIONS.SELLER.VIEW,
    PERMISSIONS.SELLER.CREATE,
    PERMISSIONS.SELLER.UPDATE,
    PERMISSIONS.SELLER.DELETE,
    PERMISSIONS.BUYER.VIEW,
    PERMISSIONS.BUYER.CREATE,
    PERMISSIONS.BUYER.UPDATE,
    PERMISSIONS.BUYER.DELETE,
    PERMISSIONS.MAKE.VIEW,
    PERMISSIONS.MAKE.CREATE,
    PERMISSIONS.MAKE.UPDATE,
    PERMISSIONS.MAKE.DELETE,
    PERMISSIONS.MODEL.VIEW,
    PERMISSIONS.MODEL.CREATE,
    PERMISSIONS.MODEL.UPDATE,
    PERMISSIONS.MODEL.DELETE,
    PERMISSIONS.TRIM.VIEW,
    PERMISSIONS.TRIM.CREATE,
    PERMISSIONS.TRIM.UPDATE,
    PERMISSIONS.TRIM.DELETE,
    PERMISSIONS.PART.VIEW,
    PERMISSIONS.PART.CREATE,
    PERMISSIONS.PART.UPDATE,
    PERMISSIONS.PART.DELETE,
    PERMISSIONS.ELEMENT.VIEW,
    PERMISSIONS.ELEMENT.CREATE,
    PERMISSIONS.ELEMENT.UPDATE,
    PERMISSIONS.ELEMENT.DELETE,
    PERMISSIONS.DASHBOARD.VIEW
  ],

  [ROLES.ADMIN]: [
    // All permissions including bulk upload
    PERMISSIONS.CHECK_IN.VIEW,
    PERMISSIONS.CHECK_IN.CREATE,
    PERMISSIONS.CHECK_IN.UPDATE,
    PERMISSIONS.CHECK_IN.CHECKOUT,
    PERMISSIONS.WAIVER.VIEW,
    PERMISSIONS.WAIVER.CREATE,
    PERMISSIONS.WAIVER.UPDATE,
    PERMISSIONS.WAIVER.DELETE,
    PERMISSIONS.CAR_INTAKE.VIEW,
    PERMISSIONS.CAR_INTAKE.CREATE,
    PERMISSIONS.CAR_INTAKE.UPDATE,
    PERMISSIONS.CAR_INTAKE.DELETE,
    PERMISSIONS.CAR_INTAKE.BULK_UPLOAD, // Admin has bulk upload
    PERMISSIONS.CAR_INVENTORY.VIEW,
    PERMISSIONS.CAR_INVENTORY.CREATE,
    PERMISSIONS.CAR_INVENTORY.UPDATE,
    PERMISSIONS.CAR_INVENTORY.DELETE,
    PERMISSIONS.PART_INVENTORY.VIEW,
    PERMISSIONS.PART_INVENTORY.CREATE,
    PERMISSIONS.PART_INVENTORY.UPDATE,
    PERMISSIONS.PART_INVENTORY.DELETE,
    PERMISSIONS.SCRAP.VIEW,
    PERMISSIONS.SCRAP.CREATE,
    PERMISSIONS.SCRAP.UPDATE,
    PERMISSIONS.SCRAP.DELETE,
    PERMISSIONS.SELLER.VIEW,
    PERMISSIONS.SELLER.CREATE,
    PERMISSIONS.SELLER.UPDATE,
    PERMISSIONS.SELLER.DELETE,
    PERMISSIONS.BUYER.VIEW,
    PERMISSIONS.BUYER.CREATE,
    PERMISSIONS.BUYER.UPDATE,
    PERMISSIONS.BUYER.DELETE,
    PERMISSIONS.MAKE.VIEW,
    PERMISSIONS.MAKE.CREATE,
    PERMISSIONS.MAKE.UPDATE,
    PERMISSIONS.MAKE.DELETE,
    PERMISSIONS.MODEL.VIEW,
    PERMISSIONS.MODEL.CREATE,
    PERMISSIONS.MODEL.UPDATE,
    PERMISSIONS.MODEL.DELETE,
    PERMISSIONS.TRIM.VIEW,
    PERMISSIONS.TRIM.CREATE,
    PERMISSIONS.TRIM.UPDATE,
    PERMISSIONS.TRIM.DELETE,
    PERMISSIONS.PART.VIEW,
    PERMISSIONS.PART.CREATE,
    PERMISSIONS.PART.UPDATE,
    PERMISSIONS.PART.DELETE,
    PERMISSIONS.ELEMENT.VIEW,
    PERMISSIONS.ELEMENT.CREATE,
    PERMISSIONS.ELEMENT.UPDATE,
    PERMISSIONS.ELEMENT.DELETE,
    PERMISSIONS.DASHBOARD.VIEW
  ]
};

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission string to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false;
  }

  const userRole = user.role.toLowerCase();
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object with role property
 * @param {Array<string>} permissions - Array of permission strings
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object with role property
 * @param {Array<string>} permissions - Array of permission strings
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get user's role
 * @param {Object} user - User object
 * @returns {string|null}
 */
export const getUserRole = (user) => {
  if (!user || !user.role) {
    return null;
  }
  return user.role.toLowerCase();
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return getUserRole(user) === ROLES.ADMIN;
};

/**
 * Check if user is manager or above
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isManagerOrAbove = (user) => {
  const role = getUserRole(user);
  return role === ROLES.MANAGER || role === ROLES.ADMIN;
};

/**
 * Check if user is staff or above
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isStaffOrAbove = (user) => {
  const role = getUserRole(user);
  return role === ROLES.STAFF || role === ROLES.MANAGER || role === ROLES.ADMIN;
};

/**
 * Get all permissions for a role
 * @param {string} role - Role name
 * @returns {Array<string>}
 */
export const getRolePermissions = (role) => {
  const roleLower = role?.toLowerCase();
  return ROLE_PERMISSIONS[roleLower] || [];
};

/**
 * Filter menu items based on user permissions
 * @param {Object} user - User object
 * @param {Array} menuItems - Array of menu item objects with requiredPermission
 * @returns {Array}
 */
export const filterMenuByPermissions = (user, menuItems) => {
  return menuItems.filter(item => {
    if (!item.requiredPermission) {
      return true; // No permission required
    }
    
    if (Array.isArray(item.requiredPermission)) {
      return hasAnyPermission(user, item.requiredPermission);
    }
    
    return hasPermission(user, item.requiredPermission);
  });
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserRole,
  isAdmin,
  isManagerOrAbove,
  isStaffOrAbove,
  getRolePermissions,
  filterMenuByPermissions
};

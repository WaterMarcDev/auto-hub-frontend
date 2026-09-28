# Role-Based Access Control (RBAC) Implementation

## Overview
RBAC has been implemented in the frontend to control access based on user roles.

## User Roles

### 1. **Front-Desk**
**Access:**
- Check-In & Check-Out
- Waiver Creation
- Dashboard
- User Guides

**Restricted From:**
- Car Intake
- Inventories
- Scrap Management
- Master Data
- Bulk Uploads

### 2. **Staff**
**Access:**
- Car Intake (Create, View, Update, Delete)
- Car Inventory
- Parts Inventory
- Scrap Management
- Dashboard
- User Guides

**Restricted From:**
- Check-In/Check-Out
- Waiver
- Seller/Buyer Management
- Master Data
- Bulk Uploads

### 3. **Manager**
**Access:**
- Everything except Bulk Upload
- All Staff permissions
- All Front-Desk permissions
- Seller/Buyer Management
- Master Data (Make, Model, Trim, Part, Element)

**Restricted From:**
- Bulk Upload only

### 4. **Admin**
**Access:**
- Full System Access
- All permissions including Bulk Upload

## Files Created

### 1. `/utils/rbac.js`
- Defines all roles and permissions
- Permission checking functions
- Role hierarchy logic

### 2. `/components/PermissionGuard.jsx`
- Component to protect routes
- Shows 403 error for unauthorized access

### 3. `/hooks/usePermissions.js`
- React hook for permission checks
- Easy-to-use API in components

## Usage Examples

### In Components:
```javascript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { can, isAdmin, role } = usePermissions();
  
  return (
    <div>
      {can(PERMISSIONS.CAR_INTAKE.CREATE) && (
        <Button>Add Car</Button>
      )}
      
      {isAdmin && (
        <Button>Admin Only Feature</Button>
      )}
    </div>
  );
}
```

### Protecting Routes:
```javascript
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../utils/rbac';

<Route
  path="/car-intake"
  element={
    <PermissionGuard requiredPermission={PERMISSIONS.CAR_INTAKE.VIEW}>
      <CarIntake />
    </PermissionGuard>
  }
/>
```

### In Sidebar (Already Implemented):
```javascript
if (can(PERMISSIONS.CAR_INTAKE.VIEW)) {
  // Show Car Intake menu
}
```

## Permission List

### Check-In
- `check-in:view`
- `check-in:create`
- `check-in:update`
- `check-in:checkout`

### Car Intake
- `car-intake:view`
- `car-intake:create`
- `car-intake:update`
- `car-intake:delete`
- `car-intake:bulk-upload` (Admin only)

### Inventories
- `car-inventory:view/create/update/delete`
- `part-inventory:view/create/update/delete`

### Scrap
- `scrap:view/create/update/delete`

### Master Data
- `make:view/create/update/delete`
- `model:view/create/update/delete`
- `trim:view/create/update/delete`
- `part:view/create/update/delete`
- `element:view/create/update/delete`

### Seller/Buyer
- `seller:view/create/update/delete`
- `buyer:view/create/update/delete`

## Updated Files

### `Sidebar.jsx`
- Now uses permission-based menu rendering
- Dynamically shows/hides menu items based on role
- Added User Guides section

### Role Format in Backend
Expected format from backend:
```json
{
  "user": {
    "role": "admin" // or "manager", "staff", "front-desk"
  }
}
```

**Note:** Role comparison is case-insensitive in the frontend.

## Next Steps

### To Apply Route Protection:
1. Import PermissionGuard in App.jsx
2. Wrap protected routes with PermissionGuard
3. Specify required permission for each route

### Example:
```javascript
<Route
  path="/make"
  element={
    <PermissionGuard 
      requiredPermission={PERMISSIONS.MAKE.VIEW}
      redirectTo="/"
    >
      <Make />
    </PermissionGuard>
  }
/>
```

## Testing

### Test with Different Roles:
1. Login as **front-desk**
   - Should only see: Dashboard, Check-In, Waiver, Guides
   
2. Login as **staff**
   - Should only see: Dashboard, Car Intake, Inventories, Scrap, Guides
   
3. Login as **manager**
   - Should see: Everything except bulk upload button
   
4. Login as **admin**
   - Should see: Everything including bulk upload

## Benefits

✅ **Security** - Unauthorized users can't access protected features
✅ **UX** - Users only see what they can access
✅ **Maintainable** - Easy to add/modify permissions
✅ **Scalable** - Can add new roles easily
✅ **Type-Safe** - Permission constants prevent typos

## Status

✅ RBAC utilities created
✅ Permission checking functions ready
✅ usePermissions hook available
✅ PermissionGuard component ready
✅ Sidebar updated with permission checks
✅ User Guides added to sidebar

⏳ TODO: Add PermissionGuard to routes in App.jsx
⏳ TODO: Test with all roles
⏳ TODO: Update buttons/actions based on permissions

---

**Implementation Date:** November 6, 2024
**Status:** Core RBAC Ready - Route Protection Pending

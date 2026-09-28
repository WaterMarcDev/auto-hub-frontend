import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { hasPermission, hasAnyPermission } from '../utils/rbac';

/**
 * Component to protect routes based on permissions
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to render
 * @param {string|Array<string>} props.requiredPermission - Required permission(s)
 * @param {string} props.redirectTo - Where to redirect if no permission (default: /)
 * @param {boolean} props.requireAny - If true and array of permissions, requires ANY (default: false)
 */
const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  redirectTo = '/',
  requireAny = false 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Still loading auth state
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth-login" replace />;
  }

  // No permission required - render children
  if (!requiredPermission) {
    return children;
  }

  // Check permissions
  let hasAccess = false;

  if (Array.isArray(requiredPermission)) {
    if (requireAny) {
      // User needs ANY of the permissions
      hasAccess = hasAnyPermission(user, requiredPermission);
    } else {
      // User needs ALL permissions
      hasAccess = requiredPermission.every(perm => hasPermission(user, perm));
    }
  } else {
    // Single permission
    hasAccess = hasPermission(user, requiredPermission);
  }

  // Has permission - render children
  if (hasAccess) {
    return children;
  }

  // No permission - show error page
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      padding: '20px'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you don't have permission to access this page."
        extra={
          <Button type="primary" onClick={() => window.location.href = redirectTo}>
            Go Back to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default PermissionGuard;

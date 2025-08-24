import React, { ReactNode } from 'react';
import { useAuth, UserRole, PermissionType } from '../context/AuthContext';

interface PermissionGateProps {
  featureGroup: string;
  permissionType: PermissionType;
  children: ReactNode;
  fallback?: ReactNode;
}

// Component to conditionally render based on permissions
export const PermissionGate: React.FC<PermissionGateProps> = ({
  featureGroup,
  permissionType,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (hasPermission(featureGroup, permissionType)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Component to conditionally render based on roles
export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface FeatureGateProps {
  featureGroup: string;
  children: ReactNode;
  fallback?: ReactNode;
}

// Component to hide features that should not be visible to user
export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureGroup,
  children,
  fallback = null
}) => {
  const { isFeatureHidden } = useAuth();

  if (!isFeatureHidden(featureGroup)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ProtectedButtonProps {
  featureGroup: string;
  permissionType: PermissionType;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

// Button component that is disabled based on permissions
export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  featureGroup,
  permissionType,
  onClick,
  children,
  className = '',
  disabled = false
}) => {
  const { hasPermission } = useAuth();
  const canPerformAction = hasPermission(featureGroup, permissionType);

  return (
    <button
      onClick={canPerformAction ? onClick : undefined}
      disabled={disabled || !canPerformAction}
      className={`${className} ${!canPerformAction ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!canPerformAction ? `You need ${permissionType} permission for ${featureGroup}` : ''}
    >
      {children}
    </button>
  );
};

interface ProtectedLinkProps {
  featureGroup: string;
  permissionType: PermissionType;
  to: string;
  children: ReactNode;
  className?: string;
}

// Link component that is disabled based on permissions
export const ProtectedLink: React.FC<ProtectedLinkProps> = ({
  featureGroup,
  permissionType,
  to,
  children,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  const canAccess = hasPermission(featureGroup, permissionType);

  if (!canAccess) {
    return (
      <span 
        className={`${className} opacity-50 cursor-not-allowed`}
        title={`You need ${permissionType} permission for ${featureGroup}`}
      >
        {children}
      </span>
    );
  }

  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
};
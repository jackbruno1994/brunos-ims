import { useAuth, UserRole, PermissionType } from '../context/AuthContext';

// Hook for permission-based rendering
export const usePermission = (featureGroup: string, permissionType: PermissionType) => {
  const { hasPermission } = useAuth();
  return hasPermission(featureGroup, permissionType);
};

// Hook for feature visibility
export const useFeatureVisibility = (featureGroup: string) => {
  const { isFeatureHidden } = useAuth();
  return !isFeatureHidden(featureGroup);
};

// Hook for role-based access
export const useRole = (allowedRoles: UserRole[]) => {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
};

// Hook to get role display name
export const useRoleDisplayName = (role?: UserRole) => {
  const getRoleDisplayName = (userRole: UserRole): string => {
    const displayNames: { [key in UserRole]: string } = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      chef: 'Chef',
      kitchen_staff: 'Kitchen Staff',
      inventory_manager: 'Inventory Manager',
      cost_controller: 'Cost Controller',
      trainee: 'Trainee'
    };
    return displayNames[userRole];
  };

  return role ? getRoleDisplayName(role) : '';
};

// Hook to get filtered feature groups based on permissions
export const useFilteredFeatureGroups = () => {
  const { featureGroups, isFeatureHidden } = useAuth();
  
  return featureGroups.filter(group => !isFeatureHidden(group.name));
};

// Hook to get navigation items based on user permissions
export const useNavigationItems = () => {
  const { hasPermission, isFeatureHidden } = useAuth();

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      featureGroup: 'system_administration',
      permissionType: 'read' as PermissionType,
      icon: '📊'
    },
    {
      path: '/recipes',
      label: 'Recipes',
      featureGroup: 'recipe_management',
      permissionType: 'read' as PermissionType,
      icon: '👨‍🍳'
    },
    {
      path: '/inventory',
      label: 'Inventory',
      featureGroup: 'inventory_control',
      permissionType: 'read' as PermissionType,
      icon: '📦'
    },
    {
      path: '/financial',
      label: 'Financial',
      featureGroup: 'financial_management',
      permissionType: 'read' as PermissionType,
      icon: '💰'
    },
    {
      path: '/quality',
      label: 'Quality',
      featureGroup: 'quality_control',
      permissionType: 'read' as PermissionType,
      icon: '✅'
    },
    {
      path: '/training',
      label: 'Training',
      featureGroup: 'training_documentation',
      permissionType: 'read' as PermissionType,
      icon: '📚'
    },
    {
      path: '/restaurants',
      label: 'Restaurants',
      featureGroup: 'system_administration',
      permissionType: 'read' as PermissionType,
      icon: '🏪'
    },
    {
      path: '/users',
      label: 'Users',
      featureGroup: 'system_administration',
      permissionType: 'read' as PermissionType,
      icon: '👥'
    },
    {
      path: '/admin',
      label: 'Admin',
      featureGroup: 'system_administration',
      permissionType: 'write' as PermissionType,
      icon: '⚙️'
    }
  ];

  return navigationItems.filter(item => 
    !isFeatureHidden(item.featureGroup) && 
    hasPermission(item.featureGroup, item.permissionType)
  );
};
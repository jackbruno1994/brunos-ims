import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types matching backend
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'chef' | 'kitchen_staff' | 'inventory_manager' | 'cost_controller' | 'trainee';
export type PermissionType = 'read' | 'write' | 'hide';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
}

export interface FeatureGroup {
  name: string;
  displayName: string;
  description: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface RolePermissions {
  [featureGroup: string]: {
    read: boolean;
    write: boolean;
    hide: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  permissions: RolePermissions;
  accessibleFeatures: string[];
  featureGroups: FeatureGroup[];
  hasPermission: (featureGroup: string, permissionType: PermissionType) => boolean;
  isFeatureHidden: (featureGroup: string) => boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [accessibleFeatures, setAccessibleFeatures] = useState<string[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock login function (in real implementation, this would authenticate with backend)
  const login = async (email: string, _password: string) => {
    setLoading(true);
    try {
      // Mock authentication - in production this would call the backend
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: 'super_admin', // This would be determined by backend
        restaurantId: '1',
        country: 'US',
        status: 'active'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      await fetchUserPermissions();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions({});
    setAccessibleFeatures([]);
    setFeatureGroups([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/rbac/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      const data = await response.json();
      
      setPermissions(data.data.permissions);
      setAccessibleFeatures(data.data.accessibleFeatures);
      setFeatureGroups(data.data.featureGroups);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const hasPermission = (featureGroup: string, permissionType: PermissionType): boolean => {
    const permission = permissions[featureGroup];
    if (!permission) return false;

    switch (permissionType) {
      case 'read':
        return permission.read;
      case 'write':
        return permission.write && permission.read;
      case 'hide':
        return permission.hide;
      default:
        return false;
    }
  };

  const isFeatureHidden = (featureGroup: string): boolean => {
    return hasPermission(featureGroup, 'hide');
  };

  // Initialize authentication state on app load
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          await fetchUserPermissions();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    permissions,
    accessibleFeatures,
    featureGroups,
    hasPermission,
    isFeatureHidden,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
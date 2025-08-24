import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PermissionGate, RoleGate, ProtectedButton } from '../components/RBACComponents';
import { useRoleDisplayName } from '../hooks/useRBAC';

interface Role {
  name: string;
  displayName: string;
  permissions: {
    [featureGroup: string]: {
      read: boolean;
      write: boolean;
      hide: boolean;
    };
  };
}

const Users: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const userRoleDisplayName = useRoleDisplayName(user?.role);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rbac/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateUser = () => {
    alert('Create user functionality would be implemented here');
  };

  const handleEditUser = () => {
    alert('Edit user functionality would be implemented here');
  };

  return (
    <div>
      <h2 className="page-title">User Management</h2>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Current User Information</h3>
          <div>
            <span>Logged in as: <strong>{user?.firstName} {user?.lastName}</strong></span>
            <span style={{ marginLeft: '10px' }}>Role: <strong>{userRoleDisplayName}</strong></span>
          </div>
        </div>
        
        <PermissionGate 
          featureGroup="system_administration" 
          permissionType="read"
          fallback={<p>You don't have permission to view user management.</p>}
        >
          <div className="card">
            <h4>User Management Features</h4>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>View all users across countries</li>
              <li>Manage user roles and permissions</li>
              <li>Assign users to specific restaurants</li>
              <li>Track user activity and status</li>
              <li>Handle multi-country user permissions</li>
            </ul>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <ProtectedButton
                featureGroup="system_administration"
                permissionType="write"
                onClick={handleCreateUser}
                className="login-button"
              >
                Create User
              </ProtectedButton>
              
              <ProtectedButton
                featureGroup="system_administration"
                permissionType="write"
                onClick={handleEditUser}
                className="login-button"
              >
                Edit User
              </ProtectedButton>
            </div>
          </div>
        </PermissionGate>
        
        <RoleGate 
          allowedRoles={['super_admin', 'admin']}
          fallback={<p style={{ fontStyle: 'italic', marginTop: '20px' }}>
            Advanced user management features are only available to administrators.
          </p>}
        >
          <div className="card">
            <h4>Role Management</h4>
            <p>Available system roles and their permissions:</p>
            
            {loading ? (
              <div>Loading roles...</div>
            ) : (
              <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
                {roles.map((role) => (
                  <div key={role.name} className="card" style={{ margin: '10px 0' }}>
                    <h5>{role.displayName}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      {Object.entries(role.permissions).map(([featureGroup, permissions]) => (
                        <div key={featureGroup} style={{ fontSize: '12px' }}>
                          <strong>{featureGroup.replace(/_/g, ' ')}</strong>
                          <div>
                            Read: {permissions.read ? '✅' : '❌'} | 
                            Write: {permissions.write ? '✅' : '❌'} | 
                            Hidden: {permissions.hide ? '✅' : '❌'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </RoleGate>
        
        <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
          Full user management functionality will be implemented with database integration.
        </p>
      </div>
    </div>
  );
};

export default Users;
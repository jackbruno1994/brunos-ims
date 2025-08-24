import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoleDisplayName, useFilteredFeatureGroups } from '../hooks/useRBAC';
import { PermissionGate, FeatureGate } from '../components/RBACComponents';

const Dashboard: React.FC = () => {
  const { user, permissions, accessibleFeatures } = useAuth();
  const roleDisplayName = useRoleDisplayName(user?.role);
  const visibleFeatureGroups = useFilteredFeatureGroups();

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="card">
        <h3>Welcome to Bruno's IMS, {user?.firstName}!</h3>
        <p>Role: <strong>{roleDisplayName}</strong></p>
        <p>You have access to {accessibleFeatures.length} feature groups in the system.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <FeatureGate featureGroup="system_administration">
            <div className="card">
              <h4>🏪 Total Restaurants</h4>
              <p style={{ fontSize: '2em', color: '#007bff' }}>0</p>
              <small>System Administration Access</small>
            </div>
          </FeatureGate>
          
          <FeatureGate featureGroup="system_administration">
            <div className="card">
              <h4>👥 Active Users</h4>
              <p style={{ fontSize: '2em', color: '#28a745' }}>0</p>
              <small>User Management Access</small>
            </div>
          </FeatureGate>
          
          <FeatureGate featureGroup="recipe_management">
            <div className="card">
              <h4>👨‍🍳 Recipes</h4>
              <p style={{ fontSize: '2em', color: '#ffc107' }}>0</p>
              <small>Recipe Management Access</small>
            </div>
          </FeatureGate>

          <FeatureGate featureGroup="inventory_control">
            <div className="card">
              <h4>📦 Inventory Items</h4>
              <p style={{ fontSize: '2em', color: '#17a2b8' }}>0</p>
              <small>Inventory Access</small>
            </div>
          </FeatureGate>

          <FeatureGate featureGroup="financial_management">
            <div className="card">
              <h4>💰 Revenue</h4>
              <p style={{ fontSize: '2em', color: '#dc3545' }}>$0</p>
              <small>Financial Access</small>
            </div>
          </FeatureGate>

          <FeatureGate featureGroup="quality_control">
            <div className="card">
              <h4>✅ Quality Score</h4>
              <p style={{ fontSize: '2em', color: '#28a745' }}>98%</p>
              <small>Quality Control Access</small>
            </div>
          </FeatureGate>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h4>Your Accessible Features</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', textAlign: 'left' }}>
            {visibleFeatureGroups
              .filter(group => !group.parentId) // Only show main groups
              .map((group) => {
                const permission = permissions[group.name];
                return (
                  <div key={group.name} className="card" style={{ padding: '15px' }}>
                    <h5>{group.displayName}</h5>
                    <p style={{ fontSize: '12px', margin: '5px 0' }}>{group.description}</p>
                    {permission && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        <span>Permissions: </span>
                        {permission.read && <span style={{ color: '#28a745' }}>Read </span>}
                        {permission.write && <span style={{ color: '#007bff' }}>Write </span>}
                        {!permission.read && !permission.write && <span style={{ color: '#dc3545' }}>No Access</span>}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <PermissionGate 
          featureGroup="system_administration" 
          permissionType="read"
        >
          <div className="card" style={{ marginTop: '20px' }}>
            <h4>🔐 RBAC System Active</h4>
            <p>Role-Based Access Control is protecting this application.</p>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>Navigation items filtered by role</li>
              <li>Content visibility based on permissions</li>
              <li>API endpoints protected by middleware</li>
              <li>Audit logging enabled</li>
            </ul>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, Edit, Trash2, Plus, X } from 'lucide-react';
import { roleService, userService } from '../../services/userService';
import { Role } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface RoleManagerProps {
  onClose?: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ onClose }) => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles
  });

  // Fetch users to show role distribution
  const { data: usersData } = useQuery({
    queryKey: ['users', { limit: 1000 }],
    queryFn: () => userService.getUsers({ limit: 1000 })
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success('Role deleted successfully');
    }
  });

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const getRoleUserCount = (roleName: string) => {
    return usersData?.users.filter(user => user.role.type === roleName).length || 0;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Role Manager
          </h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-2">
          {hasRole('admin') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesData?.roles.map((role) => (
          <div key={role._id} className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      role.name === 'admin' ? 'bg-purple-500' :
                      role.name === 'manager' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}></span>
                    {role.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>
                {hasRole('admin') && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit Role"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span>{getRoleUserCount(role.name)} users</span>
                </div>
                <div className="text-xs text-gray-500">
                  Hierarchy: Level {role.hierarchy}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                <div className="space-y-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <div
                      key={permission}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {permission.replace('_', ' ')}
                    </div>
                  ))}
                  {role.permissions.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{role.permissions.length - 3} more permissions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Hierarchy Overview */}
      <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Hierarchy</h2>
        <div className="space-y-3">
          {rolesData?.roles
            .sort((a, b) => a.hierarchy - b.hierarchy)
            .map((role, index) => (
              <div key={role._id} className="flex items-center gap-4">
                <div className="text-sm font-medium text-gray-500 w-12">
                  {index + 1}.
                </div>
                <div className={`w-4 h-4 rounded-full ${
                  role.name === 'admin' ? 'bg-purple-500' :
                  role.name === 'manager' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">{role.name}</div>
                  <div className="text-sm text-gray-600">{role.description}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {getRoleUserCount(role.name)} users
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium text-gray-900">Permission</th>
                {rolesData?.roles.map((role) => (
                  <th key={role._id} className="text-center py-2 px-4 font-medium text-gray-900 capitalize">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(rolesData?.roles.flatMap(role => role.permissions) || [])).map((permission) => (
                <tr key={permission} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm text-gray-900">
                    {permission.replace('_', ' ')}
                  </td>
                  {rolesData?.roles.map((role) => (
                    <td key={role._id} className="text-center py-2 px-4">
                      {role.permissions.includes(permission) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">−</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingRole && (
        <RoleEditModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={() => {
            setEditingRole(null);
            queryClient.invalidateQueries(['roles']);
          }}
        />
      )}

      {/* Create Role Modal */}
      {showCreateForm && (
        <RoleCreateModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            queryClient.invalidateQueries(['roles']);
          }}
        />
      )}
    </div>
  );
};

// Role Edit Modal Component
interface RoleEditModalProps {
  role: Role;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({ role, onClose, onSuccess }) => {
  const [description, setDescription] = useState(role.description);
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [hierarchy, setHierarchy] = useState(role.hierarchy);

  const updateRoleMutation = useMutation({
    mutationFn: (data: Partial<Role>) => roleService.updateRole(role._id, data),
    onSuccess: () => {
      toast.success('Role updated successfully');
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate({
      description,
      permissions,
      hierarchy
    });
  };

  const allPermissions = [
    'create_users', 'read_users', 'update_users', 'delete_users',
    'create_roles', 'read_roles', 'update_roles', 'delete_roles',
    'read_activity', 'reset_passwords', 'manage_restaurants'
  ];

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Role: {role.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hierarchy Level
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={hierarchy}
              onChange={(e) => setHierarchy(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allPermissions.map((permission) => (
                <label key={permission} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {permission.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateRoleMutation.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {updateRoleMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Create Modal Component
interface RoleCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RoleCreateModal: React.FC<RoleCreateModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState<'admin' | 'manager' | 'staff'>('staff');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [hierarchy, setHierarchy] = useState(3);

  const createRoleMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      toast.success('Role created successfully');
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate({
      name,
      description,
      permissions,
      hierarchy
    });
  };

  const allPermissions = [
    'create_users', 'read_users', 'update_users', 'delete_users',
    'create_roles', 'read_roles', 'update_roles', 'delete_roles',
    'read_activity', 'reset_passwords', 'manage_restaurants'
  ];

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value as 'admin' | 'manager' | 'staff')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hierarchy Level
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={hierarchy}
              onChange={(e) => setHierarchy(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allPermissions.map((permission) => (
                <label key={permission} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {permission.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRoleMutation.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {createRoleMutation.isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManager;
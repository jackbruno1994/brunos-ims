import React, { useState } from 'react';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserProfile from '../components/users/UserProfile';
import RoleManager from '../components/users/RoleManager';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Users, Shield, User as UserIcon, Menu, X } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit' | 'profile' | 'roles';

const UsersPage: React.FC = () => {
  const { user: currentUser, logout, hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewMode('profile');
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setViewMode('list');
  };

  const handleFormSuccess = () => {
    setSelectedUser(null);
    setViewMode('list');
  };

  const navigation = [
    {
      name: 'Users',
      icon: Users,
      key: 'list' as ViewMode,
      permission: 'read_users'
    },
    {
      name: 'Role Manager',
      icon: Shield,
      key: 'roles' as ViewMode,
      permission: 'read_roles'
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out lg:transition-none`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Bruno's IMS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              hasPermission(item.permission) && (
                <button
                  key={item.key}
                  onClick={() => {
                    setViewMode(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === item.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </button>
              )
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.role.type}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-gray-900">Bruno's IMS</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          {viewMode === 'list' && (
            <UserList
              onCreateUser={handleCreateUser}
              onEditUser={handleEditUser}
              onViewUser={handleViewUser}
            />
          )}

          {viewMode === 'roles' && (
            <RoleManager />
          )}

          {/* Modals */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <UserForm
              user={selectedUser || undefined}
              onClose={handleCloseModal}
              onSuccess={handleFormSuccess}
            />
          )}

          {viewMode === 'profile' && selectedUser && (
            <UserProfile
              userId={selectedUser._id}
              onClose={handleCloseModal}
              onEdit={handleEditUser}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
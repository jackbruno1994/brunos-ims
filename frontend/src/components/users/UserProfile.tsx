import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Activity,
  Edit,
  Key,
  X
} from 'lucide-react';
import { userService } from '../../services/userService';
import { User as UserType, Activity as ActivityType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface UserProfileProps {
  userId: string;
  onClose: () => void;
  onEdit: (user: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onClose, onEdit }) => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  // Fetch user details
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId)
  });

  // Fetch user activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => userService.getUserActivity(userId),
    enabled: activeTab === 'activity'
  });

  if (userLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center">Loading user profile...</div>
        </div>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center text-red-500">User not found</div>
        </div>
      </div>
    );
  }

  const user = userData.user;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                  {user.status}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role.type)}`}>
                  {user.role.type}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {hasPermission('update_users') && (
              <button
                onClick={() => onEdit(user)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Activity History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <MapPin className="w-4 h-4" />
                      {user.country}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Permissions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role & Permissions
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getRoleBadge(user.role.type)}`}>
                        {user.role.type.charAt(0).toUpperCase() + user.role.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {user.role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Restaurant Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Restaurant Assignment
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restaurant</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {typeof user.restaurantId === 'object' ? user.restaurantId.name : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {typeof user.restaurantId === 'object' ? user.restaurantId.country : user.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Clock className="w-4 h-4" />
                      {formatDate(user.updatedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Clock className="w-4 h-4" />
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {hasPermission('update_users') && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Quick Actions
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    {hasPermission('reset_passwords') && (
                      <button
                        onClick={() => {
                          // This would trigger password reset
                          console.log('Reset password for user:', user._id);
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Reset Password
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-gray-900">Activity History</h2>
              </div>

              {activityLoading ? (
                <div className="text-center py-8">Loading activity...</div>
              ) : !activityData?.activities.length ? (
                <div className="text-center py-8 text-gray-500">No activity found</div>
              ) : (
                <div className="space-y-3">
                  {activityData.activities.map((activity: ActivityType) => (
                    <div key={activity._id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                              activity.action === 'login' ? 'bg-green-500' :
                              activity.action === 'logout' ? 'bg-gray-500' :
                              activity.action === 'create' ? 'bg-blue-500' :
                              activity.action === 'update' ? 'bg-yellow-500' :
                              activity.action === 'delete' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`}></span>
                            <span className="font-medium text-gray-900 capitalize">
                              {activity.action} {activity.resource}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(activity.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {activity.ipAddress}
                          </p>
                        </div>
                        {activity.details && (
                          <div className="text-xs text-gray-500 ml-4">
                            {activity.details.method && (
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {activity.details.method}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Pagination for activity */}
                  {activityData.pagination.pages > 1 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing {activityData.activities.length} of {activityData.pagination.total} activities
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
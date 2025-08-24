import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Eye, EyeOff } from 'lucide-react';
import { userService, roleService } from '../../services/userService';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface UserFormProps {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const { user: currentUser, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = React.useState(false);
  const isEditing = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: isEditing ? {
      username: user.username,
      email: user.email,
      role: user.role,
      restaurantId: typeof user.restaurantId === 'object' ? user.restaurantId._id : user.restaurantId,
      country: user.country,
      status: user.status
    } : {
      username: '',
      email: '',
      password: '',
      role: {
        type: 'staff' as const,
        permissions: []
      },
      restaurantId: '',
      country: ''
    }
  });

  const selectedRole = watch('role.type');

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User created successfully');
      onSuccess();
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User updated successfully');
      onSuccess();
    }
  });

  // Update role permissions when role type changes
  useEffect(() => {
    if (selectedRole && rolesData) {
      const role = rolesData.roles.find(r => r.name === selectedRole);
      if (role) {
        setValue('role.permissions', role.permissions);
      }
    }
  }, [selectedRole, rolesData, setValue]);

  const onSubmit = (data: any) => {
    // Basic validation
    if (!data.username || !data.email || !data.role.type || !data.restaurantId || !data.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEditing && !data.password) {
      toast.error('Password is required for new users');
      return;
    }

    if (isEditing && user) {
      const updateData: UpdateUserRequest = {
        username: data.username,
        email: data.email,
        role: data.role,
        restaurantId: data.restaurantId,
        country: data.country,
        status: data.status
      };
      updateUserMutation.mutate({
        id: user._id,
        data: updateData
      });
    } else {
      const createData: CreateUserRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        restaurantId: data.restaurantId,
        country: data.country
      };
      createUserMutation.mutate(createData);
    }
  };

  const countries = [
    'USA', 'Canada', 'UK', 'France', 'Germany', 'Italy', 'Spain',
    'Australia', 'Japan', 'Brazil', 'Mexico', 'India', 'China'
  ];

  // Mock restaurant data - in real app this would come from an API
  const restaurants = [
    { _id: '1', name: "Bruno's Main Restaurant", country: 'USA' },
    { _id: '2', name: "Bruno's London", country: 'UK' },
    { _id: '3', name: "Bruno's Paris", country: 'France' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="username"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
              )}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="email"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email"
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password (only for new users) */}
          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <Controller
              name="role.type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="role"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.role?.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!hasPermission('update_users') && currentUser?.role.type !== 'admin'}
                >
                  <option value="">Select a role</option>
                  {rolesData?.roles.map((role) => (
                    <option key={role._id} value={role.name}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)} - {role.description}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.role?.type && (
              <p className="mt-1 text-sm text-red-600">{errors.role.type.message}</p>
            )}
          </div>

          {/* Restaurant */}
          <div>
            <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant *
            </label>
            <Controller
              name="restaurantId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="restaurant"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.restaurantId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name} ({restaurant.country})
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.restaurantId && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantId.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="country"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || 'active'}
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              />
            </div>
          )}

          {/* Permissions Display */}
          {selectedRole && rolesData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Permissions
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                {rolesData.roles
                  .find(r => r.name === selectedRole)
                  ?.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1"
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || createUserMutation.isLoading || updateUserMutation.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createUserMutation.isLoading || updateUserMutation.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update User'
                : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
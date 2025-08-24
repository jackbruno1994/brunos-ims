import api from './api';
import {
  LoginRequest,
  LoginResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserFilters,
  Role,
  Activity,
  PaginationInfo
} from '../types';

// Auth services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};

// User services
export const userService = {
  getUsers: async (filters: UserFilters = {}): Promise<UsersResponse> => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  getUserById: async (id: string): Promise<{ user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<{ user: User }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: UpdateUserRequest): Promise<{ user: User }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateUserStatus: async (id: string, status: 'active' | 'inactive'): Promise<{ user: User }> => {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  },

  resetPassword: async (id: string): Promise<{ tempPassword: string; resetToken: string }> => {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },

  getUserActivity: async (id: string, page = 1, limit = 20): Promise<{
    activities: Activity[];
    pagination: PaginationInfo;
  }> => {
    const response = await api.get(`/users/${id}/activity`, {
      params: { page, limit }
    });
    return response.data;
  },
};

// Role services
export const roleService = {
  getRoles: async (): Promise<{ roles: Role[] }> => {
    const response = await api.get('/roles');
    return response.data;
  },

  createRole: async (roleData: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ role: Role }> => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  updateRole: async (id: string, roleData: Partial<Role>): Promise<{ role: Role }> => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};
export interface User {
  _id: string;
  username: string;
  email: string;
  role: {
    type: 'admin' | 'manager' | 'staff';
    permissions: string[];
  };
  restaurantId: {
    _id: string;
    name: string;
    country: string;
  };
  country: string;
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  _id: string;
  name: 'admin' | 'manager' | 'staff';
  description: string;
  permissions: string[];
  hierarchy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  _id: string;
  name: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: {
    type: 'admin' | 'manager' | 'staff';
    permissions: string[];
  };
  restaurantId: string;
  country: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: {
    type: 'admin' | 'manager' | 'staff';
    permissions: string[];
  };
  restaurantId?: string;
  country?: string;
  status?: 'active' | 'inactive';
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  country?: string;
  restaurantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
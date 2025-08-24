export interface Permission {
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: string[];
  hierarchyLevel: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface User {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string; // Role ID
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  startDate: Date;
  endDate?: Date;
  assignedBy: string;
  reason?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface RoleValidation {
  name: string;
  requiredPermissions: string[];
  conflictingRoles: string[];
  hierarchyLevel: number;
}

export interface PermissionCheck {
  userId: string;
  permission: string;
  resource: string;
  expected: boolean;
}

export interface RoleChangeLog {
  userId: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
  timestamp: Date;
  reason: string;
}

export interface PermissionLog {
  roleId: string;
  permission: string;
  action: "added" | "removed";
  timestamp: Date;
  updatedBy: string;
}

export interface TestResult {
  testCase: string;
  status: "passed" | "failed";
  expectedResult: any;
  actualResult: any;
  error?: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
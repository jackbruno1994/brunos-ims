// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  restaurantId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_change' | 'system' | 'user_action';
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string[];
  category?: string[];
  restaurantId?: string;
  search?: string;
}

export interface AuditExportOptions {
  format: 'excel' | 'json' | 'csv';
  filters: AuditFilter;
  includeDetails?: boolean;
  fileName?: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  filters: AuditFilter;
  exportOptions: AuditExportOptions;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  recipients: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  lastRunAt?: Date;
  nextRunAt: Date;
}
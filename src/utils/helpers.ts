import { ApiResponse } from '../types';

export const createResponse = <T = any>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
};

export const createSuccessResponse = <T = any>(
  data?: T,
  message?: string
): ApiResponse<T> => {
  return createResponse(true, data, message);
};

export const createErrorResponse = (
  error: string,
  message?: string
): ApiResponse => {
  return createResponse(false, undefined, message, error);
};

export const validatePermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  // If user has 'all' permission, grant access
  if (userPermissions.includes('all')) {
    return true;
  }
  
  // Check if user has all required permissions
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

export const hasPermissionConflicts = (
  permissions: string[]
): { hasConflicts: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  
  // Define permission conflicts
  const conflictPairs = [
    ['view_only', 'manage_all'],
    ['read_only', 'write_access'],
  ];
  
  for (const [perm1, perm2] of conflictPairs) {
    if (permissions.includes(perm1) && permissions.includes(perm2)) {
      conflicts.push(`${perm1} conflicts with ${perm2}`);
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
};

export const generateAuditLogEntry = (
  action: string,
  resource: string,
  userId: string,
  details?: any
) => {
  return {
    action,
    resource,
    userId,
    timestamp: new Date(),
    details: details || {},
  };
};
// Mock data for demo purposes when MongoDB is not available
export const mockUsers = [
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1c1',
    username: 'admin',
    email: 'admin@brunos-restaurant.com',
    role: {
      type: 'admin',
      permissions: [
        'create_users', 'read_users', 'update_users', 'delete_users',
        'create_roles', 'read_roles', 'update_roles', 'delete_roles',
        'read_activity', 'reset_passwords', 'manage_restaurants'
      ]
    },
    restaurantId: {
      _id: '60f7d8f0c9b4d8a2c8a9b1d1',
      name: "Bruno's Main Restaurant",
      country: 'USA'
    },
    country: 'USA',
    status: 'active',
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1c2',
    username: 'manager1',
    email: 'manager1@brunos-restaurant.com',
    role: {
      type: 'manager',
      permissions: [
        'create_users', 'read_users', 'update_users',
        'read_roles', 'read_activity', 'reset_passwords'
      ]
    },
    restaurantId: {
      _id: '60f7d8f0c9b4d8a2c8a9b1d1',
      name: "Bruno's Main Restaurant",
      country: 'USA'
    },
    country: 'USA',
    status: 'active',
    lastLogin: new Date('2024-01-14T14:20:00Z'),
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-14T14:20:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1c3',
    username: 'staff1',
    email: 'staff1@brunos-restaurant.com',
    role: {
      type: 'staff',
      permissions: ['read_users', 'read_roles']
    },
    restaurantId: {
      _id: '60f7d8f0c9b4d8a2c8a9b1d2',
      name: "Bruno's London",
      country: 'UK'
    },
    country: 'UK',
    status: 'active',
    lastLogin: new Date('2024-01-13T09:15:00Z'),
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-13T09:15:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1c4',
    username: 'staff2',
    email: 'staff2@brunos-restaurant.com',
    role: {
      type: 'staff',
      permissions: ['read_users', 'read_roles']
    },
    restaurantId: {
      _id: '60f7d8f0c9b4d8a2c8a9b1d1',
      name: "Bruno's Main Restaurant",
      country: 'USA'
    },
    country: 'USA',
    status: 'inactive',
    lastLogin: new Date('2024-01-10T16:45:00Z'),
    createdAt: new Date('2024-01-04T00:00:00Z'),
    updatedAt: new Date('2024-01-12T00:00:00Z')
  }
];

export const mockRoles = [
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1e1',
    name: 'admin',
    description: 'Full system access',
    permissions: [
      'create_users', 'read_users', 'update_users', 'delete_users',
      'create_roles', 'read_roles', 'update_roles', 'delete_roles',
      'read_activity', 'reset_passwords', 'manage_restaurants'
    ],
    hierarchy: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1e2',
    name: 'manager',
    description: 'Restaurant management access',
    permissions: [
      'create_users', 'read_users', 'update_users',
      'read_roles', 'read_activity', 'reset_passwords'
    ],
    hierarchy: 2,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1e3',
    name: 'staff',
    description: 'Basic access',
    permissions: ['read_users', 'read_roles'],
    hierarchy: 3,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
];

export const mockRestaurants = [
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1d1',
    name: "Bruno's Main Restaurant",
    country: 'USA',
    address: '123 Main Street, New York, NY 10001',
    phone: '+1-555-0123',
    email: 'main@brunos-restaurant.com',
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1d2',
    name: "Bruno's London",
    country: 'UK',
    address: '456 Oxford Street, London, UK',
    phone: '+44-20-1234567',
    email: 'london@brunos-restaurant.com',
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
];

export const mockActivity = [
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1f1',
    userId: '60f7d8f0c9b4d8a2c8a9b1c1',
    action: 'login',
    resource: 'auth',
    details: { method: 'email' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date('2024-01-15T10:30:00Z')
  },
  {
    _id: '60f7d8f0c9b4d8a2c8a9b1f2',
    userId: '60f7d8f0c9b4d8a2c8a9b1c1',
    action: 'create',
    resource: 'users',
    details: { createdUserId: '60f7d8f0c9b4d8a2c8a9b1c4' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date('2024-01-04T00:00:00Z')
  }
];

// Helper function to simulate database operations with mock data
export const getMockUser = (email: string, password: string) => {
  if (email === 'admin@brunos-restaurant.com' && password === 'admin123456') {
    return mockUsers[0];
  }
  return null;
};

export const getMockUsers = (filters: any = {}) => {
  let filteredUsers = [...mockUsers];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }
  
  if (filters.role) {
    filteredUsers = filteredUsers.filter(user => user.role.type === filters.role);
  }
  
  if (filters.status) {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }
  
  if (filters.country) {
    filteredUsers = filteredUsers.filter(user => user.country.toLowerCase().includes(filters.country.toLowerCase()));
  }
  
  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    users: paginatedUsers,
    pagination: {
      page,
      limit,
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit)
    }
  };
};
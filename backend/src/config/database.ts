import mongoose from 'mongoose';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brunos-ims';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    
    // Initialize default data
    await initializeDefaultData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const initializeDefaultData = async () => {
  try {
    // Create default roles if they don't exist
    const roles = [
      {
        name: 'admin',
        description: 'Full system access',
        permissions: [
          'create_users', 'read_users', 'update_users', 'delete_users',
          'create_roles', 'read_roles', 'update_roles', 'delete_roles',
          'read_activity', 'reset_passwords', 'manage_restaurants'
        ],
        hierarchy: 1
      },
      {
        name: 'manager',
        description: 'Restaurant management access',
        permissions: [
          'create_users', 'read_users', 'update_users',
          'read_roles', 'read_activity', 'reset_passwords'
        ],
        hierarchy: 2
      },
      {
        name: 'staff',
        description: 'Basic access',
        permissions: ['read_users', 'read_roles'],
        hierarchy: 3
      }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created default role: ${roleData.name}`);
      }
    }

    // Create default restaurant if none exist
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      const defaultRestaurant = await Restaurant.create({
        name: 'Bruno\'s Main Restaurant',
        country: 'USA',
        address: '123 Main Street, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'main@brunos-restaurant.com',
        status: 'active'
      });
      console.log('Created default restaurant');

      // Create default admin user if none exist
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const adminRole = await Role.findOne({ name: 'admin' });
        if (adminRole) {
          await User.create({
            username: 'admin',
            email: 'admin@brunos-restaurant.com',
            password: 'admin123456', // Will be hashed by pre-save hook
            role: {
              type: 'admin',
              permissions: adminRole.permissions
            },
            restaurantId: defaultRestaurant._id,
            country: 'USA',
            status: 'active'
          });
          console.log('Created default admin user (admin@brunos-restaurant.com / admin123456)');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};
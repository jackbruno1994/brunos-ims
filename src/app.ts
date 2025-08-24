import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, predefinedRoles } from './config';
import { connectDatabase } from './utils';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware';
import { Role, User } from './models';
import bcrypt from 'bcrypt';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize database with predefined roles and admin user
const initializeDatabase = async (): Promise<void> => {
  try {
    // Create predefined roles if they don't exist
    for (const roleData of predefinedRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role({
          ...roleData,
          isActive: true,
        });
        await role.save();
        console.log(`Created predefined role: ${roleData.name}`);
      }
    }

    // Create admin user if it doesn't exist
    const adminUser = await User.findOne({ username: config.admin.username });
    if (!adminUser) {
      const adminRole = await Role.findOne({ name: 'Admin' });
      const hashedPassword = await bcrypt.hash(config.admin.password, 10);
      
      const admin = new User({
        username: config.admin.username,
        email: config.admin.email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: adminRole?._id,
        isActive: true,
      });
      
      await admin.save();
      console.log('Created admin user');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await initializeDatabase();
    
    app.listen(config.port, () => {
      console.log(`Bruno's IMS API server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
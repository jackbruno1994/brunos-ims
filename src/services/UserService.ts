import bcrypt from 'bcrypt';
import { User, UserDocument } from '../models';
import { User as IUser, PaginationOptions } from '../types';

export class UserService {
  async createUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    // Check if username already exists
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error(`Username '${userData.username}' already exists`);
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new Error(`Email '${userData.email}' already exists`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();
    return user;
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return await User.findById(userId).populate('role');
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    return await User.findOne({ username }).populate('role');
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email }).populate('role');
  }

  async getAllUsers(options?: PaginationOptions): Promise<UserDocument[]> {
    const query = User.find({ isActive: true }).populate('role');
    
    if (options) {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      query
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    }
    
    return await query.exec();
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<UserDocument | null> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash password if it's being updated
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Check for unique constraints if username or email is being updated
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await User.findOne({ username: updateData.username });
      if (existingUsername) {
        throw new Error(`Username '${updateData.username}' already exists`);
      }
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await User.findOne({ email: updateData.email });
      if (existingEmail) {
        throw new Error(`Email '${updateData.email}' already exists`);
      }
    }

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();

    return true;
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserDocument[]> {
    const regex = new RegExp(searchTerm, 'i');
    const query = User.find({
      isActive: true,
      $or: [
        { username: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
      ],
    }).populate('role');

    if (options) {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      query
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    }

    return await query.exec();
  }

  async getUsersByRole(roleId: string, options?: PaginationOptions): Promise<UserDocument[]> {
    const query = User.find({ role: roleId, isActive: true }).populate('role');

    if (options) {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      query
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    }

    return await query.exec();
  }

  async countUsers(): Promise<number> {
    return await User.countDocuments({ isActive: true });
  }

  async countUsersByRole(roleId: string): Promise<number> {
    return await User.countDocuments({ role: roleId, isActive: true });
  }
}
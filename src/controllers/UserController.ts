import { Request, Response } from 'express';
import { UserService } from '../services';
import { createSuccessResponse, createErrorResponse } from '../utils';
import { User as IUser } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Create a new user
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const user = await this.userService.createUser(userData);
      
      // Remove password from response
      const userResponse = { ...user.toObject(), password: undefined };
      
      res.status(201).json(createSuccessResponse(userResponse, 'User created successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to create user'));
    }
  };

  // Get all users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const users = await this.userService.getAllUsers({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      // Remove passwords from response
      const usersResponse = users.map(user => ({ ...user.toObject(), password: undefined }));

      res.json(createSuccessResponse(usersResponse, 'Users retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve users'));
    }
  };

  // Get user by ID
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }

      // Remove password from response
      const userResponse = { ...user.toObject(), password: undefined };

      res.json(createSuccessResponse(userResponse, 'User retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve user'));
    }
  };

  // Update user
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await this.userService.updateUser(userId, updateData);

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }

      // Remove password from response
      const userResponse = { ...user.toObject(), password: undefined };

      res.json(createSuccessResponse(userResponse, 'User updated successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to update user'));
    }
  };

  // Delete user
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      await this.userService.deleteUser(userId);

      res.json(createSuccessResponse(null, 'User deleted successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to delete user'));
    }
  };

  // Search users
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      if (!q) {
        res.status(400).json(createErrorResponse('Search query is required'));
        return;
      }

      const users = await this.userService.searchUsers(q as string, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      // Remove passwords from response
      const usersResponse = users.map(user => ({ ...user.toObject(), password: undefined }));

      res.json(createSuccessResponse(usersResponse, 'Users search completed successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to search users'));
    }
  };

  // Get users by role
  getUsersByRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const users = await this.userService.getUsersByRole(roleId, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      // Remove passwords from response
      const usersResponse = users.map(user => ({ ...user.toObject(), password: undefined }));

      res.json(createSuccessResponse(usersResponse, 'Users retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve users by role'));
    }
  };

  // Get user count
  getUserCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.userService.countUsers();
      res.json(createSuccessResponse({ count }, 'User count retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to get user count'));
    }
  };

  // Get user count by role
  getUserCountByRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const count = await this.userService.countUsersByRole(roleId);
      res.json(createSuccessResponse({ count }, 'User count by role retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to get user count by role'));
    }
  };
}
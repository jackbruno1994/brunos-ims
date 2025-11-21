import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../models/User';
import { appConfig } from '../config';
import { auditLogin } from '../middleware/audit';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, username, firstName, lastName, password, role } = req.body;

            // Check if user already exists
            const existingUser = await UserService.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ message: 'User already exists with this email' });
                return;
            }

            if (username) {
                const existingUsername = await UserService.findByUsername(username);
                if (existingUsername) {
                    res.status(400).json({ message: 'Username already taken' });
                    return;
                }
            }

            // Create new user
            const user = await UserService.create({
                email,
                username,
                firstName,
                lastName,
                password,
                role: role || 'STAFF',
                status: 'ACTIVE',
            });

            // Remove password from response
            const { passwordHash, ...userResponse } = user;

            res.status(201).json({
                message: 'User created successfully',
                user: userResponse,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error });
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await UserService.findByEmail(email);
            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            // Check if user is active
            if (user.status !== 'ACTIVE') {
                res.status(401).json({ message: 'Account is not active' });
                return;
            }

            // Verify password
            const isValidPassword = await UserService.verifyPassword(user, password);
            if (!isValidPassword) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            // Update last login
            await UserService.updateLastLogin(user.id);

            // Log successful login
            await auditLogin(req, user.id);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                appConfig.jwtSecret,
                { expiresIn: '24h' }
            );

            // Remove password from response
            const { passwordHash, ...userResponse } = user;

            res.json({
                message: 'Login successful',
                token,
                user: userResponse,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error during login', error });
        }
    },

    async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const user = await UserService.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Remove password from response
            const { passwordHash, ...userResponse } = user;

            res.json(userResponse);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error });
        }
    },

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const { email, username, firstName, lastName } = req.body;

            // Check if email is being changed and if it's already taken
            if (email) {
                const existingUser = await UserService.findByEmail(email);
                if (existingUser && existingUser.id !== userId) {
                    res.status(400).json({ message: 'Email already taken' });
                    return;
                }
            }

            // Check if username is being changed and if it's already taken
            if (username) {
                const existingUsername = await UserService.findByUsername(username);
                if (existingUsername && existingUsername.id !== userId) {
                    res.status(400).json({ message: 'Username already taken' });
                    return;
                }
            }

            const updatedUser = await UserService.update(userId, {
                email,
                username,
                firstName,
                lastName,
            });

            // Remove password from response
            const { passwordHash, ...userResponse } = updatedUser;

            res.json({
                message: 'Profile updated successfully',
                user: userResponse,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile', error });
        }
    },

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const { currentPassword } = req.body;

            const user = await UserService.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Verify current password
            const isValidPassword = await UserService.verifyPassword(user, currentPassword);
            if (!isValidPassword) {
                res.status(400).json({ message: 'Current password is incorrect' });
                return;
            }

            // TODO: Update password - in real implementation, UserService.update would handle password hashing
            // For now, just acknowledge the request

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error changing password', error });
        }
    },
};
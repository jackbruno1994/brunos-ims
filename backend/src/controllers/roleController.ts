import { Response } from 'express';
import { body, param } from 'express-validator';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Validation rules
export const createRoleValidation = [
  body('name').isIn(['admin', 'manager', 'staff']),
  body('description').notEmpty().trim(),
  body('permissions').isArray(),
  body('hierarchy').isInt({ min: 1, max: 10 })
];

export const updateRoleValidation = [
  param('id').isMongoId(),
  body('description').optional().notEmpty().trim(),
  body('permissions').optional().isArray(),
  body('hierarchy').optional().isInt({ min: 1, max: 10 })
];

// Get all roles
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await Role.find().sort({ hierarchy: 1 });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Create role
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, permissions, hierarchy } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ error: 'Role already exists' });
    }

    const role = new Role({
      name,
      description,
      permissions,
      hierarchy
    });

    await role.save();

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Update role
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing the name
    delete updates.name;

    const role = await Role.findByIdAndUpdate(id, updates, { 
      new: true, 
      runValidators: true 
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Update all users with this role
    await User.updateMany(
      { 'role.type': role.name },
      { 'role.permissions': role.permissions }
    );

    res.json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete role
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if any users have this role
    const usersWithRole = await User.countDocuments({ 'role.type': role.name });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users' 
      });
    }

    await Role.findByIdAndDelete(id);

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
};
/**
 * ========================================
 * User Profile Routes
 * ========================================
 * 
 * Handles user profile management:
 * - GET /api/users/:id - Get user profile
 * - PUT /api/users/:id - Update user profile
 * - DELETE /api/users/:id - Delete user account
 * - GET /api/users/:id/stats - Get user statistics
 * 
 * All routes are protected (require JWT authentication)
 * 
 * @module routes/userRoutes
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { findUserById, updateUser, deleteUser, updateUserPassword } from '../db/users.js';
import { getUserSessionStats } from '../data/mockData.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * GET /api/users/:id
 * ========================================
 * 
 * Get user profile by ID (Protected)
 * Only the user can view their own profile or admins can view any
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "User profile retrieved successfully",
 *   "data": {
 *     "id": 1,
 *     "name": "John Doe",
 *     "email": "john@fitbuddy.com",
 *     "role": "member",
 *     "avatar": "https://...",
 *     "bio": "Fitness enthusiast",
 *     "createdAt": "2025-10-29T..."
 *   }
 * }
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user; // From JWT middleware

    // Check if user is accessing their own profile or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own profile or you are not authorized',
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't send password hash
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/users/:id
 * ========================================
 * 
 * Update user profile (Protected)
 * Users can update: name, email, bio, avatar, phone, etc.
 * Password changes should use a separate endpoint
 * 
 * Request Body:
 * {
 *   "name": "John Updated",
 *   "email": "john.new@fitbuddy.com",
 *   "bio": "Updated bio",
 *   "avatar": "https://...",
 *   "phone": "+1-555-1234"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Profile updated successfully",
 *   "data": { updated user object }
 * }
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;
    const { name, email, bio, avatar, phone } = req.body;

    // Authorization check
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this profile',
      });
    }

    // Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validate input
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }
      updates.email = email.toLowerCase();
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio must be less than 500 characters',
        });
      }
      updates.bio = bio.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || !avatar.startsWith('http')) {
        return res.status(400).json({
          success: false,
          message: 'Avatar must be a valid URL',
        });
      }
      updates.avatar = avatar;
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be valid',
        });
      }
      updates.phone = phone;
    }

    // Perform update
    const updatedUser = await updateUser(userId, updates);

    // Don't send password hash
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * DELETE /api/users/:id
 * ========================================
 * 
 * Delete user account (Protected)
 * Users can delete their own account or admins can delete any account
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "User account deleted successfully"
 * }
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;

    // Authorization check
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this account',
      });
    }

    // Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user
    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user account',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user account',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/users/:id/stats
 * ========================================
 * 
 * Get user statistics (Protected)
 * Returns aggregated data about user's activities
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "User statistics retrieved successfully",
 *   "data": {
 *     "totalSessions": 42,
 *     "completedSessions": 40,
 *     "totalDuration": 2520,
 *     "averageDuration": 63,
 *     "memberSince": "2024-01-15T...",
 *     "lastWorkout": "2025-10-28T14:30:00Z"
 *   }
 * }
 */
router.get('/:id/stats', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;

    // Check if user is accessing their own stats or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own statistics',
      });
    }

    // Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get session stats
    const sessionStats = getUserSessionStats(userId);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        ...sessionStats,
        memberSince: user.createdAt || new Date().toISOString(),
        lastWorkout: user.lastWorkout || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user statistics',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/users/:id/password
 * ========================================
 * 
 * Change user password (Protected)
 * Users can only change their own password
 * 
 * Request Body:
 * {
 *   "currentPassword": "oldpassword123",
 *   "newPassword": "newpassword123"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Password changed successfully"
 * }
 */
router.put('/:id/password', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    // Authorization check
    if (currentUser.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password',
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Get user
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await updateUserPassword(userId, hashedPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
});

export default router;

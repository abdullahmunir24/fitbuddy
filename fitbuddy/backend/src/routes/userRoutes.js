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
import { getUserStats, getUserProgressHistory, createProgressEntry } from '../db/stats.js';
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

    // Get real statistics from database
    const stats = await getUserStats(userId);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        ...stats,
        memberSince: user.createdAt || new Date().toISOString(),
        lastWorkout: stats.lastWorkoutDate || null,
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

/**
 * ========================================
 * GET /api/users/:id/progress
 * ========================================
 * 
 * Get user progress history (Protected)
 * Returns measurements over time for tracking body composition changes
 * 
 * Query Parameters:
 * - limit: Number of entries to return (default: 10)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Progress history retrieved successfully",
 *   "data": [
 *     {
 *       "id": 1,
 *       "measurement_date": "2025-11-20",
 *       "weight_kg": 75.5,
 *       "body_fat_percentage": 18.5,
 *       "muscle_mass_kg": 32.0,
 *       "chest_cm": 98.0,
 *       "waist_cm": 82.0,
 *       "hips_cm": 96.0,
 *       "biceps_cm": 35.0,
 *       "thighs_cm": 58.0,
 *       "notes": "Feeling stronger"
 *     }
 *   ]
 * }
 */
router.get('/:id/progress', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;
    const limit = parseInt(req.query.limit) || 10;

    // Check if user is accessing their own progress or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own progress',
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

    // Get progress history from database
    const progressHistory = await getUserProgressHistory(userId, limit);

    res.status(200).json({
      success: true,
      message: 'Progress history retrieved successfully',
      data: progressHistory,
    });
  } catch (error) {
    console.error('Error retrieving progress history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving progress history',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * POST /api/users/:id/progress
 * ========================================
 * 
 * Create a new progress entry (Protected)
 * Allows users to log their body measurements
 * 
 * Request Body:
 * {
 *   "weight_kg": 75.5,
 *   "body_fat_percentage": 18.5,
 *   "muscle_mass_kg": 32.0,
 *   "chest_cm": 98.0,
 *   "waist_cm": 82.0,
 *   "hips_cm": 96.0,
 *   "biceps_cm": 35.0,
 *   "thighs_cm": 58.0,
 *   "notes": "Monthly check-in"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Progress entry created successfully",
 *   "data": { ... }
 * }
 */
router.post('/:id/progress', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;

    // Check if user is creating their own progress entry
    if (currentUser.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create progress entries for yourself',
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

    // Create progress entry
    const progressEntry = await createProgressEntry(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Progress entry created successfully',
      data: progressEntry,
    });
  } catch (error) {
    console.error('Error creating progress entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating progress entry',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/users/:id/classes
 * ========================================
 * 
 * Get available classes for a user (member view)
 * Shows all classes created by trainers that the member can join
 * 
 * Query Parameters:
 * - trainer_id: Filter by specific trainer (optional)
 * - class_type: Filter by class type (optional)
 * - difficulty_level: Filter by difficulty (optional)
 * - gym_id: Filter by gym (optional)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Available classes retrieved successfully",
 *   "data": [
 *     {
 *       "id": 1,
 *       "class_name": "Yoga Basics",
 *       "description": "Beginner yoga for flexibility",
 *       "trainer": {
 *         "id": 5,
 *         "name": "Jane Smith",
 *         "specializations": ["yoga", "pilates"]
 *       },
 *       "gym": {
 *         "id": 1,
 *         "name": "FitHub Kelowna"
 *       },
 *       "class_type": "yoga",
 *       "difficulty_level": "beginner",
 *       "max_capacity": 20,
 *       "duration_minutes": 60,
 *       "price": 0.00,
 *       "schedules": [
 *         {
 *           "id": 1,
 *           "scheduled_date": "2025-11-25",
 *           "start_time": "10:00:00",
 *           "end_time": "11:00:00",
 *           "current_capacity": 15,
 *           "available_spots": 5,
 *           "status": "scheduled"
 *         }
 *       ]
 *     }
 *   ],
 *   "count": 1
 * }
 */
router.get('/:id/classes', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { trainer_id, class_type, difficulty_level, gym_id } = req.query;

    // Verify user is viewing their own classes or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own available classes',
      });
    }

    // Build filter options
    const filters = {};
    if (trainer_id) filters.trainer_id = parseInt(trainer_id);
    if (class_type) filters.class_type = class_type;
    if (difficulty_level) filters.difficulty_level = difficulty_level;
    if (gym_id) filters.gym_id = parseInt(gym_id);

    // Query available classes from database
    const query = `
      SELECT 
        fc.id,
        fc.class_name,
        fc.description,
        fc.class_type,
        fc.difficulty_level,
        fc.max_capacity,
        fc.duration_minutes,
        fc.price,
        fc.trainer_id,
        u.full_name as trainer_name,
        g.id as gym_id,
        g.name as gym_name,
        g.city as gym_city,
        json_agg(
          json_build_object(
            'id', cs.id,
            'scheduled_date', cs.scheduled_date,
            'start_time', cs.start_time,
            'end_time', cs.end_time,
            'current_capacity', cs.current_capacity,
            'available_spots', fc.max_capacity - COALESCE(cs.current_capacity, 0),
            'status', cs.status
          ) ORDER BY cs.scheduled_date, cs.start_time
        ) as schedules
      FROM fitness_classes fc
      LEFT JOIN users u ON fc.trainer_id = u.id
      LEFT JOIN gyms g ON fc.gym_id = g.id
      LEFT JOIN class_schedules cs ON fc.id = cs.class_id AND cs.status != 'cancelled'
      WHERE fc.is_active = true
        ${trainer_id ? `AND fc.trainer_id = $${Object.keys(filters).indexOf('trainer_id') + 1}` : ''}
        ${class_type ? `AND fc.class_type = $${Object.keys(filters).indexOf('class_type') + 1}` : ''}
        ${difficulty_level ? `AND fc.difficulty_level = $${Object.keys(filters).indexOf('difficulty_level') + 1}` : ''}
        ${gym_id ? `AND fc.gym_id = $${Object.keys(filters).indexOf('gym_id') + 1}` : ''}
      GROUP BY fc.id, u.id, g.id
      ORDER BY fc.class_name ASC
    `;

    const filterValues = Object.values(filters);
    const result = await pool.query(query, filterValues);

    res.status(200).json({
      success: true,
      message: 'Available classes retrieved successfully',
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error retrieving available classes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available classes',
      error: error.message,
    });
  }
});

export default router;

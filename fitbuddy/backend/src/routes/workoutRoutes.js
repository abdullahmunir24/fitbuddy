/**
 * ========================================
 * Workout Routes
 * ========================================
 * 
 * Handles workout management:
 * - POST /api/workouts - Create new workout
 * - GET /api/workouts - Get all workouts (with pagination)
 * - GET /api/workouts/:id - Get specific workout
 * - PUT /api/workouts/:id - Update workout
 * - DELETE /api/workouts/:id - Delete workout
 * - GET /api/users/:userId/workouts - Get user's workouts
 * 
 * All routes are protected (require JWT authentication)
 * 
 * @module routes/workoutRoutes
 */

import express from 'express';
import {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  getUserWorkouts,
  updateWorkout,
  deleteWorkout,
} from '../data/mockData.js';
import { findUserById } from '../data/mockUsers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * POST /api/workouts
 * ========================================
 * 
 * Create a new workout (Protected)
 * 
 * Request Body:
 * {
 *   "name": "Chest Day",
 *   "description": "Focus on chest and triceps",
 *   "date": "2025-10-29",
 *   "duration": 60,
 *   "exercises": [
 *     {
 *       "exerciseId": 1,
 *       "sets": 4,
 *       "reps": 8,
 *       "weight": 225,
 *       "notes": "Felt strong today"
 *     }
 *   ]
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Workout created successfully",
 *   "data": { workout object }
 * }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, date, duration, exercises } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Workout name is required and must be at least 3 characters',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Workout date is required',
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format',
      });
    }

    if (duration && (typeof duration !== 'number' || duration < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number (in minutes)',
      });
    }

    if (exercises && !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'Exercises must be an array',
      });
    }

    // Validate exercises
    if (exercises) {
      for (const ex of exercises) {
        if (!ex.exerciseId || !ex.sets || !ex.reps) {
          return res.status(400).json({
            success: false,
            message: 'Each exercise must have exerciseId, sets, and reps',
          });
        }

        if (typeof ex.sets !== 'number' || ex.sets < 1) {
          return res.status(400).json({
            success: false,
            message: 'Sets must be a positive number',
          });
        }

        if (typeof ex.reps !== 'number' || ex.reps < 1) {
          return res.status(400).json({
            success: false,
            message: 'Reps must be a positive number',
          });
        }
      }
    }

    // Create workout
    const workoutData = {
      name: name.trim(),
      description: description || '',
      date,
      duration: duration || 0,
      exercises: exercises || [],
      status: 'draft', // draft or completed
    };

    const newWorkout = createWorkout(userId, workoutData);

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: newWorkout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating workout',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/workouts
 * ========================================
 * 
 * Get all workouts with pagination (Protected)
 * Query parameters: page, limit
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Workouts retrieved successfully",
 *   "data": [ workout objects ],
 *   "pagination": {
 *     "total": 150,
 *     "page": 1,
 *     "limit": 10,
 *     "pages": 15
 *   }
 * }
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page and limit must be positive numbers',
      });
    }

    const allWorkouts = getAllWorkouts();
    const total = allWorkouts.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedWorkouts = allWorkouts.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: paginatedWorkouts,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving workouts',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/workouts/:id
 * ========================================
 * 
 * Get specific workout by ID (Protected)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Workout retrieved successfully",
 *   "data": { workout object }
 * }
 */
router.get('/:id', requireAuth, (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    const workout = getWorkoutById(workoutId);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout retrieved successfully',
      data: workout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving workout',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/workouts/:id
 * ========================================
 * 
 * Update workout (Protected)
 * Users can only update their own workouts
 * 
 * Request Body:
 * {
 *   "name": "Updated Chest Day",
 *   "description": "New description",
 *   "duration": 75,
 *   "exercises": [...]
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Workout updated successfully",
 *   "data": { updated workout object }
 * }
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const userId = req.user.id;
    const { name, description, date, duration, exercises, status } = req.body;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    const workout = getWorkoutById(workoutId);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    // Authorization: only owner or admin can update
    if (workout.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this workout',
      });
    }

    // Validate updates
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Workout name must be at least 3 characters',
        });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description || '';
    }

    if (date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Date must be in YYYY-MM-DD format',
        });
      }
      updates.date = date;
    }

    if (duration !== undefined) {
      if (typeof duration !== 'number' || duration < 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a non-negative number',
        });
      }
      updates.duration = duration;
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises)) {
        return res.status(400).json({
          success: false,
          message: 'Exercises must be an array',
        });
      }
      updates.exercises = exercises;
    }

    if (status !== undefined) {
      if (!['draft', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be draft, completed, or cancelled',
        });
      }
      updates.status = status;
    }

    const updatedWorkout = updateWorkout(workoutId, updates);

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: updatedWorkout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating workout',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * DELETE /api/workouts/:id
 * ========================================
 * 
 * Delete workout (Protected)
 * Users can only delete their own workouts
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Workout deleted successfully"
 * }
 */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    const workout = getWorkoutById(workoutId);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    // Authorization check
    if (workout.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this workout',
      });
    }

    const deleted = deleteWorkout(workoutId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete workout',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting workout',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/users/:userId/workouts
 * ========================================
 * 
 * Get workouts for a specific user (Protected)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "User workouts retrieved successfully",
 *   "data": [ workout objects ]
 * }
 */
router.get('/user/:userId', requireAuth, (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUser = req.user;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Check authorization
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own workouts',
      });
    }

    // Verify user exists
    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userWorkouts = getUserWorkouts(userId);

    res.status(200).json({
      success: true,
      message: 'User workouts retrieved successfully',
      data: userWorkouts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user workouts',
      error: error.message,
    });
  }
});

export default router;

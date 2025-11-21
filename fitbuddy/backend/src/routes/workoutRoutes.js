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
  getUserWorkouts,
  getWorkoutById,
  updateWorkout,
  addExerciseToWorkout,
  deleteWorkout,
} from '../db/workouts.js';
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
    const { name, date, completed, exercises } = req.body;
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

    if (exercises && !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'Exercises must be an array',
      });
    }

    // Validate exercises
    if (exercises) {
      for (const ex of exercises) {
        if (!ex.name || typeof ex.name !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each exercise must have a name',
          });
        }

        if (ex.sets !== undefined && (typeof ex.sets !== 'number' || ex.sets < 1)) {
          return res.status(400).json({
            success: false,
            message: 'Sets must be a positive number',
          });
        }

        if (ex.reps !== undefined && (typeof ex.reps !== 'number' || ex.reps < 1)) {
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
      date,
      completed: completed || false,
      exercises: exercises || [],
    };

    const newWorkout = await createWorkout(userId, workoutData);

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
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userWorkouts = await getUserWorkouts(userId);

    res.status(200).json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: userWorkouts,
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
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    const workout = await getWorkoutById(workoutId, userId);

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
    const { name, date, completed, exercises } = req.body;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
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

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Completed must be a boolean',
        });
      }
      updates.completed = completed;
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises)) {
        return res.status(400).json({
          success: false,
          message: 'Exercises must be an array',
        });
      }
      // Validate exercises
      for (const ex of exercises) {
        if (!ex.name || typeof ex.name !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each exercise must have a name',
          });
        }
      }
      updates.exercises = exercises;
    }

    const updatedWorkout = await updateWorkout(workoutId, userId, updates);

    if (!updatedWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized',
      });
    }

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
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    const deleted = await deleteWorkout(workoutId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized',
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
router.get('/user/:userId', requireAuth, async (req, res) => {
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

    const userWorkouts = await getUserWorkouts(userId);

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

/**
 * ========================================
 * POST /api/workouts/:id/exercises
 * ========================================
 * 
 * Add an exercise to an existing workout (Protected)
 * 
 * Request Body:
 * {
 *   "name": "Bench Press",
 *   "sets": 3,
 *   "reps": 10,
 *   "weight": "135 lbs"
 * }
 */
router.post('/:id/exercises', requireAuth, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const userId = req.user.id;
    const { name, sets, reps, weight } = req.body;

    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout ID',
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Exercise name is required',
      });
    }

    if (sets !== undefined && (typeof sets !== 'number' || sets < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Sets must be a positive number',
      });
    }

    if (reps !== undefined && (typeof reps !== 'number' || reps < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Reps must be a positive number',
      });
    }

    const exercise = await addExerciseToWorkout(workoutId, userId, {
      name,
      sets: sets || 0,
      reps: reps || 0,
      weight: weight || 'Body Weight',
    });

    res.status(201).json({
      success: true,
      message: 'Exercise added to workout successfully',
      data: exercise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding exercise to workout',
      error: error.message,
    });
  }
});

export default router;

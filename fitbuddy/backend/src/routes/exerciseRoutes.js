/**
 * ========================================
 * Exercise Routes
 * ========================================
 * 
 * Handles exercise library management:
 * - GET /api/exercises - Get all exercises
 * - GET /api/exercises/:id - Get exercise by ID
 * - POST /api/exercises - Create new exercise (Admin only)
 * - PUT /api/exercises/:id - Update exercise (Admin only)
 * - DELETE /api/exercises/:id - Delete exercise (Admin only)
 * 
 * All routes except GET are protected and require admin role
 * 
 * @module routes/exerciseRoutes
 */

import express from 'express';
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../data/mockData.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * GET /api/exercises
 * ========================================
 * 
 * Get all available exercises (Public - no auth required)
 * Returns complete exercise library for all users
 * 
 * Query parameters:
 * - muscleGroup: Filter by muscle group (e.g., 'Chest', 'Legs')
 * - difficulty: Filter by difficulty (e.g., 'Beginner', 'Intermediate', 'Advanced')
 * - equipment: Filter by equipment needed
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Exercises retrieved successfully",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Bench Press",
 *       "description": "Push bar up from chest level",
 *       "muscleGroup": "Chest",
 *       "difficulty": "Intermediate",
 *       "equipment": "Barbell"
 *     }
 *   ]
 * }
 */
router.get('/', (req, res) => {
  try {
    const { muscleGroup, difficulty, equipment } = req.query;
    let exercises = getAllExercises();

    // Apply filters if provided
    if (muscleGroup) {
      exercises = exercises.filter(
        ex => ex.muscleGroup.toLowerCase() === muscleGroup.toLowerCase()
      );
    }

    if (difficulty) {
      exercises = exercises.filter(
        ex => ex.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (equipment) {
      exercises = exercises.filter(
        ex => ex.equipment.toLowerCase() === equipment.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      message: 'Exercises retrieved successfully',
      data: exercises,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving exercises',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/exercises/:id
 * ========================================
 * 
 * Get specific exercise by ID (Public - no auth required)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Exercise retrieved successfully",
 *   "data": { exercise object }
 * }
 */
router.get('/:id', (req, res) => {
  try {
    const exerciseId = parseInt(req.params.id);

    if (isNaN(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise ID',
      });
    }

    const exercise = getExerciseById(exerciseId);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exercise retrieved successfully',
      data: exercise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving exercise',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * POST /api/exercises
 * ========================================
 * 
 * Create new exercise (Protected - Admin only)
 * 
 * Request Body:
 * {
 *   "name": "Cable Fly",
 *   "description": "Isolate chest muscles using cables",
 *   "muscleGroup": "Chest",
 *   "difficulty": "Intermediate",
 *   "equipment": "Cable Machine"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Exercise created successfully",
 *   "data": { exercise object with ID }
 * }
 */
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, description, muscleGroup, difficulty, equipment } = req.body;
    const currentUser = req.user;

    // Check admin role
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create exercises',
      });
    }

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name is required and must be at least 3 characters',
      });
    }

    if (!muscleGroup || typeof muscleGroup !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Muscle group is required',
      });
    }

    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    if (!difficulty || !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
      });
    }

    if (!equipment || typeof equipment !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Equipment is required',
      });
    }

    const exerciseData = {
      name: name.trim(),
      description: description || '',
      muscleGroup: muscleGroup.trim(),
      difficulty,
      equipment: equipment.trim(),
    };

    const newExercise = createExercise(exerciseData);

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: newExercise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating exercise',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/exercises/:id
 * ========================================
 * 
 * Update exercise (Protected - Admin only)
 * 
 * Request Body:
 * {
 *   "name": "Updated name",
 *   "description": "Updated description",
 *   "difficulty": "Advanced"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Exercise updated successfully",
 *   "data": { updated exercise object }
 * }
 */
router.put('/:id', requireAuth, (req, res) => {
  try {
    const exerciseId = parseInt(req.params.id);
    const currentUser = req.user;

    if (isNaN(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise ID',
      });
    }

    // Check admin role
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update exercises',
      });
    }

    // Check if exercise exists
    const exercise = getExerciseById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const { name, description, muscleGroup, difficulty, equipment } = req.body;
    const updates = {};

    // Validate and build updates object
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Exercise name must be at least 3 characters',
        });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description || '';
    }

    if (muscleGroup !== undefined) {
      if (typeof muscleGroup !== 'string' || muscleGroup.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Muscle group must be a non-empty string',
        });
      }
      updates.muscleGroup = muscleGroup.trim();
    }

    if (difficulty !== undefined) {
      const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
        });
      }
      updates.difficulty = difficulty;
    }

    if (equipment !== undefined) {
      if (typeof equipment !== 'string' || equipment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Equipment must be a non-empty string',
        });
      }
      updates.equipment = equipment.trim();
    }

    const updatedExercise = updateExercise(exerciseId, updates);

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully',
      data: updatedExercise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exercise',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * DELETE /api/exercises/:id
 * ========================================
 * 
 * Delete exercise (Protected - Admin only)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Exercise deleted successfully"
 * }
 */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const exerciseId = parseInt(req.params.id);
    const currentUser = req.user;

    if (isNaN(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise ID',
      });
    }

    // Check admin role
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete exercises',
      });
    }

    // Check if exercise exists
    const exercise = getExerciseById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const deleted = deleteExercise(exerciseId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete exercise',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting exercise',
      error: error.message,
    });
  }
});

export default router;

/**
 * ========================================
 * Workout Session Routes
 * ========================================
 * 
 * Handles workout logs/sessions management:
 * - POST /api/sessions - Create new session (log workout)
 * - GET /api/sessions - Get all sessions
 * - GET /api/sessions/:id - Get session by ID
 * - PUT /api/sessions/:id - Update session
 * - DELETE /api/sessions/:id - Delete session
 * - GET /api/users/:userId/sessions - Get user's sessions
 * - GET /api/sessions/stats/:userId - Get user session statistics
 * 
 * A session represents a logged workout with exercises completed
 * 
 * @module routes/sessionRoutes
 */

import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  getUserSessions,
  updateSession,
  deleteSession,
  getUserSessionStats,
} from '../data/mockData.js';
import { findUserById } from '../data/mockUsers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * POST /api/sessions
 * ========================================
 * 
 * Create a new workout session/log (Protected)
 * Represents a completed or in-progress workout
 * 
 * Request Body:
 * {
 *   "workoutId": 1,
 *   "workoutName": "Chest Day",
 *   "date": "2025-10-29",
 *   "duration": 45,
 *   "exercises": [
 *     {
 *       "exerciseId": 1,
 *       "exerciseName": "Bench Press",
 *       "sets": 4,
 *       "reps": 8,
 *       "weight": 225,
 *       "actualReps": 8,
 *       "actualWeight": 225,
 *       "notes": "Felt strong"
 *     }
 *   ],
 *   "notes": "Great workout",
 *   "status": "completed"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Session created successfully",
 *   "data": { session object }
 * }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { workoutId, workoutName, date, duration, exercises, notes, status } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!workoutName || typeof workoutName !== 'string' || workoutName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Workout name is required and must be at least 3 characters',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Session date is required',
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

    const validStatuses = ['in-progress', 'completed', 'abandoned'];
    const sessionStatus = status || 'completed';
    if (!validStatuses.includes(sessionStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
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
        if (!ex.exerciseId || !ex.exerciseName) {
          return res.status(400).json({
            success: false,
            message: 'Each exercise must have exerciseId and exerciseName',
          });
        }

        if (ex.sets && typeof ex.sets !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Sets must be a number',
          });
        }

        if (ex.reps && typeof ex.reps !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Reps must be a number',
          });
        }

        if (ex.weight && typeof ex.weight !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Weight must be a number',
          });
        }
      }
    }

    // Create session
    const sessionData = {
      workoutId: workoutId || null,
      workoutName: workoutName.trim(),
      date,
      duration: duration || 0,
      exercises: exercises || [],
      notes: notes || '',
      status: sessionStatus,
    };

    const newSession = createSession(userId, sessionData);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: newSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/sessions
 * ========================================
 * 
 * Get all sessions with pagination (Protected)
 * Query parameters: page, limit
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Sessions retrieved successfully",
 *   "data": [ session objects ],
 *   "pagination": { ... }
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

    const allSessions = getAllSessions();
    const total = allSessions.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedSessions = allSessions.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      message: 'Sessions retrieved successfully',
      data: paginatedSessions,
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
      message: 'Error retrieving sessions',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/sessions/:id
 * ========================================
 * 
 * Get specific session by ID (Protected)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Session retrieved successfully",
 *   "data": { session object }
 * }
 */
router.get('/:id', requireAuth, (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const session = getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session retrieved successfully',
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving session',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/sessions/:id
 * ========================================
 * 
 * Update session (Protected)
 * Users can only update their own sessions
 * 
 * Request Body:
 * {
 *   "duration": 60,
 *   "exercises": [...],
 *   "notes": "Updated notes",
 *   "status": "completed"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Session updated successfully",
 *   "data": { updated session object }
 * }
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;
    const { duration, exercises, notes, status } = req.body;

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const session = getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Authorization: only owner or admin can update
    if (session.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this session',
      });
    }

    // Validate updates
    const updates = {};

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

    if (notes !== undefined) {
      updates.notes = notes || '';
    }

    if (status !== undefined) {
      const validStatuses = ['in-progress', 'completed', 'abandoned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }
      updates.status = status;
    }

    const updatedSession = updateSession(sessionId, updates);

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating session',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * DELETE /api/sessions/:id
 * ========================================
 * 
 * Delete session (Protected)
 * Users can only delete their own sessions
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Session deleted successfully"
 * }
 */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const session = getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Authorization check
    if (session.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this session',
      });
    }

    const deleted = deleteSession(sessionId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete session',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting session',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/users/:userId/sessions
 * ========================================
 * 
 * Get sessions for a specific user (Protected)
 * 
 * Query parameters: status (filter by status)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "User sessions retrieved successfully",
 *   "data": [ session objects ]
 * }
 */
router.get('/user/:userId', requireAuth, (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUser = req.user;
    const { status } = req.query;

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
        message: 'You can only view your own sessions',
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

    let userSessions = getUserSessions(userId);

    // Apply status filter if provided
    if (status) {
      const validStatuses = ['in-progress', 'completed', 'abandoned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }
      userSessions = userSessions.filter(s => s.status === status);
    }

    res.status(200).json({
      success: true,
      message: 'User sessions retrieved successfully',
      data: userSessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user sessions',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/sessions/stats/:userId
 * ========================================
 * 
 * Get user session statistics (Protected)
 * Returns aggregated statistics about user's sessions
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Session statistics retrieved successfully",
 *   "data": {
 *     "totalSessions": 42,
 *     "completedSessions": 40,
 *     "totalDuration": 2520,
 *     "averageDuration": 63
 *   }
 * }
 */
router.get('/stats/:userId', requireAuth, (req, res) => {
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
        message: 'You can only view your own statistics',
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

    const stats = getUserSessionStats(userId);

    res.status(200).json({
      success: true,
      message: 'Session statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving session statistics',
      error: error.message,
    });
  }
});

export default router;

/**
 * ========================================
 * Progress Analytics Routes
 * ========================================
 * 
 * Handles progress and analytics endpoints:
 * - GET /api/progress/workouts - Get workout statistics
 * - GET /api/progress/exercises - Get exercise statistics
 * - GET /api/progress/overview - Get progress overview
 * 
 * All routes are protected (require JWT authentication)
 * 
 * @module routes/progressRoutes
 */

import express from 'express';
import {
  getWorkoutStats,
  getExerciseStats,
  getProgressOverview
} from '../db/progress.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * GET /api/progress/workouts
 * ========================================
 * 
 * Get workout statistics for a date range
 * 
 * Query Parameters:
 * - startDate: Start date (YYYY-MM-DD)
 * - endDate: End date (YYYY-MM-DD)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "total": 25,
 *     "byWeek": [...],
 *     "byMonth": [...],
 *     "byDay": [...]
 *   }
 * }
 */
router.get('/workouts', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Dates must be in YYYY-MM-DD format'
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const stats = await getWorkoutStats(userId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting workout stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving workout statistics',
      error: error.message
    });
  }
});

/**
 * ========================================
 * GET /api/progress/exercises
 * ========================================
 * 
 * Get exercise statistics for a date range
 * 
 * Query Parameters:
 * - startDate: Start date (YYYY-MM-DD)
 * - endDate: End date (YYYY-MM-DD)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "total": 150,
 *     "byDay": [...],
 *     "byWeek": [...]
 *   }
 * }
 */
router.get('/exercises', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Dates must be in YYYY-MM-DD format'
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const stats = await getExerciseStats(userId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting exercise stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving exercise statistics',
      error: error.message
    });
  }
});

/**
 * ========================================
 * GET /api/progress/overview
 * ========================================
 * 
 * Get comprehensive progress overview
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "allTime": { "workouts": 100, "exercises": 500 },
 *     "thisWeek": { "workouts": 5 },
 *     "thisMonth": { "workouts": 20 }
 *   }
 * }
 */
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const overview = await getProgressOverview(userId);

    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error getting progress overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving progress overview',
      error: error.message
    });
  }
});

export default router;

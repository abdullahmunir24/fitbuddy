/**
 * ========================================
 * Cardio Routes
 * ========================================
 * 
 * Handles cardio session management:
 * - POST /api/cardio - Log new cardio session
 * - GET /api/cardio - Get all cardio sessions
 * - GET /api/cardio/:id - Get specific cardio session
 * - PUT /api/cardio/:id - Update cardio session
 * - DELETE /api/cardio/:id - Delete cardio session
 * - GET /api/cardio/stats - Get cardio statistics
 * 
 * All routes are protected (require JWT authentication)
 * 
 * @module routes/cardioRoutes
 */

import express from 'express';
import { query, getClient } from '../config/db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * POST /api/cardio
 * Log a new cardio session
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      activityType,
      sessionDate,
      durationMinutes,
      distanceKm,
      intensityLevel,
      location,
      notes,
    } = req.body;

    // Validation
    if (!activityType || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Activity type and duration are required',
      });
    }

    // Calculate pace if distance is provided
    let paceMinPerKm = null;
    if (distanceKm && distanceKm > 0) {
      paceMinPerKm = durationMinutes / distanceKm;
    }

    // Calculate average speed if distance is provided
    let averageSpeedKmh = null;
    if (distanceKm && durationMinutes > 0) {
      averageSpeedKmh = (distanceKm / durationMinutes) * 60;
    }

    // Auto-calculate calories based on modern formulas
    // MET (Metabolic Equivalent of Task) values for different activities and intensities
    const MET_VALUES = {
      // Running MET values based on speed
      running: {
        low: 6.0,      // ~8 km/h (5 mph) - jogging
        moderate: 9.8, // ~10 km/h (6.2 mph) - moderate running
        high: 11.5,    // ~12 km/h (7.5 mph) - fast running
        very_high: 14.5 // ~14+ km/h (8.7+ mph) - very fast running
      },
      cycling: {
        low: 4.0,      // leisurely cycling
        moderate: 8.0, // moderate effort
        high: 10.0,    // vigorous effort
        very_high: 12.0 // racing/very vigorous
      },
      swimming: {
        low: 6.0,      // leisurely
        moderate: 8.0, // moderate effort
        high: 10.0,    // vigorous effort
        very_high: 11.0 // competitive
      },
      walking: {
        low: 3.0,      // casual walking
        moderate: 3.5, // moderate pace
        high: 4.5,     // brisk walking
        very_high: 5.0 // very brisk/power walking
      },
      rowing: {
        low: 4.8,      // light effort
        moderate: 7.0, // moderate effort
        high: 8.5,     // vigorous effort
        very_high: 12.0 // competitive
      },
      elliptical: {
        low: 5.0,      // light effort
        moderate: 7.0, // moderate effort
        high: 8.0,     // vigorous effort
        very_high: 9.5 // very vigorous
      },
      stair_climbing: {
        low: 4.0,      // slow pace
        moderate: 8.0, // moderate pace
        high: 9.0,     // fast pace
        very_high: 12.0 // very fast/intense
      },
      hiking: {
        low: 4.5,      // flat terrain
        moderate: 6.0, // moderate terrain
        high: 7.5,     // steep terrain
        very_high: 9.0 // very steep/heavy pack
      }
    };

    // For running, adjust MET based on actual speed if available
    let metValue = MET_VALUES[activityType]?.[intensityLevel || 'moderate'] || 8.0;
    
    if (activityType === 'running' && averageSpeedKmh) {
      // More precise MET calculation for running based on speed
      if (averageSpeedKmh < 8) metValue = 6.0;
      else if (averageSpeedKmh < 9) metValue = 8.3;
      else if (averageSpeedKmh < 10) metValue = 9.8;
      else if (averageSpeedKmh < 11) metValue = 10.5;
      else if (averageSpeedKmh < 12) metValue = 11.5;
      else if (averageSpeedKmh < 13) metValue = 12.5;
      else if (averageSpeedKmh < 14) metValue = 13.5;
      else metValue = 14.5;
    }

    // Calorie calculation: Calories = MET × Weight(kg) × Duration(hours)
    // Using average adult weight of 70kg (can be personalized later)
    const assumedWeightKg = 70;
    const durationHours = durationMinutes / 60;
    const caloriesBurned = Math.round(metValue * assumedWeightKg * durationHours);

    const result = await query(
      `INSERT INTO cardio_sessions 
       (user_id, activity_type, session_date, duration_minutes, distance_km, 
        calories_burned, pace_min_per_km, average_speed_kmh, intensity_level, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        activityType,
        sessionDate || new Date().toISOString().split('T')[0],
        durationMinutes,
        distanceKm || null,
        caloriesBurned,
        paceMinPerKm,
        averageSpeedKmh,
        intensityLevel || 'moderate',
        location || null,
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Cardio session logged successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error logging cardio session:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging cardio session',
      error: error.message,
    });
  }
});

/**
 * GET /api/cardio
 * Get all cardio sessions for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, activityType, startDate, endDate } = req.query;

    let queryStr = `
      SELECT * FROM cardio_sessions 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (activityType) {
      queryStr += ` AND activity_type = $${paramIndex}`;
      params.push(activityType);
      paramIndex++;
    }

    if (startDate) {
      queryStr += ` AND session_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryStr += ` AND session_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryStr += ` ORDER BY session_date DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryStr, params);

    res.status(200).json({
      success: true,
      message: 'Cardio sessions retrieved successfully',
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error retrieving cardio sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cardio sessions',
      error: error.message,
    });
  }
});

/**
 * GET /api/cardio/stats
 * Get cardio statistics for the authenticated user
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query; // week, month, year, all

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND session_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND session_date >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (period === 'year') {
      dateFilter = "AND session_date >= CURRENT_DATE - INTERVAL '365 days'";
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_duration,
        SUM(distance_km) as total_distance,
        SUM(calories_burned) as total_calories,
        AVG(distance_km) as avg_distance,
        AVG(duration_minutes) as avg_duration,
        AVG(pace_min_per_km) as avg_pace,
        activity_type,
        COUNT(*) FILTER (WHERE intensity_level = 'high' OR intensity_level = 'very_high') as high_intensity_count
      FROM cardio_sessions
      WHERE user_id = $1 ${dateFilter}
      GROUP BY activity_type
    `;

    const overallQuery = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_duration,
        SUM(distance_km) as total_distance,
        SUM(calories_burned) as total_calories,
        AVG(distance_km) as avg_distance,
        AVG(duration_minutes) as avg_duration
      FROM cardio_sessions
      WHERE user_id = $1 ${dateFilter}
    `;

    const [statsResult, overallResult] = await Promise.all([
      query(statsQuery, [userId]),
      query(overallQuery, [userId]),
    ]);

    res.status(200).json({
      success: true,
      message: 'Cardio statistics retrieved successfully',
      data: {
        overall: overallResult.rows[0],
        byActivity: statsResult.rows,
        period: period,
      },
    });
  } catch (error) {
    console.error('Error retrieving cardio stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cardio statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/cardio/:id
 * Get a specific cardio session
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const result = await query(
      'SELECT * FROM cardio_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cardio session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cardio session retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error retrieving cardio session:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cardio session',
      error: error.message,
    });
  }
});

/**
 * PUT /api/cardio/:id
 * Update a cardio session
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const {
      activityType,
      sessionDate,
      durationMinutes,
      distanceKm,
      intensityLevel,
      location,
      notes,
    } = req.body;

    // Check if session exists and belongs to user
    const checkResult = await query(
      'SELECT id FROM cardio_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cardio session not found',
      });
    }

    // Calculate pace and speed
    let paceMinPerKm = null;
    let averageSpeedKmh = null;
    
    if (distanceKm && distanceKm > 0 && durationMinutes) {
      paceMinPerKm = durationMinutes / distanceKm;
      averageSpeedKmh = (distanceKm / durationMinutes) * 60;
    }

    // Recalculate calories with MET values
    let caloriesBurned = null;
    if (activityType && durationMinutes) {
      const MET_VALUES = {
        running: { low: 6.0, moderate: 9.8, high: 11.5, very_high: 14.5 },
        cycling: { low: 4.0, moderate: 8.0, high: 10.0, very_high: 12.0 },
        swimming: { low: 6.0, moderate: 8.0, high: 10.0, very_high: 11.0 },
        walking: { low: 3.0, moderate: 3.5, high: 4.5, very_high: 5.0 },
        rowing: { low: 4.8, moderate: 7.0, high: 8.5, very_high: 12.0 },
        elliptical: { low: 5.0, moderate: 7.0, high: 8.0, very_high: 9.5 },
        stair_climbing: { low: 4.0, moderate: 8.0, high: 9.0, very_high: 12.0 },
        hiking: { low: 4.5, moderate: 6.0, high: 7.5, very_high: 9.0 }
      };

      let metValue = MET_VALUES[activityType]?.[intensityLevel || 'moderate'] || 8.0;
      
      if (activityType === 'running' && averageSpeedKmh) {
        if (averageSpeedKmh < 8) metValue = 6.0;
        else if (averageSpeedKmh < 9) metValue = 8.3;
        else if (averageSpeedKmh < 10) metValue = 9.8;
        else if (averageSpeedKmh < 11) metValue = 10.5;
        else if (averageSpeedKmh < 12) metValue = 11.5;
        else if (averageSpeedKmh < 13) metValue = 12.5;
        else if (averageSpeedKmh < 14) metValue = 13.5;
        else metValue = 14.5;
      }

      const assumedWeightKg = 70;
      const durationHours = durationMinutes / 60;
      caloriesBurned = Math.round(metValue * assumedWeightKg * durationHours);
    }

    const result = await query(
      `UPDATE cardio_sessions 
       SET activity_type = COALESCE($1, activity_type),
           session_date = COALESCE($2, session_date),
           duration_minutes = COALESCE($3, duration_minutes),
           distance_km = COALESCE($4, distance_km),
           calories_burned = COALESCE($5, calories_burned),
           pace_min_per_km = COALESCE($6, pace_min_per_km),
           average_speed_kmh = COALESCE($7, average_speed_kmh),
           intensity_level = COALESCE($8, intensity_level),
           location = COALESCE($9, location),
           notes = COALESCE($10, notes)
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        activityType,
        sessionDate,
        durationMinutes,
        distanceKm,
        caloriesBurned,
        paceMinPerKm,
        averageSpeedKmh,
        intensityLevel,
        location,
        notes,
        sessionId,
        userId,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Cardio session updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating cardio session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cardio session',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/cardio/:id
 * Delete a cardio session
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const result = await query(
      'DELETE FROM cardio_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cardio session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cardio session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cardio session:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting cardio session',
      error: error.message,
    });
  }
});

export default router;

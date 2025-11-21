/**
 * ========================================
 * User Statistics Module
 * ========================================
 * 
 * Calculates real user statistics from:
 * - Completed workouts
 * - Attended classes
 * - Progress measurements
 * 
 * @module db/stats
 */

import pkg from 'pg';
const { Pool } = pkg;

// Use the same pool from environment
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Get user statistics calculated from real data
 * Includes: total workouts, total classes attended, total duration, calories burned, etc.
 * @param {number} userId - User ID
 * @returns {Object} User statistics object
 */
export async function getUserStats(userId) {
  try {
    // Get workout statistics
    const workoutStats = await pool.query(
      `SELECT 
        COUNT(*) as totalWorkouts,
        SUM(duration_minutes) as totalDurationMinutes,
        SUM(calories_burned) as totalCaloriesBurned,
        AVG(duration_minutes) as averageDurationMinutes,
        MAX(workout_date) as lastWorkoutDate
      FROM user_workouts
      WHERE user_id = $1`,
      [userId]
    );

    // Get class attendance statistics
    const classStats = await pool.query(
      `SELECT 
        COUNT(*) as totalClassesAttended,
        SUM(fc.duration_minutes) as classesTotalDurationMinutes
      FROM class_bookings cb
      JOIN class_schedules cs ON cb.schedule_id = cs.id
      JOIN fitness_classes fc ON cs.class_id = fc.id
      WHERE cb.user_id = $1 AND cb.booking_status = 'attended'`,
      [userId]
    );

    // Get progress data (latest measurements)
    const progressStats = await pool.query(
      `SELECT 
        weight_kg,
        body_fat_percentage,
        muscle_mass_kg,
        measurement_date
      FROM user_progress
      WHERE user_id = $1
      ORDER BY measurement_date DESC
      LIMIT 2`,
      [userId]
    );

    // Calculate derived stats
    const workouts = workoutStats.rows[0] || {};
    const classes = classStats.rows[0] || {};
    const progress = progressStats.rows || [];

    const totalWorkouts = parseInt(workouts.totalworkouts) || 0;
    const totalClassesAttended = parseInt(classes.totalclassesattended) || 0;
    const totalDurationMinutes = (parseInt(workouts.totaldurationminutes) || 0) + 
                                 (parseInt(classes.classestotaldurationminutes) || 0);
    const caloriesBurned = parseInt(workouts.totalcaloriesburned) || 0;
    const averageDurationMinutes = Math.round(
      (parseInt(workouts.averagedurationminutes) || 0) + 
      (parseInt(classes.classestotaldurationminutes) || classes.totalclassesattended || 0)
    ) || 0;

    // Calculate progress metrics (weight change, body fat change)
    let weightChange = 0;
    let bodyFatChange = 0;
    let muscleGainChange = 0;

    if (progress.length >= 2) {
      const current = progress[0];
      const previous = progress[1];
      
      if (current.weight_kg && previous.weight_kg) {
        weightChange = parseFloat(current.weight_kg) - parseFloat(previous.weight_kg);
      }
      if (current.body_fat_percentage && previous.body_fat_percentage) {
        bodyFatChange = parseFloat(current.body_fat_percentage) - parseFloat(previous.body_fat_percentage);
      }
      if (current.muscle_mass_kg && previous.muscle_mass_kg) {
        muscleGainChange = parseFloat(current.muscle_mass_kg) - parseFloat(previous.muscle_mass_kg);
      }
    } else if (progress.length === 1) {
      // Only one progress entry, show absolute values
      const current = progress[0];
      weightChange = parseFloat(current.weight_kg) || 0;
      bodyFatChange = parseFloat(current.body_fat_percentage) || 0;
      muscleGainChange = parseFloat(current.muscle_mass_kg) || 0;
    }

    return {
      totalSessions: totalWorkouts + totalClassesAttended,
      totalWorkouts,
      totalClassesAttended,
      totalDuration: totalDurationMinutes,
      averageDuration: averageDurationMinutes,
      caloriesBurned,
      weightChange: weightChange.toFixed(2),
      bodyFatChange: bodyFatChange.toFixed(2),
      muscleGainChange: muscleGainChange.toFixed(2),
      currentWeight: progress.length > 0 ? progress[0].weight_kg : null,
      currentBodyFat: progress.length > 0 ? progress[0].body_fat_percentage : null,
      lastWorkoutDate: workouts.lastworkoutdate,
      completedSessions: totalWorkouts, // Completed workouts
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      totalSessions: 0,
      totalWorkouts: 0,
      totalClassesAttended: 0,
      totalDuration: 0,
      averageDuration: 0,
      caloriesBurned: 0,
      weightChange: 0,
      bodyFatChange: 0,
      muscleGainChange: 0,
      completedSessions: 0,
    };
  }
}

/**
 * Get user progress history
 * @param {number} userId - User ID
 * @param {number} limit - Number of entries to return (default 10)
 * @returns {Array} Progress entries
 */
export async function getUserProgressHistory(userId, limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        measurement_date,
        weight_kg,
        body_fat_percentage,
        muscle_mass_kg,
        chest_cm,
        waist_cm,
        hips_cm,
        biceps_cm,
        thighs_cm,
        notes
      FROM user_progress
      WHERE user_id = $1
      ORDER BY measurement_date DESC
      LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching user progress history:', error);
    return [];
  }
}

/**
 * Create a new progress entry based on user's current stats
 * @param {number} userId - User ID
 * @param {Object} progressData - Progress measurement data
 * @returns {Object} Created progress entry
 */
export async function createProgressEntry(userId, progressData) {
  try {
    const result = await pool.query(
      `INSERT INTO user_progress 
      (user_id, measurement_date, weight_kg, body_fat_percentage, muscle_mass_kg,
       chest_cm, waist_cm, hips_cm, biceps_cm, thighs_cm, notes, progress_photo_url)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        progressData.weight_kg || null,
        progressData.body_fat_percentage || null,
        progressData.muscle_mass_kg || null,
        progressData.chest_cm || null,
        progressData.waist_cm || null,
        progressData.hips_cm || null,
        progressData.biceps_cm || null,
        progressData.thighs_cm || null,
        progressData.notes || '',
        progressData.progress_photo_url || null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating progress entry:', error);
    throw error;
  }
}

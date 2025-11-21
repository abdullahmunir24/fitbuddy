/**
 * ========================================
 * Progress Analytics Database Functions
 * ========================================
 * 
 * Database operations for workout and exercise analytics
 * Provides aggregated statistics for progress tracking
 * 
 * @module db/progress
 */

import { query } from '../config/db.js';

/**
 * Get workout count statistics for different time ranges
 * 
 * @param {number} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Workout statistics
 */
export const getWorkoutStats = async (userId, startDate, endDate) => {
  try {
    // Get total workouts in date range
    const totalResult = await query(
      `SELECT COUNT(*) as total
       FROM user_workouts
       WHERE user_id = $1 
       AND workout_date >= $2 
       AND workout_date <= $3`,
      [userId, startDate, endDate]
    );

    // Get workouts grouped by week
    const weeklyResult = await query(
      `SELECT 
         DATE_TRUNC('week', workout_date) as week_start,
         COUNT(*) as count
       FROM user_workouts
       WHERE user_id = $1 
       AND workout_date >= $2 
       AND workout_date <= $3
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [userId, startDate, endDate]
    );

    // Get workouts grouped by month
    const monthlyResult = await query(
      `SELECT 
         DATE_TRUNC('month', workout_date) as month_start,
         COUNT(*) as count
       FROM user_workouts
       WHERE user_id = $1 
       AND workout_date >= $2 
       AND workout_date <= $3
       GROUP BY month_start
       ORDER BY month_start ASC`,
      [userId, startDate, endDate]
    );

    // Get workouts grouped by day
    const dailyResult = await query(
      `SELECT 
         workout_date::date as date,
         COUNT(*) as count
       FROM user_workouts
       WHERE user_id = $1 
       AND workout_date >= $2 
       AND workout_date <= $3
       GROUP BY workout_date::date
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    return {
      total: parseInt(totalResult.rows[0]?.total || 0),
      byWeek: weeklyResult.rows.map(row => ({
        week: row.week_start,
        count: parseInt(row.count)
      })),
      byMonth: monthlyResult.rows.map(row => ({
        month: row.month_start,
        count: parseInt(row.count)
      })),
      byDay: dailyResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    };
  } catch (error) {
    console.error('Error getting workout stats:', error);
    throw error;
  }
};

/**
 * Get exercise count statistics for different time ranges
 * 
 * @param {number} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Exercise statistics
 */
export const getExerciseStats = async (userId, startDate, endDate) => {
  try {
    // Get total exercises in date range
    const totalResult = await query(
      `SELECT COUNT(we.*) as total
       FROM workout_exercises we
       JOIN user_workouts uw ON we.workout_id = uw.id
       WHERE uw.user_id = $1 
       AND uw.workout_date >= $2 
       AND uw.workout_date <= $3`,
      [userId, startDate, endDate]
    );

    // Get exercises grouped by day
    const dailyResult = await query(
      `SELECT 
         uw.workout_date::date as date,
         COUNT(we.*) as count
       FROM workout_exercises we
       JOIN user_workouts uw ON we.workout_id = uw.id
       WHERE uw.user_id = $1 
       AND uw.workout_date >= $2 
       AND uw.workout_date <= $3
       GROUP BY uw.workout_date::date
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    // Get exercises grouped by week
    const weeklyResult = await query(
      `SELECT 
         DATE_TRUNC('week', uw.workout_date) as week_start,
         COUNT(we.*) as count
       FROM workout_exercises we
       JOIN user_workouts uw ON we.workout_id = uw.id
       WHERE uw.user_id = $1 
       AND uw.workout_date >= $2 
       AND uw.workout_date <= $3
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [userId, startDate, endDate]
    );

    return {
      total: parseInt(totalResult.rows[0]?.total || 0),
      byDay: dailyResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      byWeek: weeklyResult.rows.map(row => ({
        week: row.week_start,
        count: parseInt(row.count)
      }))
    };
  } catch (error) {
    console.error('Error getting exercise stats:', error);
    throw error;
  }
};

/**
 * Get comprehensive progress overview
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Progress overview
 */
export const getProgressOverview = async (userId) => {
  try {
    // Get all-time stats
    const allTimeWorkouts = await query(
      `SELECT COUNT(*) as total FROM user_workouts WHERE user_id = $1`,
      [userId]
    );

    const allTimeExercises = await query(
      `SELECT COUNT(we.*) as total
       FROM workout_exercises we
       JOIN user_workouts uw ON we.workout_id = uw.id
       WHERE uw.user_id = $1`,
      [userId]
    );

    // Get this week stats (Monday to Sunday)
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = await query(
      `SELECT COUNT(*) as total 
       FROM user_workouts 
       WHERE user_id = $1 AND workout_date >= $2`,
      [userId, thisWeekStart.toISOString().split('T')[0]]
    );

    // Get this month stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthWorkouts = await query(
      `SELECT COUNT(*) as total 
       FROM user_workouts 
       WHERE user_id = $1 AND workout_date >= $2`,
      [userId, thisMonthStart.toISOString().split('T')[0]]
    );

    return {
      allTime: {
        workouts: parseInt(allTimeWorkouts.rows[0]?.total || 0),
        exercises: parseInt(allTimeExercises.rows[0]?.total || 0)
      },
      thisWeek: {
        workouts: parseInt(thisWeekWorkouts.rows[0]?.total || 0)
      },
      thisMonth: {
        workouts: parseInt(thisMonthWorkouts.rows[0]?.total || 0)
      }
    };
  } catch (error) {
    console.error('Error getting progress overview:', error);
    throw error;
  }
};

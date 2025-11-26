/**
 * ========================================
 * Workout Database Functions
 * ========================================
 * 
 * Database operations for workout management using PostgreSQL
 * Handles user workouts and their exercises
 * 
 * @module db/workouts
 */

import { query, getClient } from '../config/db.js';

/**
 * Create a new workout for a user
 * 
 * @param {number} userId - User ID
 * @param {Object} workoutData - Workout data
 * @param {string} workoutData.name - Workout name
 * @param {string} workoutData.date - Workout date (YYYY-MM-DD)
 * @param {boolean} workoutData.completed - Whether workout is completed
 * @param {Array} workoutData.exercises - Array of exercises
 * @returns {Promise<Object>} Created workout object with exercises
 */
export const createWorkout = async (userId, workoutData) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Insert workout
    const workoutResult = await client.query(
      `INSERT INTO user_workouts (user_id, workout_name, workout_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        workoutData.name,
        workoutData.date,
        workoutData.completed ? new Date() : new Date(), // start_time
        workoutData.completed ? new Date() : null, // end_time (null if not completed)
      ]
    );

    const workout = workoutResult.rows[0];

    // Insert exercises if provided
    const exercises = [];
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      for (let i = 0; i < workoutData.exercises.length; i++) {
        const exercise = workoutData.exercises[i];
        const exerciseResult = await client.query(
          `INSERT INTO workout_exercises 
           (workout_id, exercise_id, order_index, sets, reps, weight_kg, notes, completed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            workout.id,
            null, // exercise_id (not using master exercises table for Option 1)
            i + 1, // order_index
            exercise.sets || 0,
            exercise.reps || 0,
            null, // weight_kg (storing weight as string in notes instead)
            `${exercise.name}|||${exercise.weight || 'Body Weight'}`, // Store name and weight in notes
            true, // completed
          ]
        );
        exercises.push({
          id: exerciseResult.rows[0].id,
          name: exercise.name,
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight: exercise.weight || 'Body Weight',
        });
      }
    }

    await client.query('COMMIT');

    // Format date consistently - avoid timezone issues by using the raw date string
    let dateISO;
    if (typeof workout.workout_date === 'string') {
      // Already in YYYY-MM-DD format
      dateISO = workout.workout_date.split('T')[0];
    } else if (workout.workout_date instanceof Date) {
      // Convert to local date string in YYYY-MM-DD format
      const year = workout.workout_date.getFullYear();
      const month = String(workout.workout_date.getMonth() + 1).padStart(2, '0');
      const day = String(workout.workout_date.getDate()).padStart(2, '0');
      dateISO = `${year}-${month}-${day}`;
    } else {
      dateISO = new Date().toISOString().split('T')[0];
    }

    return {
      id: workout.id,
      name: workout.workout_name,
      date: new Date(dateISO + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateISO: dateISO, // Store ISO format for updates
      completed: workout.end_time !== null,
      exercises: exercises,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating workout:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get all workouts for a specific user
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of workout objects with exercises
 */
export const getUserWorkouts = async (userId) => {
  try {
    // Get all workouts for the user
    const workoutsResult = await query(
      `SELECT * FROM user_workouts 
       WHERE user_id = $1 
       ORDER BY workout_date DESC, created_at DESC`,
      [userId]
    );

    const workouts = workoutsResult.rows;

    // Get exercises for each workout
    const workoutsWithExercises = await Promise.all(
      workouts.map(async (workout) => {
        const exercisesResult = await query(
          `SELECT * FROM workout_exercises 
           WHERE workout_id = $1 
           ORDER BY order_index ASC`,
          [workout.id]
        );

        // Parse exercises from notes field (format: "name|||weight")
        const exercises = exercisesResult.rows.map((ex) => {
          const [name, weight] = ex.notes ? ex.notes.split('|||') : ['Unknown', 'Body Weight'];
          return {
            id: ex.id,
            name: name || 'Unknown',
            sets: ex.sets || 0,
            reps: ex.reps || 0,
            weight: weight || 'Body Weight',
          };
        });

        // Format date consistently - avoid timezone issues by using the raw date string
        let dateISO;
        if (typeof workout.workout_date === 'string') {
          // Already in YYYY-MM-DD format
          dateISO = workout.workout_date.split('T')[0];
        } else if (workout.workout_date instanceof Date) {
          // Convert to local date string in YYYY-MM-DD format
          const year = workout.workout_date.getFullYear();
          const month = String(workout.workout_date.getMonth() + 1).padStart(2, '0');
          const day = String(workout.workout_date.getDate()).padStart(2, '0');
          dateISO = `${year}-${month}-${day}`;
        } else {
          dateISO = new Date().toISOString().split('T')[0];
        }

        return {
          id: workout.id,
          name: workout.workout_name,
          date: new Date(dateISO + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          dateISO: dateISO, // Store ISO format for updates
          completed: workout.end_time !== null,
          exercises: exercises,
        };
      })
    );

    return workoutsWithExercises;
  } catch (error) {
    console.error('Error getting user workouts:', error);
    throw error;
  }
};

/**
 * Get a specific workout by ID
 * 
 * @param {number} workoutId - Workout ID
 * @param {number} userId - User ID (for authorization check)
 * @returns {Promise<Object|null>} Workout object or null if not found
 */
export const getWorkoutById = async (workoutId, userId) => {
  try {
    const workoutResult = await query(
      `SELECT * FROM user_workouts 
       WHERE id = $1 AND user_id = $2`,
      [workoutId, userId]
    );

    if (workoutResult.rows.length === 0) {
      return null;
    }

    const workout = workoutResult.rows[0];

    // Get exercises for this workout
    const exercisesResult = await query(
      `SELECT * FROM workout_exercises 
       WHERE workout_id = $1 
       ORDER BY order_index ASC`,
      [workout.id]
    );

    // Parse exercises from notes field
    const exercises = exercisesResult.rows.map((ex) => {
      const [name, weight] = ex.notes ? ex.notes.split('|||') : ['Unknown', 'Body Weight'];
      return {
        id: ex.id,
        name: name || 'Unknown',
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        weight: weight || 'Body Weight',
      };
    });

    // Format date consistently - avoid timezone issues by using the raw date string
    let dateISO;
    if (typeof workout.workout_date === 'string') {
      // Already in YYYY-MM-DD format
      dateISO = workout.workout_date.split('T')[0];
    } else if (workout.workout_date instanceof Date) {
      // Convert to local date string in YYYY-MM-DD format
      const year = workout.workout_date.getFullYear();
      const month = String(workout.workout_date.getMonth() + 1).padStart(2, '0');
      const day = String(workout.workout_date.getDate()).padStart(2, '0');
      dateISO = `${year}-${month}-${day}`;
    } else {
      dateISO = new Date().toISOString().split('T')[0];
    }

    return {
      id: workout.id,
      name: workout.workout_name,
      date: new Date(dateISO + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateISO: dateISO, // Store ISO format for updates
      completed: workout.end_time !== null,
      exercises: exercises,
    };
  } catch (error) {
    console.error('Error getting workout by ID:', error);
    throw error;
  }
};

/**
 * Update a workout
 * 
 * @param {number} workoutId - Workout ID
 * @param {number} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated workout object or null if not found
 */
export const updateWorkout = async (workoutId, userId, updates) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Check if workout exists and belongs to user
    const workoutCheck = await client.query(
      `SELECT * FROM user_workouts WHERE id = $1 AND user_id = $2`,
      [workoutId, userId]
    );

    if (workoutCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const workout = workoutCheck.rows[0];

    // Update workout fields
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      updateFields.push(`workout_name = $${paramCount++}`);
      updateValues.push(updates.name);
    }

    if (updates.date !== undefined) {
      updateFields.push(`workout_date = $${paramCount++}`);
      updateValues.push(updates.date);
    }

    if (updates.completed !== undefined) {
      if (updates.completed && !workout.end_time) {
        // Mark as completed - set end_time
        updateFields.push(`end_time = $${paramCount++}`);
        updateValues.push(new Date());
      } else if (!updates.completed && workout.end_time) {
        // Mark as not completed - clear end_time
        updateFields.push(`end_time = $${paramCount++}`);
        updateValues.push(null);
      }
    }

    if (updateFields.length > 0) {
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(workoutId, userId);

      await client.query(
        `UPDATE user_workouts 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramCount++} AND user_id = $${paramCount++}`,
        [...updateValues]
      );
    }

    // Update exercises if provided
    if (updates.exercises !== undefined) {
      // Delete existing exercises
      await client.query(
        `DELETE FROM workout_exercises WHERE workout_id = $1`,
        [workoutId]
      );

      // Insert new exercises
      for (let i = 0; i < updates.exercises.length; i++) {
        const exercise = updates.exercises[i];
        await client.query(
          `INSERT INTO workout_exercises 
           (workout_id, exercise_id, order_index, sets, reps, weight_kg, notes, completed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            workoutId,
            null,
            i + 1,
            exercise.sets || 0,
            exercise.reps || 0,
            null,
            `${exercise.name}|||${exercise.weight || 'Body Weight'}`,
            true,
          ]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch and return updated workout
    return await getWorkoutById(workoutId, userId);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating workout:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Add an exercise to an existing workout
 * 
 * @param {number} workoutId - Workout ID
 * @param {number} userId - User ID (for authorization)
 * @param {Object} exerciseData - Exercise data
 * @returns {Promise<Object>} Created exercise object
 */
export const addExerciseToWorkout = async (workoutId, userId, exerciseData) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify workout belongs to user
    const workoutCheck = await client.query(
      `SELECT * FROM user_workouts WHERE id = $1 AND user_id = $2`,
      [workoutId, userId]
    );

    if (workoutCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('Workout not found or unauthorized');
    }

    // Get current max order_index
    const maxOrderResult = await client.query(
      `SELECT MAX(order_index) as max_order FROM workout_exercises WHERE workout_id = $1`,
      [workoutId]
    );
    const nextOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1;

    // Insert exercise
    const exerciseResult = await client.query(
      `INSERT INTO workout_exercises 
       (workout_id, exercise_id, order_index, sets, reps, weight_kg, notes, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        workoutId,
        null,
        nextOrder,
        exerciseData.sets || 0,
        exerciseData.reps || 0,
        null,
        `${exerciseData.name}|||${exerciseData.weight || 'Body Weight'}`,
        true,
      ]
    );

    await client.query('COMMIT');

    const ex = exerciseResult.rows[0];
    const [name, weight] = ex.notes.split('|||');

    return {
      id: ex.id,
      name: name,
      sets: ex.sets || 0,
      reps: ex.reps || 0,
      weight: weight || 'Body Weight',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding exercise to workout:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete a workout
 * 
 * @param {number} workoutId - Workout ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteWorkout = async (workoutId, userId) => {
  try {
    const result = await query(
      `DELETE FROM user_workouts 
       WHERE id = $1 AND user_id = $2`,
      [workoutId, userId]
    );

    // Note: workout_exercises will be automatically deleted due to CASCADE
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};


/**
 * ========================================
 * Seed Workout Data Script
 * ========================================
 * 
 * Creates realistic workout and exercise data for member@gmail.com
 * Covers 2-3 months of training history with diverse exercises
 * 
 * Usage:
 * npm run seed-workouts
 * 
 * OR
 * 
 * node src/seed-workouts.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitbuddy_db',
  user: process.env.DB_USER || 'fitbuddy_user',
  password: process.env.DB_PASSWORD || 'fitbuddy_password',
});

// Exercise library with realistic data
const EXERCISES = {
  chest: [
    { name: 'Bench Press', avgSets: 4, avgReps: 8, weightRange: [135, 225] },
    { name: 'Incline Dumbbell Press', avgSets: 3, avgReps: 10, weightRange: [60, 90] },
    { name: 'Cable Flyes', avgSets: 3, avgReps: 12, weightRange: [30, 50] },
    { name: 'Push-ups', avgSets: 3, avgReps: 15, weightRange: [0, 0], isBodyweight: true },
    { name: 'Dumbbell Flyes', avgSets: 3, avgReps: 12, weightRange: [25, 45] },
  ],
  back: [
    { name: 'Deadlift', avgSets: 4, avgReps: 6, weightRange: [185, 315] },
    { name: 'Pull-ups', avgSets: 3, avgReps: 10, weightRange: [0, 0], isBodyweight: true },
    { name: 'Barbell Rows', avgSets: 4, avgReps: 8, weightRange: [135, 185] },
    { name: 'Lat Pulldown', avgSets: 3, avgReps: 10, weightRange: [120, 160] },
    { name: 'Cable Rows', avgSets: 3, avgReps: 12, weightRange: [100, 140] },
    { name: 'Face Pulls', avgSets: 3, avgReps: 15, weightRange: [30, 50] },
  ],
  legs: [
    { name: 'Squat', avgSets: 4, avgReps: 8, weightRange: [185, 275] },
    { name: 'Leg Press', avgSets: 3, avgReps: 12, weightRange: [270, 360] },
    { name: 'Romanian Deadlift', avgSets: 3, avgReps: 10, weightRange: [135, 205] },
    { name: 'Leg Curls', avgSets: 3, avgReps: 12, weightRange: [70, 100] },
    { name: 'Leg Extensions', avgSets: 3, avgReps: 12, weightRange: [90, 130] },
    { name: 'Lunges', avgSets: 3, avgReps: 10, weightRange: [40, 60] },
    { name: 'Calf Raises', avgSets: 4, avgReps: 15, weightRange: [90, 130] },
  ],
  shoulders: [
    { name: 'Overhead Press', avgSets: 4, avgReps: 8, weightRange: [95, 135] },
    { name: 'Dumbbell Lateral Raises', avgSets: 3, avgReps: 12, weightRange: [20, 35] },
    { name: 'Front Raises', avgSets: 3, avgReps: 12, weightRange: [20, 30] },
    { name: 'Rear Delt Flyes', avgSets: 3, avgReps: 12, weightRange: [15, 25] },
    { name: 'Arnold Press', avgSets: 3, avgReps: 10, weightRange: [40, 60] },
  ],
  arms: [
    { name: 'Barbell Curls', avgSets: 3, avgReps: 10, weightRange: [60, 95] },
    { name: 'Hammer Curls', avgSets: 3, avgReps: 12, weightRange: [30, 45] },
    { name: 'Tricep Dips', avgSets: 3, avgReps: 12, weightRange: [0, 0], isBodyweight: true },
    { name: 'Skull Crushers', avgSets: 3, avgReps: 10, weightRange: [50, 75] },
    { name: 'Cable Curls', avgSets: 3, avgReps: 12, weightRange: [40, 60] },
    { name: 'Overhead Tricep Extension', avgSets: 3, avgReps: 12, weightRange: [40, 60] },
  ],
  cardio: [
    { name: 'Treadmill Running', avgSets: 1, avgReps: 20, weightRange: [0, 0], isCardio: true, unit: 'minutes' },
    { name: 'Cycling', avgSets: 1, avgReps: 30, weightRange: [0, 0], isCardio: true, unit: 'minutes' },
    { name: 'Rowing Machine', avgSets: 1, avgReps: 15, weightRange: [0, 0], isCardio: true, unit: 'minutes' },
    { name: 'Stair Climber', avgSets: 1, avgReps: 10, weightRange: [0, 0], isCardio: true, unit: 'minutes' },
    { name: 'Jump Rope', avgSets: 3, avgReps: 100, weightRange: [0, 0], isCardio: true, unit: 'jumps' },
  ],
  core: [
    { name: 'Plank', avgSets: 3, avgReps: 60, weightRange: [0, 0], isBodyweight: true, unit: 'seconds' },
    { name: 'Russian Twists', avgSets: 3, avgReps: 20, weightRange: [25, 45] },
    { name: 'Hanging Leg Raises', avgSets: 3, avgReps: 12, weightRange: [0, 0], isBodyweight: true },
    { name: 'Cable Crunches', avgSets: 3, avgReps: 15, weightRange: [60, 90] },
    { name: 'Mountain Climbers', avgSets: 3, avgReps: 20, weightRange: [0, 0], isBodyweight: true },
  ],
};

// Workout templates
const WORKOUT_TEMPLATES = [
  {
    name: 'Push Day',
    exercises: ['chest', 'shoulders', 'arms'],
    exerciseTypes: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Dumbbell Lateral Raises', 'Skull Crushers', 'Cable Flyes'],
  },
  {
    name: 'Pull Day',
    exercises: ['back', 'arms'],
    exerciseTypes: ['Deadlift', 'Pull-ups', 'Barbell Rows', 'Lat Pulldown', 'Barbell Curls', 'Face Pulls'],
  },
  {
    name: 'Leg Day',
    exercises: ['legs', 'core'],
    exerciseTypes: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises', 'Plank'],
  },
  {
    name: 'Upper Body',
    exercises: ['chest', 'back', 'shoulders'],
    exerciseTypes: ['Bench Press', 'Barbell Rows', 'Overhead Press', 'Lat Pulldown', 'Dumbbell Flyes', 'Cable Rows'],
  },
  {
    name: 'Full Body',
    exercises: ['legs', 'chest', 'back', 'core'],
    exerciseTypes: ['Squat', 'Bench Press', 'Pull-ups', 'Lunges', 'Push-ups', 'Plank'],
  },
  {
    name: 'Cardio & Core',
    exercises: ['cardio', 'core'],
    exerciseTypes: ['Treadmill Running', 'Russian Twists', 'Cycling', 'Mountain Climbers', 'Plank'],
  },
  {
    name: 'Arms & Shoulders',
    exercises: ['arms', 'shoulders'],
    exerciseTypes: ['Barbell Curls', 'Overhead Press', 'Hammer Curls', 'Dumbbell Lateral Raises', 'Tricep Dips', 'Rear Delt Flyes'],
  },
];

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random element from an array
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Add variance to a number (±10%)
 */
function addVariance(value, percentage = 0.1) {
  const variance = value * percentage;
  return Math.round(value + (Math.random() * 2 - 1) * variance);
}

/**
 * Generate a date in the past
 */
function generatePastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Generate realistic workout completion times
 */
function generateWorkoutTimes(workoutDate) {
  // Most workouts happen between 6-9 AM or 5-8 PM
  const isMonringWorkout = Math.random() > 0.4;
  const startHour = isMonringWorkout ? randomInt(6, 9) : randomInt(17, 20);
  const startMinute = randomInt(0, 59);
  
  const startTime = new Date(workoutDate);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  // Workouts last 45-90 minutes
  const durationMinutes = randomInt(45, 90);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  
  return { startTime, endTime, durationMinutes };
}

/**
 * Find exercise by name across all categories
 */
function findExercise(name) {
  for (const category of Object.values(EXERCISES)) {
    const exercise = category.find(ex => ex.name === name);
    if (exercise) return exercise;
  }
  return null;
}

/**
 * Generate a realistic workout with exercises
 */
function generateWorkout(template, workoutDate, progressionFactor = 1) {
  const { startTime, endTime, durationMinutes } = generateWorkoutTimes(workoutDate);
  
  const exercises = template.exerciseTypes.map((exerciseName, index) => {
    const exerciseData = findExercise(exerciseName);
    if (!exerciseData) return null;
    
    // Apply progression (weights increase over time)
    const sets = addVariance(exerciseData.avgSets, 0);
    const reps = addVariance(exerciseData.avgReps, 0.15);
    
    let weight;
    if (exerciseData.isBodyweight || exerciseData.isCardio) {
      weight = 'Body Weight';
    } else {
      const [minWeight, maxWeight] = exerciseData.weightRange;
      const baseWeight = minWeight + (maxWeight - minWeight) * progressionFactor;
      weight = `${addVariance(baseWeight, 0.05)} lbs`;
    }
    
    // For cardio, use reps as duration
    if (exerciseData.isCardio && exerciseData.unit === 'minutes') {
      return {
        name: exerciseName,
        sets: sets,
        reps: reps,
        weight: `${reps} minutes`,
        order: index + 1,
      };
    }
    
    return {
      name: exerciseName,
      sets: sets,
      reps: reps,
      weight: weight,
      order: index + 1,
    };
  }).filter(ex => ex !== null);
  
  return {
    name: template.name,
    date: workoutDate,
    startTime,
    endTime,
    durationMinutes,
    exercises,
  };
}

/**
 * Generate workout schedule for the past 90 days
 */
function generateWorkoutSchedule() {
  const workouts = [];
  const today = new Date();
  
  // Generate workouts for the past 90 days
  // Frequency: 3-5 workouts per week
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const date = generatePastDate(daysAgo);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Skip some random days (rest days)
    // More likely to work out on weekdays
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const workoutProbability = isWeekend ? 0.3 : 0.6;
    
    if (Math.random() > workoutProbability) continue;
    
    // Select a random workout template
    const template = randomChoice(WORKOUT_TEMPLATES);
    
    // Progression factor: gradually increase weights over time (older workouts = lighter weights)
    const progressionFactor = 0.7 + (0.3 * (90 - daysAgo) / 90);
    
    const workout = generateWorkout(template, date, progressionFactor);
    workouts.push(workout);
  }
  
  // Sort workouts by date (oldest first)
  workouts.sort((a, b) => a.date - b.date);
  
  return workouts;
}

/**
 * Insert workouts into database
 */
async function insertWorkouts(userId, workouts) {
  const client = await pool.connect();
  let insertedCount = 0;
  let skippedCount = 0;
  
  try {
    for (const workout of workouts) {
      await client.query('BEGIN');
      
      try {
        // Check if workout already exists for this date
        const checkResult = await client.query(
          'SELECT id FROM user_workouts WHERE user_id = $1 AND workout_date = $2 AND workout_name = $3',
          [userId, workout.date.toISOString().split('T')[0], workout.name]
        );
        
        if (checkResult.rows.length > 0) {
          skippedCount++;
          await client.query('ROLLBACK');
          continue;
        }
        
        // Insert workout
        const workoutResult = await client.query(
          `INSERT INTO user_workouts 
           (user_id, workout_name, workout_date, start_time, end_time, duration_minutes)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            userId,
            workout.name,
            workout.date.toISOString().split('T')[0],
            workout.startTime,
            workout.endTime,
            workout.durationMinutes,
          ]
        );
        
        const workoutId = workoutResult.rows[0].id;
        
        // Insert exercises
        for (const exercise of workout.exercises) {
          await client.query(
            `INSERT INTO workout_exercises 
             (workout_id, exercise_id, order_index, sets, reps, weight_kg, notes, completed)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              workoutId,
              null, // exercise_id (not using master exercises table)
              exercise.order,
              exercise.sets,
              exercise.reps,
              null, // weight_kg (stored in notes)
              `${exercise.name}|||${exercise.weight}`, // Format: "name|||weight"
              true, // completed
            ]
          );
        }
        
        await client.query('COMMIT');
        insertedCount++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error inserting workout ${workout.name} on ${workout.date}:`, error.message);
      }
    }
    
  } finally {
    client.release();
  }
  
  return { insertedCount, skippedCount };
}

/**
 * Main seed function
 */
async function seedWorkouts() {
  try {
    // Seed for member@gmail.com (the default test user)
    const targetEmail = 'member@gmail.com';
    console.log(`🌱 Starting workout seed for ${targetEmail}...\n`);
    
    // Get user ID for member@gmail.com
    const userResult = await pool.query(
      'SELECT id, email, full_name FROM users WHERE email = $1',
      [targetEmail]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`❌ User ${targetEmail} not found. Please ensure the user exists first.`);
      console.error('   The user should be auto-created on server startup.');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.full_name} (${user.email})`);
    console.log(`   User ID: ${user.id}\n`);
    
    // Generate workouts
    console.log('🏋️  Generating realistic workout data...');
    const workouts = generateWorkoutSchedule();
    console.log(`   Generated ${workouts.length} workouts over the past 90 days\n`);
    
    // Insert workouts
    console.log('💾 Inserting workouts into database...');
    const { insertedCount, skippedCount } = await insertWorkouts(user.id, workouts);
    
    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   Inserted: ${insertedCount} workouts`);
    console.log(`   Skipped: ${skippedCount} workouts (already exist)`);
    console.log(`   Total exercises: ${insertedCount * 6} (avg)\n`);
    
    // Show date range
    if (workouts.length > 0) {
      console.log('📅 Workout date range:');
      console.log(`   First workout: ${workouts[0].date.toLocaleDateString()}`);
      console.log(`   Last workout: ${workouts[workouts.length - 1].date.toLocaleDateString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding workouts:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedWorkouts()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });

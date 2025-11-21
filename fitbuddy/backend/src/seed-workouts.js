import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seedWorkouts() {
  const client = await pool.connect();

  try {
    console.log('🏋️ Starting workout seeding...');

    // Get member user
    const membersResult = await client.query(
      "SELECT id FROM users WHERE role = 'member' LIMIT 1"
    );

    if (membersResult.rows.length === 0) {
      console.log('No member found. Please seed users first.');
      return;
    }

    const memberId = membersResult.rows[0].id;
    console.log(`Found member user ID: ${memberId}`);

    // Get available exercises
    const exercisesResult = await client.query(
      'SELECT id, name FROM exercises LIMIT 5'
    );

    if (exercisesResult.rows.length === 0) {
      console.log('No exercises found. Please seed exercises first.');
      return;
    }

    const exercises = exercisesResult.rows;
    console.log(`Found ${exercises.length} exercises`);

    // Clear existing workouts for clean seed
    await client.query('DELETE FROM user_workouts WHERE user_id = $1', [memberId]);

    // Sample workout names
    const workoutTypes = [
      'Upper Body Strength',
      'Lower Body Burn',
      'Full Body HIIT',
      'Cardio Day',
      'Core & Abs',
      'Upper Body Strength',
      'Lower Body Burn',
    ];

    // Create workouts for the last 7 days
    let workoutCount = 0;
    for (let i = 0; i < 7; i++) {
      const workoutDate = new Date();
      workoutDate.setDate(workoutDate.getDate() - i);
      const dateStr = workoutDate.toISOString().split('T')[0];

      const workoutName = workoutTypes[i % workoutTypes.length];
      const durationMinutes = 45 + Math.floor(Math.random() * 30); // 45-75 minutes
      const caloriesBurned = 300 + Math.floor(Math.random() * 300); // 300-600 calories

      // Insert workout
      const workoutResult = await client.query(
        `INSERT INTO user_workouts 
        (user_id, workout_name, workout_date, duration_minutes, calories_burned, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [memberId, workoutName, dateStr, durationMinutes, caloriesBurned, `Great ${workoutName} session!`]
      );

      const workoutId = workoutResult.rows[0].id;
      workoutCount++;

      // Add 3-5 exercises to each workout
      const exerciseCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < exerciseCount; j++) {
        const exercise = exercises[Math.floor(Math.random() * exercises.length)];
        const sets = 3 + Math.floor(Math.random() * 2); // 3-4 sets
        const reps = 8 + Math.floor(Math.random() * 5); // 8-12 reps
        const weight = 20 + Math.floor(Math.random() * 50); // 20-70 kg

        await client.query(
          `INSERT INTO workout_exercises 
          (workout_id, exercise_id, order_index, sets, reps, weight_kg, completed)
          VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [workoutId, exercise.id, j + 1, sets, reps, weight]
        );
      }

      console.log(`  ✓ Created workout: ${workoutName} (${durationMinutes}min, ${caloriesBurned}cal)`);
    }

    console.log(`\n✅ Workout seeding completed! Created ${workoutCount} workouts`);
  } catch (error) {
    console.error('Error seeding workouts:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedWorkouts();

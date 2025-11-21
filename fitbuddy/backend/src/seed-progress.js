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

async function seedProgress() {
  const client = await pool.connect();

  try {
    console.log('📊 Starting progress seeding...');

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

    // Clear existing progress for clean seed
    await client.query('DELETE FROM user_progress WHERE user_id = $1', [memberId]);

    // Create progress entries for the last 8 weeks (bi-weekly measurements)
    let progressCount = 0;
    for (let i = 0; i < 8; i++) {
      const progressDate = new Date();
      progressDate.setDate(progressDate.getDate() - (i * 14)); // Every 2 weeks
      const dateStr = progressDate.toISOString().split('T')[0];

      // Simulate gradual weight loss and muscle gain
      const startWeight = 85; // Starting weight
      const weightLoss = i * 0.5; // 0.5kg per 2 weeks
      const weight = startWeight - weightLoss;
      
      const bodyFat = 25 - (i * 0.3); // Gradual decrease in body fat
      const muscleMass = 45 + (i * 0.2); // Gradual muscle gain

      // Body measurements
      const chest = 105 - (i * 0.5);
      const waist = 95 - (i * 0.8);
      const hips = 100 - (i * 0.3);
      const biceps = 32 + (i * 0.3);
      const thighs = 58 - (i * 0.3);

      await client.query(
        `INSERT INTO user_progress 
        (user_id, measurement_date, weight_kg, body_fat_percentage, muscle_mass_kg, 
         chest_cm, waist_cm, hips_cm, biceps_cm, thighs_cm, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          memberId,
          dateStr,
          weight.toFixed(2),
          bodyFat.toFixed(1),
          muscleMass.toFixed(2),
          chest.toFixed(1),
          waist.toFixed(1),
          hips.toFixed(1),
          biceps.toFixed(1),
          thighs.toFixed(1),
          `Progress check - Week ${i * 2}. Feeling stronger!`
        ]
      );

      progressCount++;
      console.log(`  ✓ Progress entry ${i + 1}: Weight ${weight.toFixed(1)}kg, Body Fat ${bodyFat.toFixed(1)}%`);
    }

    console.log(`\n✅ Progress seeding completed! Created ${progressCount} progress entries`);
  } catch (error) {
    console.error('Error seeding progress:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedProgress();

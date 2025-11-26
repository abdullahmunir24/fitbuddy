import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitbuddy_db',
  user: process.env.DB_USER || 'fitbuddy_user',
  password: process.env.DB_PASSWORD || 'fitbuddy_password',
});

const activityTypes = [
  { type: 'running', weight: 40, avgDistance: 5, distanceVariance: 2 },
  { type: 'cycling', weight: 25, avgDistance: 15, distanceVariance: 5 },
  { type: 'walking', weight: 15, avgDistance: 3, distanceVariance: 1 },
  { type: 'swimming', weight: 10, avgDistance: 1.5, distanceVariance: 0.5 },
  { type: 'rowing', weight: 5, avgDistance: 3, distanceVariance: 1 },
  { type: 'elliptical', weight: 3, avgDistance: 4, distanceVariance: 1 },
  { type: 'hiking', weight: 1, avgDistance: 8, distanceVariance: 3 },
  { type: 'stair_climbing', weight: 1, avgDistance: 0, distanceVariance: 0 },
];

const intensityLevels = ['low', 'moderate', 'high', 'very_high'];

const locations = {
  running: ['Outdoor', 'Treadmill', 'Park', 'Track', 'Trail'],
  cycling: ['Outdoor', 'Indoor Bike', 'Bike Path', 'Road'],
  walking: ['Outdoor', 'Treadmill', 'Park', 'Neighborhood'],
  swimming: ['Pool', 'Lap Pool', 'Open Water'],
  rowing: ['Gym', 'Indoor Rower', 'Water'],
  elliptical: ['Gym', 'Home'],
  hiking: ['Trail', 'Mountain', 'Forest'],
  stair_climbing: ['Gym', 'Stair Machine', 'Building Stairs'],
};

const notes = [
  'Felt great today!',
  'Good pace, pushed harder than usual',
  'Tired but finished strong',
  'Easy recovery session',
  'New personal best!',
  'Legs were a bit heavy',
  'Perfect weather conditions',
  'Challenging but rewarding',
  'Building endurance',
  'Interval training session',
  null, // Some sessions without notes
  null,
];

function getWeightedRandomActivity() {
  const totalWeight = activityTypes.reduce((sum, a) => sum + a.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const activity of activityTypes) {
    random -= activity.weight;
    if (random <= 0) return activity;
  }
  
  return activityTypes[0];
}

function getRandomIntensity(activityType) {
  // More intense activities tend to be moderate/high
  if (activityType === 'running' || activityType === 'rowing') {
    const weights = [10, 40, 35, 15]; // low, moderate, high, very_high
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return intensityLevels[i];
    }
  } else if (activityType === 'walking') {
    const weights = [40, 45, 15, 0]; // Mostly low/moderate
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return intensityLevels[i];
    }
  }
  
  // Default distribution
  const weights = [15, 50, 30, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return intensityLevels[i];
  }
  
  return 'moderate';
}

function generateDistance(activity) {
  if (activity.avgDistance === 0) return null; // Stair climbing has no distance
  
  const distance = activity.avgDistance + (Math.random() - 0.5) * 2 * activity.distanceVariance;
  return Math.max(0.5, distance).toFixed(2);
}

function generateDuration(distance, activityType, intensity) {
  if (!distance || distance === 0) {
    // Duration only activities (like stair climbing)
    return Math.floor(15 + Math.random() * 30); // 15-45 minutes
  }
  
  let baseSpeed;
  
  // Base speeds in km/h
  switch (activityType) {
    case 'running':
      baseSpeed = intensity === 'very_high' ? 14 : intensity === 'high' ? 11 : intensity === 'moderate' ? 9 : 7;
      break;
    case 'cycling':
      baseSpeed = intensity === 'very_high' ? 30 : intensity === 'high' ? 25 : intensity === 'moderate' ? 20 : 15;
      break;
    case 'walking':
      baseSpeed = intensity === 'high' ? 6 : intensity === 'moderate' ? 5 : 4;
      break;
    case 'swimming':
      baseSpeed = intensity === 'very_high' ? 2.5 : intensity === 'high' ? 2 : intensity === 'moderate' ? 1.5 : 1;
      break;
    case 'rowing':
      baseSpeed = intensity === 'very_high' ? 12 : intensity === 'high' ? 10 : intensity === 'moderate' ? 8 : 6;
      break;
    case 'elliptical':
      baseSpeed = intensity === 'very_high' ? 12 : intensity === 'high' ? 10 : intensity === 'moderate' ? 8 : 6;
      break;
    case 'hiking':
      baseSpeed = intensity === 'high' ? 5 : intensity === 'moderate' ? 4 : 3;
      break;
    default:
      baseSpeed = 8;
  }
  
  // Add some variance
  const speed = baseSpeed * (0.85 + Math.random() * 0.3);
  const durationHours = parseFloat(distance) / speed;
  const durationMinutes = Math.round(durationHours * 60);
  
  return Math.max(5, durationMinutes); // Minimum 5 minutes
}

function calculateCalories(activityType, durationMinutes, intensityLevel, distanceKm) {
  // MET values based on activity and intensity
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

  let metValue = MET_VALUES[activityType]?.[intensityLevel] || 8.0;
  
  // For running, adjust MET based on actual speed if available
  if (activityType === 'running' && distanceKm && durationMinutes) {
    const averageSpeedKmh = (distanceKm / durationMinutes) * 60;
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
  return Math.round(metValue * assumedWeightKg * durationHours);
}

function generateCardioSessions(daysBack = 60) {
  console.log('🏃 Generating realistic cardio sessions...');
  
  const sessions = [];
  const today = new Date();
  
  // Generate 2-4 sessions per week on average (varying by week)
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip some days (not every day has a session)
    // More likely to exercise on certain days
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Higher chance on weekends and Wed
    const exerciseChance = isWeekend ? 0.5 : dayOfWeek === 3 ? 0.4 : 0.3;
    
    if (Math.random() > exerciseChance) continue;
    
    const activity = getWeightedRandomActivity();
    const intensity = getRandomIntensity(activity.type);
    const distance = generateDistance(activity);
    const duration = generateDuration(distance, activity.type, intensity);
    const calories = calculateCalories(activity.type, duration, intensity, distance);
    const location = locations[activity.type][Math.floor(Math.random() * locations[activity.type].length)];
    const note = notes[Math.floor(Math.random() * notes.length)];
    
    sessions.push({
      activityType: activity.type,
      sessionDate: date.toISOString().split('T')[0],
      durationMinutes: duration,
      distanceKm: distance,
      caloriesBurned: calories,
      intensityLevel: intensity,
      location: location,
      notes: note,
    });
  }
  
  // Sort by date (oldest first)
  sessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
  
  console.log(`   Generated ${sessions.length} cardio sessions over the past ${daysBack} days`);
  
  return sessions;
}

async function seedCardioData() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Get the member user
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = 'member@gmail.com'"
    );
    
    if (userResult.rows.length === 0) {
      console.error('❌ User member@gmail.com not found!');
      console.log('   Make sure the default user seed has run first.');
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Found user: member@gmail.com (ID: ${userId})`);
    
    // Check if cardio data already exists
    const existingResult = await pool.query(
      'SELECT COUNT(*) as count FROM cardio_sessions WHERE user_id = $1',
      [userId]
    );
    
    const existingCount = parseInt(existingResult.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing cardio sessions`);
      console.log('   Skipping seed to preserve existing data');
      console.log('   To re-seed, delete existing sessions first');
      return;
    }
    
    const sessions = generateCardioSessions(60);
    
    console.log('\n💾 Inserting cardio sessions into database...');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const session of sessions) {
      try {
        await pool.query(
          `INSERT INTO cardio_sessions 
           (user_id, activity_type, session_date, duration_minutes, distance_km, 
            calories_burned, intensity_level, location, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            userId,
            session.activityType,
            session.sessionDate,
            session.durationMinutes,
            session.distanceKm,
            session.caloriesBurned,
            session.intensityLevel,
            session.location,
            session.notes,
          ]
        );
        inserted++;
      } catch (error) {
        if (error.code === '23505') {
          // Duplicate entry, skip
          skipped++;
        } else {
          console.error('Error inserting session:', error.message);
        }
      }
    }
    
    console.log('\n✅ Seed completed successfully!');
    console.log(`   Inserted: ${inserted} cardio sessions`);
    if (skipped > 0) {
      console.log(`   Skipped: ${skipped} sessions (already exist)`);
    }
    
    // Show summary stats
    const statsResult = await pool.query(
      `SELECT 
        activity_type,
        COUNT(*) as count,
        SUM(duration_minutes) as total_duration,
        SUM(distance_km) as total_distance,
        SUM(calories_burned) as total_calories
       FROM cardio_sessions 
       WHERE user_id = $1 
       GROUP BY activity_type 
       ORDER BY count DESC`,
      [userId]
    );
    
    console.log('\n📊 Cardio session breakdown:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.activity_type.padEnd(15)} - ${row.count} sessions, ${Math.round(row.total_duration || 0)} min, ${parseFloat(row.total_distance || 0).toFixed(1)} km, ${Math.round(row.total_calories || 0)} kcal`);
    });
    
    // Show date range
    const dateResult = await pool.query(
      `SELECT 
        MIN(session_date) as first_session,
        MAX(session_date) as last_session
       FROM cardio_sessions 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (dateResult.rows[0].first_session) {
      console.log('\n📅 Cardio session date range:');
      console.log(`   First session: ${new Date(dateResult.rows[0].first_session).toLocaleDateString()}`);
      console.log(`   Last session: ${new Date(dateResult.rows[0].last_session).toLocaleDateString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding cardio data:', error);
    throw error;
  } finally {
    console.log('\n🔌 Closing database connection...');
    await pool.end();
    console.log('\n✅ All done!\n');
  }
}

// Run the seed
seedCardioData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

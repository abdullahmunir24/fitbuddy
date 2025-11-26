/**
 * ========================================
 * Startup Script with Seeding
 * ========================================
 * 
 * This script:
 * 1. Starts the server (which creates default users)
 * 2. Waits for server to be ready
 * 3. Seeds the workout data for member@gmail.com
 * 4. Seeds the cardio data for member@gmail.com
 */

import { spawn } from 'child_process';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitbuddy_db',
  user: process.env.DB_USER || 'fitbuddy_user',
  password: process.env.DB_PASSWORD || 'fitbuddy_password',
});

/**
 * Wait for the server to be ready
 */
async function waitForServer() {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.error('❌ Server failed to start within timeout');
  return false;
}

/**
 * Check if workouts already exist for member@gmail.com
 */
async function hasWorkouts() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM workouts w
      JOIN users u ON w.user_id = u.id
      WHERE u.email = 'member@gmail.com'
    `);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if cardio sessions already exist for member@gmail.com
 */
async function hasCardioSessions() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM cardio_sessions c
      JOIN users u ON c.user_id = u.id
      WHERE u.email = 'member@gmail.com'
    `);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Seed workouts for member@gmail.com
 */
async function seedWorkouts() {
  return new Promise((resolve, reject) => {
    console.log('🌱 Seeding workout data for member@gmail.com...\n');
    
    const seedProcess = spawn('npm', ['run', 'seed-workouts'], {
      stdio: 'inherit',
      shell: true
    });
    
    seedProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Workout seed process exited with code ${code}`));
      }
    });
  });
}

/**
 * Seed cardio sessions for member@gmail.com
 */
async function seedCardio() {
  return new Promise((resolve, reject) => {
    console.log('🏃 Seeding cardio data for member@gmail.com...\n');
    
    const seedProcess = spawn('npm', ['run', 'seed-cardio'], {
      stdio: 'inherit',
      shell: true
    });
    
    seedProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Cardio seed process exited with code ${code}`));
      }
    });
  });
}

/**
 * Main startup function
 */
async function startup() {
  console.log('🚀 Starting FitBuddy with auto-seeding...\n');
  
  // Start the main server in the background
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...\n');
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.error('❌ Server startup failed');
    process.exit(1);
  }
  
  // Check if workouts already exist
  const alreadySeeded = await hasWorkouts();
  
  if (alreadySeeded) {
    console.log('✅ Workout data already exists for member@gmail.com\n');
  } else {
    // Seed workouts
    try {
      await seedWorkouts();
      console.log('\n✅ Workout seeding completed!\n');
    } catch (error) {
      console.error('❌ Workout seeding failed:', error.message);
    }
  }

  // Check if cardio sessions already exist
  const cardioAlreadySeeded = await hasCardioSessions();
  
  if (cardioAlreadySeeded) {
    console.log('✅ Cardio data already exists for member@gmail.com\n');
  } else {
    // Seed cardio
    try {
      await seedCardio();
      console.log('\n✅ Cardio seeding completed!\n');
    } catch (error) {
      console.error('❌ Cardio seeding failed:', error.message);
    }
  }
  
  await pool.end();
  
  // Keep the process running
  serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n📴 Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('\n📴 Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });
}

// Run startup
startup().catch((error) => {
  console.error('❌ Startup failed:', error);
  process.exit(1);
});

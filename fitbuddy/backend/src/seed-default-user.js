/**
 * ========================================
 * Seed Default User Script
 * ========================================
 * 
 * Creates a default member user in the database
 * This user will always be available for testing and login
 * 
 * Usage:
 * npm run seed-user
 * 
 * OR
 * 
 * node src/seed-default-user.js
 * 
 * Credentials:
 * Email: raad.sask@gmail.com
 * Password: Raad7223!
 * Role: member
 */

import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitbuddy_db',
  user: process.env.DB_USER || 'fitbuddy_user',
  password: process.env.DB_PASSWORD || 'fitbuddy_password',
});

// Default user credentials
const DEFAULT_USER = {
  username: 'raad',
  email: 'raad.sask@gmail.com',
  password: 'Raad7223!',
  full_name: 'Raad Sarker',
  role: 'member',
};

async function seedDefaultUser() {
  try {
    console.log('🌱 Starting database seed for default user...\n');
    
    // Hash the password with bcrypt (same as auth routes)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, saltRounds);
    
    console.log('🔐 Password hashed successfully');
    
    // Check if user already exists
    const checkQuery = 'SELECT id, email, full_name, role FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [DEFAULT_USER.email]);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Default user already exists in database');
      console.log(`   User ID: ${checkResult.rows[0].id}`);
      console.log(`   Email: ${checkResult.rows[0].email}`);
      console.log(`   Name: ${checkResult.rows[0].full_name}`);
      console.log(`   Role: ${checkResult.rows[0].role}`);
      console.log('\n📝 Login Credentials:');
      console.log(`   Email: ${DEFAULT_USER.email}`);
      console.log(`   Password: ${DEFAULT_USER.password}`);
      return;
    }
    
    // Insert the default user
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, full_name, role, created_at
    `;
    
    const values = [
      DEFAULT_USER.username,
      DEFAULT_USER.email,
      hashedPassword,
      DEFAULT_USER.full_name,
      DEFAULT_USER.role,
      true,  // is_active
      true   // email_verified
    ];
    
    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];
    
    console.log('✅ Default user created successfully!\n');
    console.log('👤 User Details:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Full Name: ${newUser.full_name}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Created At: ${newUser.created_at}`);
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${DEFAULT_USER.email}`);
    console.log(`   Password: ${DEFAULT_USER.password}`);
    
  } catch (error) {
    console.error('❌ Error seeding default user:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedDefaultUser()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });


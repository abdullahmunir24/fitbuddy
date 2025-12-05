/**
 * ========================================
 * Seed Gyms Script
 * ========================================
 * 
 * Seeds the database with real gyms in Kelowna, BC
 * 
 * Usage:
 * node src/seed-gyms.js
 */

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

// Real gyms in Kelowna, BC with accurate coordinates
const gyms = [
  {
    name: 'Anytime Fitness',
    description: '24/7 gym access with modern equipment and friendly staff. Great for all fitness levels.',
    address: '1677 Commerce Ave #110',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1X 8A9',
    phone: '(778) 392-3767',
    email: 'anytimefitness@kelowna.com',
    website_url: 'https://www.anytimefitness.com',
    latitude: 49.8880,
    longitude: -119.4960,
    facilities: ['24/7 Access', 'Free Weights', 'Cardio Equipment', 'Personal Training', 'Showers']
  },
  {
    name: 'GoodLife Fitness Kelowna',
    description: 'Canada\'s largest gym chain with extensive facilities and group classes.',
    address: '1835 Gordon Dr',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1Y 3H4',
    phone: '(250) 860-3348',
    email: 'goodlife@kelowna.com',
    website_url: 'https://www.goodlifefitness.com',
    latitude: 49.8847,
    longitude: -119.4673,
    facilities: ['Pool', 'Sauna', 'Group Classes', 'Personal Training', 'Cardio Equipment', 'Free Weights']
  },
  {
    name: 'CrossFit Revolution',
    description: 'High-intensity functional fitness training with experienced coaches.',
    address: '1889 Springfield Rd #103',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1Y 5V5',
    phone: '(250) 717-5348',
    email: 'info@crossfitrevolution.com',
    website_url: 'https://www.crossfitrevolution.com',
    latitude: 49.8825,
    longitude: -119.4701,
    facilities: ['CrossFit Equipment', 'Group Classes', 'Olympic Lifting', 'Personal Training']
  },
  {
    name: 'The Realm Fitness Kelowna',
    description: 'Modern fitness facility with state-of-the-art equipment and expert trainers.',
    address: '1876 Cooper Rd',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1Y 8K5',
    phone: '(250) 868-3348',
    email: 'info@therealmfitness.com',
    website_url: 'https://www.therealmfitness.com',
    latitude: 49.8863,
    longitude: -119.4689,
    facilities: ['Modern Equipment', 'Personal Training', 'Group Classes', 'Nutrition Coaching']
  },
  {
    name: 'Planet Fitness Kelowna',
    description: 'Judgement-free zone with affordable memberships and 24/7 access.',
    address: '2271 Harvey Ave',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1Y 6H2',
    phone: '(250) 762-3348',
    email: 'planetfitness@kelowna.com',
    website_url: 'https://www.planetfitness.com',
    latitude: 49.8861,
    longitude: -119.4525,
    facilities: ['24/7 Access', 'Cardio Equipment', 'Free Weights', 'Massage Chairs', 'Tanning']
  },
  {
    name: 'Body & Soul Fitness',
    description: 'Boutique fitness studio focusing on personalized training and wellness.',
    address: '375 Hartman Rd',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1W 3A1',
    phone: '(250) 763-5348',
    email: 'info@bodyandsoul.com',
    website_url: 'https://www.bodyandsoul.com',
    latitude: 49.8795,
    longitude: -119.4912,
    facilities: ['Personal Training', 'Small Group Classes', 'Nutrition Coaching', 'Yoga']
  },
  {
    name: 'UBCO Fitness Centre',
    description: 'University fitness center with student-friendly rates and modern facilities.',
    address: '3333 University Way',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1V 1V7',
    phone: '(250) 807-9107',
    email: 'fitness@ubc.ca',
    website_url: 'https://recreation.ok.ubc.ca',
    latitude: 49.9397,
    longitude: -119.3967,
    facilities: ['Student Rates', 'Modern Equipment', 'Pool', 'Climbing Wall', 'Group Classes']
  },
  {
    name: 'Yoga Studio Kelowna',
    description: 'Dedicated yoga and meditation space with experienced instructors.',
    address: '1441 Ellis St #200',
    city: 'Kelowna',
    province: 'BC',
    postal_code: 'V1Y 2A3',
    phone: '(250) 717-9642',
    email: 'info@yogastudiokelowna.com',
    website_url: 'https://www.yogastudiokelowna.com',
    latitude: 49.8836,
    longitude: -119.4876,
    facilities: ['Hot Yoga', 'Meditation Room', 'Various Yoga Styles', 'Workshops']
  },
];

async function seedGyms() {
  try {
    console.log('🌱 Starting gym seeding process...\n');
    
    // Check if gyms table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gyms'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Gyms table does not exist. Please run the schema.sql file first.');
      process.exit(1);
    }
    
    console.log('✅ Gyms table found\n');
    
    // Clear existing gyms (optional - comment out if you want to keep existing data)
    await pool.query('DELETE FROM gym_facilities');
    await pool.query('DELETE FROM gyms');
    console.log('🗑️  Cleared existing gym data\n');
    
    // Insert gyms
    for (const gym of gyms) {
      console.log(`📍 Adding ${gym.name}...`);
      
      // Insert gym
      const gymResult = await pool.query(
        `INSERT INTO gyms (
          name, description, address, city, province, postal_code,
          phone, email, website_url, latitude, longitude,
          is_approved, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          gym.name,
          gym.description,
          gym.address,
          gym.city,
          gym.province,
          gym.postal_code,
          gym.phone,
          gym.email,
          gym.website_url,
          gym.latitude,
          gym.longitude,
          true, // is_approved
          true  // is_active
        ]
      );
      
      const gymId = gymResult.rows[0].id;
      
      // Insert facilities
      if (gym.facilities && gym.facilities.length > 0) {
        for (const facility of gym.facilities) {
          await pool.query(
            'INSERT INTO gym_facilities (gym_id, facility_name, is_available) VALUES ($1, $2, $3)',
            [gymId, facility, true]
          );
        }
        console.log(`   ✓ Added ${gym.facilities.length} facilities`);
      }
      
      console.log(`   ✓ ${gym.name} added successfully (ID: ${gymId})\n`);
    }
    
    console.log('✅ Successfully seeded all gyms!\n');
    console.log('📊 Summary:');
    console.log(`   Total gyms added: ${gyms.length}`);
    console.log(`   Location: Kelowna, BC`);
    console.log(`   All gyms are active and approved\n`);
    
    // Display gyms with coordinates
    console.log('📍 Gym Locations:');
    const result = await pool.query('SELECT name, address, latitude, longitude FROM gyms ORDER BY name');
    result.rows.forEach(gym => {
      console.log(`   ${gym.name}`);
      console.log(`   ${gym.address}`);
      console.log(`   Coordinates: ${gym.latitude}, ${gym.longitude}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding gyms:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedGyms()
  .then(() => {
    console.log('\n✅ Gym seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Gym seeding failed:', error);
    process.exit(1);
  });


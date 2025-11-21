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

async function seedClasses() {
  const client = await pool.connect();

  try {
    console.log('Starting class seeding...');

    // Get trainer user IDs
    const trainersResult = await client.query(
      "SELECT id, full_name FROM users WHERE role = 'trainer' LIMIT 2"
    );

    if (trainersResult.rows.length === 0) {
      console.log('No trainers found. Please seed users first.');
      return;
    }

    const trainers = trainersResult.rows;
    console.log(`Found ${trainers.length} trainers`);

    // Get available gyms
    const gymsResult = await client.query('SELECT id, name FROM gyms LIMIT 2');
    if (gymsResult.rows.length === 0) {
      console.log('No gyms found. Please seed gyms first.');
      return;
    }
    const gyms = gymsResult.rows;
    console.log(`Found ${gyms.length} gyms`);

    // Sample classes for each trainer
    const classTemplates = [
      {
        class_name: 'Morning Yoga Flow',
        class_type: 'Yoga',
        difficulty_level: 'beginner',
        max_capacity: 15,
        duration_minutes: 60,
        description: 'Start your day with gentle stretching and breathing exercises to energize your body and calm your mind.',
      },
      {
        class_name: 'HIIT Bootcamp',
        class_type: 'HIIT',
        difficulty_level: 'advanced',
        max_capacity: 20,
        duration_minutes: 45,
        description: 'High-intensity interval training designed to burn calories and build strength. Not for the faint of heart!',
      },
      {
        class_name: 'Power Pilates',
        class_type: 'Pilates',
        difficulty_level: 'intermediate',
        max_capacity: 12,
        duration_minutes: 50,
        description: 'Core-focused workout combining strength, flexibility, and controlled movements for a full-body transformation.',
      },
      {
        class_name: 'Spin & Burn',
        class_type: 'Cycling',
        difficulty_level: 'intermediate',
        max_capacity: 25,
        duration_minutes: 45,
        description: 'Indoor cycling class with high-energy music and interval training to torch calories and build endurance.',
      },
      {
        class_name: 'Strength & Conditioning',
        class_type: 'Strength Training',
        difficulty_level: 'intermediate',
        max_capacity: 18,
        duration_minutes: 60,
        description: 'Build muscle and increase strength with compound lifts and functional training movements.',
      },
      {
        class_name: 'Restorative Yoga',
        class_type: 'Yoga',
        difficulty_level: 'beginner',
        max_capacity: 15,
        duration_minutes: 75,
        description: 'Slow-paced class focused on relaxation, deep stretching, and stress relief. Perfect for recovery days.',
      },
    ];

    // Create classes for each trainer
    for (const trainer of trainers) {
      console.log(`\nCreating classes for ${trainer.full_name}...`);

      // Give each trainer 3 different classes
      const trainerClasses = classTemplates.slice(0, 3);

      for (const classTemplate of trainerClasses) {
        // Check if class already exists for this trainer
        const existingClass = await client.query(
          'SELECT id FROM fitness_classes WHERE trainer_id = $1 AND class_name = $2',
          [trainer.id, classTemplate.class_name]
        );

        let classId;

        if (existingClass.rows.length > 0) {
          classId = existingClass.rows[0].id;
          console.log(`  - Class "${classTemplate.class_name}" already exists`);
        } else {
          // Create new class with gym assignment
          const gymIndex = trainers.indexOf(trainer) % gyms.length;
          const classResult = await client.query(
            `INSERT INTO fitness_classes 
            (trainer_id, gym_id, class_name, class_type, difficulty_level, max_capacity, duration_minutes, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [
              trainer.id,
              gyms[gymIndex].id,
              classTemplate.class_name,
              classTemplate.class_type,
              classTemplate.difficulty_level,
              classTemplate.max_capacity,
              classTemplate.duration_minutes,
              classTemplate.description,
            ]
          );

          classId = classResult.rows[0].id;
          console.log(`  ✓ Created class: ${classTemplate.class_name}`);
        }

        // Create schedules for the next 3 days
        const schedulesToCreate = [];
        const today = new Date();

        for (let i = 1; i <= 3; i++) {
          const scheduleDate = new Date(today);
          scheduleDate.setDate(today.getDate() + i);

          // Different times for different class types
          let startHour = 6;
          if (classTemplate.class_type === 'HIIT') startHour = 18;
          else if (classTemplate.class_type === 'Pilates') startHour = 10;
          else if (classTemplate.class_type === 'Cycling') startHour = 17;
          else if (classTemplate.class_type === 'Strength Training') startHour = 14;
          else if (classTemplate.class_type === 'Yoga') startHour = 7;

          const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
          const endHour = startHour + Math.floor(classTemplate.duration_minutes / 60);
          const endMinutes = classTemplate.duration_minutes % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;

          schedulesToCreate.push({
            date: scheduleDate.toISOString().split('T')[0],
            startTime,
            endTime,
          });
        }

        // Insert schedules
        for (const schedule of schedulesToCreate) {
          // Check if schedule already exists
          const existingSchedule = await client.query(
            `SELECT id FROM class_schedules 
            WHERE class_id = $1 AND scheduled_date = $2 AND start_time = $3`,
            [classId, schedule.date, schedule.startTime]
          );

          if (existingSchedule.rows.length === 0) {
            await client.query(
              `INSERT INTO class_schedules (class_id, scheduled_date, start_time, end_time, status)
              VALUES ($1, $2, $3, $4, 'scheduled')`,
              [classId, schedule.date, schedule.startTime, schedule.endTime]
            );
          }
        }

        console.log(`    ✓ Created ${schedulesToCreate.length} schedules`);
      }

      // Rotate templates for next trainer
      classTemplates.push(classTemplates.shift());
    }

    // Create some sample bookings for members
    console.log('\nCreating sample bookings...');
    const membersResult = await client.query(
      "SELECT id FROM users WHERE role = 'member' LIMIT 1"
    );

    if (membersResult.rows.length > 0) {
      const memberId = membersResult.rows[0].id;

      // Get upcoming schedules
      const upcomingSchedules = await client.query(
        `SELECT cs.id, cs.class_id, cs.scheduled_date
        FROM class_schedules cs
        WHERE cs.scheduled_date >= CURRENT_DATE
        AND cs.status = 'scheduled'
        LIMIT 3`
      );

      for (const schedule of upcomingSchedules.rows) {
        // Check if booking already exists
        const existingBooking = await client.query(
          'SELECT id FROM class_bookings WHERE user_id = $1 AND schedule_id = $2',
          [memberId, schedule.id]
        );

        if (existingBooking.rows.length === 0) {
          await client.query(
            `INSERT INTO class_bookings (schedule_id, user_id, booking_status)
            VALUES ($1, $2, 'confirmed')`,
            [schedule.id, memberId]
          );
          console.log(`  ✓ Created booking for schedule ${schedule.id}`);
        }
      }
    }

    console.log('\n✅ Class seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding classes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedClasses();

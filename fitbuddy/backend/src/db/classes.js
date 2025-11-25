/**
 * ========================================
 * Classes Database Module
 * ========================================
 * 
 * Handles all database operations for fitness classes, schedules, and bookings
 * 
 * Tables:
 * - fitness_classes: Base class templates created by trainers
 * - class_schedules: Specific instances of classes with dates/times
 * - class_bookings: Member bookings for class schedules
 * - class_waitlist: Waitlist for full classes
 * 
 * @module db/classes
 */

import pool from '../config/db.js';

/**
 * ========================================
 * TRAINER OPERATIONS
 * ========================================
 */

/**
 * Create a new fitness class
 * @param {Object} classData - Class information
 * @returns {Object} Created class
 */
export const createClass = async (classData) => {
  const {
    trainer_id,
    gym_id,
    class_name,
    description,
    class_type,
    difficulty_level,
    max_capacity,
    duration_minutes,
    price = 0.00,
  } = classData;

  const query = `
    INSERT INTO fitness_classes (
      trainer_id, gym_id, class_name, description, class_type,
      difficulty_level, max_capacity, duration_minutes, price, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    trainer_id, gym_id, class_name, description, class_type,
    difficulty_level, max_capacity, duration_minutes, price, true
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Create a class schedule (specific instance)
 * @param {Object} scheduleData - Schedule information
 * @returns {Object} Created schedule
 */
export const createClassSchedule = async (scheduleData) => {
  const {
    class_id,
    scheduled_date,
    start_time,
    end_time,
  } = scheduleData;

  const query = `
    INSERT INTO class_schedules (
      class_id, scheduled_date, start_time, end_time, current_capacity, status
    )
    VALUES ($1, $2, $3, $4, 0, 'scheduled')
    RETURNING *
  `;

  const values = [class_id, scheduled_date, start_time, end_time];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get all classes for a specific trainer with schedule counts
 * @param {number} trainerId - Trainer user ID
 * @returns {Array} Array of classes
 */
export const getTrainerClasses = async (trainerId) => {
  const query = `
    SELECT 
      fc.*,
      g.name as gym_name,
      g.city as gym_city,
      COUNT(DISTINCT cs.id) as schedule_count,
      COUNT(DISTINCT cb.id) as total_bookings
    FROM fitness_classes fc
    LEFT JOIN gyms g ON fc.gym_id = g.id
    LEFT JOIN class_schedules cs ON fc.id = cs.class_id
    LEFT JOIN class_bookings cb ON cs.id = cb.schedule_id AND cb.booking_status = 'confirmed'
    WHERE fc.trainer_id = $1 AND fc.is_active = true
    GROUP BY fc.id, g.name, g.city
    ORDER BY fc.created_at DESC
  `;

  const result = await pool.query(query, [trainerId]);
  return result.rows;
};

/**
 * Get a specific class by ID with full details
 * @param {number} classId - Class ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {Object} Class details
 */
export const getClassById = async (classId, trainerId) => {
  const query = `
    SELECT 
      fc.*,
      g.name as gym_name,
      g.address as gym_address,
      g.city as gym_city,
      u.full_name as trainer_name
    FROM fitness_classes fc
    LEFT JOIN gyms g ON fc.gym_id = g.id
    LEFT JOIN users u ON fc.trainer_id = u.id
    WHERE fc.id = $1 AND fc.trainer_id = $2
  `;

  const result = await pool.query(query, [classId, trainerId]);
  return result.rows[0];
};

/**
 * Update a class
 * @param {number} classId - Class ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated class
 */
export const updateClass = async (classId, trainerId, updates) => {
  const {
    class_name,
    description,
    class_type,
    difficulty_level,
    max_capacity,
    duration_minutes,
    price,
    is_active,
  } = updates;

  const query = `
    UPDATE fitness_classes
    SET 
      class_name = COALESCE($1, class_name),
      description = COALESCE($2, description),
      class_type = COALESCE($3, class_type),
      difficulty_level = COALESCE($4, difficulty_level),
      max_capacity = COALESCE($5, max_capacity),
      duration_minutes = COALESCE($6, duration_minutes),
      price = COALESCE($7, price),
      is_active = COALESCE($8, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9 AND trainer_id = $10
    RETURNING *
  `;

  const values = [
    class_name,
    description,
    class_type,
    difficulty_level,
    max_capacity,
    duration_minutes,
    price,
    is_active,
    classId,
    trainerId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete a class (soft delete by setting is_active = false)
 * @param {number} classId - Class ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {boolean} Success status
 */
export const deleteClass = async (classId, trainerId) => {
  const query = `
    UPDATE fitness_classes
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND trainer_id = $2
    RETURNING id
  `;

  const result = await pool.query(query, [classId, trainerId]);
  return result.rows.length > 0;
};

/**
 * Get all schedules for a specific class
 * @param {number} classId - Class ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {Array} Array of schedules with booking info
 */
export const getClassSchedules = async (classId, trainerId) => {
  const query = `
    SELECT 
      cs.*,
      fc.class_name,
      fc.max_capacity,
      COUNT(cb.id) FILTER (WHERE cb.booking_status = 'confirmed') as confirmed_bookings
    FROM class_schedules cs
    JOIN fitness_classes fc ON cs.class_id = fc.id
    LEFT JOIN class_bookings cb ON cs.id = cb.schedule_id
    WHERE cs.class_id = $1 AND fc.trainer_id = $2
    GROUP BY cs.id, fc.class_name, fc.max_capacity
    ORDER BY cs.scheduled_date DESC, cs.start_time DESC
  `;

  const result = await pool.query(query, [classId, trainerId]);
  return result.rows;
};

/**
 * Get members booked for a specific schedule
 * @param {number} scheduleId - Schedule ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {Array} Array of booked members
 */
export const getScheduleBookings = async (scheduleId, trainerId) => {
  const query = `
    SELECT 
      cb.id as booking_id,
      cb.booking_status,
      cb.booked_at,
      cb.attended,
      u.id as user_id,
      u.full_name,
      u.email,
      u.profile_picture_url
    FROM class_bookings cb
    JOIN users u ON cb.user_id = u.id
    JOIN class_schedules cs ON cb.schedule_id = cs.id
    JOIN fitness_classes fc ON cs.class_id = fc.id
    WHERE cb.schedule_id = $1 
      AND fc.trainer_id = $2
      AND cb.booking_status IN ('confirmed', 'attended')
    ORDER BY cb.booked_at ASC
  `;

  const result = await pool.query(query, [scheduleId, trainerId]);
  return result.rows;
};

/**
 * ========================================
 * MEMBER OPERATIONS
 * ========================================
 */

/**
 * Get all upcoming available classes for members
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of available class schedules
 */
export const getAvailableClasses = async (filters = {}) => {
  const { trainer_id, class_type, difficulty_level, date_from, date_to, gym_id } = filters;
  
  let query = `
    SELECT 
      cs.id as schedule_id,
      cs.scheduled_date,
      cs.start_time,
      cs.end_time,
      cs.current_capacity,
      cs.status,
      fc.id as class_id,
      fc.class_name,
      fc.description,
      fc.class_type,
      fc.difficulty_level,
      fc.max_capacity,
      fc.duration_minutes,
      fc.price,
      (fc.max_capacity - cs.current_capacity) as spots_available,
      u.id as trainer_id,
      u.full_name as trainer_name,
      u.profile_picture_url as trainer_picture,
      g.name as gym_name,
      g.address as gym_address,
      g.city as gym_city
    FROM class_schedules cs
    JOIN fitness_classes fc ON cs.class_id = fc.id
    JOIN users u ON fc.trainer_id = u.id
    LEFT JOIN gyms g ON fc.gym_id = g.id
    WHERE fc.is_active = true
      AND cs.status = 'scheduled'
      AND cs.scheduled_date >= CURRENT_DATE
  `;

  const values = [];
  let paramCount = 1;

  if (trainer_id) {
    query += ` AND fc.trainer_id = $${paramCount}`;
    values.push(trainer_id);
    paramCount++;
  }

  if (class_type) {
    query += ` AND fc.class_type = $${paramCount}`;
    values.push(class_type);
    paramCount++;
  }

  if (difficulty_level) {
    query += ` AND fc.difficulty_level = $${paramCount}`;
    values.push(difficulty_level);
    paramCount++;
  }

  if (gym_id) {
    query += ` AND fc.gym_id = $${paramCount}`;
    values.push(gym_id);
    paramCount++;
  }

  if (date_from) {
    query += ` AND cs.scheduled_date >= $${paramCount}`;
    values.push(date_from);
    paramCount++;
  }

  if (date_to) {
    query += ` AND cs.scheduled_date <= $${paramCount}`;
    values.push(date_to);
    paramCount++;
  }

  query += ` ORDER BY cs.scheduled_date ASC, cs.start_time ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get member's booked classes
 * @param {number} userId - Member user ID
 * @param {string} status - Optional status filter
 * @returns {Array} Array of booked classes
 */
export const getMemberBookings = async (userId, status = null) => {
  let query = `
    SELECT 
      cb.id as booking_id,
      cb.booking_status,
      cb.booked_at,
      cb.attended,
      cs.id as schedule_id,
      cs.scheduled_date,
      cs.start_time,
      cs.end_time,
      cs.status as schedule_status,
      fc.id as class_id,
      fc.class_name,
      fc.class_type,
      fc.difficulty_level,
      fc.duration_minutes,
      fc.max_capacity,
      cs.current_capacity,
      u.full_name as trainer_name,
      u.profile_picture_url as trainer_picture,
      g.name as gym_name,
      g.city as gym_city
    FROM class_bookings cb
    JOIN class_schedules cs ON cb.schedule_id = cs.id
    JOIN fitness_classes fc ON cs.class_id = fc.id
    JOIN users u ON fc.trainer_id = u.id
    LEFT JOIN gyms g ON fc.gym_id = g.id
    WHERE cb.user_id = $1
  `;

  const values = [userId];

  if (status) {
    query += ` AND cb.booking_status = $2`;
    values.push(status);
  } else {
    query += ` AND cb.booking_status IN ('confirmed', 'attended')`;
  }

  query += ` ORDER BY cs.scheduled_date ASC, cs.start_time ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Book a class for a member
 * @param {number} scheduleId - Schedule ID
 * @param {number} userId - Member user ID
 * @returns {Object} Booking details
 */
export const bookClass = async (scheduleId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if class is full
    const capacityCheck = `
      SELECT 
        cs.current_capacity,
        fc.max_capacity
      FROM class_schedules cs
      JOIN fitness_classes fc ON cs.class_id = fc.id
      WHERE cs.id = $1 AND cs.status = 'scheduled'
    `;
    
    const capacityResult = await client.query(capacityCheck, [scheduleId]);
    
    if (capacityResult.rows.length === 0) {
      throw new Error('Class schedule not found or not available');
    }

    const { current_capacity, max_capacity } = capacityResult.rows[0];
    
    if (current_capacity >= max_capacity) {
      throw new Error('Class is full');
    }

    // Check if already booked
    const existingBooking = await client.query(
      'SELECT id FROM class_bookings WHERE schedule_id = $1 AND user_id = $2',
      [scheduleId, userId]
    );

    if (existingBooking.rows.length > 0) {
      throw new Error('You have already booked this class');
    }

    // Create booking
    const bookingQuery = `
      INSERT INTO class_bookings (schedule_id, user_id, booking_status)
      VALUES ($1, $2, 'confirmed')
      RETURNING *
    `;
    
    const bookingResult = await client.query(bookingQuery, [scheduleId, userId]);

    // Update capacity
    await client.query(
      'UPDATE class_schedules SET current_capacity = current_capacity + 1 WHERE id = $1',
      [scheduleId]
    );

    await client.query('COMMIT');
    return bookingResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Cancel a class booking
 * @param {number} bookingId - Booking ID
 * @param {number} userId - Member user ID (for authorization)
 * @returns {Object} Cancelled booking
 */
export const cancelBooking = async (bookingId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get booking and schedule info
    const bookingQuery = `
      SELECT cb.*, cs.scheduled_date, cs.start_time
      FROM class_bookings cb
      JOIN class_schedules cs ON cb.schedule_id = cs.id
      WHERE cb.id = $1 AND cb.user_id = $2 AND cb.booking_status = 'confirmed'
    `;
    
    const bookingResult = await client.query(bookingQuery, [bookingId, userId]);
    
    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found or already cancelled');
    }

    const booking = bookingResult.rows[0];

    // Check if class is in the past
    const classDateTime = new Date(`${booking.scheduled_date} ${booking.start_time}`);
    if (classDateTime < new Date()) {
      throw new Error('Cannot cancel past classes');
    }

    // Cancel booking
    const cancelQuery = `
      UPDATE class_bookings
      SET 
        booking_status = 'cancelled',
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const cancelResult = await client.query(cancelQuery, [bookingId]);

    // Decrease capacity
    await client.query(
      'UPDATE class_schedules SET current_capacity = GREATEST(current_capacity - 1, 0) WHERE id = $1',
      [booking.schedule_id]
    );

    await client.query('COMMIT');
    return cancelResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get unique class types for filtering
 * @returns {Array} Array of class types
 */
export const getClassTypes = async () => {
  const query = `
    SELECT DISTINCT class_type
    FROM fitness_classes
    WHERE is_active = true AND class_type IS NOT NULL
    ORDER BY class_type
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.class_type);
};

/**
 * Get all trainers who teach classes
 * @returns {Array} Array of trainers
 */
export const getClassTrainers = async () => {
  const query = `
    SELECT DISTINCT
      u.id,
      u.full_name,
      u.profile_picture_url
    FROM users u
    JOIN fitness_classes fc ON u.id = fc.trainer_id
    WHERE u.role = 'trainer' AND fc.is_active = true
    ORDER BY u.full_name
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

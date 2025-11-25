/**
 * ========================================
 * Trainer-Client Relationship Module
 * ========================================
 * 
 * Manages trainer-client relationships with request/accept flow
 * 
 * @module db/trainerClients
 */

import pool from '../config/db.js';

/**
 * Create a trainer request from member to trainer
 * @param {number} memberId - Member user ID
 * @param {number} trainerId - Trainer user ID
 * @param {string} message - Optional message from member
 * @returns {Object} Created request
 */
export const createTrainerRequest = async (memberId, trainerId, message = '') => {
  // Check if request already exists
  const existingRequest = await pool.query(
    `SELECT * FROM trainer_client_requests 
     WHERE member_id = $1 AND trainer_id = $2 AND status IN ('pending', 'accepted')`,
    [memberId, trainerId]
  );

  if (existingRequest.rows.length > 0) {
    const status = existingRequest.rows[0].status;
    if (status === 'accepted') {
      throw new Error('You are already a client of this trainer');
    } else {
      throw new Error('You already have a pending request with this trainer');
    }
  }

  const query = `
    INSERT INTO trainer_client_requests (member_id, trainer_id, message, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *
  `;

  const result = await pool.query(query, [memberId, trainerId, message]);
  return result.rows[0];
};

/**
 * Get all pending requests for a trainer
 * @param {number} trainerId - Trainer user ID
 * @returns {Array} Array of pending requests with member details
 */
export const getTrainerPendingRequests = async (trainerId) => {
  const query = `
    SELECT 
      tcr.*,
      u.full_name as member_name,
      u.email as member_email,
      u.profile_picture_url as member_picture
    FROM trainer_client_requests tcr
    JOIN users u ON tcr.member_id = u.id
    WHERE tcr.trainer_id = $1 AND tcr.status = 'pending'
    ORDER BY tcr.created_at DESC
  `;

  const result = await pool.query(query, [trainerId]);
  return result.rows;
};

/**
 * Get all accepted clients for a trainer with stats
 * @param {number} trainerId - Trainer user ID
 * @returns {Array} Array of clients with booking stats
 */
export const getTrainerClients = async (trainerId) => {
  const query = `
    SELECT 
      tcr.id as relationship_id,
      tcr.accepted_at,
      u.id as member_id,
      u.full_name as member_name,
      u.email as member_email,
      u.profile_picture_url as member_picture,
      u.created_at as member_since,
      COUNT(DISTINCT cb.id) FILTER (WHERE cb.booking_status = 'confirmed') as total_bookings,
      COUNT(DISTINCT cb.id) FILTER (
        WHERE cb.booking_status = 'confirmed' 
        AND cs.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
      ) as recent_bookings,
      MAX(cs.scheduled_date) FILTER (
        WHERE cb.booking_status = 'confirmed'
      ) as last_booking_date
    FROM trainer_client_requests tcr
    JOIN users u ON tcr.member_id = u.id
    LEFT JOIN class_bookings cb ON cb.user_id = u.id
    LEFT JOIN class_schedules cs ON cs.id = cb.schedule_id
    LEFT JOIN fitness_classes fc ON fc.id = cs.class_id AND fc.trainer_id = $1
    WHERE tcr.trainer_id = $1 AND tcr.status = 'accepted'
    GROUP BY tcr.id, tcr.accepted_at, u.id, u.full_name, u.email, u.profile_picture_url, u.created_at
    ORDER BY tcr.accepted_at DESC
  `;

  const result = await pool.query(query, [trainerId]);
  return result.rows;
};

/**
 * Accept a trainer request
 * @param {number} requestId - Request ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {Object} Updated request
 */
export const acceptTrainerRequest = async (requestId, trainerId) => {
  const query = `
    UPDATE trainer_client_requests
    SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND trainer_id = $2 AND status = 'pending'
    RETURNING *
  `;

  const result = await pool.query(query, [requestId, trainerId]);
  
  if (result.rows.length === 0) {
    throw new Error('Request not found or already processed');
  }

  return result.rows[0];
};

/**
 * Reject a trainer request
 * @param {number} requestId - Request ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {Object} Updated request
 */
export const rejectTrainerRequest = async (requestId, trainerId) => {
  const query = `
    UPDATE trainer_client_requests
    SET status = 'rejected'
    WHERE id = $1 AND trainer_id = $2 AND status = 'pending'
    RETURNING *
  `;

  const result = await pool.query(query, [requestId, trainerId]);
  
  if (result.rows.length === 0) {
    throw new Error('Request not found or already processed');
  }

  return result.rows[0];
};

/**
 * Remove a client (trainer ends relationship)
 * @param {number} relationshipId - Relationship ID
 * @param {number} trainerId - Trainer ID (for authorization)
 * @returns {boolean} Success status
 */
export const removeClient = async (relationshipId, trainerId) => {
  const query = `
    DELETE FROM trainer_client_requests
    WHERE id = $1 AND trainer_id = $2 AND status = 'accepted'
    RETURNING id
  `;

  const result = await pool.query(query, [relationshipId, trainerId]);
  return result.rows.length > 0;
};

/**
 * Get member's current trainer
 * @param {number} memberId - Member user ID
 * @returns {Object|null} Trainer details or null
 */
export const getMemberTrainer = async (memberId) => {
  const query = `
    SELECT 
      tcr.id as relationship_id,
      tcr.accepted_at,
      u.id as trainer_id,
      u.full_name as trainer_name,
      u.email as trainer_email,
      u.profile_picture_url as trainer_picture,
      u.bio,
      COUNT(DISTINCT fc.id) as total_classes
    FROM trainer_client_requests tcr
    JOIN users u ON tcr.trainer_id = u.id
    LEFT JOIN fitness_classes fc ON fc.trainer_id = u.id AND fc.is_active = true
    WHERE tcr.member_id = $1 AND tcr.status = 'accepted'
    GROUP BY tcr.id, tcr.accepted_at, u.id, u.full_name, u.email, u.profile_picture_url, u.bio
    LIMIT 1
  `;

  const result = await pool.query(query, [memberId]);
  return result.rows[0] || null;
};

/**
 * Get member's pending trainer requests
 * @param {number} memberId - Member user ID
 * @returns {Array} Array of pending requests
 */
export const getMemberPendingRequests = async (memberId) => {
  const query = `
    SELECT 
      tcr.*,
      u.full_name as trainer_name,
      u.email as trainer_email,
      u.profile_picture_url as trainer_picture
    FROM trainer_client_requests tcr
    JOIN users u ON tcr.trainer_id = u.id
    WHERE tcr.member_id = $1 AND tcr.status = 'pending'
    ORDER BY tcr.created_at DESC
  `;

  const result = await pool.query(query, [memberId]);
  return result.rows;
};

/**
 * Get all available trainers (for member to choose from)
 * @returns {Array} Array of trainers with stats
 */
export const getAvailableTrainers = async () => {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.profile_picture_url,
      u.bio,
      COUNT(DISTINCT fc.id) as total_classes,
      COUNT(DISTINCT tcr.id) as total_clients
    FROM users u
    LEFT JOIN fitness_classes fc ON fc.trainer_id = u.id AND fc.is_active = true
    LEFT JOIN trainer_client_requests tcr ON tcr.trainer_id = u.id AND tcr.status = 'accepted'
    WHERE u.role = 'trainer'
    GROUP BY u.id, u.full_name, u.email, u.profile_picture_url, u.bio
    ORDER BY total_clients DESC, u.full_name ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

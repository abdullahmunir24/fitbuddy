/**
 * ========================================
 * User Database Functions
 * ========================================
 * 
 * Database operations for user management using PostgreSQL
 * Replaces the mock user data with real database queries
 * 
 * @module db/users
 */

import { query } from '../config/db.js';

/**
 * Find a user by email address
 * 
 * @param {string} email - The email address to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 * 
 * @example
 * const user = await findUserByEmail('john@fitbuddy.com');
 */
export const findUserByEmail = async (email) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Find a user by ID
 * 
 * @param {number} id - The user ID to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 * 
 * @example
 * const user = await findUserById(1);
 */
export const findUserById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

/**
 * Get all users (for admin purposes)
 * 
 * @param {number} limit - Maximum number of users to return
 * @param {number} offset - Number of users to skip
 * @returns {Promise<Array>} Array of user objects
 * 
 * @example
 * const users = await getAllUsers(10, 0);
 */
export const getAllUsers = async (limit = 50, offset = 0) => {
  try {
    const result = await query(
      'SELECT id, username, email, role, full_name, phone, profile_picture_url, bio, is_active, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Create a new user
 * 
 * @param {Object} userData - User data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - Hashed password
 * @param {string} userData.role - User's role (member, trainer, admin)
 * @param {string} userData.username - User's username (optional)
 * @returns {Promise<Object>} Created user object (without password)
 * 
 * @example
 * const newUser = await createUser({
 *   name: 'John Doe',
 *   email: 'john@fitbuddy.com',
 *   password: 'hashedPassword123',
 *   role: 'member'
 * });
 */
export const createUser = async (userData) => {
  try {
    const { name, email, password, role = 'member', username } = userData;
    
    // Generate username from email if not provided
    const userUsername = username || email.split('@')[0];
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, role, full_name, is_active, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, username, email, role, full_name, phone, profile_picture_url, bio, is_active, email_verified, created_at, updated_at`,
      [userUsername, email, password, role, name, true, false]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user's information
 * 
 * @param {number} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user object or null if not found
 * 
 * @example
 * const updated = await updateUser(1, { full_name: 'Jane Doe', bio: 'Fitness enthusiast' });
 */
export const updateUser = async (id, updates) => {
  try {
    // Build dynamic SQL query based on provided fields
    const allowedFields = ['username', 'email', 'full_name', 'phone', 'profile_picture_url', 'bio', 'role', 'is_active', 'email_verified'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Map common field names to database column names
    const fieldMapping = {
      name: 'full_name',
      avatar: 'profile_picture_url'
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMapping[key] || key;
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return null; // No valid fields to update
    }

    // Add updated_at timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, username, email, role, full_name, phone, profile_picture_url, bio, is_active, email_verified, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Update a user's password
 * 
 * @param {number} id - User ID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<boolean>} True if updated successfully
 * 
 * @example
 * await updateUserPassword(1, 'newHashedPassword');
 */
export const updateUserPassword = async (id, newPasswordHash) => {
  try {
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, id]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

/**
 * Delete a user (soft delete - sets is_active to false)
 * 
 * @param {number} id - User ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 * 
 * @example
 * await deleteUser(1);
 */
export const deleteUser = async (id) => {
  try {
    // Soft delete - just deactivate the user
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Permanently delete a user (hard delete)
 * Use with caution - this cannot be undone
 * 
 * @param {number} id - User ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 * 
 * @example
 * await hardDeleteUser(1);
 */
export const hardDeleteUser = async (id) => {
  try {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error hard deleting user:', error);
    throw error;
  }
};

/**
 * Get user count (for pagination)
 * 
 * @returns {Promise<number>} Total number of users
 */
export const getUserCount = async () => {
  try {
    const result = await query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting user count:', error);
    throw error;
  }
};

/**
 * Get user profile data (from user_profiles table)
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile object or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const result = await query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update or create user profile data
 * 
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated/created profile object
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { height_cm, weight_kg, fitness_goal, date_of_birth, gender, experience_level, preferred_workout_types } = profileData;
    
    // Check if profile exists
    const existing = await getUserProfile(userId);
    
    if (existing) {
      // Update existing profile
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (height_cm !== undefined) {
        fields.push(`height_cm = $${paramCount}`);
        values.push(height_cm);
        paramCount++;
      }
      if (weight_kg !== undefined) {
        fields.push(`weight_kg = $${paramCount}`);
        values.push(weight_kg);
        paramCount++;
      }
      if (fitness_goal !== undefined) {
        fields.push(`fitness_goal = $${paramCount}`);
        values.push(fitness_goal);
        paramCount++;
      }
      if (date_of_birth !== undefined) {
        fields.push(`date_of_birth = $${paramCount}`);
        values.push(date_of_birth);
        paramCount++;
      }
      if (gender !== undefined) {
        fields.push(`gender = $${paramCount}`);
        values.push(gender);
        paramCount++;
      }
      if (experience_level !== undefined) {
        fields.push(`experience_level = $${paramCount}`);
        values.push(experience_level);
        paramCount++;
      }
      if (preferred_workout_types !== undefined) {
        fields.push(`preferred_workout_types = $${paramCount}`);
        values.push(preferred_workout_types);
        paramCount++;
      }
      
      if (fields.length === 0) {
        return existing;
      }
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);
      
      const result = await query(
        `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    } else {
      // Create new profile
      const result = await query(
        `INSERT INTO user_profiles (user_id, height_cm, weight_kg, fitness_goal, date_of_birth, gender, experience_level, preferred_workout_types)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, height_cm, weight_kg, fitness_goal, date_of_birth, gender, experience_level, preferred_workout_types]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

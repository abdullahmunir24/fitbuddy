/**
 * ========================================
 * Gym Database Functions
 * ========================================
 * 
 * Database operations for gym management using PostgreSQL
 * Includes geolocation-based queries for finding nearby gyms
 * 
 * @module db/gyms
 */

import { query } from '../config/db.js';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get all gyms with optional filtering and distance calculation
 * 
 * @param {Object} options - Query options
 * @param {number} options.userLat - User's latitude for distance calculation
 * @param {number} options.userLng - User's longitude for distance calculation
 * @param {number} options.radius - Maximum distance in km (default: 50)
 * @param {string} options.city - Filter by city
 * @param {boolean} options.isActive - Filter by active status
 * @returns {Promise<Array>} Array of gym objects with distance
 */
export const getAllGyms = async (options = {}) => {
  try {
    const { userLat, userLng, radius = 50, city, isActive = true } = options;
    
    let queryText = `
      SELECT 
        id, name, description, address, city, province, postal_code,
        phone, email, website_url, latitude, longitude,
        is_approved, is_active, created_at, updated_at
      FROM gyms
      WHERE is_active = $1
    `;
    
    const params = [isActive];
    let paramCount = 2;
    
    // Add city filter if provided
    if (city) {
      queryText += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }
    
    queryText += ' ORDER BY name';
    
    const result = await query(queryText, params);
    let gyms = result.rows;
    
    // Calculate distance if user location provided
    if (userLat && userLng) {
      gyms = gyms.map(gym => {
        const distance = calculateDistance(
          userLat,
          userLng,
          parseFloat(gym.latitude),
          parseFloat(gym.longitude)
        );
        return {
          ...gym,
          distance: parseFloat(distance.toFixed(2))
        };
      });
      
      // Filter by radius if specified
      if (radius) {
        gyms = gyms.filter(gym => gym.distance <= radius);
      }
      
      // Sort by distance
      gyms.sort((a, b) => a.distance - b.distance);
    }
    
    return gyms;
  } catch (error) {
    console.error('Error getting gyms:', error);
    throw error;
  }
};

/**
 * Get gym by ID
 * 
 * @param {number} id - Gym ID
 * @returns {Promise<Object|null>} Gym object or null if not found
 */
export const getGymById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM gyms WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting gym by ID:', error);
    throw error;
  }
};

/**
 * Create a new gym
 * 
 * @param {Object} gymData - Gym data
 * @returns {Promise<Object>} Created gym object
 */
export const createGym = async (gymData) => {
  try {
    const {
      name,
      description,
      address,
      city,
      province,
      postal_code,
      country = 'Canada',
      phone,
      email,
      website_url,
      latitude,
      longitude
    } = gymData;
    
    const result = await query(
      `INSERT INTO gyms (
        name, description, address, city, province, postal_code, country,
        phone, email, website_url, latitude, longitude, is_approved, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name, description, address, city, province, postal_code, country,
        phone, email, website_url, latitude, longitude, true, true
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating gym:', error);
    throw error;
  }
};

/**
 * Update gym information
 * 
 * @param {number} id - Gym ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated gym object or null
 */
export const updateGym = async (id, updates) => {
  try {
    const allowedFields = [
      'name', 'description', 'address', 'city', 'province', 'postal_code',
      'phone', 'email', 'website_url', 'latitude', 'longitude', 'is_active'
    ];
    
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await query(
      `UPDATE gyms SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating gym:', error);
    throw error;
  }
};

/**
 * Delete gym (soft delete)
 * 
 * @param {number} id - Gym ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteGym = async (id) => {
  try {
    const result = await query(
      'UPDATE gyms SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting gym:', error);
    throw error;
  }
};

/**
 * Get gym facilities
 * 
 * @param {number} gymId - Gym ID
 * @returns {Promise<Array>} Array of facility objects
 */
export const getGymFacilities = async (gymId) => {
  try {
    const result = await query(
      'SELECT * FROM gym_facilities WHERE gym_id = $1 AND is_available = true',
      [gymId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting gym facilities:', error);
    throw error;
  }
};

/**
 * Add facility to gym
 * 
 * @param {number} gymId - Gym ID
 * @param {string} facilityName - Name of facility
 * @returns {Promise<Object>} Created facility object
 */
export const addGymFacility = async (gymId, facilityName) => {
  try {
    const result = await query(
      'INSERT INTO gym_facilities (gym_id, facility_name, is_available) VALUES ($1, $2, $3) RETURNING *',
      [gymId, facilityName, true]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding gym facility:', error);
    throw error;
  }
};

/**
 * Search gyms by name or location
 * 
 * @param {string} searchTerm - Search term
 * @param {number} userLat - User latitude
 * @param {number} userLng - User longitude
 * @returns {Promise<Array>} Array of matching gyms
 */
export const searchGyms = async (searchTerm, userLat, userLng) => {
  try {
    const result = await query(
      `SELECT * FROM gyms 
       WHERE is_active = true 
       AND (
         LOWER(name) LIKE LOWER($1) OR 
         LOWER(city) LIKE LOWER($1) OR 
         LOWER(address) LIKE LOWER($1)
       )
       ORDER BY name`,
      [`%${searchTerm}%`]
    );
    
    let gyms = result.rows;
    
    // Add distance if user location provided
    if (userLat && userLng) {
      gyms = gyms.map(gym => ({
        ...gym,
        distance: calculateDistance(
          userLat,
          userLng,
          parseFloat(gym.latitude),
          parseFloat(gym.longitude)
        ).toFixed(2)
      }));
      
      gyms.sort((a, b) => a.distance - b.distance);
    }
    
    return gyms;
  } catch (error) {
    console.error('Error searching gyms:', error);
    throw error;
  }
};


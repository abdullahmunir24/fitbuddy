/**
 * ========================================
 * Gym Routes
 * ========================================
 * 
 * Handles gym finder and management:
 * - GET /api/gyms - Get all gyms (with location filtering)
 * - GET /api/gyms/search - Search gyms
 * - GET /api/gyms/:id - Get specific gym
 * - POST /api/gyms - Create gym (admin only)
 * - PUT /api/gyms/:id - Update gym (admin only)
 * - DELETE /api/gyms/:id - Delete gym (admin only)
 * - GET /api/gyms/:id/facilities - Get gym facilities
 * 
 * @module routes/gymRoutes
 */

import express from 'express';
import {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  getGymFacilities,
  searchGyms,
} from '../db/gyms.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * GET /api/gyms
 * ========================================
 * 
 * Get all gyms with optional location-based filtering
 * 
 * Query Parameters:
 * - lat: User's latitude (optional)
 * - lng: User's longitude (optional)
 * - radius: Maximum distance in km (default: 50)
 * - city: Filter by city (optional)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Gyms retrieved successfully",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Anytime Fitness",
 *       "address": "1677 Commerce Ave #110",
 *       "city": "Kelowna",
 *       "distance": 2.3,  // Only if lat/lng provided
 *       ...
 *     }
 *   ]
 * }
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius, city } = req.query;
    
    const options = {
      userLat: lat ? parseFloat(lat) : null,
      userLng: lng ? parseFloat(lng) : null,
      radius: radius ? parseFloat(radius) : 50,
      city: city || null,
    };
    
    const gyms = await getAllGyms(options);
    
    res.status(200).json({
      success: true,
      message: 'Gyms retrieved successfully',
      data: gyms,
      count: gyms.length,
    });
  } catch (error) {
    console.error('Error getting gyms:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving gyms',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/gyms/search
 * ========================================
 * 
 * Search gyms by name, city, or address
 * 
 * Query Parameters:
 * - q: Search query
 * - lat: User's latitude (optional, for distance calculation)
 * - lng: User's longitude (optional, for distance calculation)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    
    const gyms = await searchGyms(q, userLat, userLng);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: gyms,
      count: gyms.length,
    });
  } catch (error) {
    console.error('Error searching gyms:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching gyms',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/gyms/:id
 * ========================================
 * 
 * Get specific gym by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const gymId = parseInt(req.params.id);
    
    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gym ID',
      });
    }
    
    const gym = await getGymById(gymId);
    
    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Gym not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Gym retrieved successfully',
      data: gym,
    });
  } catch (error) {
    console.error('Error getting gym:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving gym',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * POST /api/gyms
 * ========================================
 * 
 * Create new gym (Admin only)
 * 
 * Request Body:
 * {
 *   "name": "Gym Name",
 *   "address": "123 Main St",
 *   "city": "Kelowna",
 *   "province": "BC",
 *   "latitude": 49.8880,
 *   "longitude": -119.4960,
 *   ...
 * }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create gyms',
      });
    }
    
    const {
      name,
      description,
      address,
      city,
      province,
      postal_code,
      phone,
      email,
      website_url,
      latitude,
      longitude,
    } = req.body;
    
    // Validate required fields
    if (!name || !address || !city || !province) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, city, and province are required',
      });
    }
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }
    
    const gymData = {
      name,
      description,
      address,
      city,
      province,
      postal_code,
      phone,
      email,
      website_url,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    
    const newGym = await createGym(gymData);
    
    res.status(201).json({
      success: true,
      message: 'Gym created successfully',
      data: newGym,
    });
  } catch (error) {
    console.error('Error creating gym:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating gym',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * PUT /api/gyms/:id
 * ========================================
 * 
 * Update gym (Admin only)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    const gymId = parseInt(req.params.id);
    
    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gym ID',
      });
    }
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update gyms',
      });
    }
    
    const gym = await getGymById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Gym not found',
      });
    }
    
    const updates = req.body;
    const updatedGym = await updateGym(gymId, updates);
    
    res.status(200).json({
      success: true,
      message: 'Gym updated successfully',
      data: updatedGym,
    });
  } catch (error) {
    console.error('Error updating gym:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gym',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * DELETE /api/gyms/:id
 * ========================================
 * 
 * Delete gym (Admin only)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    const gymId = parseInt(req.params.id);
    
    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gym ID',
      });
    }
    
    // Check if user is admin
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete gyms',
      });
    }
    
    const gym = await getGymById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Gym not found',
      });
    }
    
    const deleted = await deleteGym(gymId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete gym',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Gym deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gym:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gym',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * GET /api/gyms/:id/facilities
 * ========================================
 * 
 * Get gym facilities
 */
router.get('/:id/facilities', async (req, res) => {
  try {
    const gymId = parseInt(req.params.id);
    
    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gym ID',
      });
    }
    
    const facilities = await getGymFacilities(gymId);
    
    res.status(200).json({
      success: true,
      message: 'Facilities retrieved successfully',
      data: facilities,
    });
  } catch (error) {
    console.error('Error getting facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving facilities',
      error: error.message,
    });
  }
});

export default router;


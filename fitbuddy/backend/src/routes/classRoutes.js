/**
 * ========================================
 * Class Routes
 * ========================================
 * 
 * Handles all fitness class-related endpoints for both trainers and members
 * 
 * Trainer endpoints:
 * - POST /api/classes - Create a new class
 * - POST /api/classes/:id/schedules - Create a schedule for a class
 * - GET /api/classes/trainer - Get trainer's classes
 * - GET /api/classes/:id - Get class details
 * - PUT /api/classes/:id - Update a class
 * - DELETE /api/classes/:id - Delete a class
 * - GET /api/classes/:id/schedules - Get schedules for a class
 * - GET /api/classes/schedules/:scheduleId/bookings - Get bookings for a schedule
 * 
 * Member endpoints:
 * - GET /api/classes - Get all available classes
 * - GET /api/classes/my-bookings - Get member's bookings
 * - POST /api/classes/book - Book a class
 * - DELETE /api/classes/bookings/:id - Cancel a booking
 * - GET /api/classes/filters - Get filter options (types, trainers)
 * 
 * @module routes/classRoutes
 */

import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  createClass,
  createClassSchedule,
  getTrainerClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassSchedules,
  getScheduleBookings,
  getAvailableClasses,
  getMemberBookings,
  bookClass,
  cancelBooking,
  getClassTypes,
  getClassTrainers,
} from '../db/classes.js';

const router = express.Router();

/**
 * ========================================
 * FILTER & METADATA ENDPOINTS
 * ========================================
 */

/**
 * GET /api/classes/filters
 * Get filter options for classes (types and trainers)
 * Public endpoint
 */
router.get('/filters', async (req, res) => {
  try {
    const [classTypes, trainers] = await Promise.all([
      getClassTypes(),
      getClassTrainers(),
    ]);

    res.json({
      success: true,
      data: {
        classTypes,
        trainers,
        difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      },
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * MEMBER ENDPOINTS
 * ========================================
 */

/**
 * GET /api/classes
 * Get all available classes (for members)
 * Protected endpoint
 * 
 * Query params:
 * - trainer_id: Filter by trainer
 * - class_type: Filter by class type
 * - difficulty_level: Filter by difficulty
 * - date_from: Filter from date
 * - date_to: Filter to date
 * - gym_id: Filter by gym
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      trainer_id: req.query.trainer_id,
      class_type: req.query.class_type,
      difficulty_level: req.query.difficulty_level,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      gym_id: req.query.gym_id,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const classes = await getAvailableClasses(filters);

    res.json({
      success: true,
      message: 'Classes retrieved successfully',
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message,
    });
  }
});

/**
 * GET /api/classes/my-bookings
 * Get member's booked classes
 * Protected endpoint - Members only
 */
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status; // Optional: filter by booking status

    const bookings = await getMemberBookings(userId, status);

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
});

/**
 * POST /api/classes/book
 * Book a class
 * Protected endpoint - Members only
 * 
 * Body:
 * - schedule_id: ID of the class schedule to book
 */
router.post('/book', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { schedule_id } = req.body;

    if (!schedule_id) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID is required',
      });
    }

    // Check if user is a member
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Only members can book classes',
      });
    }

    const booking = await bookClass(schedule_id, userId);

    res.status(201).json({
      success: true,
      message: 'Class booked successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error booking class:', error);
    
    if (error.message === 'Class is full' || 
        error.message === 'You have already booked this class' ||
        error.message === 'Class schedule not found or not available') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to book class',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/classes/bookings/:id
 * Cancel a booking
 * Protected endpoint - Members only
 */
router.delete('/bookings/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const cancelledBooking = await cancelBooking(bookingId, userId);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelledBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    
    if (error.message === 'Booking not found or already cancelled' ||
        error.message === 'Cannot cancel past classes') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
});

/**
 * ========================================
 * TRAINER ENDPOINTS
 * ========================================
 */

/**
 * GET /api/classes/trainer
 * Get all classes for the authenticated trainer
 * Protected endpoint - Trainers only
 */
router.get('/trainer', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can access this endpoint',
      });
    }

    const classes = await getTrainerClasses(userId);

    res.json({
      success: true,
      message: 'Trainer classes retrieved successfully',
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error('Error fetching trainer classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer classes',
      error: error.message,
    });
  }
});

/**
 * POST /api/classes
 * Create a new class
 * Protected endpoint - Trainers only
 * 
 * Body:
 * - gym_id: Gym where class is held
 * - class_name: Name of the class
 * - description: Class description
 * - class_type: Type of class (e.g., 'yoga', 'HIIT')
 * - difficulty_level: 'beginner', 'intermediate', or 'advanced'
 * - max_capacity: Maximum number of participants
 * - duration_minutes: Duration in minutes
 * - price: Price (optional, defaults to 0)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can create classes',
      });
    }

    const {
      gym_id,
      class_name,
      description,
      class_type,
      difficulty_level,
      max_capacity,
      duration_minutes,
      price,
    } = req.body;

    // Validation
    if (!class_name || !class_type || !difficulty_level || !max_capacity || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level',
      });
    }

    const classData = {
      trainer_id: userId,
      gym_id: gym_id || null,
      class_name,
      description,
      class_type,
      difficulty_level,
      max_capacity: parseInt(max_capacity),
      duration_minutes: parseInt(duration_minutes),
      price: price ? parseFloat(price) : 0.00,
    };

    const newClass = await createClass(classData);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class',
      error: error.message,
    });
  }
});

/**
 * POST /api/classes/:id/schedules
 * Create a schedule for a class
 * Protected endpoint - Trainers only
 * 
 * Body:
 * - scheduled_date: Date of the class (YYYY-MM-DD)
 * - start_time: Start time (HH:MM:SS)
 * - end_time: End time (HH:MM:SS)
 */
router.post('/:id/schedules', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const classId = parseInt(req.params.id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can create schedules',
      });
    }

    // Verify trainer owns this class
    const classDetails = await getClassById(classId, userId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have permission',
      });
    }

    const { scheduled_date, start_time, end_time } = req.body;

    if (!scheduled_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const scheduleData = {
      class_id: classId,
      scheduled_date,
      start_time,
      end_time,
    };

    const newSchedule = await createClassSchedule(scheduleData);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newSchedule,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message,
    });
  }
});

/**
 * GET /api/classes/:id
 * Get class details
 * Protected endpoint
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    const classDetails = await getClassById(classId, userId);

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.json({
      success: true,
      data: classDetails,
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class details',
      error: error.message,
    });
  }
});

/**
 * PUT /api/classes/:id
 * Update a class
 * Protected endpoint - Trainers only
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can update classes',
      });
    }

    const updates = req.body;

    // Validate difficulty level if provided
    if (updates.difficulty_level && !['beginner', 'intermediate', 'advanced'].includes(updates.difficulty_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level',
      });
    }

    const updatedClass = await updateClass(classId, userId, updates);

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have permission',
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/classes/:id
 * Delete a class (soft delete)
 * Protected endpoint - Trainers only
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can delete classes',
      });
    }

    const deleted = await deleteClass(classId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have permission',
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message,
    });
  }
});

/**
 * GET /api/classes/:id/schedules
 * Get all schedules for a class
 * Protected endpoint - Trainers only
 */
router.get('/:id/schedules', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can view schedules',
      });
    }

    const schedules = await getClassSchedules(classId, userId);

    res.json({
      success: true,
      message: 'Schedules retrieved successfully',
      data: schedules,
      count: schedules.length,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message,
    });
  }
});

/**
 * GET /api/classes/schedules/:scheduleId/bookings
 * Get all bookings for a specific schedule
 * Protected endpoint - Trainers only
 */
router.get('/schedules/:scheduleId/bookings', requireAuth, async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const userId = req.user.id;

    if (isNaN(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID',
      });
    }

    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can view bookings',
      });
    }

    const bookings = await getScheduleBookings(scheduleId, userId);

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
});

export default router;

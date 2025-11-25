/**
 * ========================================
 * Trainer-Client Routes
 * ========================================
 * 
 * Handles trainer-client relationship endpoints
 * 
 * Member endpoints:
 * - GET /api/trainer-clients/trainers - Get all available trainers
 * - POST /api/trainer-clients/request - Send trainer request
 * - GET /api/trainer-clients/my-trainer - Get current trainer
 * - GET /api/trainer-clients/my-requests - Get pending requests
 * 
 * Trainer endpoints:
 * - GET /api/trainer-clients/requests - Get pending requests
 * - GET /api/trainer-clients/clients - Get accepted clients
 * - POST /api/trainer-clients/accept/:id - Accept request
 * - POST /api/trainer-clients/reject/:id - Reject request
 * - DELETE /api/trainer-clients/:id - Remove client
 * 
 * @module routes/trainerClientRoutes
 */

import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  createTrainerRequest,
  getTrainerPendingRequests,
  getTrainerClients,
  acceptTrainerRequest,
  rejectTrainerRequest,
  removeClient,
  getMemberTrainer,
  getMemberPendingRequests,
  getAvailableTrainers,
} from '../db/trainerClients.js';

const router = express.Router();

/**
 * ========================================
 * MEMBER ENDPOINTS
 * ========================================
 */

/**
 * GET /api/trainer-clients/trainers
 * Get all available trainers
 * Protected endpoint - Members only
 */
router.get('/trainers', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Only members can view trainers',
      });
    }

    const trainers = await getAvailableTrainers();

    res.json({
      success: true,
      data: trainers,
      count: trainers.length,
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers',
      error: error.message,
    });
  }
});

/**
 * POST /api/trainer-clients/request
 * Send a trainer request
 * Protected endpoint - Members only
 * 
 * Body:
 * - trainer_id: ID of the trainer to request
 * - message: Optional message to the trainer
 */
router.post('/request', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Only members can request trainers',
      });
    }

    const { trainer_id, message } = req.body;

    if (!trainer_id) {
      return res.status(400).json({
        success: false,
        message: 'Trainer ID is required',
      });
    }

    const request = await createTrainerRequest(req.user.id, trainer_id, message);

    res.status(201).json({
      success: true,
      message: 'Trainer request sent successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error creating trainer request:', error);
    
    if (error.message.includes('already')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send trainer request',
      error: error.message,
    });
  }
});

/**
 * GET /api/trainer-clients/my-trainer
 * Get member's current trainer
 * Protected endpoint - Members only
 */
router.get('/my-trainer', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Only members can view their trainer',
      });
    }

    const trainer = await getMemberTrainer(req.user.id);

    res.json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    console.error('Error fetching member trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer',
      error: error.message,
    });
  }
});

/**
 * GET /api/trainer-clients/my-requests
 * Get member's pending trainer requests
 * Protected endpoint - Members only
 */
router.get('/my-requests', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Only members can view their requests',
      });
    }

    const requests = await getMemberPendingRequests(req.user.id);

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching member requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
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
 * GET /api/trainer-clients/requests
 * Get pending requests for trainer
 * Protected endpoint - Trainers only
 */
router.get('/requests', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can view requests',
      });
    }

    const requests = await getTrainerPendingRequests(req.user.id);

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching trainer requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message,
    });
  }
});

/**
 * GET /api/trainer-clients/clients
 * Get all accepted clients for trainer
 * Protected endpoint - Trainers only
 */
router.get('/clients', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can view clients',
      });
    }

    const clients = await getTrainerClients(req.user.id);

    res.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error('Error fetching trainer clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message,
    });
  }
});

/**
 * POST /api/trainer-clients/accept/:id
 * Accept a trainer request
 * Protected endpoint - Trainers only
 */
router.post('/accept/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can accept requests',
      });
    }

    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const acceptedRequest = await acceptTrainerRequest(requestId, req.user.id);

    res.json({
      success: true,
      message: 'Client request accepted',
      data: acceptedRequest,
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to accept request',
      error: error.message,
    });
  }
});

/**
 * POST /api/trainer-clients/reject/:id
 * Reject a trainer request
 * Protected endpoint - Trainers only
 */
router.post('/reject/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can reject requests',
      });
    }

    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const rejectedRequest = await rejectTrainerRequest(requestId, req.user.id);

    res.json({
      success: true,
      message: 'Client request rejected',
      data: rejectedRequest,
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/trainer-clients/:id
 * Remove a client (end relationship)
 * Protected endpoint - Trainers only
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can remove clients',
      });
    }

    const relationshipId = parseInt(req.params.id);

    if (isNaN(relationshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid relationship ID',
      });
    }

    const removed = await removeClient(relationshipId, req.user.id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Client relationship not found',
      });
    }

    res.json({
      success: true,
      message: 'Client removed successfully',
    });
  } catch (error) {
    console.error('Error removing client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove client',
      error: error.message,
    });
  }
});

export default router;

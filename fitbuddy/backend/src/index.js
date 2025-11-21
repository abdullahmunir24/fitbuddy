/**
 * ========================================
 * FitBuddy Backend - Main Server File
 * ========================================
 * 
 * This is the entry point for the FitBuddy backend API server.
 * It sets up and configures the Express application with:
 * - Environment variables
 * - CORS for cross-origin requests
 * - JSON body parsing
 * - Authentication routes
 * - Error handling
 * - Server startup
 * 
 * Architecture:
 * - Express.js web framework
 * - RESTful API design
 * - JWT-based authentication
 * - Modular route structure
 * 
 * @module index
 */

import 'dotenv/config'; // Load environment variables from .env file
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import classRoutes from './routes/classRoutes.js';
import trainerClientRoutes from './routes/trainerClientRoutes.js';


/**
 * =====================================
 * Initialize Express Application
 * =====================================
 */
const app = express();

/**
 * Get configuration from environment variables
 * with fallback defaults for development
 */
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * =====================================
 * Global Middleware
 * =====================================
 */

/**
 * CORS (Cross-Origin Resource Sharing)
 * Allows the frontend to make requests to this API
 * 
 * Configuration:
 * - origin: Frontend URL that's allowed to access the API
 * - credentials: Allow cookies and authorization headers
 * - methods: HTTP methods allowed
 * - allowedHeaders: Headers allowed in requests
 * 
 * TODO: In production, restrict origin to specific domains
 * TODO: Consider using a CORS whitelist for multiple frontend domains
 */
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Body Parser Middleware
 * Parses incoming JSON requests and makes data available in req.body
 * 
 * Limits:
 * - limit: Maximum request body size (prevents large payload attacks)
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL-encoded body parser
 * Parses URL-encoded form data (if needed for form submissions)
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware (development only)
 * Logs all incoming requests for debugging
 * 
 * TODO: Replace with a proper logging library like Winston or Morgan in production
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/**
 * =====================================
 * API Routes
 * =====================================
 */

/**
 * Health check endpoint
 * Used to verify the server is running
 * 
 * GET /
 * Response: { message: "FitBuddy API is running", version: "1.0.0", timestamp: "..." }
 */
app.get('/', (req, res) => {
  res.json({
    message: 'FitBuddy API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      health: '/health',
    },
  });
});

/**
 * Detailed health check endpoint
 * Used by monitoring tools to check server status
 * 
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Authentication routes
 * All auth-related endpoints are mounted under /api/auth
 * 
 * Available endpoints:
 * - POST /api/auth/signup - Register new user
 * - POST /api/auth/login - Authenticate user
 * - GET /api/auth/me - Get current user (protected)
 */
app.use('/api/auth', authRoutes);

/**
 * User Profile routes
 * All user profile management endpoints under /api/users
 * 
 * Available endpoints:
 * - GET /api/users/:id - Get user profile (protected)
 * - PUT /api/users/:id - Update user profile (protected)
 * - DELETE /api/users/:id - Delete user account (protected)
 * - GET /api/users/:id/stats - Get user statistics (protected)
 */
app.use('/api/users', userRoutes);

/**
 * Workout routes
 * All workout management endpoints under /api/workouts
 * 
 * Available endpoints:
 * - POST /api/workouts - Create new workout (protected)
 * - GET /api/workouts - Get all workouts with pagination (protected)
 * - GET /api/workouts/:id - Get specific workout (protected)
 * - PUT /api/workouts/:id - Update workout (protected)
 * - DELETE /api/workouts/:id - Delete workout (protected)
 * - GET /api/users/:userId/workouts - Get user's workouts (protected)
 */
app.use('/api/workouts', workoutRoutes);

/**
 * Exercise routes
 * All exercise management endpoints under /api/exercises
 * 
 * Available endpoints:
 * - GET /api/exercises - Get all exercises (public)
 * - GET /api/exercises/:id - Get exercise by ID (public)
 * - POST /api/exercises - Create new exercise (protected, admin only)
 * - PUT /api/exercises/:id - Update exercise (protected, admin only)
 * - DELETE /api/exercises/:id - Delete exercise (protected, admin only)
 */
app.use('/api/exercises', exerciseRoutes);

/**
 * Workout Session/Log routes
 * All workout session and logging endpoints under /api/sessions
 * 
 * Available endpoints:
 * - POST /api/sessions - Create new session (protected)
 * - GET /api/sessions - Get all sessions with pagination (protected)
 * - GET /api/sessions/:id - Get specific session (protected)
 * - PUT /api/sessions/:id - Update session (protected)
 * - DELETE /api/sessions/:id - Delete session (protected)
 * - GET /api/users/:userId/sessions - Get user's sessions (protected)
 * - GET /api/sessions/stats/:userId - Get user session statistics (protected)
 */
app.use('/api/sessions', sessionRoutes);

/**
 * Gym routes
 * All gym finder and management endpoints under /api/gyms
 * 
 * Available endpoints:
 * - GET /api/gyms - Get all gyms (with optional location filtering)
 * - GET /api/gyms/search - Search gyms
 * - GET /api/gyms/:id - Get specific gym (public)
 * - POST /api/gyms - Create gym (protected, admin only)
 * - PUT /api/gyms/:id - Update gym (protected, admin only)
 * - DELETE /api/gyms/:id - Delete gym (protected, admin only)
 */
app.use('/api/gyms', gymRoutes);

/**
 * Class routes
 * All fitness class management endpoints under /api/classes
 * 
 * Available endpoints:
 * - GET /api/classes - Get all available classes (members)
 * - GET /api/classes/filters - Get filter options
 * - GET /api/classes/my-bookings - Get member's bookings
 * - POST /api/classes/book - Book a class
 * - DELETE /api/classes/bookings/:id - Cancel a booking
 * - GET /api/classes/trainer - Get trainer's classes
 * - POST /api/classes - Create a class (trainers)
 * - GET /api/classes/:id - Get class details
 * - PUT /api/classes/:id - Update a class
 * - DELETE /api/classes/:id - Delete a class
 */
app.use('/api/classes', classRoutes);

/**
 * Trainer-Client Routes
 * Base path: /api/trainer-clients
 * 
 * Member endpoints:
 * - GET /api/trainer-clients/trainers - Get available trainers
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
 */
app.use('/api/trainer-clients', trainerClientRoutes);

/**
 * =====================================
 * Error Handling Middleware
 * =====================================
 */

/**
 * 404 Not Found Handler
 * Catches all requests to undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/auth/me',
    ],
  });
});

/**
 * Global Error Handler
 * Catches all errors that occur in routes and middleware
 * 
 * This should be the last middleware in the chain
 * 
 * TODO: Enhance error handling
 * 1. Add error logging service (e.g., Sentry, LogRocket)
 * 2. Send different error messages for development vs production
 * 3. Add error codes for frontend to handle specific errors
 */
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Determine status code (default to 500 if not set)
  const statusCode = error.statusCode || 500;
  
  // In production, don't leak error details
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred'
    : error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

/**
 * =====================================
 * Start Server
 * =====================================
 */

/**
 * Seed default users for testing
 * Creates a member and trainer account if they don't exist
 */
const seedDefaultUsers = async () => {
  const defaultUsers = [
    {
      username: 'member',
      email: 'member@gmail.com',
      password: 'member123',
      full_name: 'Member User',
      role: 'member',
    },
    {
      username: 'trainer',
      email: 'trainer@gmail.com',
      password: 'trainer123',
      full_name: 'Trainer User',
      role: 'trainer',
    },
  ];

  for (const user of defaultUsers) {
    try {
      // Check if user already exists
      const checkQuery = 'SELECT id FROM users WHERE email = $1';
      const checkResult = await pool.query(checkQuery, [user.email]);
      
      if (checkResult.rows.length > 0) {
        console.log(`✅ Default ${user.role} user already exists: ${user.email}`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insert user
      const insertQuery = `
        INSERT INTO users (username, email, password_hash, full_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, role
      `;
      
      const values = [
        user.username,
        user.email,
        hashedPassword,
        user.full_name,
        user.role,
        true,  // is_active
        true   // email_verified
      ];
      
      const result = await pool.query(insertQuery, values);
      console.log(`✅ Created default ${user.role} user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error creating default ${user.role} user:`, error.message);
    }
  }
};

/**
 * Start the Express server
 */
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');
    
    // Seed default users
    console.log('\n🌱 Seeding default users...');
    await seedDefaultUsers();
    console.log('');
    
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('FitBuddy API Server Started');
      console.log('========================================');
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log(`Started at: ${new Date().toISOString()}`);
      console.log('========================================\n');
      console.log('Available endpoints:');
      console.log(`   GET    http://localhost:${PORT}/`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/signup`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
      console.log('\n========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Make sure PostgreSQL is running and DATABASE_URL is correctly configured');
    process.exit(1);
  }
};

startServer();

/**
 * Export app for testing purposes
 * This allows the app to be imported in test files without starting the server
 */
export default app;

/**
 * ========================================
 * TESTING INSTRUCTIONS
 * ========================================
 * 
 * Use these curl commands to test the API endpoints manually:
 * 
 * 1. Check server health:
 * -------------------------------------------
 * curl http://localhost:5000/health
 * 
 * 
 * 2. Register a new user (Signup):
 * -------------------------------------------
 * curl -X POST http://localhost:5000/api/auth/signup \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "John Doe",
 *     "email": "john@fitbuddy.com",
 *     "password": "SecurePass123",
 *     "role": "member"
 *   }'
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUz...",
 *     "user": {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@fitbuddy.com",
 *       "role": "member"
 *     }
 *   }
 * }
 * 
 * 
 * 3. Login with existing user:
 * -------------------------------------------
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "john@fitbuddy.com",
 *     "password": "SecurePass123"
 *   }'
 * 
 * Expected Response: (same as signup)
 * Save the accessToken from the response for the next request!
 * 
 * 
 * 4. Get current user profile (Protected route):
 * -------------------------------------------
 * curl http://localhost:5000/api/auth/me \
 *   -H "Authorization: Bearer YOUR_TOKEN_HERE"
 * 
 * Replace YOUR_TOKEN_HERE with the actual token from login/signup
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@fitbuddy.com",
 *       "role": "member"
 *     }
 *   }
 * }
 * 
 * 
 * 5. Test with invalid credentials:
 * -------------------------------------------
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "wrong@email.com",
 *     "password": "wrongpassword"
 *   }'
 * 
 * Expected Response:
 * {
 *   "success": false,
 *   "message": "Invalid email or password"
 * }
 * 
 * 
 * 6. Test protected route without token:
 * -------------------------------------------
 * curl http://localhost:5000/api/auth/me
 * 
 * Expected Response:
 * {
 *   "success": false,
 *   "message": "No authorization header provided. Please include a valid token."
 * }
 * 
 * 
 * ========================================
 * USING POSTMAN OR THUNDER CLIENT
 * ========================================
 * 
 * For a better testing experience, use:
 * - Postman (https://www.postman.com/)
 * - Thunder Client (VS Code extension)
 * - Insomnia (https://insomnia.rest/)
 * 
 * Create requests with:
 * 1. URL: http://localhost:5000/api/auth/signup
 * 2. Method: POST
 * 3. Headers: Content-Type: application/json
 * 4. Body: JSON with user data
 * 5. For /me endpoint, add Authorization: Bearer <token> header
 */


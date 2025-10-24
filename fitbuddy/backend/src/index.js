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
import authRoutes from './routes/authRoutes.js';

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
 * TODO: Add more route modules here as the app grows
 * 
 * Examples:
 * import userRoutes from './routes/userRoutes.js';
 * import workoutRoutes from './routes/workoutRoutes.js';
 * import classRoutes from './routes/classRoutes.js';
 * import gymRoutes from './routes/gymRoutes.js';
 * 
 * app.use('/api/users', userRoutes);
 * app.use('/api/workouts', workoutRoutes);
 * app.use('/api/classes', classRoutes);
 * app.use('/api/gyms', gymRoutes);
 */

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
 * Start the Express server
 * Only start if this file is run directly (not imported)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 FitBuddy API Server Started');
    console.log('========================================');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('========================================\n');
    console.log('📚 Available endpoints:');
    console.log(`   GET    http://localhost:${PORT}/`);
    console.log(`   GET    http://localhost:${PORT}/health`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/signup`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
    console.log('\n========================================\n');
  });
}

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


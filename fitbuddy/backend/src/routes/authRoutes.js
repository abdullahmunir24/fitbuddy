/**
 * ========================================
 * Authentication Routes
 * ========================================
 * 
 * Handles all authentication-related endpoints:
 * - POST /api/auth/signup - Register a new user
 * - POST /api/auth/login - Authenticate existing user
 * - GET /api/auth/me - Get current user's profile (protected)
 * 
 * All routes follow REST API best practices:
 * - Clear endpoint naming
 * - Proper HTTP status codes
 * - Consistent JSON response format
 * - Comprehensive error handling
 * 
 * @module routes/authRoutes
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/token.js';
import { findUserByEmail, createUser, findUserById } from '../data/mockUsers.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * ========================================
 * POST /api/auth/signup
 * ========================================
 * 
 * Register a new user account
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@fitbuddy.com",
 *   "password": "SecurePass123",
 *   "role": "member" // optional, defaults to "member"
 * }
 * 
 * Response (201 Created):
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
 * Validation:
 * - Name: Required, min 2 characters
 * - Email: Required, valid email format, unique
 * - Password: Required, min 8 characters (for security)
 * - Role: Optional, must be 'member', 'trainer', or 'admin'
 * 
 * TODO: Database integration
 * Replace mock user functions with PostgreSQL queries:
 * 1. Check if email exists: SELECT * FROM users WHERE email = $1
 * 2. Insert new user: INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *
 * 3. Add email verification flow
 * 4. Add CAPTCHA for bot prevention
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // =====================================
    // Step 1: Input Validation
    // =====================================
    
    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long',
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }
    
    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }
    
    // Validate role (if provided)
    const validRoles = ['member', 'trainer', 'admin'];
    const userRole = role || 'member'; // Default to 'member' if not provided
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }
    
    // =====================================
    // Step 2: Check if email already exists
    // =====================================
    
    // TODO: Replace with PostgreSQL query
    // const result = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // const existingUser = result.rows[0];
    
    const existingUser = findUserByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or try logging in.',
      });
    }
    
    // =====================================
    // Step 3: Hash the password
    // =====================================
    
    // Salt rounds: Higher = more secure but slower (10-12 is recommended)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // =====================================
    // Step 4: Create the user
    // =====================================
    
    // TODO: Replace with PostgreSQL INSERT query
    // const result = await pool.query(
    //   'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    //   [name.trim(), email.toLowerCase(), hashedPassword, userRole]
    // );
    // const newUser = result.rows[0];
    
    const newUser = createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });
    
    // =====================================
    // Step 5: Generate JWT token
    // =====================================
    
    const accessToken = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    
    // =====================================
    // Step 6: Send response (excluding password)
    // =====================================
    
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        user: userWithoutPassword,
      },
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
    });
  }
});

/**
 * ========================================
 * POST /api/auth/login
 * ========================================
 * 
 * Authenticate a user and return a JWT token
 * 
 * Request Body:
 * {
 *   "email": "john@fitbuddy.com",
 *   "password": "SecurePass123"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Login successful",
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
 * Error Response (401 Unauthorized):
 * {
 *   "success": false,
 *   "message": "Invalid email or password"
 * }
 * 
 * TODO: Database integration
 * Replace findUserByEmail with PostgreSQL query:
 * const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
 * const user = result.rows[0];
 * 
 * TODO: Security enhancements
 * 1. Add rate limiting to prevent brute force attacks
 * 2. Log failed login attempts
 * 3. Implement account lockout after X failed attempts
 * 4. Add two-factor authentication (2FA) option
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // =====================================
    // Step 1: Input Validation
    // =====================================
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    
    // =====================================
    // Step 2: Find user by email
    // =====================================
    
    // TODO: Replace with PostgreSQL query
    // const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    // const user = result.rows[0];
    
    const user = findUserByEmail(email);
    
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // =====================================
    // Step 3: Verify password
    // =====================================
    
    // Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // =====================================
    // Step 4: Generate JWT token
    // =====================================
    
    const accessToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // =====================================
    // Step 5: Send response (excluding password)
    // =====================================
    
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: userWithoutPassword,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
});

/**
 * ========================================
 * GET /api/auth/me
 * ========================================
 * 
 * Get current authenticated user's profile
 * This is a protected route - requires valid JWT token
 * 
 * Headers:
 * {
 *   "Authorization": "Bearer eyJhbGciOiJIUz..."
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@fitbuddy.com",
 *       "role": "member",
 *       "createdAt": "2025-10-23T..."
 *     }
 *   }
 * }
 * 
 * Error Response (401 Unauthorized):
 * {
 *   "success": false,
 *   "message": "Invalid or expired token"
 * }
 * 
 * Use Cases:
 * - Check if user is still authenticated
 * - Get updated user profile information
 * - Refresh user data in frontend state
 * 
 * TODO: Database integration
 * If you want to get fresh user data from database instead of token:
 * const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
 * const freshUser = result.rows[0];
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    // requireAuth middleware has already verified the token
    // and attached the user to req.user
    
    // =====================================
    // Step 1: Get user from request
    // =====================================
    
    // The user was attached by the requireAuth middleware
    // It's already without the password field
    const user = req.user;
    
    // =====================================
    // Step 2: Optionally fetch fresh data from database
    // =====================================
    
    // TODO: If you want to get the latest user data from PostgreSQL:
    // const result = await pool.query(
    //   'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    //   [user.id]
    // );
    // const freshUser = result.rows[0];
    
    // For now, we'll use the user data from the token
    
    // =====================================
    // Step 3: Send response
    // =====================================
    
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile. Please try again.',
    });
  }
});

/**
 * ========================================
 * Additional Routes for Future Implementation
 * ========================================
 * 
 * TODO: Implement these routes when needed:
 * 
 * 1. POST /api/auth/logout
 *    - Add token to blacklist
 *    - Clear client-side token
 * 
 * 2. POST /api/auth/refresh
 *    - Exchange refresh token for new access token
 *    - Implement refresh token rotation
 * 
 * 3. POST /api/auth/forgot-password
 *    - Send password reset email
 *    - Generate reset token
 * 
 * 4. POST /api/auth/reset-password
 *    - Verify reset token
 *    - Update password
 * 
 * 5. PUT /api/auth/update-profile
 *    - Update user profile information
 *    - Require authentication
 * 
 * 6. PUT /api/auth/change-password
 *    - Update user password
 *    - Require current password verification
 */

export default router;

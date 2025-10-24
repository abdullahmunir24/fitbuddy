/**
 * ========================================
 * Authentication Middleware
 * ========================================
 * 
 * Protects routes by verifying JWT tokens.
 * Only allows requests with valid tokens to proceed to the protected route.
 * 
 * Usage:
 * - Add this middleware to any route that requires authentication
 * - The middleware verifies the token and attaches user data to req.user
 * - Protected routes can then access req.user safely
 * 
 * Flow:
 * 1. Client sends request with Authorization header: "Bearer <token>"
 * 2. Middleware extracts and verifies the token
 * 3. If valid: Attach user data to request and continue
 * 4. If invalid: Return 401 Unauthorized error
 * 
 * @module middleware/requireAuth
 */

import { verifyToken, extractTokenFromHeader } from '../utils/token.js';
import { findUserById } from '../data/mockUsers.js';

/**
 * Middleware to require authentication for protected routes
 * 
 * This middleware:
 * 1. Checks for an Authorization header
 * 2. Extracts the JWT token
 * 3. Verifies the token is valid and not expired
 * 4. Looks up the user from the token data
 * 5. Attaches the user object to req.user for use in route handlers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * // Protect a route with this middleware
 * import requireAuth from './middleware/requireAuth.js';
 * 
 * router.get('/profile', requireAuth, (req, res) => {
 *   // req.user is now available and guaranteed to exist
 *   res.json({ user: req.user });
 * });
 * 
 * @example
 * // Client request with token
 * fetch('/api/profile', {
 *   headers: {
 *     'Authorization': 'Bearer eyJhbGciOiJIUz...'
 *   }
 * });
 * 
 * TODO: Database integration
 * When PostgreSQL is set up, replace findUserById() with:
 * const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
 * const user = result.rows[0];
 * 
 * TODO: Future enhancements
 * 1. Check if token is in blacklist (for logout functionality)
 * 2. Implement token refresh logic
 * 3. Add rate limiting for failed authentication attempts
 * 4. Log authentication attempts for security monitoring
 */
const requireAuth = async (req, res, next) => {
  try {
    // Step 1: Get the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided. Please include a valid token.',
      });
    }
    
    // Step 2: Extract the token from "Bearer <token>" format
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }
    
    // Step 3: Verify the token is valid and not expired
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid or expired token',
      });
    }
    
    // Step 4: Look up the user from the decoded token data
    // TODO: Replace with database query when PostgreSQL is ready
    const user = findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be for a deleted user.',
      });
    }
    
    // Step 5: Attach user to request object (without password!)
    // Remove sensitive data before attaching to request
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    // Step 6: Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

/**
 * Optional middleware to check user role/permissions
 * Use this in addition to requireAuth for role-based access control
 * 
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Only allow trainers and admins
 * router.post('/classes', requireAuth, requireRole(['trainer', 'admin']), createClass);
 * 
 * @example
 * // Only allow admins
 * router.delete('/users/:id', requireAuth, requireRole(['admin']), deleteUser);
 * 
 * TODO: Future enhancement
 * Expand role system with permissions:
 * - Create a permissions table in PostgreSQL
 * - Map roles to specific permissions (create, read, update, delete)
 * - Check permissions instead of just roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Make sure user is attached to request (requireAuth should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }
    
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: ${allowedRoles.join(' or ')}`,
      });
    }
    
    // User has the required role, continue
    next();
  };
};

export default requireAuth;

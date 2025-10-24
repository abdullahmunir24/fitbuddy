/**
 * ========================================
 * JWT Token Utility Functions
 * ========================================
 * 
 * Handles creation and verification of JSON Web Tokens (JWT) for authentication.
 * Tokens are used to securely identify users without storing session data on the server.
 * 
 * Flow:
 * 1. User logs in → Server creates JWT with user data
 * 2. Client stores JWT (localStorage/cookie)
 * 3. Client sends JWT with each request
 * 4. Server verifies JWT to authenticate user
 * 
 * @module utils/token
 */

import jwt from 'jsonwebtoken';

/**
 * Get the JWT secret from environment variables
 * 
 * @throws {Error} If JWT_SECRET is not set in environment variables
 */
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables. Please check your .env file.');
  }
  
  return secret;
};

/**
 * Create a signed JWT token containing user information
 * 
 * The token includes:
 * - userId: Unique identifier for the user
 * - email: User's email address
 * - role: User's role (member, trainer, admin)
 * - iat: Issued at timestamp (automatically added by JWT)
 * - exp: Expiration timestamp (automatically added by JWT)
 * 
 * @param {Object} payload - User data to encode in the token
 * @param {number|string} payload.userId - The user's unique ID
 * @param {string} payload.email - The user's email address
 * @param {string} payload.role - The user's role
 * @param {string} [expiresIn='7d'] - Token expiration time (default: 7 days)
 * @returns {string} Signed JWT token
 * 
 * @example
 * const token = signToken({
 *   userId: 1,
 *   email: 'john@fitbuddy.com',
 *   role: 'member'
 * });
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * @example
 * // Create a token that expires in 1 day
 * const shortLivedToken = signToken(payload, '1d');
 * 
 * TODO: Future enhancements
 * 1. Implement refresh tokens for better security
 * 2. Add token blacklist for logout functionality
 * 3. Store token metadata in database (optional for security auditing)
 */
export const signToken = (payload, expiresIn = '7d') => {
  try {
    const secret = getJWTSecret();
    
    // Sign the token with the payload and secret
    // The token will be valid for the specified duration
    const token = jwt.sign(
      payload,
      secret,
      { 
        expiresIn,
        issuer: 'fitbuddy-api', // Identifies who created the token
        audience: 'fitbuddy-app', // Identifies who the token is for
      }
    );
    
    return token;
  } catch (error) {
    console.error('Error signing token:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode a JWT token
 * 
 * Checks if the token is:
 * - Properly signed with our secret key
 * - Not expired
 * - Has valid structure
 * 
 * @param {string} token - The JWT token to verify
 * @returns {Object} Decoded token payload containing user data
 * @throws {Error} If token is invalid, expired, or malformed
 * 
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log('User ID:', decoded.userId);
 *   console.log('Email:', decoded.email);
 *   console.log('Role:', decoded.role);
 * } catch (error) {
 *   console.error('Invalid token:', error.message);
 * }
 * 
 * Possible errors:
 * - 'jwt expired': Token has passed its expiration time
 * - 'invalid signature': Token was tampered with or signed with wrong secret
 * - 'jwt malformed': Token format is incorrect
 * 
 * TODO: Future enhancements
 * 1. Check if token is in blacklist (for logout functionality)
 * 2. Verify token against database for revoked tokens
 * 3. Add rate limiting for token verification attempts
 */
export const verifyToken = (token) => {
  try {
    const secret = getJWTSecret();
    
    // Verify the token and decode its payload
    // This will throw an error if the token is invalid or expired
    const decoded = jwt.verify(token, secret, {
      issuer: 'fitbuddy-api',
      audience: 'fitbuddy-app',
    });
    
    return decoded;
  } catch (error) {
    // Provide specific error messages for different failure scenarios
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please log in again.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token. Please log in again.');
    } else {
      console.error('Error verifying token:', error.message);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 * 
 * Expected format: "Bearer <token>"
 * 
 * @param {string} authHeader - The Authorization header value
 * @returns {string|null} The extracted token or null if not found
 * 
 * @example
 * const token = extractTokenFromHeader('Bearer eyJhbGciOiJIUz...');
 * // Returns: "eyJhbGciOiJIUz..."
 * 
 * @example
 * const token = extractTokenFromHeader('Invalid format');
 * // Returns: null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract the token part after "Bearer "
  return authHeader.substring(7);
};

/**
 * Decode a token without verifying it (use with caution!)
 * 
 * This is useful for debugging or getting non-sensitive info from expired tokens.
 * NEVER use this for authentication - always use verifyToken() instead.
 * 
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} Decoded payload or null if token is malformed
 * 
 * @example
 * const payload = decodeTokenUnsafe(token);
 * console.log('Token expires at:', new Date(payload.exp * 1000));
 * 
 * WARNING: This does NOT verify the token signature!
 * Use verifyToken() for actual authentication.
 */
export const decodeTokenUnsafe = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

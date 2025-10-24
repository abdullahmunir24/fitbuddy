/**
 * ========================================
 * Mock Users Data Store
 * ========================================
 * 
 * TEMPORARY in-memory storage for user data during development.
 * This will be replaced with PostgreSQL database queries once the database is set up.
 * 
 * Structure:
 * - users: Array storing user objects
 * - Each user has: id, name, email, password (hashed), role, createdAt
 * 
 * @module data/mockUsers
 */

/**
 * In-memory array to store user data
 * 
 * TODO: REPLACE WITH POSTGRESQL DATABASE
 * When database is ready:
 * 1. Create a 'users' table in PostgreSQL with columns:
 *    - id (PRIMARY KEY, AUTO_INCREMENT)
 *    - name (VARCHAR)
 *    - email (VARCHAR, UNIQUE)
 *    - password (VARCHAR - hashed)
 *    - role (VARCHAR with CHECK constraint: 'member', 'trainer', 'admin')
 *    - created_at (TIMESTAMP)
 * 2. Replace this array with database queries using pg (node-postgres)
 * 3. Update all CRUD operations in routes to use SQL queries
 * 
 * @type {Array<Object>}
 */
let users = [];

/**
 * Counter for generating unique user IDs
 * 
 * TODO: Remove when using PostgreSQL AUTO_INCREMENT
 * 
 * @type {number}
 */
let userIdCounter = 1;

/**
 * Find a user by email address
 * 
 * @param {string} email - The email address to search for
 * @returns {Object|undefined} User object if found, undefined otherwise
 * 
 * @example
 * const user = findUserByEmail('john@fitbuddy.com');
 * if (user) {
 *   console.log('User found:', user.name);
 * }
 * 
 * TODO: Replace with PostgreSQL query
 * const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
 * return result.rows[0];
 */
export const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

/**
 * Find a user by their unique ID
 * 
 * @param {number|string} id - The user ID to search for
 * @returns {Object|undefined} User object if found, undefined otherwise
 * 
 * @example
 * const user = findUserById(1);
 * 
 * TODO: Replace with PostgreSQL query
 * const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
 * return result.rows[0];
 */
export const findUserById = (id) => {
  return users.find(user => user.id === Number(id));
};

/**
 * Create a new user and add to the data store
 * 
 * @param {Object} userData - User data to store
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - Hashed password
 * @param {string} userData.role - User's role (member, trainer, admin)
 * @returns {Object} The newly created user object
 * 
 * @example
 * const newUser = createUser({
 *   name: 'John Doe',
 *   email: 'john@fitbuddy.com',
 *   password: 'hashed_password_here',
 *   role: 'member'
 * });
 * 
 * TODO: Replace with PostgreSQL INSERT query
 * const result = await pool.query(
 *   'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
 *   [userData.name, userData.email, userData.password, userData.role]
 * );
 * return result.rows[0];
 */
export const createUser = (userData) => {
  const newUser = {
    id: userIdCounter++,
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password, // Already hashed before this function is called
    role: userData.role || 'member', // Default role is 'member'
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  return newUser;
};

/**
 * Get all users (for debugging/testing purposes)
 * 
 * @returns {Array<Object>} Array of all users
 * 
 * @example
 * const allUsers = getAllUsers();
 * console.log(`Total users: ${allUsers.length}`);
 * 
 * TODO: Replace with PostgreSQL query
 * const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
 * return result.rows;
 */
export const getAllUsers = () => {
  return users;
};

/**
 * Clear all users from the data store
 * Used for testing purposes only
 * 
 * @example
 * clearUsers(); // Removes all users
 * 
 * TODO: In production, use database migrations and seeds instead
 */
export const clearUsers = () => {
  users = [];
  userIdCounter = 1;
};

/**
 * Export the users array (for direct access if needed)
 * Use the helper functions above instead when possible
 */
export default users;

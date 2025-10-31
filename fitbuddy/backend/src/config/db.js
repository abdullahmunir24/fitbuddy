/**
 * ========================================
 * Database Connection Configuration
 * ========================================
 * 
 * PostgreSQL connection pool using node-postgres (pg)
 * Manages database connections efficiently with connection pooling
 * 
 * @module config/db
 */

import pkg from 'pg';
const { Pool } = pkg;

/**
 * PostgreSQL Connection Pool
 * 
 * Configuration from environment variables:
 * - DATABASE_URL: Full connection string
 * OR individual variables:
 * - DB_HOST: Database host (default: localhost)
 * - DB_PORT: Database port (default: 5432)
 * - DB_NAME: Database name
 * - DB_USER: Database user
 * - DB_PASSWORD: Database password
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual env vars if DATABASE_URL is not set
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitbuddy_db',
  user: process.env.DB_USER || 'fitbuddy_user',
  password: process.env.DB_PASSWORD || 'fitbuddy_password',
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not available
});

/**
 * Test database connection on startup
 */
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Query helper function with error handling
 * 
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters (for parameterized queries)
 * @returns {Promise<Object>} Query result
 * 
 * @example
 * const result = await query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', { text, duration: `${duration}ms`, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * Remember to release the client after use!
 * 
 * @returns {Promise<Object>} Database client
 * 
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... multiple queries
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */
export const getClient = async () => {
  return await pool.connect();
};

/**
 * Close all connections in the pool
 * Use this for graceful shutdown
 * 
 * @returns {Promise<void>}
 */
export const closePool = async () => {
  await pool.end();
  console.log('🔌 Database pool closed');
};

export default pool;

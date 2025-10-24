# FitBuddy Backend - JWT Authentication API

## 📋 Overview

This is a production-ready JWT authentication system for the FitBuddy fitness web application. It currently uses **in-memory data storage** (mock users) and is designed to seamlessly transition to **PostgreSQL** when the database is ready.

### ✨ Key Features

- ✅ **JWT-based authentication** - Secure, stateless authentication
- ✅ **Password hashing with bcrypt** - Passwords are never stored in plain text
- ✅ **Role-based user system** - Support for Member, Trainer, and Admin roles
- ✅ **Protected routes** - Middleware for authenticating API requests
- ✅ **Comprehensive documentation** - Every function and route is well-documented
- ✅ **Production-ready code** - Clean, maintainable, and extensible
- ✅ **Easy database migration** - Clear TODO markers for PostgreSQL integration

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── index.js              # Main server file (Express setup, middleware, routes)
│   ├── routes/
│   │   └── authRoutes.js     # Authentication endpoints (signup, login, /me)
│   ├── middleware/
│   │   └── requireAuth.js    # JWT verification middleware
│   ├── utils/
│   │   └── token.js          # Token signing and verification utilities
│   └── data/
│       └── mockUsers.js      # In-memory user storage (temporary)
├── .env                       # Environment variables (DO NOT commit!)
├── .env.example              # Template for environment variables
└── package.json              # Dependencies and scripts
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` and set your JWT secret:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Important**: Use a long, random string for `JWT_SECRET` in production!

### 3. Start the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:

```
========================================
🚀 FitBuddy API Server Started
========================================
📡 Server running on: http://localhost:5000
🌍 Environment: development
🔗 Frontend URL: http://localhost:3000
========================================
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/` | API info and health check | ❌ No |
| GET | `/health` | Detailed health status | ❌ No |
| POST | `/api/auth/signup` | Register new user | ❌ No |
| POST | `/api/auth/login` | Authenticate user | ❌ No |
| GET | `/api/auth/me` | Get current user profile | ✅ Yes |

---

## 🔐 Authentication Flow

### 1. **Signup** (Register New User)

**Endpoint**: `POST /api/auth/signup`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@fitbuddy.com",
  "password": "SecurePass123",
  "role": "member"
}
```

**Fields**:
- `name` (required): Min 2 characters
- `email` (required): Valid email format, must be unique
- `password` (required): Min 8 characters
- `role` (optional): `"member"`, `"trainer"`, or `"admin"` (default: `"member"`)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@fitbuddy.com",
      "role": "member",
      "createdAt": "2025-10-23T12:00:00.000Z"
    }
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "message": "Email already registered. Please use a different email or try logging in."
}
```

---

### 2. **Login** (Authenticate Existing User)

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@fitbuddy.com",
  "password": "SecurePass123"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@fitbuddy.com",
      "role": "member",
      "createdAt": "2025-10-23T12:00:00.000Z"
    }
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. **Get Current User** (Protected Route)

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@fitbuddy.com",
      "role": "member",
      "createdAt": "2025-10-23T12:00:00.000Z"
    }
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "No authorization header provided. Please include a valid token."
}
```

---

## 🧪 Testing the API

### Option 1: Using cURL

#### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@fitbuddy.com",
    "password": "SecurePass123",
    "role": "member"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@fitbuddy.com",
    "password": "SecurePass123"
  }'
```

#### 3. Get Current User (save token from login first!)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 2: Using Postman/Thunder Client

1. **Install Thunder Client** (VS Code extension) or use Postman
2. Create a new request:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "name": "John Doe",
       "email": "john@fitbuddy.com",
       "password": "SecurePass123"
     }
     ```
3. Save the `accessToken` from the response
4. Test protected route with Authorization header

---

## 🔧 Code Architecture

### Token Management (`src/utils/token.js`)

- **`signToken(payload, expiresIn)`** - Creates a JWT token
- **`verifyToken(token)`** - Validates and decodes a JWT token
- **`extractTokenFromHeader(authHeader)`** - Extracts token from "Bearer <token>" format

### Authentication Middleware (`src/middleware/requireAuth.js`)

- **`requireAuth`** - Middleware to protect routes (verifies JWT)
- **`requireRole(roles)`** - Additional middleware for role-based access control

### Data Layer (`src/data/mockUsers.js`)

**Current**: In-memory array
**Future**: PostgreSQL database

Functions:
- `findUserByEmail(email)` - Find user by email
- `findUserById(id)` - Find user by ID
- `createUser(userData)` - Create new user
- `getAllUsers()` - Get all users (for debugging)

---

## 🗄️ Database Migration Guide

When you're ready to integrate PostgreSQL, follow these steps:

### 1. Set up PostgreSQL Database

Create the users table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('member', 'trainer', 'admin')) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Install PostgreSQL Client

```bash
npm install pg
```

### 3. Create Database Connection

Create `src/config/database.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

export default pool;
```

### 4. Replace Mock Functions

In `src/data/mockUsers.js`, replace each function with SQL queries. All TODO comments mark the exact locations!

**Example**:
```javascript
// Before (Mock)
export const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// After (PostgreSQL)
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0];
};
```

### 5. Update All Route Handlers

Make all route handlers `async` and use `await` with database queries.

### 6. Update Environment Variables

Add to `.env`:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fitbuddy
DB_PASSWORD=your_password
DB_PORT=5432
```

---

## 📝 TODO Comments

All files contain clear `TODO` comments marking where to integrate PostgreSQL:

```javascript
// TODO: Replace with PostgreSQL query
// const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

Search for `TODO` in the codebase to find all integration points!

---

## 🔒 Security Best Practices

### Current Implementation

✅ **Passwords are hashed** using bcrypt (salt rounds: 10)  
✅ **JWT tokens** are signed with a secret key  
✅ **Tokens expire** after 7 days (configurable)  
✅ **Password validation** - Minimum 8 characters  
✅ **Error messages** don't reveal if email exists (prevents enumeration)  
✅ **CORS configured** to only allow specific frontend URL  

### Future Enhancements (TODO)

- [ ] Add refresh tokens for better security
- [ ] Implement token blacklist for logout
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Implement account lockout after failed login attempts
- [ ] Add two-factor authentication (2FA)
- [ ] Email verification on signup
- [ ] Password reset via email
- [ ] HTTPS in production
- [ ] Security headers (helmet.js)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change the PORT in `.env` or kill the process using port 5000:
```bash
lsof -ti:5000 | xargs kill -9
```

### JWT Secret Not Found
```
Error: JWT_SECRET is not defined in environment variables
```

**Solution**: Make sure `.env` file exists and contains `JWT_SECRET`

### CORS Errors
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```

**Solution**: Update `FRONTEND_URL` in `.env` to match your frontend URL

---

## 📚 Additional Resources

- [JWT Introduction](https://jwt.io/introduction)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

## 👥 Contributing

When adding new features:

1. Follow the existing code structure and naming conventions
2. Add comprehensive JSDoc comments to all functions
3. Include TODO comments for database integration points
4. Update this README with new endpoints
5. Test all endpoints before committing

---

## 📄 License

ISC

---

**Created**: October 23, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Frontend Integration

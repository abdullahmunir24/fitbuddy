# FitBuddy Setup and Testing Guide

## What Was Completed

Your teammate created the backend routes and your integration is now complete! Here's what has been connected:

### Backend Features
- User authentication (signup/login)
- Exercise management routes
- Workout management routes
- Session/logging routes
- User profile routes
- Mock data storage (ready for PostgreSQL migration)

### Frontend Features
- Login page connected to backend API
- Signup page connected to backend API
- Dashboard page with user stats
- Authentication context for state management
- Protected routes

---

## Quick Start - Get Everything Running

### Step 1: Start the Backend Server

Open a terminal in the project root and run:

```bash
cd fitbuddy/backend
npm install
npm run dev
```

You should see:
```
FitBuddy API Server Started
Server running on: http://localhost:5000
Environment: development
```

**Keep this terminal running!**

### Step 2: Start the Frontend Server

Open a NEW terminal and run:

```bash
cd fitbuddy/frontend
npm install
npm run dev
```

You should see:
```
Local:   http://localhost:3000/
```

**Keep this terminal running too!**

### Step 3: Test the Application

1. Open your browser to `http://localhost:3000`
2. You'll see the FitBuddy landing page
3. Click "Get Started" or "Sign In"

---

## Testing the Integration

### Test 1: Create a New Account

1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: john@test.com
   - **Password**: Test1234
   - **Confirm Password**: Test1234
   - **Role**: Member
3. Click "Create Account"
4. You should be redirected to the Dashboard
5. You should see a welcome message with your name
6. Check your browser's Developer Console (F12) - you should see the user data logged

### Test 2: Login with Existing Account

1. Logout from the dashboard
2. Go to `http://localhost:3000/login`
3. Enter:
   - **Email**: john@test.com
   - **Password**: Test1234
4. Click "Sign In"
5. You should be redirected to the Dashboard
6. Your stats should load (will show 0 for now)

### Test 3: Verify Protected Routes

1. While logged in, note your token in localStorage:
   - Open Developer Tools (F12)
   - Go to Application/Storage tab
   - Click "Local Storage"
   - You should see `token` and `user` entries

2. Logout
3. Try to access `http://localhost:3000/dashboard` directly
4. You should be redirected back to login

### Test 4: Test Backend Endpoints Directly

You can test the backend API using curl or a tool like Postman:

#### Get All Exercises (Public - No Auth)
```bash
curl http://localhost:5000/api/exercises
```

#### Get User Profile (Protected - Requires Token)
Replace YOUR_TOKEN with your actual token from localStorage:
```bash
curl http://localhost:5000/api/users/1 -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Available Backend Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/:id` - Get user profile (protected)
- `PUT /api/users/:id` - Update profile (protected)
- `DELETE /api/users/:id` - Delete account (protected)
- `GET /api/users/:id/stats` - Get user statistics (protected)

### Exercises
- `GET /api/exercises` - Get all exercises (public)
- `GET /api/exercises/:id` - Get exercise by ID (public)
- `POST /api/exercises` - Create exercise (admin only)
- `PUT /api/exercises/:id` - Update exercise (admin only)
- `DELETE /api/exercises/:id` - Delete exercise (admin only)

### Workouts
- `POST /api/workouts` - Create workout (protected)
- `GET /api/workouts` - Get all workouts (protected)
- `GET /api/workouts/:id` - Get workout by ID (protected)
- `PUT /api/workouts/:id` - Update workout (protected)
- `DELETE /api/workouts/:id` - Delete workout (protected)
- `GET /api/workouts/user/:userId` - Get user's workouts (protected)

### Sessions (Workout Logs)
- `POST /api/sessions` - Log a workout session (protected)
- `GET /api/sessions` - Get all sessions (protected)
- `GET /api/sessions/:id` - Get session by ID (protected)
- `PUT /api/sessions/:id` - Update session (protected)
- `DELETE /api/sessions/:id` - Delete session (protected)
- `GET /api/sessions/user/:userId` - Get user's sessions (protected)
- `GET /api/sessions/stats/:userId` - Get user session stats (protected)

---

## File Structure

```
fitbuddy/
├── backend/
│   ├── .env                      # Backend configuration (PORT, JWT_SECRET)
│   ├── src/
│   │   ├── index.js             # Main server file
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # Authentication endpoints
│   │   │   ├── userRoutes.js    # User management
│   │   │   ├── exerciseRoutes.js# Exercise library
│   │   │   ├── workoutRoutes.js # Workout plans
│   │   │   └── sessionRoutes.js # Workout logs
│   │   ├── data/
│   │   │   ├── mockData.js      # Mock data storage
│   │   │   └── mockUsers.js     # Mock user storage
│   │   └── middleware/
│   │       └── requireAuth.js   # JWT authentication
│   └── package.json
│
├── frontend/
│   ├── .env                     # Frontend configuration (VITE_API_URL)
│   ├── src/
│   │   ├── App.jsx              # Main app component with routes
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx        # Login page (connected to API)
│   │   │   ├── Signup.jsx       # Signup page (connected to API)
│   │   │   └── Dashboard.jsx    # User dashboard (protected)
│   │   └── context/
│   │       └── AuthContext.jsx  # Authentication state management
│   └── package.json
│
└── SETUP_AND_TEST_GUIDE.md     # This file
```

---

## Configuration Files

### Backend .env
Located at `fitbuddy/backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### Frontend .env
Located at `fitbuddy/frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## Common Issues and Solutions

### Issue: CORS Error
**Error**: `Access to fetch has been blocked by CORS policy`

**Solution**: 
- Make sure backend is running on port 5000
- Check that `FRONTEND_URL=http://localhost:3000` in backend/.env
- Restart the backend server after changing .env

### Issue: 401 Unauthorized
**Error**: `Invalid or expired token`

**Solution**:
- Token expired (default: 7 days)
- Logout and login again to get a new token
- Check that token is being sent in Authorization header

### Issue: Network Error / Cannot Fetch
**Error**: `Failed to fetch`

**Solution**:
- Check that backend is running: `http://localhost:5000/health`
- Check that frontend .env has correct API URL
- Check your firewall isn't blocking the connection

### Issue: User Already Exists
**Error**: `Email already registered`

**Solution**:
- This is normal - the backend uses in-memory storage
- Either use a different email OR restart the backend server to clear data
- To restart: Press Ctrl+C in backend terminal, then `npm run dev` again

---

## Next Steps

Now that your frontend and backend are connected, you can:

1. **Build More Pages**
   - Workout creation page
   - Exercise browser
   - Session logger
   - User profile editor

2. **Add More Features**
   - Use the AuthContext in pages for better state management
   - Add loading states and better error handling
   - Create admin dashboard for exercise management
   - Add workout history visualization

3. **Set Up PostgreSQL Database**
   - Follow the backend README for database setup
   - Run the migrations from `fitbuddy/database/schema.sql`
   - Replace mock data functions with real database queries

4. **Enhance Security**
   - Change JWT_SECRET in production
   - Add password reset functionality
   - Implement refresh tokens
   - Add rate limiting

---

## Using the Auth Context (Optional but Recommended)

You can refactor your pages to use the AuthContext for cleaner code:

```javascript
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message });
    }
  };
}
```

To enable it, wrap your App in `main.jsx`:

```javascript
import { AuthProvider } from './context/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>
```

---

## API Testing with Postman

If you prefer using Postman:

1. Create a new collection: "FitBuddy API"
2. Add requests for each endpoint
3. For protected routes:
   - Click "Authorization" tab
   - Type: Bearer Token
   - Token: Paste your token from localStorage

---

## Development Tips

1. **Backend Changes**: The backend auto-reloads when you save files
2. **Frontend Changes**: The frontend auto-reloads when you save files
3. **View Logs**: Keep both terminal windows visible to see requests/errors
4. **Clear Data**: Restart backend server to clear all mock data
5. **Token Expiry**: Default is 7 days, configurable in backend/.env

---

## Success Checklist

- [ ] Backend server running on http://localhost:5000
- [ ] Frontend server running on http://localhost:3000
- [ ] Can access landing page
- [ ] Can create new account
- [ ] Can login with created account
- [ ] Dashboard loads with user data
- [ ] Can see user statistics (even if 0)
- [ ] Can logout successfully
- [ ] Cannot access dashboard when logged out
- [ ] Token saved in localStorage
- [ ] No errors in browser console

---

## Congratulations!

Your FitBuddy application is now fully integrated and working! The frontend and backend are successfully communicating, authentication is working, and you have a solid foundation to build more features.

For detailed API documentation, see:
- `fitbuddy/backend/src/index.js` - Full testing instructions
- `fitbuddy/INTEGRATION_GUIDE.md` - Integration details
- `fitbuddy/backend/src/routes/*` - Individual route documentation

Happy coding!


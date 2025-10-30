# FitBuddy - Full-Stack Fitness Application

A modern full-stack web application for fitness tracking and management.

## Status: FULLY INTEGRATED AND WORKING

The frontend and backend are now fully connected! You can create accounts, login, and access the dashboard.

## Tech Stack

- **Frontend**: React.js with Vite, React Router, Tailwind CSS
- **Backend**: Node.js with Express.js, JWT authentication
- **Database**: PostgreSQL (optional - currently using in-memory mock data)

## Project Structure

```
fitbuddy/
├── frontend/          # React frontend application (CONNECTED)
├── backend/           # Express.js API server (WORKING)
├── database/          # PostgreSQL schema and migrations
├── docker-compose.yml # Docker setup for PostgreSQL
├── SETUP_AND_TEST_GUIDE.md  # Detailed setup and testing guide
└── README.md
```

## Quick Start (In-Memory Mode - No Database Required)

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Start Backend Server

Open a terminal:

```bash
cd fitbuddy/backend
npm install
npm run dev
```

The backend will run on **http://localhost:5000**

KEEP THIS TERMINAL RUNNING!

### 2. Start Frontend Server

Open a NEW terminal:

```bash
cd fitbuddy/frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**

KEEP THIS TERMINAL RUNNING!

### 3. Test the Application

1. Open browser to **http://localhost:3000**
2. Click "Get Started" to create an account
3. Fill in signup form and create account
4. You'll be redirected to the dashboard
5. See your stats and explore!

See **SETUP_AND_TEST_GUIDE.md** for detailed testing instructions.

## Current Features (Working)

### Authentication
- User signup with role selection (Member/Trainer)
- User login with JWT tokens
- Protected routes and dashboard
- Logout functionality

### Backend API (All Working)
- User authentication endpoints
- User profile management
- Exercise library (6 pre-loaded exercises)
- Workout management
- Session/workout logging
- User statistics

### Frontend Pages
- Landing page
- Login page (connected to API)
- Signup page (connected to API)
- Dashboard (protected, shows user stats)

## Development

- **Frontend**: Port 3000 (auto-reload on save)
- **Backend**: Port 5000 (auto-reload on save)
- **Storage**: In-memory (data clears on restart)

## API Endpoints Available

Full list in SETUP_AND_TEST_GUIDE.md and INTEGRATION_GUIDE.md

### Quick Reference
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/exercises` - Get all exercises
- `POST /api/workouts` - Create workout
- `POST /api/sessions` - Log workout session
- `GET /api/users/:id/stats` - Get user stats

## Next Steps

1. **Add More Pages**: Workout creator, exercise browser, session logger
2. **Set Up PostgreSQL**: Migrate from in-memory to persistent database
3. **Add Features**: Progress charts, workout history, social features
4. **Enhance UI**: More animations, better mobile responsiveness

## Contributing

This is a starter template. Feel free to customize and extend it for your needs!

## License

MIT


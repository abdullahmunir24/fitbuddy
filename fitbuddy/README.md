# FitBuddy - Full-Stack Fitness Application

A modern full-stack web application for fitness tracking and management.

## Tech Stack

- **Frontend**: React.js with Vite, React Router, Tailwind CSS
- **Backend**: Node.js with Express.js, JWT authentication
- **Database**: PostgreSQL

## Project Structure

```
fitbuddy/
├── frontend/          # React frontend application
├── backend/           # Express.js API server
├── database/          # PostgreSQL schema and migrations
├── docker-compose.yml # Docker setup for PostgreSQL
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for PostgreSQL)

### 1. Clone and Navigate

```bash
cd fitbuddy
```

### 2. Set Up Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

Install PostgreSQL locally and create a database named `fitbuddy_db`.

Then run the schema:

```bash
cd database
psql -h localhost -U fitbuddy_user -d fitbuddy_db -f schema.sql
cd ..
```

### 3. Set Up Backend

```bash
cd backend
npm install
cp src/config/.env.example .env
# Edit .env with your database credentials if needed
npm run dev
```

The backend will run on **http://localhost:4000**

### 4. Set Up Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**

## Development

- **Frontend**: Runs on port 3000
- **Backend**: Runs on port 4000
- **Database**: Runs on port 5432 (if using Docker)

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration (to be implemented)
- `POST /api/auth/login` - User login (to be implemented)

## Next Steps

1. Implement user authentication with JWT
2. Create database models and controllers
3. Build out frontend components and pages
4. Add workout tracking features
5. Implement user progress tracking

## Contributing

This is a starter template. Feel free to customize and extend it for your needs!

## License

MIT


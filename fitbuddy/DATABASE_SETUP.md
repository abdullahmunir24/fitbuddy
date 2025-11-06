# Database Setup Guide

## Quick Start

Follow these steps to set up the FitBuddy database with a default user.

### Step 1: Start PostgreSQL Database

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This starts PostgreSQL with:
- Host: localhost
- Port: 5432
- Database: fitbuddy_db
- Username: fitbuddy_user
- Password: fitbuddy_password

### Step 2: Run Database Schema

From the `fitbuddy/database` directory:

```bash
psql -h localhost -U fitbuddy_user -d fitbuddy_db -f schema.sql
```

When prompted for password, enter: `fitbuddy_password`

Or use your preferred PostgreSQL client (pgAdmin, DBeaver, etc.) and run the `schema.sql` file.

### Step 3: Seed Default User

From the `fitbuddy/backend` directory:

```bash
cd ../backend
npm run seed-user
```

This creates a default member account you can use immediately.

## Default User Credentials

After seeding, you can login with:

- **Email**: raad.sask@gmail.com
- **Password**: Raad7223!
- **Role**: member

## Verifying Setup

1. Check if the database is running:
   ```bash
   docker ps
   ```

2. Connect to the database:
   ```bash
   psql -h localhost -U fitbuddy_user -d fitbuddy_db
   ```

3. Verify tables exist:
   ```sql
   \dt
   ```

4. Check the default user:
   ```sql
   SELECT id, email, full_name, role FROM users WHERE email = 'raad.sask@gmail.com';
   ```

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running: `docker ps`
- Check if port 5432 is available
- Verify credentials in `.env` file match docker-compose.yml

### User Already Exists
- The seed script is safe to run multiple times
- It will skip creation if the user already exists

### Permission Denied
- Make sure you're running commands from the correct directory
- Check that npm dependencies are installed: `npm install`

## Clean Start

To start fresh:

```bash
# Stop and remove the database container
docker-compose down -v

# Start it again
docker-compose up -d

# Run schema again
cd fitbuddy/database
psql -h localhost -U fitbuddy_user -d fitbuddy_db -f schema.sql

# Seed default user
cd ../backend
npm run seed-user
```

## Next Steps

After database setup:
1. Start the backend: `npm run dev` (from backend directory)
2. Start the frontend: `npm run dev` (from frontend directory)
3. Login at http://localhost:3000 with the default credentials


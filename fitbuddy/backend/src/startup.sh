#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Seed gyms (ignore errors if already seeded)
echo "Seeding gyms..."
npm run seed-gyms || echo "Gyms already seeded or seeding failed, continuing..."

# Start the server
echo "Starting server..."
npm run dev


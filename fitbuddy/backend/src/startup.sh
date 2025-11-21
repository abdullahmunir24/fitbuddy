#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Seed gyms
echo "🌱 Seeding gyms..."
node src/seed-gyms.js
echo "✅ Gyms seeding completed"
sleep 1

# Seed default users
echo "🌱 Seeding default users..."
node src/seed-default-user.js
echo "✅ Users seeding completed"
sleep 1

# Seed fitness classes
echo "🌱 Seeding fitness classes..."
node src/seed-classes.js
echo "✅ Classes seeding completed"
sleep 1

# Seed workouts
echo "🏋️ Seeding workouts..."
node src/seed-workouts.js
echo "✅ Workouts seeding completed"
sleep 1

# Start the server
echo "🚀 Starting server..."
npm run dev


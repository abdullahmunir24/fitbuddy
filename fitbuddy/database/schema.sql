-- ========================================
-- FitBuddy Database Schema
-- ========================================
-- Complete database structure for FitBuddy fitness web app
-- Features: User management, workout tracking, class scheduling, 
--           gym finder, progress analytics, and admin panel
-- 
-- Created: October 23, 2025
-- Team: Abdullah Munir, Raad Sarker, Haider Ali
-- ========================================

-- ========================================
-- 1. USERS & AUTHENTICATION
-- ========================================

-- Users table - Core user information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'trainer', 'admin')),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles - Extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    fitness_goal VARCHAR(100),
    experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_workout_types TEXT[], -- Array of workout types
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer profiles - Additional info for trainers
CREATE TABLE IF NOT EXISTS trainer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specializations TEXT[], -- e.g., ['yoga', 'strength', 'cardio']
    certifications TEXT[],
    years_of_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00, -- Average rating out of 5
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer-client relationships - Manages trainer-client requests and relationships
CREATE TABLE IF NOT EXISTS trainer_client_requests (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    UNIQUE(member_id, trainer_id)
);

-- ========================================
-- 2. GYMS & FACILITIES
-- ========================================

-- Gyms table - Gym information
CREATE TABLE IF NOT EXISTS gyms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'Canada',
    phone VARCHAR(20),
    email VARCHAR(100),
    website_url TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval required
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gym facilities - Amenities available at each gym
CREATE TABLE IF NOT EXISTS gym_facilities (
    id SERIAL PRIMARY KEY,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    facility_name VARCHAR(50) NOT NULL, -- e.g., 'Pool', 'Sauna', 'Free Weights'
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gym memberships - Membership plans offered by gyms
CREATE TABLE IF NOT EXISTS gym_memberships (
    id SERIAL PRIMARY KEY,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL, -- e.g., 'Monthly', 'Annual', 'Day Pass'
    duration_days INTEGER, -- NULL for day passes
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User gym memberships - Track which users are members of which gyms
CREATE TABLE IF NOT EXISTS user_gym_memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    membership_id INTEGER REFERENCES gym_memberships(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, gym_id, start_date)
);

-- Gym reviews - User reviews and ratings for gyms
CREATE TABLE IF NOT EXISTS gym_reviews (
    id SERIAL PRIMARY KEY,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gym_id, user_id) -- One review per user per gym
);

-- ========================================
-- 3. WORKOUTS & EXERCISES
-- ========================================

-- Exercise library - Master list of exercises
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- e.g., 'strength', 'cardio', 'flexibility', 'sports'
    muscle_groups TEXT[], -- e.g., ['chest', 'triceps', 'shoulders']
    equipment_needed TEXT[], -- e.g., ['dumbbells', 'bench']
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    image_url TEXT,
    instructions TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Trainer who created it
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval for custom exercises
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout templates - Pre-defined workout plans
CREATE TABLE IF NOT EXISTS workout_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE, -- User or trainer who created it
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_minutes INTEGER,
    category VARCHAR(50), -- e.g., 'full body', 'upper body', 'cardio'
    is_public BOOLEAN DEFAULT FALSE, -- Public templates visible to all users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template exercises - Exercises within a workout template
CREATE TABLE IF NOT EXISTS template_exercises (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL, -- Order of exercise in the workout
    sets INTEGER,
    reps INTEGER,
    duration_seconds INTEGER, -- For timed exercises
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User workouts - Logged workouts by users
CREATE TABLE IF NOT EXISTS user_workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES workout_templates(id) ON DELETE SET NULL, -- Optional: based on template
    workout_name VARCHAR(100) NOT NULL,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    notes TEXT,
    calories_burned INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout exercises - Individual exercises within a user workout
CREATE TABLE IF NOT EXISTS workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES user_workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    duration_seconds INTEGER,
    distance_km DECIMAL(6,2), -- For cardio
    notes TEXT,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cardio sessions - Dedicated cardio activity tracking
CREATE TABLE IF NOT EXISTS cardio_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'running', 'cycling', 'swimming', 'rowing', 'walking', 'elliptical', 'stair_climbing', 'hiking'
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    average_speed_kmh DECIMAL(5,2),
    calories_burned INTEGER, -- Auto-calculated using MET values
    pace_min_per_km DECIMAL(5,2), -- Minutes per kilometer, auto-calculated
    intensity_level VARCHAR(20) CHECK (intensity_level IN ('low', 'moderate', 'high', 'very_high')),
    location VARCHAR(200), -- e.g., 'Outdoor', 'Treadmill', 'Track'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cardio goals - Specific cardio-related goals
CREATE TABLE IF NOT EXISTS cardio_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50), -- NULL for all cardio types
    goal_type VARCHAR(50) NOT NULL, -- e.g., 'weekly_distance', 'weekly_duration', 'pace_improvement', 'total_calories'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL, -- e.g., 'km', 'minutes', 'calories', 'min/km'
    time_period VARCHAR(20) NOT NULL, -- e.g., 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. CLASSES & SCHEDULING
-- ========================================

-- Fitness classes - Classes offered by trainers
CREATE TABLE IF NOT EXISTS fitness_classes (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gym_id INTEGER REFERENCES gyms(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    description TEXT,
    class_type VARCHAR(50), -- e.g., 'yoga', 'spin', 'HIIT', 'pilates'
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    max_capacity INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00, -- 0 for included in membership
    is_recurring BOOLEAN DEFAULT FALSE, -- True for weekly classes
    recurrence_pattern VARCHAR(50), -- e.g., 'weekly', 'bi-weekly'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class schedules - Specific instances of classes
CREATE TABLE IF NOT EXISTS class_schedules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES fitness_classes(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    current_capacity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class bookings - User bookings for classes
CREATE TABLE IF NOT EXISTS class_bookings (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES class_schedules(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'attended', 'cancelled', 'no_show')),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, user_id) -- Prevent double booking
);

-- Waitlist - Users waiting for full classes
CREATE TABLE IF NOT EXISTS class_waitlist (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES class_schedules(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, user_id)
);

-- ========================================
-- 5. PROGRESS TRACKING & ANALYTICS
-- ========================================

-- User progress snapshots - Periodic measurements
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    biceps_cm DECIMAL(5,2),
    thighs_cm DECIMAL(5,2),
    notes TEXT,
    progress_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal records - Best performances for exercises
CREATE TABLE IF NOT EXISTS personal_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    record_type VARCHAR(20) CHECK (record_type IN ('max_weight', 'max_reps', 'max_distance', 'best_time')),
    value DECIMAL(10,2) NOT NULL,
    achieved_date DATE NOT NULL DEFAULT CURRENT_DATE,
    workout_id INTEGER REFERENCES user_workouts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User goals - Fitness goals and tracking
CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- e.g., 'weight_loss', 'muscle_gain', 'strength', 'endurance'
    goal_description TEXT NOT NULL,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    unit VARCHAR(20), -- e.g., 'kg', 'lbs', 'minutes', 'km'
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. NOTIFICATIONS & MESSAGING
-- ========================================

-- Notifications - System notifications for users
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- e.g., 'class_reminder', 'booking_confirmed', 'new_message'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50), -- e.g., 'class', 'workout', 'message'
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages - Direct messages between users (e.g., member to trainer)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    parent_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE, -- For threading
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. ADMIN & SYSTEM
-- ========================================

-- Activity logs - Track important system activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'login', 'workout_logged', 'class_booked'
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings - App-wide configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Trainer-client requests indexes
CREATE INDEX IF NOT EXISTS idx_trainer_requests_trainer ON trainer_client_requests(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_trainer_requests_member ON trainer_client_requests(member_id, status);
CREATE INDEX IF NOT EXISTS idx_trainer_requests_status ON trainer_client_requests(status);

-- Gyms table indexes
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_is_approved ON gyms(is_approved);
CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms(latitude, longitude);

-- Workouts table indexes
CREATE INDEX IF NOT EXISTS idx_user_workouts_user_id ON user_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_date ON user_workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Classes table indexes
CREATE INDEX IF NOT EXISTS idx_fitness_classes_trainer_id ON fitness_classes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_fitness_classes_gym_id ON fitness_classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_date ON class_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_class_bookings_user_id ON class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule_id ON class_bookings(schedule_id);

-- Progress table indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(measurement_date);

-- Cardio sessions indexes
CREATE INDEX IF NOT EXISTS idx_cardio_sessions_user_id ON cardio_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cardio_sessions_date ON cardio_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_cardio_sessions_activity_type ON cardio_sessions(activity_type);

-- Cardio goals indexes
CREATE INDEX IF NOT EXISTS idx_cardio_goals_user_id ON cardio_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_cardio_goals_status ON cardio_goals(status);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- ========================================
-- 9. FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_profiles_updated_at BEFORE UPDATE ON trainer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_memberships_updated_at BEFORE UPDATE ON gym_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gym_memberships_updated_at BEFORE UPDATE ON user_gym_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_workouts_updated_at BEFORE UPDATE ON user_workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_classes_updated_at BEFORE UPDATE ON fitness_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON class_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at BEFORE UPDATE ON personal_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cardio_sessions_updated_at BEFORE UPDATE ON cardio_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cardio_goals_updated_at BEFORE UPDATE ON cardio_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. SEED DATA (Optional - for testing)
-- ========================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('app_name', 'FitBuddy', 'Application name'),
    ('max_class_capacity', '30', 'Default maximum class capacity'),
    ('booking_cancellation_hours', '24', 'Hours before class for free cancellation'),
    ('trial_period_days', '7', 'Free trial period in days')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert common exercises (sample data)
INSERT INTO exercises (name, description, category, muscle_groups, difficulty_level, is_approved) VALUES
    ('Bench Press', 'Flat barbell bench press', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'intermediate', TRUE),
    ('Squat', 'Barbell back squat', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'intermediate', TRUE),
    ('Deadlift', 'Conventional barbell deadlift', 'strength', ARRAY['back', 'glutes', 'hamstrings'], 'advanced', TRUE),
    ('Running', 'Treadmill or outdoor running', 'cardio', ARRAY['legs', 'cardiovascular'], 'beginner', TRUE),
    ('Push-ups', 'Standard push-ups', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'beginner', TRUE),
    ('Pull-ups', 'Standard pull-ups', 'strength', ARRAY['back', 'biceps'], 'intermediate', TRUE),
    ('Plank', 'Front plank hold', 'flexibility', ARRAY['core'], 'beginner', TRUE),
    ('Burpees', 'Full body burpees', 'cardio', ARRAY['full body'], 'intermediate', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- END OF SCHEMA
-- ========================================


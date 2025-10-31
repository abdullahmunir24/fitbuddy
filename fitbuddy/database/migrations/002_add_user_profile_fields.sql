-- ========================================
-- Migration: Add User Profile Fields
-- ========================================
-- Date: October 31, 2025
-- Description: Adds profile fields (bio, avatar, phone) to users table
--              These fields are already in the main schema.sql but this
--              migration can be applied if you're updating an existing database
-- ========================================

-- Add profile fields to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index on phone for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';


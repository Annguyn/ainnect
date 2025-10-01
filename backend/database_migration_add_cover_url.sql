-- Migration script to add cover_url column to users table
-- Run this script to add cover image support to existing user profiles

-- Add cover_url column to users table
ALTER TABLE users 
ADD COLUMN cover_url VARCHAR(500);

-- Add comment to the column for documentation
COMMENT ON COLUMN users.cover_url IS 'URL of the user cover image';

-- Optional: Create an index on cover_url if you plan to query by it frequently
-- CREATE INDEX idx_users_cover_url ON users(cover_url);

-- Verify the column was added successfully
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'cover_url';

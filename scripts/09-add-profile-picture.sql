-- Add profile_picture column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_picture IS 'URL or base64 encoded profile picture of the user';

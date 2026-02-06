
-- Add is_active column to profiles table for agent account management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is active. Inactive accounts cannot log in.';

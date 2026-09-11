-- Add user_id column to company_settings for per-user settings
ALTER TABLE public.company_settings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique constraint on user_id (one setting per user)
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_user_id_unique UNIQUE (user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Admins can read company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Admins can update company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Admins can insert company_settings" ON public.company_settings;

-- Create new RLS policies
-- Users can read their own settings
CREATE POLICY "Users can read their own settings"
ON public.company_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings"
ON public.company_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can read all settings
CREATE POLICY "Admins can read all settings"
ON public.company_settings
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update all settings
CREATE POLICY "Admins can update all settings"
ON public.company_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.company_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can delete settings
CREATE POLICY "Admins can delete settings"
ON public.company_settings
FOR DELETE
USING (public.is_admin(auth.uid()));
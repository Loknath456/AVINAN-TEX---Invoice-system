-- Drop existing public policies on company_settings
DROP POLICY IF EXISTS "Allow public read company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow public update company_settings" ON public.company_settings;

-- Create new policies restricting to authenticated users only
CREATE POLICY "Authenticated users can read company_settings"
ON public.company_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update company_settings"
ON public.company_settings
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert company_settings"
ON public.company_settings
FOR INSERT
TO authenticated
WITH CHECK (true);
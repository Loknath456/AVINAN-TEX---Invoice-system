-- Drop existing permissive policies on customers table
DROP POLICY IF EXISTS "Allow public delete customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update customers" ON public.customers;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can read customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (true);
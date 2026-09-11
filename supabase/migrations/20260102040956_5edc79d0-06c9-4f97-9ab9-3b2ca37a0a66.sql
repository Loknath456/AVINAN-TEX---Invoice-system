-- Drop existing permissive policies on invoices table
DROP POLICY IF EXISTS "Allow public delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public update invoices" ON public.invoices;

-- Drop existing permissive policies on invoice_items table
DROP POLICY IF EXISTS "Allow public delete invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public insert invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public read invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public update invoice_items" ON public.invoice_items;

-- Create authenticated-only policies for invoices
CREATE POLICY "Authenticated users can read invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (true);

-- Create authenticated-only policies for invoice_items
CREATE POLICY "Authenticated users can read invoice_items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert invoice_items"
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice_items"
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invoice_items"
ON public.invoice_items
FOR DELETE
TO authenticated
USING (true);
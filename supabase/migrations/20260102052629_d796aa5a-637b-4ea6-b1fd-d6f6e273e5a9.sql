-- Add user_id column to invoices table
ALTER TABLE public.invoices ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies on invoices
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;

-- Create new user-scoped RLS policies for invoices
CREATE POLICY "Users can read their own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing RLS policies on invoice_items
DROP POLICY IF EXISTS "Authenticated users can delete invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can insert invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can read invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can update invoice_items" ON public.invoice_items;

-- Create new policies for invoice_items based on parent invoice ownership
CREATE POLICY "Users can read their own invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own invoice items"
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can update their own invoice items"
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own invoice items"
ON public.invoice_items
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));
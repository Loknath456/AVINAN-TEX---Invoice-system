-- Update Terms & Conditions for company settings
UPDATE public.company_settings
SET 
  terms_and_conditions = 'Overdue interest will be charged at 24% from the invoice date.

We are not responsible for any loss or damage in transit.

We will not accept any claim after processing of goods.

Subject to: TIRUPPUR jurisdiction.',
  updated_at = now();

-- Also update existing invoices with empty or default terms with the new terms
UPDATE public.invoices
SET 
  terms_and_conditions = 'Overdue interest will be charged at 24% from the invoice date.

We are not responsible for any loss or damage in transit.

We will not accept any claim after processing of goods.

Subject to: TIRUPPUR jurisdiction.',
  updated_at = now()
WHERE terms_and_conditions IS NULL OR terms_and_conditions = '';

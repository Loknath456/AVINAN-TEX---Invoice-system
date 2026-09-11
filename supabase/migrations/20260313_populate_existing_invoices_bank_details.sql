-- Populate bank details for all existing invoices
UPDATE public.invoices
SET 
  bank_name = 'THE KARUR VYSYA BANK LIMITED',
  bank_account_no = '1279135000012299',
  bank_branch = 'SOMANUR',
  bank_ifsc = 'KVBL0001279',
  updated_at = now()
WHERE bank_account_no IS NULL OR bank_account_no = '';

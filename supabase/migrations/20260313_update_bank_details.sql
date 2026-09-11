-- Update company bank details for AVINAN TEX
-- Update all existing company_settings rows (for all users)
UPDATE public.company_settings
SET 
  bank_name = 'THE KARUR VYSYA BANK LIMITED',
  bank_account_no = '1279135000012299',
  bank_branch = 'SOMANUR',
  bank_ifsc = 'KVBL0001279',
  updated_at = now();

-- Also update the default company name to AVINAN TEX if it hasn't been changed
UPDATE public.company_settings
SET 
  company_name = 'AVINAN TEX'
WHERE company_name = 'Sri Rajendra Tex';

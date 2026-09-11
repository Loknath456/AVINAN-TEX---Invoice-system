export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  hsn_code: string;
  bales: number;
  pieces: number;
  total_metre: number;
  rate_per_metre: number;
  amount: number;
  folding_less_percentage: number;
  folding_less_metre: number;
  sort_order: number;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  invoice_no: string;
  invoice_date: string;
  financial_year: string;
  tax_on_reverse_charge: boolean;
  
  // Billed To
  billed_to_name: string;
  billed_to_address: string;
  billed_to_gstin: string;
  billed_to_pan: string;
  
  // Shipped To
  shipped_to_name: string;
  shipped_to_address: string;
  shipped_to_gstin: string;
  shipped_to_pan: string;
  
  // Order details
  order_no?: string;
  payment_terms?: string;
  
  // Calculations
  assessable_value: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  rounded_off: number;
  net_amount: number;
  amount_in_words?: string;
  
  // Bale summary
  total_bales: number;
  bale_numbers?: string;
  
  // Bank details
  bank_name?: string;
  bank_account_no?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  
  // Terms
  terms_and_conditions?: string;
  
  // Signatures
  prepared_by?: string;
  checked_by?: string;
  
  // Status
  status?: 'draft' | 'saved' | 'paid' | 'cancelled';
  
  created_at?: string;
  updated_at?: string;
}

export interface CompanySettings {
  id: string;
  user_id?: string;
  company_name: string;
  company_tagline?: string;
  company_address: string;
  company_phone?: string;
  company_email?: string;
  company_pan: string;
  company_gstin: string;
  logo_url?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  default_cgst_rate: number;
  default_sgst_rate: number;
  invoice_counter: number;
  invoice_prefix?: string;
  terms_and_conditions?: string;
}

export interface Customer {
  id?: string;
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone?: string;
  email?: string;
}

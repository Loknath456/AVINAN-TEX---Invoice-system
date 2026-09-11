-- Create enum for invoice status
CREATE TYPE public.invoice_status AS ENUM ('draft', 'saved', 'paid', 'cancelled');

-- Create company settings table (single row)
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Sri Rajendra Tex',
  company_tagline text DEFAULT 'Grey Cloth Manufacturing',
  company_address text NOT NULL DEFAULT '5/307 Maniakaran Kadu, Ichipatti, Palladam(TK), Tiruppur(DT)-641668',
  company_phone text DEFAULT '9865728564',
  company_email text DEFAULT 'srirajendratex45@gmail.com',
  company_pan text NOT NULL DEFAULT 'CEVPS4657C',
  company_gstin text NOT NULL DEFAULT '33CEVPS4657C1Z2',
  logo_url text,
  bank_name text DEFAULT 'Indian Overseas Bank',
  bank_account_no text DEFAULT '100402000001100',
  bank_branch text DEFAULT 'Kollupalayam',
  bank_ifsc text DEFAULT 'IOBA0001004',
  default_cgst_rate numeric(5,2) DEFAULT 2.5,
  default_sgst_rate numeric(5,2) DEFAULT 2.5,
  invoice_counter integer DEFAULT 1,
  invoice_prefix text DEFAULT '',
  terms_and_conditions text DEFAULT 'Overdue interest will be charged at 24% from the invoice date. We are not responsible for any loss or damage in transit. We will not accept any claim after processing of goods. Subject to: TIRUPPUR jurisdiction.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default company settings
INSERT INTO public.company_settings (id) VALUES (gen_random_uuid());

-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  gstin text NOT NULL,
  pan text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(gstin)
);

-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  financial_year text NOT NULL,
  tax_on_reverse_charge boolean DEFAULT false,
  
  -- Billed To
  billed_to_name text NOT NULL,
  billed_to_address text NOT NULL,
  billed_to_gstin text NOT NULL,
  billed_to_pan text NOT NULL,
  
  -- Shipped To
  shipped_to_name text NOT NULL,
  shipped_to_address text NOT NULL,
  shipped_to_gstin text NOT NULL,
  shipped_to_pan text NOT NULL,
  
  -- Order details
  order_no text,
  payment_terms text,
  
  -- Calculations
  assessable_value numeric(15,2) NOT NULL DEFAULT 0,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 2.5,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 2.5,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  rounded_off numeric(15,2) DEFAULT 0,
  net_amount numeric(15,2) NOT NULL DEFAULT 0,
  amount_in_words text,
  
  -- Bale summary
  total_bales integer DEFAULT 0,
  bale_numbers text,
  
  -- Bank details (snapshot at time of invoice)
  bank_name text,
  bank_account_no text,
  bank_branch text,
  bank_ifsc text,
  
  -- Terms
  terms_and_conditions text,
  
  -- Signatures
  prepared_by text,
  checked_by text,
  
  -- Status
  status invoice_status DEFAULT 'draft',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(invoice_no, financial_year)
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  hsn_code text NOT NULL DEFAULT '520812',
  bales integer NOT NULL DEFAULT 0,
  pieces integer NOT NULL DEFAULT 0,
  total_metre numeric(15,2) NOT NULL DEFAULT 0,
  rate_per_metre numeric(15,2) NOT NULL DEFAULT 0,
  amount numeric(15,2) NOT NULL DEFAULT 0,
  folding_less_percentage numeric(5,2) DEFAULT 0,
  folding_less_metre numeric(15,2) DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for now - add auth later)
CREATE POLICY "Allow public read company_settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update company_settings" ON public.company_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete customers" ON public.customers FOR DELETE USING (true);

CREATE POLICY "Allow public read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoices" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Allow public read invoice_items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_items" ON public.invoice_items FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_invoices_invoice_no ON public.invoices(invoice_no);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_gstin ON public.invoices(billed_to_gstin);
CREATE INDEX idx_invoices_financial_year ON public.invoices(financial_year);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_customers_gstin ON public.customers(gstin);
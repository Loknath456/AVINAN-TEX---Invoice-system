import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Copy } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Invoice, InvoiceItem, CompanySettings } from "@/types/invoice";
import { calculateFinancialYear, convertToWords, validateGSTIN, validatePAN, formatCurrency, generateInvoiceNumber } from "@/lib/invoice-utils";
import { useAuth } from "@/contexts/AuthContext";

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [copyShipping, setCopyShipping] = useState(false);
  
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_no: "",
    invoice_date: new Date().toISOString().split('T')[0],
    financial_year: calculateFinancialYear(new Date()),
    tax_on_reverse_charge: false,
    billed_to_name: "",
    billed_to_address: "",
    billed_to_gstin: "",
    billed_to_pan: "",
    shipped_to_name: "",
    shipped_to_address: "",
    shipped_to_gstin: "",
    shipped_to_pan: "",
    order_no: "",
    payment_terms: "",
    assessable_value: 0,
    cgst_rate: 2.5,
    cgst_amount: 0,
    sgst_rate: 2.5,
    sgst_amount: 0,
    rounded_off: 0,
    net_amount: 0,
    total_bales: 0,
    bale_numbers: "",
    status: "draft",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      hsn_code: "520812",
      bales: 0,
      pieces: 0,
      total_metre: 0,
      rate_per_metre: 0,
      amount: 0,
      folding_less_percentage: 0,
      folding_less_metre: 0,
      sort_order: 0,
    },
  ]);

  useEffect(() => {
    fetchSettings();
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  useEffect(() => {
    if (copyShipping) {
      setInvoice({
        ...invoice,
        shipped_to_name: invoice.billed_to_name,
        shipped_to_address: invoice.billed_to_address,
        shipped_to_gstin: invoice.billed_to_gstin,
        shipped_to_pan: invoice.billed_to_pan,
      });
    }
  }, [copyShipping]);

  useEffect(() => {
    calculateTotals();
  }, [items, invoice.cgst_rate, invoice.sgst_rate]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .maybeSingle();
    
    if (data) {
      setSettings(data);
      setInvoice(prev => ({
        ...prev,
        cgst_rate: data.default_cgst_rate,
        sgst_rate: data.default_sgst_rate,
        bank_name: data.bank_name,
        bank_account_no: data.bank_account_no,
        bank_branch: data.bank_branch,
        bank_ifsc: data.bank_ifsc,
        terms_and_conditions: data.terms_and_conditions,
      }));
    }
  };

  const fetchInvoice = async (invoiceId: string) => {
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    const { data: itemsData } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("sort_order");

    if (invoiceData) {
      setInvoice(invoiceData);
    }
    if (itemsData && itemsData.length > 0) {
      setItems(itemsData);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalBales = 0;

    items.forEach(item => {
      const netMetre = item.total_metre - (item.folding_less_metre || 0);
      const amount = netMetre * item.rate_per_metre;
      item.amount = amount;
      subtotal += amount;
      totalBales += item.bales || 0;
    });

    const cgstAmount = (subtotal * invoice.cgst_rate) / 100;
    const sgstAmount = (subtotal * invoice.sgst_rate) / 100;
    const total = subtotal + cgstAmount + sgstAmount;
    const rounded = Math.round(total);
    const roundedOff = rounded - total;

    setInvoice(prev => ({
      ...prev,
      assessable_value: subtotal,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      rounded_off: roundedOff,
      net_amount: rounded,
      amount_in_words: convertToWords(rounded),
      total_bales: totalBales,
    }));
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsn_code: "520812",
        bales: 0,
        pieces: 0,
        total_metre: 0,
        rate_per_metre: 0,
        amount: 0,
        folding_less_percentage: 0,
        folding_less_metre: 0,
        sort_order: items.length,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate folding less metre
    if (field === "folding_less_percentage" || field === "total_metre") {
      const item = newItems[index];
      item.folding_less_metre = (item.total_metre * (item.folding_less_percentage || 0)) / 100;
    }
    
    setItems(newItems);
  };

  const handleSave = async () => {
    // Validation
    if (!invoice.billed_to_gstin || !validateGSTIN(invoice.billed_to_gstin)) {
      toast({
        title: "Validation Error",
        description: "Invalid Billed To GSTIN format",
        variant: "destructive",
      });
      return;
    }

    if (invoice.billed_to_pan && !validatePAN(invoice.billed_to_pan)) {
      toast({
        title: "Validation Error",
        description: "Invalid Billed To PAN format",
        variant: "destructive",
      });
      return;
    }

    if (!invoice.shipped_to_gstin || !validateGSTIN(invoice.shipped_to_gstin)) {
      toast({
        title: "Validation Error",
        description: "Invalid Shipped To GSTIN format",
        variant: "destructive",
      });
      return;
    }

    if (invoice.shipped_to_pan && !validatePAN(invoice.shipped_to_pan)) {
      toast({
        title: "Validation Error",
        description: "Invalid Shipped To PAN format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate invoice number if new and not manually entered
      if (!id && settings && !invoice.invoice_no) {
        // Fetch latest counter to avoid race conditions
        const { data: latestSettings } = await supabase
          .from("company_settings")
          .select("invoice_counter")
          .eq("id", settings.id)
          .single();
        
        const currentCounter = latestSettings?.invoice_counter || settings.invoice_counter;
        const invoiceNo = generateInvoiceNumber(currentCounter, settings.invoice_prefix);
        const fullInvoiceNo = `${invoiceNo}/${invoice.financial_year}`;
        
        // Check if invoice number already exists
        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id")
          .eq("invoice_no", fullInvoiceNo)
          .eq("financial_year", invoice.financial_year)
          .maybeSingle();
        
        if (existingInvoice) {
          toast({
            title: "Duplicate Invoice",
            description: "An invoice with this number already exists. Please try again.",
            variant: "destructive",
          });
          // Refresh settings to get updated counter
          fetchSettings();
          setLoading(false);
          return;
        }
        
        invoice.invoice_no = fullInvoiceNo;
        
        // Update counter
        await supabase
          .from("company_settings")
          .update({ invoice_counter: currentCounter + 1 })
          .eq("id", settings.id);
      } else if (!id && invoice.invoice_no) {
        // Manual invoice number entered - check for duplicates
        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id")
          .eq("invoice_no", invoice.invoice_no)
          .eq("financial_year", invoice.financial_year)
          .maybeSingle();
        
        if (existingInvoice) {
          toast({
            title: "Duplicate Invoice",
            description: "An invoice with this number already exists.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      invoice.status = "saved";

      if (id) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update(invoice)
          .eq("id", id);

        if (invoiceError) throw invoiceError;

        // Delete old items
        await supabase.from("invoice_items").delete().eq("invoice_id", id);

        // Insert new items
        const itemsToInsert = items.map((item, index) => ({
          ...item,
          invoice_id: id,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        // Insert new invoice with user_id
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .insert([{ ...invoice, user_id: user?.id }])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Insert items
        const itemsToInsert = items.map((item, index) => ({
          ...item,
          invoice_id: invoiceData.id,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: "Success",
          description: "Invoice created successfully",
        });

        navigate(`/invoice/preview/${invoiceData.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/invoices">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">
                {id ? "Edit Invoice" : "Create New Invoice"}
              </h1>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6 space-y-6">
          {/* Invoice Meta */}
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="invoice_no">Invoice No</Label>
              <Input
                id="invoice_no"
                value={invoice.invoice_no}
                onChange={(e) =>
                  setInvoice({ ...invoice, invoice_no: e.target.value })
                }
                placeholder={id ? "" : "Auto-generated if empty"}
              />
            </div>
            <div>
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                type="date"
                id="invoice_date"
                value={invoice.invoice_date}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setInvoice({
                    ...invoice,
                    invoice_date: e.target.value,
                    financial_year: calculateFinancialYear(date),
                  });
                }}
              />
            </div>
            <div>
              <Label htmlFor="financial_year">Financial Year</Label>
              <Input
                id="financial_year"
                value={invoice.financial_year}
                disabled
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="tax_reverse"
                checked={invoice.tax_on_reverse_charge}
                onCheckedChange={(checked) =>
                  setInvoice({ ...invoice, tax_on_reverse_charge: !!checked })
                }
              />
              <Label htmlFor="tax_reverse" className="cursor-pointer">
                Tax Payable on Reverse Charge
              </Label>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Billed To</h3>
              <div>
                <Label htmlFor="billed_name">Name *</Label>
                <Input
                  id="billed_name"
                  value={invoice.billed_to_name}
                  onChange={(e) =>
                    setInvoice({ ...invoice, billed_to_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="billed_address">Address *</Label>
                <Textarea
                  id="billed_address"
                  rows={3}
                  value={invoice.billed_to_address}
                  onChange={(e) =>
                    setInvoice({ ...invoice, billed_to_address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="billed_gstin">GSTIN *</Label>
                <Input
                  id="billed_gstin"
                  value={invoice.billed_to_gstin}
                  onChange={(e) =>
                    setInvoice({ ...invoice, billed_to_gstin: e.target.value.toUpperCase() })
                  }
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="billed_pan">PAN</Label>
                <Input
                  id="billed_pan"
                  value={invoice.billed_to_pan}
                  onChange={(e) =>
                    setInvoice({ ...invoice, billed_to_pan: e.target.value.toUpperCase() })
                  }
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-lg">Shipped To</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="copy_shipping"
                    checked={copyShipping}
                    onCheckedChange={(checked) => setCopyShipping(!!checked)}
                  />
                  <Label htmlFor="copy_shipping" className="cursor-pointer text-sm">
                    Same as Billed To
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="shipped_name">Name *</Label>
                <Input
                  id="shipped_name"
                  value={invoice.shipped_to_name}
                  onChange={(e) =>
                    setInvoice({ ...invoice, shipped_to_name: e.target.value })
                  }
                  disabled={copyShipping}
                />
              </div>
              <div>
                <Label htmlFor="shipped_address">Address *</Label>
                <Textarea
                  id="shipped_address"
                  rows={3}
                  value={invoice.shipped_to_address}
                  onChange={(e) =>
                    setInvoice({ ...invoice, shipped_to_address: e.target.value })
                  }
                  disabled={copyShipping}
                />
              </div>
              <div>
                <Label htmlFor="shipped_gstin">GSTIN *</Label>
                <Input
                  id="shipped_gstin"
                  value={invoice.shipped_to_gstin}
                  onChange={(e) =>
                    setInvoice({ ...invoice, shipped_to_gstin: e.target.value.toUpperCase() })
                  }
                  maxLength={15}
                  disabled={copyShipping}
                />
              </div>
              <div>
                <Label htmlFor="shipped_pan">PAN</Label>
                <Input
                  id="shipped_pan"
                  value={invoice.shipped_to_pan}
                  onChange={(e) =>
                    setInvoice({ ...invoice, shipped_to_pan: e.target.value.toUpperCase() })
                  }
                  maxLength={10}
                  disabled={copyShipping}
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="order_no">Order No.</Label>
              <Input
                id="order_no"
                value={invoice.order_no || ""}
                onChange={(e) => setInvoice({ ...invoice, order_no: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={invoice.payment_terms || ""}
                onChange={(e) => setInvoice({ ...invoice, payment_terms: e.target.value })}
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
            <Textarea
              id="terms_and_conditions"
              rows={4}
              value={invoice.terms_and_conditions || ""}
              onChange={(e) => setInvoice({ ...invoice, terms_and_conditions: e.target.value })}
              placeholder="Enter terms and conditions..."
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Line Items</h3>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4 relative">
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="e.g., 60 X 50 X 50'' - 20S X 20S"
                      />
                    </div>
                    <div>
                      <Label>HSN Code *</Label>
                      <Input
                        value={item.hsn_code}
                        onChange={(e) => updateItem(index, "hsn_code", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bales</Label>
                      <Input
                        type="number"
                        value={item.bales}
                        onChange={(e) => updateItem(index, "bales", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Pieces</Label>
                      <Input
                        type="number"
                        value={item.pieces}
                        onChange={(e) => updateItem(index, "pieces", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total Metre *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.total_metre}
                        onChange={(e) => updateItem(index, "total_metre", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Folding Less %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.folding_less_percentage}
                        onChange={(e) => updateItem(index, "folding_less_percentage", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Folding Less Metre</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.folding_less_metre}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Rate/Metre *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate_per_metre}
                        onChange={(e) => updateItem(index, "rate_per_metre", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label>Amount</Label>
                      <Input
                        value={formatCurrency(item.amount)}
                        disabled
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Bale Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="total_bales">Total Bales</Label>
              <Input
                id="total_bales"
                value={invoice.total_bales}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="bale_numbers">Bale Numbers</Label>
              <Input
                id="bale_numbers"
                value={invoice.bale_numbers || ""}
                onChange={(e) => setInvoice({ ...invoice, bale_numbers: e.target.value })}
                placeholder="e.g., 366-410"
              />
            </div>
          </div>

          {/* Tax Calculations */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Tax Calculations</h3>
            <div className="grid gap-4 md:grid-cols-2 max-w-2xl ml-auto">
              <div>
                <Label>Assessable Value</Label>
                <Input value={formatCurrency(invoice.assessable_value)} disabled />
              </div>
              <div></div>
              <div>
                <Label htmlFor="cgst_rate">CGST Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="cgst_rate"
                  value={invoice.cgst_rate}
                  onChange={(e) => setInvoice({ ...invoice, cgst_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>CGST Amount</Label>
                <Input value={formatCurrency(invoice.cgst_amount)} disabled />
              </div>
              <div>
                <Label htmlFor="sgst_rate">SGST Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="sgst_rate"
                  value={invoice.sgst_rate}
                  onChange={(e) => setInvoice({ ...invoice, sgst_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>SGST Amount</Label>
                <Input value={formatCurrency(invoice.sgst_amount)} disabled />
              </div>
              <div>
                <Label>Rounded Off</Label>
                <Input value={formatCurrency(invoice.rounded_off)} disabled />
              </div>
              <div>
                <Label className="text-lg font-bold">Net Amount</Label>
                <Input
                  value={formatCurrency(invoice.net_amount)}
                  disabled
                  className="font-bold text-lg"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Amount in Words</Label>
              <Input
                value={invoice.amount_in_words || ""}
                disabled
                className="font-semibold"
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default InvoiceForm;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Invoice, InvoiceItem, CompanySettings } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";
import { InvoiceHeader } from "@/components/InvoiceHeader";
const InvoicePreview = () => {
  const {
    id
  } = useParams();
  const {
    toast
  } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);
  const fetchInvoiceData = async () => {
    try {
      // First fetch the invoice to get the user_id
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      
      if (invoiceError) throw invoiceError;
      if (!invoiceData) {
        throw new Error("Invoice not found");
      }

      // Fetch company settings for the invoice owner
      const [settingsRes, itemsRes] = await Promise.all([
        supabase
          .from("company_settings")
          .select("*")
          .eq("user_id", invoiceData.user_id)
          .maybeSingle(),
        supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id!)
          .order("sort_order")
      ]);

      if (settingsRes.error) throw settingsRes.error;
      
      setInvoice(invoiceData);
      setSettings(settingsRes.data);
      setItems(itemsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load invoice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePrint = () => {
    window.print();
  };
  const handleDownloadPDF = async () => {
    toast({
      title: "PDF Download",
      description: "PDF generation feature will be implemented with server-side rendering"
    });
  };
  if (loading || !invoice || !settings) {
    return <div className="p-8 text-center">Loading invoice...</div>;
  }
  return <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/invoices">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Invoice Preview</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-invoice-bg border-2 border-invoice-border p-8 invoice-preview">
          <InvoiceHeader settings={settings} />

          {/* Tax on Reverse Charge */}
          <div className="text-xs mb-2 border-b border-invoice-border pb-1">
            Tax is Payable On Reverse Charge: {invoice.tax_on_reverse_charge ? "YES" : "NO"}
          </div>

          {/* Invoice Meta & Parties */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-invoice-border pb-4 mb-4">
            <div>
              <div className="font-semibold mb-1">INVOICE NO: {invoice.invoice_no}</div>
              <div className="space-y-1 border-solid">
                <div className="font-semibold">Billed To:</div>
                <div>{invoice.billed_to_name}</div>
                <div>{invoice.billed_to_address}</div>
                <div>GSTIN: {invoice.billed_to_gstin}</div>
                <div>PAN: {invoice.billed_to_pan}</div>
              </div>
              {invoice.order_no && <div className="mt-2">
                  <span className="font-semibold">ORDER NO:</span> {invoice.order_no}
                </div>}
              {invoice.payment_terms && <div>
                  <span className="font-semibold">PAYMENT TERMS:</span> {invoice.payment_terms}
                </div>}
            </div>
            <div className="text-right">
              <div className="font-semibold mb-1">
                INVOICE DATE: {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
              </div>
              <div className="space-y-1 text-left">
                <div className="font-semibold">Shipped To:</div>
                <div>{invoice.shipped_to_name}</div>
                <div>{invoice.shipped_to_address}</div>
                <div>GSTIN: {invoice.shipped_to_gstin}</div>
                <div>PAN: {invoice.shipped_to_pan}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="border-y border-invoice-border">
                <th className="text-left p-2 font-semibold">Description of Goods</th>
                <th className="text-center p-2 font-semibold w-20">HSN</th>
                <th className="text-center p-2 font-semibold w-16">No. of Bales</th>
                <th className="text-center p-2 font-semibold w-16">No. of Pieces</th>
                <th className="text-right p-2 font-semibold w-24">Total Metre</th>
                <th className="text-right p-2 font-semibold w-24">Rate/Metre</th>
                <th className="text-right p-2 font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => <tr key={index} className="border-b border-invoice-border">
                  <td className="p-2">
                    <div>{item.description}</div>
                    {item.folding_less_percentage > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        Folding Less {item.folding_less_percentage}%
                      </div>
                    )}
                  </td>
                  <td className="text-center p-2">{item.hsn_code}</td>
                  <td className="text-center p-2">{item.bales}</td>
                  <td className="text-center p-2">{item.pieces || "-"}</td>
                  <td className="text-right p-2">
                    <div>{item.total_metre.toFixed(2)}</div>
                    {item.folding_less_percentage > 0 && (
                      <>
                        <div className="text-[10px] text-muted-foreground">
                          {item.folding_less_metre.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-medium">
                          {(item.total_metre - item.folding_less_metre).toFixed(2)}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="text-right p-2">{item.rate_per_metre.toFixed(2)}</td>
                  <td className="text-right p-2 font-semibold">{formatCurrency(item.amount)}</td>
                </tr>)}
            </tbody>
          </table>

          {/* Bale Summary */}
          <div className="text-xs border-b border-invoice-border pb-2 mb-4">
            <span className="font-semibold">NO OF BALE:</span> {invoice.total_bales}
            {invoice.bale_numbers && (
              <span className="ml-4"><span className="font-semibold">BALE NOS:</span> {invoice.bale_numbers}</span>
            )}
          </div>

          {/* Bank Account & Tax Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-invoice-border pb-4 mb-4">
            <div className="space-y-1">
              <div className="font-semibold underline">Bank Account:</div>
              {(invoice.bank_account_no || settings?.bank_account_no) && <div>ACCOUNT NO: {invoice.bank_account_no || settings?.bank_account_no}</div>}
              {(invoice.bank_name || settings?.bank_name) && <div>BANK NAME: {invoice.bank_name || settings?.bank_name}</div>}
              {(invoice.bank_branch || settings?.bank_branch) && <div>BRANCH: {invoice.bank_branch || settings?.bank_branch}</div>}
              {(invoice.bank_ifsc || settings?.bank_ifsc) && <div>IFSC: {invoice.bank_ifsc || settings?.bank_ifsc}</div>}
            </div>
            
            <div className="space-y-1">
              <div className="font-semibold underline">Tax Summary:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>ASSESSABLE VALUE:</div>
                <div className="text-right">{formatCurrency(invoice.assessable_value)}</div>
                <div>CGST {invoice.cgst_rate}%:</div>
                <div className="text-right">{formatCurrency(invoice.cgst_amount)}</div>
                <div>SGST {invoice.sgst_rate}%:</div>
                <div className="text-right">{formatCurrency(invoice.sgst_amount)}</div>
                <div>ROUNDED OFF:</div>
                <div className="text-right">{formatCurrency(invoice.rounded_off)}</div>
                <div className="font-bold">NET AMOUNT:</div>
                <div className="text-right font-bold">{formatCurrency(invoice.net_amount)}</div>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="text-xs mb-4 border-b border-invoice-border pb-4">
            <span className="font-semibold">Rupees:</span> {invoice.amount_in_words}
          </div>

          {/* Terms & Conditions */}
          {(invoice.terms_and_conditions || settings?.terms_and_conditions) && (
            <div className="text-xs mb-6 border-b border-invoice-border pb-4">
              <div className="font-semibold underline mb-1">Terms & Conditions:</div>
              <div className="whitespace-pre-line">{invoice.terms_and_conditions || settings?.terms_and_conditions}</div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="h-12"></div>
              <div className="border-t border-invoice-border pt-1 font-semibold">
                {invoice.prepared_by || "Prepared by"}
              </div>
            </div>
            <div className="text-center">
              <div className="h-12"></div>
              <div className="border-t border-invoice-border pt-1 font-semibold">
                {invoice.checked_by || "Checked by"}
              </div>
            </div>
            <div className="text-center">
              <div className="h-12"></div>
              <div className="border-t border-invoice-border pt-1 font-semibold">
                Authorised Signatory
                <div className="text-[10px] mt-1">For {settings.company_name.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default InvoicePreview;
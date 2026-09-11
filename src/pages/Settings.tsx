import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanySettings as CompanySettingsType } from "@/types/invoice";
import defaultLogo from "@/assets/avinan-logo.png";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [settings, setSettings] = useState<CompanySettingsType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch settings for current user
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setSettings(data);
    } else {
      // No settings yet - will be created by admin or show empty form
      setSettings(null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setLoading(true);
    const { error } = await supabase
      .from("company_settings")
      .update(settings)
      .eq("id", settings.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update settings with new logo URL
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: publicUrl })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings({ ...settings, logo_url: publicUrl });
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Remove from database
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: null })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings({ ...settings, logo_url: null });
      toast({
        title: "Success",
        description: "Logo removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  if (!settings) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Company Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 space-y-6">
          {/* Logo Upload Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Company Logo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={settings.logo_url || defaultLogo}
                  alt="Company Logo"
                  className="h-28 w-28 rounded-full object-cover border-2 border-border"
                />
                {settings.logo_url && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    title="Remove logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company_tagline">Tagline</Label>
                <Input
                  id="company_tagline"
                  value={settings.company_tagline || ""}
                  onChange={(e) => setSettings({ ...settings, company_tagline: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="company_address">Address *</Label>
                <Textarea
                  id="company_address"
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company_phone">Phone</Label>
                <Input
                  id="company_phone"
                  value={settings.company_phone || ""}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company_email">Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={settings.company_email || ""}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company_pan">PAN *</Label>
                <Input
                  id="company_pan"
                  value={settings.company_pan}
                  onChange={(e) => setSettings({ ...settings, company_pan: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="company_gstin">GSTIN *</Label>
                <Input
                  id="company_gstin"
                  value={settings.company_gstin}
                  onChange={(e) => setSettings({ ...settings, company_gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={settings.bank_name || ""}
                  onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bank_account_no">Account Number</Label>
                <Input
                  id="bank_account_no"
                  value={settings.bank_account_no || ""}
                  onChange={(e) => setSettings({ ...settings, bank_account_no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bank_branch">Branch</Label>
                <Input
                  id="bank_branch"
                  value={settings.bank_branch || ""}
                  onChange={(e) => setSettings({ ...settings, bank_branch: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bank_ifsc">IFSC Code</Label>
                <Input
                  id="bank_ifsc"
                  value={settings.bank_ifsc || ""}
                  onChange={(e) => setSettings({ ...settings, bank_ifsc: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Tax Settings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cgst_rate">Default CGST Rate (%)</Label>
                <Input
                  id="cgst_rate"
                  type="number"
                  step="0.01"
                  value={settings.default_cgst_rate}
                  onChange={(e) => setSettings({ ...settings, default_cgst_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="sgst_rate">Default SGST Rate (%)</Label>
                <Input
                  id="sgst_rate"
                  type="number"
                  step="0.01"
                  value={settings.default_sgst_rate}
                  onChange={(e) => setSettings({ ...settings, default_sgst_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Invoice Settings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="invoice_prefix">Invoice Number Prefix</Label>
                <Input
                  id="invoice_prefix"
                  value={settings.invoice_prefix || ""}
                  onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                  placeholder="e.g., INV-"
                />
              </div>
              <div>
                <Label htmlFor="invoice_counter">Next Invoice Number</Label>
                <Input
                  id="invoice_counter"
                  type="number"
                  value={settings.invoice_counter}
                  onChange={(e) => setSettings({ ...settings, invoice_counter: parseInt(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  rows={4}
                  value={settings.terms_and_conditions || ""}
                  onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link to="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;

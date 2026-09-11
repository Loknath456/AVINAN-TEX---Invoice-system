import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Plus, List, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/avinan-logo.png";

interface CompanyInfo {
  company_name: string;
  logo_url: string | null;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("company_settings")
        .select("company_name, logo_url")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setCompanyInfo(data);
      }
    };
    
    fetchCompanySettings();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const displayName = companyInfo?.company_name || "AVINAN TEX";
  const displayLogo = companyInfo?.logo_url || logo;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={displayLogo} alt={displayName} className="h-28 w-28 rounded-full object-cover" />
              <div>
                <h1 className="text-3xl font-bold text-primary">{displayName}</h1>
                <p className="text-sm text-muted-foreground">Tax Invoice Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
              )}
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="icon">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Link to="/invoice/new">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Create New Invoice</h2>
                <p className="text-sm text-muted-foreground">
                  Generate a new tax invoice with auto-calculations
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/invoices">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <List className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">View All Invoices</h2>
                <p className="text-sm text-muted-foreground">
                  Search, edit, duplicate, and manage your invoices
                </p>
              </div>
            </Card>
          </Link>

          {isAdmin && (
            <Link to="/admin">
              <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-secondary rounded-full">
                    <Shield className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">Admin Panel</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage users and company settings
                  </p>
                </div>
              </Card>
            </Link>
          )}
        </div>

      </main>
    </div>
  );
};

export default Index;

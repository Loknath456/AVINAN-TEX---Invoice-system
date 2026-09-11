import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, UserPlus, Trash2, Shield, Settings, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanySettings as CompanySettingsType } from "@/types/invoice";

interface UserWithRole {
  id: string;
  email: string;
  role: "admin" | "user" | null;
  role_id: string | null;
  created_at: string;
  has_settings: boolean;
  company_name: string | null;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviting, setInviting] = useState(false);
  
  // Settings dialog state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<CompanySettingsType | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Get all company settings to check which users have settings and get company names
      const { data: allSettings, error: settingsError } = await supabase
        .from("company_settings")
        .select("user_id, company_name");

      if (settingsError) throw settingsError;

      const settingsMap = new Map(allSettings?.map(s => [s.user_id, s.company_name]) || []);

      // Map roles to display format
      const userMap = new Map<string, UserWithRole>();
      
      roles?.forEach((role) => {
        userMap.set(role.user_id, {
          id: role.user_id,
          email: "Loading...",
          role: role.role as "admin" | "user",
          role_id: role.id,
          created_at: role.created_at || "",
          has_settings: settingsMap.has(role.user_id),
          company_name: settingsMap.get(role.user_id) || null,
        });
      });

      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email: inviteEmail, role: inviteRole },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite user",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "user", roleId: string | null) => {
    try {
      if (roleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User role updated",
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role removed",
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "Failed to remove user role",
        variant: "destructive",
      });
    }
  };

  const handleOpenSettings = async (userId: string) => {
    setSelectedUserId(userId);
    setSettingsDialogOpen(true);
    
    // Fetch user's settings
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setUserSettings(data);
    } else {
      // Create default settings for this user
      setUserSettings({
        id: "",
        user_id: userId,
        company_name: "",
        company_tagline: "",
        company_address: "",
        company_phone: "",
        company_email: "",
        company_pan: "",
        company_gstin: "",
        bank_name: "",
        bank_account_no: "",
        bank_branch: "",
        bank_ifsc: "",
        default_cgst_rate: 2.5,
        default_sgst_rate: 2.5,
        invoice_prefix: "",
        invoice_counter: 1,
        terms_and_conditions: "Overdue interest will be charged at 24% from the invoice date. We are not responsible for any loss or damage in transit. We will not accept any claim after processing of goods. Subject to: TIRUPPUR jurisdiction.",
        logo_url: null,
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!userSettings || !selectedUserId) return;

    setSavingSettings(true);
    try {
      if (userSettings.id) {
        // Update existing settings
        const { error } = await supabase
          .from("company_settings")
          .update({
            company_name: userSettings.company_name,
            company_tagline: userSettings.company_tagline,
            company_address: userSettings.company_address,
            company_phone: userSettings.company_phone,
            company_email: userSettings.company_email,
            company_pan: userSettings.company_pan,
            company_gstin: userSettings.company_gstin,
            bank_name: userSettings.bank_name,
            bank_account_no: userSettings.bank_account_no,
            bank_branch: userSettings.bank_branch,
            bank_ifsc: userSettings.bank_ifsc,
            default_cgst_rate: userSettings.default_cgst_rate,
            default_sgst_rate: userSettings.default_sgst_rate,
            invoice_prefix: userSettings.invoice_prefix,
            invoice_counter: userSettings.invoice_counter,
            terms_and_conditions: userSettings.terms_and_conditions,
          })
          .eq("id", userSettings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("company_settings")
          .insert({
            user_id: selectedUserId,
            company_name: userSettings.company_name,
            company_tagline: userSettings.company_tagline,
            company_address: userSettings.company_address,
            company_phone: userSettings.company_phone,
            company_email: userSettings.company_email,
            company_pan: userSettings.company_pan,
            company_gstin: userSettings.company_gstin,
            bank_name: userSettings.bank_name,
            bank_account_no: userSettings.bank_account_no,
            bank_branch: userSettings.bank_branch,
            bank_ifsc: userSettings.bank_ifsc,
            default_cgst_rate: userSettings.default_cgst_rate,
            default_sgst_rate: userSettings.default_sgst_rate,
            invoice_prefix: userSettings.invoice_prefix,
            invoice_counter: userSettings.invoice_counter,
            terms_and_conditions: userSettings.terms_and_conditions,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User settings saved successfully",
      });
      
      setSettingsDialogOpen(false);
      setUserSettings(null);
      setSelectedUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save user settings",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

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
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="user-settings">User Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Invite User Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite New User
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "user")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleInviteUser} disabled={inviting}>
                    {inviting ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Users List */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Users with Roles</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Invite your first user above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company / User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.company_name || <span className="font-mono text-xs text-muted-foreground">{user.id.substring(0, 8)}...</span>}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role || "user"}
                            onValueChange={(v) => handleUpdateRole(user.id, v as "admin" | "user", user.role_id)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRole(user.role_id!)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="user-settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage User Company Settings
              </h2>
              <p className="text-muted-foreground mb-4">
                Configure company settings for each user. These settings will be used on their invoices.
              </p>
              
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Invite users first.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company / User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Settings Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.company_name || <span className="font-mono text-xs text-muted-foreground">{user.id.substring(0, 8)}...</span>}
                        </TableCell>
                        <TableCell className="capitalize">{user.role || "user"}</TableCell>
                        <TableCell>
                          {user.has_settings ? (
                            <span className="text-green-600 dark:text-green-400">Configured</span>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">Not configured</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSettings(user.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {user.has_settings ? "Edit" : "Configure"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Company Settings</DialogTitle>
          </DialogHeader>
          
          {userSettings && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-semibold mb-3">Company Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={userSettings.company_name}
                      onChange={(e) => setUserSettings({ ...userSettings, company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_tagline">Tagline</Label>
                    <Input
                      id="company_tagline"
                      value={userSettings.company_tagline || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, company_tagline: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="company_address">Address *</Label>
                    <Textarea
                      id="company_address"
                      value={userSettings.company_address}
                      onChange={(e) => setUserSettings({ ...userSettings, company_address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Phone</Label>
                    <Input
                      id="company_phone"
                      value={userSettings.company_phone || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, company_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={userSettings.company_email || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, company_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_pan">PAN *</Label>
                    <Input
                      id="company_pan"
                      value={userSettings.company_pan}
                      onChange={(e) => setUserSettings({ ...userSettings, company_pan: e.target.value.toUpperCase() })}
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_gstin">GSTIN *</Label>
                    <Input
                      id="company_gstin"
                      value={userSettings.company_gstin}
                      onChange={(e) => setUserSettings({ ...userSettings, company_gstin: e.target.value.toUpperCase() })}
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-3">Bank Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={userSettings.bank_name || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, bank_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_account_no">Account Number</Label>
                    <Input
                      id="bank_account_no"
                      value={userSettings.bank_account_no || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, bank_account_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_branch">Branch</Label>
                    <Input
                      id="bank_branch"
                      value={userSettings.bank_branch || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, bank_branch: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_ifsc">IFSC Code</Label>
                    <Input
                      id="bank_ifsc"
                      value={userSettings.bank_ifsc || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, bank_ifsc: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-3">Tax Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cgst_rate">Default CGST Rate (%)</Label>
                    <Input
                      id="cgst_rate"
                      type="number"
                      step="0.01"
                      value={userSettings.default_cgst_rate}
                      onChange={(e) => setUserSettings({ ...userSettings, default_cgst_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sgst_rate">Default SGST Rate (%)</Label>
                    <Input
                      id="sgst_rate"
                      type="number"
                      step="0.01"
                      value={userSettings.default_sgst_rate}
                      onChange={(e) => setUserSettings({ ...userSettings, default_sgst_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-3">Invoice Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="invoice_prefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoice_prefix"
                      value={userSettings.invoice_prefix || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, invoice_prefix: e.target.value })}
                      placeholder="e.g., INV-"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoice_counter">Next Invoice Number</Label>
                    <Input
                      id="invoice_counter"
                      type="number"
                      value={userSettings.invoice_counter}
                      onChange={(e) => setUserSettings({ ...userSettings, invoice_counter: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      rows={4}
                      value={userSettings.terms_and_conditions || ""}
                      onChange={(e) => setUserSettings({ ...userSettings, terms_and_conditions: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
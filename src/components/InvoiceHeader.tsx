import logo from "@/assets/avinan-logo.png";
import { CompanySettings } from "@/types/invoice";
interface InvoiceHeaderProps {
  settings: CompanySettings;
}
export const InvoiceHeader = ({
  settings
}: InvoiceHeaderProps) => {
  return <div className="border-b-2 border-invoice-border pb-4 mb-4">
      <div className="text-center mb-2">
        <h1 className="font-bold uppercase text-lg text-center pl-0 pr-[26px]">TAX INVOICE</h1>
        
      </div>
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {settings.logo_url ? <img src={settings.logo_url} alt={settings.company_name} className="h-28 w-28 rounded-full object-cover" /> : <img src={logo} alt={settings.company_name} className="h-28 w-28 rounded-full object-cover" />}
        </div>
        
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-primary uppercase text-center">{settings.company_name}</h2>
          {settings.company_tagline && <p className="text-sm text-muted-foreground uppercase">{settings.company_tagline}</p>}
          <p className="text-xs mt-2">{settings.company_address}</p>
          {settings.company_phone && <p className="text-xs">Phone: {settings.company_phone}</p>}
          {settings.company_email && <p className="text-xs">Email: {settings.company_email}</p>}
        </div>
        
        <div className="flex-shrink-0 text-right text-xs space-y-1">
          
          <p className="font-semibold">GSTIN: {settings.company_gstin}</p>
        </div>
      </div>
    </div>;
};
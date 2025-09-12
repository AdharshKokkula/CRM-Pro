import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmailStatus } from './EmailStatus';
import { Mail, Phone, Building2, MapPin, Edit, Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  created_at: string;
  welcome_email_sent?: boolean;
  welcome_email_sent_at?: string;
  _count?: {
    leads: number;
  };
}

interface CustomerListViewProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onRefresh?: () => void;
}

export function CustomerListView({ customers, onEdit, onDelete, onRefresh }: CustomerListViewProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customers found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Company</th>
            <th className="text-left p-3 font-medium">Contact</th>
            <th className="text-left p-3 font-medium">Location</th>
            <th className="text-left p-3 font-medium">Leads</th>
            <th className="text-left p-3 font-medium">Email Status</th>
            <th className="text-left p-3 font-medium">Added</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <div className="font-medium">{customer.name}</div>
              </td>
              <td className="p-3">
                {customer.company && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3 mr-1" />
                    {customer.company}
                  </div>
                )}
              </td>
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                {customer.address && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[200px]">{customer.address}</span>
                  </div>
                )}
              </td>
              <td className="p-3">
                <Badge variant="secondary">
                  {customer._count?.leads || 0} leads
                </Badge>
              </td>
              <td className="p-3">
                <EmailStatus customer={customer} onEmailSent={onRefresh} />
              </td>
              <td className="p-3">
                <div className="text-sm text-muted-foreground">
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(customer)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
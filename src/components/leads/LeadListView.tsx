import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Building2, Edit, Trash2 } from 'lucide-react';

interface Lead {
  id: string;
  title: string;
  description?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  value: number;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    company?: string;
  };
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  proposal: 'bg-purple-100 text-purple-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

interface LeadListViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadListView({ leads, onEdit, onDelete }: LeadListViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Lead</th>
            <th className="text-left p-3 font-medium">Customer</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Priority</th>
            <th className="text-left p-3 font-medium">Value</th>
            <th className="text-left p-3 font-medium">Close Date</th>
            <th className="text-left p-3 font-medium">Created</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <div>
                  <div className="font-medium">{lead.title}</div>
                  {lead.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                      {lead.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div>
                  <div className="font-medium text-sm">{lead.customer.name}</div>
                  {lead.customer.company && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3 mr-1" />
                      {lead.customer.company}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <Badge className={statusColors[lead.status]}>
                  {lead.status}
                </Badge>
              </td>
              <td className="p-3">
                <Badge variant="outline" className={priorityColors[lead.priority]}>
                  {lead.priority}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex items-center text-green-600 font-medium">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCurrency(lead.value)}
                </div>
              </td>
              <td className="p-3">
                {lead.expected_close_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(lead.expected_close_date).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="p-3">
                <div className="text-sm text-muted-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(lead)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(lead)}
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
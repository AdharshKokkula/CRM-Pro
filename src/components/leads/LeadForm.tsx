import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company?: string;
}

interface Lead {
  id: string;
  title: string;
  description?: string;
  customer_id: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  value: number;
  expected_close_date?: string;
  notes?: string;
}

interface LeadFormProps {
  lead?: Lead;
  onSaved: () => void;
}

export function LeadForm({ lead, onSaved }: LeadFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    title: lead?.title || '',
    description: lead?.description || '',
    customer_id: lead?.customer_id || '',
    status: lead?.status || 'new' as const,
    priority: lead?.priority || 'medium' as const,
    value: lead?.value?.toString() || '',
    expected_close_date: lead?.expected_close_date || '',
    notes: lead?.notes || '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, company')
        .eq('owner_id', user.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const leadData = {
        title: formData.title,
        description: formData.description || null,
        customer_id: formData.customer_id,
        status: formData.status,
        priority: formData.priority,
        value: formData.value ? parseFloat(formData.value) : 0,
        expected_close_date: formData.expected_close_date || null,
        notes: formData.notes || null,
      };

      if (lead) {
        const { error } = await supabase
          .from('leads')
          .update(leadData)
          .eq('id', lead.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leads')
          .insert(leadData);

        if (error) throw error;
      }

      onSaved();
      if (!lead) {
        setFormData({
          title: '',
          description: '',
          customer_id: '',
          status: 'new',
          priority: 'medium',
          value: '',
          expected_close_date: '',
          notes: '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Lead title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Select value={formData.customer_id} onValueChange={(value) => handleChange('customer_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.company && ` (${customer.company})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the lead opportunity"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected_close_date">Expected Close Date</Label>
        <Input
          id="expected_close_date"
          type="date"
          value={formData.expected_close_date}
          onChange={(e) => handleChange('expected_close_date', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about the lead"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || !formData.customer_id}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {lead ? 'Update Lead' : 'Save Lead'}
        </Button>
      </div>
    </form>
  );
}
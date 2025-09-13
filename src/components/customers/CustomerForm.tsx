import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EmailService } from '@/services/emailService';
import { Loader2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

interface CustomerFormProps {
  customer?: Customer;
  onSaved: () => void;
}

export function CustomerForm({ customer, onSaved }: CustomerFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(!customer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', customer.id);

        if (error) throw error;
      } else {
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            ...formData,
            owner_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Send welcome email for new customers
        if (sendWelcomeEmail && newCustomer) {
          try {
            console.log('Attempting to send welcome email to:', newCustomer.email);
            const emailSuccess = await EmailService.sendWelcomeEmail({
              id: newCustomer.id,
              name: newCustomer.name,
              email: newCustomer.email,
            });
            
            if (emailSuccess) {
              console.log('Welcome email sent successfully');
            } else {
              console.warn('Welcome email failed to send');
              toast({
                title: 'Warning',
                description: 'Customer created but welcome email failed to send',
                variant: 'destructive',
              });
            }
          } catch (emailError) {
            console.error('Welcome email failed:', emailError);
            toast({
              title: 'Warning', 
              description: 'Customer created but welcome email failed to send',
              variant: 'destructive',
            });
          }
        }
      }

      onSaved();
      if (!customer) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          notes: '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save customer',
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
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about the customer"
          rows={3}
        />
      </div>

      {!customer && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sendWelcomeEmail"
            checked={sendWelcomeEmail}
            onCheckedChange={setSendWelcomeEmail}
          />
          <Label htmlFor="sendWelcomeEmail" className="text-sm">
            Send welcome email with portal access
          </Label>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {customer ? 'Update Customer' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
}
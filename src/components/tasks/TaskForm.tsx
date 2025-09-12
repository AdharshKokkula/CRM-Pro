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
}

interface TaskFormProps {
  onSaved: () => void;
}

export function TaskForm({ onSaved }: TaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    estimated_hours: '',
    customer_ids: [] as string[],
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .eq('owner_id', user.id)
      .order('name');

    if (error) {
      console.error('Error loading customers:', error);
    } else {
      setCustomers(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customer_ids: prev.customer_ids.includes(customerId)
        ? prev.customer_ids.filter(id => id !== customerId)
        : [...prev.customer_ids, customerId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create task
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as any,
        status: formData.status as any,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        owner_id: user.id,
      };

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) throw taskError;

      // Link task to customers
      if (formData.customer_ids.length > 0) {
        const taskCustomerData = formData.customer_ids.map(customerId => ({
          task_id: task.id,
          customer_id: customerId,
        }));

        const { error: linkError } = await supabase
          .from('task_customers')
          .insert(taskCustomerData);

        if (linkError) throw linkError;
      }

      onSaved();
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        estimated_hours: '',
        customer_ids: [],
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Estimated Hours</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            step="0.5"
            min="0"
            value={formData.estimated_hours}
            onChange={handleChange}
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assign to Customers</Label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
          {customers.map(customer => (
            <label key={customer.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customer_ids.includes(customer.id)}
                onChange={() => handleCustomerSelect(customer.id)}
                className="rounded"
              />
              <span className="text-sm">{customer.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Task
        </Button>
      </div>
    </form>
  );
}
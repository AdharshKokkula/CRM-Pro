import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date: string | null;
  estimated_hours: number | null;
  created_at: string;
  customers: { id: string; name: string }[];
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  todo: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

interface TaskListViewProps {
  onTaskUpdate?: () => void;
}

export function TaskListView({ onTaskUpdate }: TaskListViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_customers!inner(
            customer:customers(id, name)
          )
        `)
        .or(`owner_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksWithCustomers = data.map(task => ({
        ...task,
        customers: task.task_customers?.map((tc: any) => tc.customer) || []
      }));

      setTasks(tasksWithCustomers);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      onTaskUpdate?.();
      
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    return !isNaN(date.getTime()) && date < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Task</th>
              <th className="text-left p-3 font-medium">Priority</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Due Date</th>
              <th className="text-left p-3 font-medium">Customers</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </div>
                    )}
                    {task.estimated_hours && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.estimated_hours}h estimated
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Badge className={priorityColors[task.priority]} variant="secondary">
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge className={statusColors[task.status]} variant="secondary">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-3">
                  {task.due_date && (
                    <div className={`flex items-center text-sm ${isOverdue(task.due_date) ? 'text-red-600' : 'text-muted-foreground'}`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(task.due_date)}
                      {isOverdue(task.due_date) && (
                        <AlertCircle className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {task.customers.length > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate">
                        {task.customers.map(c => c.name).join(', ')}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {task.status !== 'todo' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => {
                          const statuses = ['todo', 'in_progress', 'review', 'completed'];
                          const currentIndex = statuses.indexOf(task.status);
                          if (currentIndex > 0) {
                            updateTaskStatus(task.id, statuses[currentIndex - 1] as Task['status']);
                          }
                        }}
                      >
                        Back
                      </Button>
                    )}
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => {
                          const statuses = ['todo', 'in_progress', 'review', 'completed'];
                          const currentIndex = statuses.indexOf(task.status);
                          if (currentIndex < statuses.length - 1) {
                            updateTaskStatus(task.id, statuses[currentIndex + 1] as Task['status']);
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found. Create your first task to get started.
        </div>
      )}
    </div>
  );
}
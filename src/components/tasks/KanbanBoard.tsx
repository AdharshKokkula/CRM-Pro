import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: string;
  customers: { id: string; name: string }[];
}

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

interface KanbanBoardProps {
  onTaskUpdate?: () => void;
}

export function KanbanBoard({ onTaskUpdate }: KanbanBoardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

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

      // Transform the data to group customers for each task
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
        task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
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

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask) {
      updateTaskStatus(draggedTask, newStatus as Task['status']);
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[600px]">
      {statusColumns.map(column => (
        <div
          key={column.id}
          className={`${column.color} rounded-lg p-4 flex flex-col`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center justify-between flex-shrink-0">
            {column.title}
            <Badge variant="secondary" className="bg-white/50">
              {getTasksByStatus(column.id).length}
            </Badge>
          </h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto">
            {getTasksByStatus(column.id).map(task => (
              <Card
                key={task.id}
                className="cursor-move hover:shadow-md transition-shadow bg-white"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {task.title}
                    </CardTitle>
                    <Badge className={priorityColors[task.priority]} variant="secondary">
                      {task.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {task.due_date && (
                      <div className={`flex items-center text-xs ${isOverdue(task.due_date) ? 'text-red-600' : 'text-muted-foreground'}`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.due_date)}
                        {isOverdue(task.due_date) && (
                          <AlertCircle className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    )}
                    
                    {task.estimated_hours && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.estimated_hours}h estimated
                      </div>
                    )}
                    
                    {task.customers.length > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {task.customers.map(c => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 mt-3">
                    {column.id !== 'todo' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        aria-label="Move to previous status"
                        onClick={() => {
                          const currentIndex = statusColumns.findIndex(col => col.id === task.status);
                          if (currentIndex > 0) {
                            updateTaskStatus(task.id, statusColumns[currentIndex - 1].id as Task['status']);
                          }
                        }}
                      >
                        Back
                      </Button>
                    )}
                    
                    {column.id !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        aria-label="Move to next status"
                        onClick={() => {
                          const currentIndex = statusColumns.findIndex(col => col.id === task.status);
                          if (currentIndex < statusColumns.length - 1) {
                            updateTaskStatus(task.id, statusColumns[currentIndex + 1].id as Task['status']);
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
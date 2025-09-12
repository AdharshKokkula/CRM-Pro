import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Calendar } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: string;
}

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionRate: number;
  averageCompletionTime: number;
}

interface TaskAnalyticsViewProps {
  onTaskUpdate?: () => void;
}

export function TaskAnalyticsView({ onTaskUpdate }: TaskAnalyticsViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<TaskAnalytics>({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    tasksByStatus: {},
    tasksByPriority: {},
    completionRate: 0,
    averageCompletionTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`owner_id.eq.${user.id},assigned_to.eq.${user.id}`);

      if (error) throw error;

      const now = new Date();
      const overdueTasks = tasks?.filter(task => 
        task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
      ).length || 0;

      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const totalTasks = tasks?.length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const tasksByStatus = tasks?.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const tasksByPriority = tasks?.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalEstimatedHours = tasks?.reduce((sum, task) => 
        sum + (task.estimated_hours || 0), 0) || 0;
      
      const totalActualHours = tasks?.reduce((sum, task) => 
        sum + (task.actual_hours || 0), 0) || 0;

      setAnalytics({
        totalTasks,
        completedTasks,
        overdueTasks,
        totalEstimatedHours,
        totalActualHours,
        tasksByStatus,
        tasksByPriority,
        completionRate,
        averageCompletionTime: 0, // Would need more complex calculation
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All tasks in your system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEstimatedHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total estimated work
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status and Priority Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>
              Distribution of tasks across different stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tasksByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>
              Priority distribution of your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{priority}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          priority === 'urgent' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key insights from your task management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.completionRate.toFixed(1)}% of tasks completed
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Time Tracking</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.totalActualHours}h actual vs {analytics.totalEstimatedHours}h estimated
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Overdue Tasks</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.overdueTasks} tasks need immediate attention
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
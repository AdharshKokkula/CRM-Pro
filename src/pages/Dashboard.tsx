import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Target, TrendingUp, DollarSign, CheckSquare, Clock, AlertTriangle, Plus, UserPlus, BarChart3, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { LeadForm } from '@/components/leads/LeadForm';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  taskCompletionRate: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLeads: 0,
    totalValue: 0,
    conversionRate: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    taskCompletionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      // Fetch leads data
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          customers!inner (owner_id)
        `)
        .eq('customers.owner_id', user?.id);

      // Fetch tasks data
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .or(`owner_id.eq.${user?.id},assigned_to.eq.${user?.id}`);

      const totalLeads = leadsData?.length || 0;
      const totalValue = leadsData?.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0) || 0;
      const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
      const overdueTasks = tasksData?.filter(task => 
        task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
      ).length || 0;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      setStats({
        totalCustomers: customersCount || 0,
        totalLeads,
        totalValue,
        conversionRate,
        totalTasks,
        completedTasks,
        overdueTasks,
        taskCompletionRate,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleCustomerSaved = () => {
    setCustomerDialogOpen(false);
    fetchDashboardStats();
    toast({
      title: 'Success',
      description: 'Customer added successfully',
    });
  };

  const handleLeadSaved = () => {
    setLeadDialogOpen(false);
    fetchDashboardStats();
    toast({
      title: 'Success',
      description: 'Lead created successfully',
    });
  };

  const handleExportData = async () => {
    try {
      // Export customers data as CSV
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user?.id);

      if (customers && customers.length > 0) {
        const csvContent = [
          ['Name', 'Email', 'Phone', 'Company', 'Created At'].join(','),
          ...customers.map(customer => [
            customer.name,
            customer.email,
            customer.phone || '',
            customer.company || '',
            new Date(customer.created_at).toLocaleDateString()
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'Customer data exported successfully',
        });
      } else {
        toast({
          title: 'Info',
          description: 'No customer data to export',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const quickActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer record',
      icon: UserPlus,
      action: () => setCustomerDialogOpen(true),
      color: 'text-blue-600',
    },
    {
      title: 'Create Lead',
      description: 'Add a new sales opportunity',
      icon: Plus,
      action: () => setLeadDialogOpen(true),
      color: 'text-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'text-purple-600',
    },
    {
      title: 'Export Data',
      description: 'Download customer data',
      icon: Download,
      action: handleExportData,
      color: 'text-orange-600',
    },
  ];

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      description: 'Active customers in your CRM',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Leads',
      value: stats.totalLeads,
      description: 'Leads in your pipeline',
      icon: Target,
      color: 'text-green-600',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(stats.totalValue),
      description: 'Total value of all leads',
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      description: 'Leads converted to customers',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      description: 'All tasks in your system',
      icon: CheckSquare,
      color: 'text-indigo-600',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      description: 'Tasks marked as completed',
      icon: CheckSquare,
      color: 'text-green-600',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks,
      description: 'Tasks past their due date',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Task Completion',
      value: `${stats.taskCompletionRate.toFixed(1)}%`,
      description: 'Overall task completion rate',
      icon: Clock,
      color: 'text-teal-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your CRM performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Welcome to your CRM Dashboard
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start by adding your first customer to get started.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-muted"
                onClick={action.action}
              >
                <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSaved={handleCustomerSaved} />
        </DialogContent>
      </Dialog>

      {/* Lead Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm onSaved={handleLeadSaved} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EmailDashboard } from '@/components/admin/EmailDashboard';
import { EmailTest } from '@/components/admin/EmailTest';
import { BarChart3, TrendingUp, Users, Target, DollarSign, Mail } from 'lucide-react';

interface AnalyticsData {
  totalCustomers: number;
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
  leadsByStatus: Record<string, number>;
  recentGrowth: {
    customersGrowth: number;
    leadsGrowth: number;
    valueGrowth: number;
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCustomers: 0,
    totalLeads: 0,
    totalValue: 0,
    conversionRate: 0,
    leadsByStatus: {},
    recentGrowth: {
      customersGrowth: 0,
      leadsGrowth: 0,
      valueGrowth: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      // Fetch leads with customer data
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          customers!inner (owner_id)
        `)
        .eq('customers.owner_id', user?.id);

      // Calculate metrics
      const totalLeads = leadsData?.length || 0;
      const totalValue = leadsData?.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0) || 0;
      const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Group leads by status
      const leadsByStatus = leadsData?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setAnalytics({
        totalCustomers: customersCount || 0,
        totalLeads,
        totalValue,
        conversionRate,
        leadsByStatus,
        recentGrowth: {
          customersGrowth: 12, // Placeholder - would calculate from date ranges
          leadsGrowth: 8,
          valueGrowth: 23,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and performance metrics for your CRM
        </p>
      </div>

      <Tabs defaultValue="crm" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            CRM Analytics
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crm" className="mt-6">

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.recentGrowth.customersGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.recentGrowth.leadsGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.recentGrowth.valueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Leads converted to customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>
              Distribution of leads across different stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${analytics.totalLeads > 0 ? (count / analytics.totalLeads) * 100 : 0}%` 
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
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Key insights from your CRM data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Average Deal Size</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.totalLeads > 0 
                      ? formatCurrency(analytics.totalValue / analytics.totalLeads)
                      : '$0'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Qualified Leads</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.leadsByStatus.qualified || 0} leads ready for proposal
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Growth Trend</p>
                  <p className="text-sm text-muted-foreground">
                    Positive growth across all metrics
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="space-y-6">
            <EmailTest />
            <EmailDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
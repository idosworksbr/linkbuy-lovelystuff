import { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, RefreshCw, Download, Users, TrendingUp, DollarSign, ExternalLink, Package, Loader2, BarChart3, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MasterAnalyticsTab } from '@/components/MasterAnalyticsTab';
import { MasterUserManagement } from '@/components/MasterUserManagement';

const MasterDashboard = () => {
  const { master, signOut } = useMasterAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [stripeRevenue, setStripeRevenue] = useState<any>(null);
  const [catalogStats, setCatalogStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!master) {
      navigate('/loginmaster');
      return;
    }
    loadDashboardData();
  }, [master, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, revenueRes, statsRes] = await Promise.all([
        supabase.functions.invoke('admin-metrics'),
        supabase.functions.invoke('admin-stripe-revenue'),
        supabase.functions.invoke('admin-catalog-stats')
      ]);
      
      if (metricsRes.data) {
        setMetrics(metricsRes.data.metrics);
        setUsers(metricsRes.data.users);
      }
      if (revenueRes.data) setStripeRevenue(revenueRes.data);
      if (statsRes.data) setCatalogStats(statsRes.data);

      toast({ title: 'Dados carregados', description: 'Dashboard atualizado' });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-users');
      if (error) throw error;

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mylinkbuy-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({ title: 'Sucesso', description: 'Relatório exportado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao exportar', variant: 'destructive' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Master Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {master?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Store className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics do Site
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pagantes</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.paidUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stripeRevenue?.mrr || metrics?.monthlyRevenue || 0)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{catalogStats?.totalProducts || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <Button onClick={handleExportUsers} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MasterUserManagement users={users} onRefresh={loadDashboardData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <MasterAnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterDashboard;

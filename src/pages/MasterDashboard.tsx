import { useState, useEffect } from "react";
import { Users, CreditCard, TrendingUp, Download, RefreshCw, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  monthlyRevenue: number;
  annualRevenue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  store_name: string;
  subscription_plan: string;
  created_at: string;
  subscription_expires_at: string | null;
}

const MasterDashboard = () => {
  const { master, signOut } = useMasterAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!master) {
      navigate('/loginmaster');
      return;
    }
    loadDashboardData();
  }, [master, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-metrics');
      if (error) throw error;
      
      setMetrics(data.metrics);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
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
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Relatório de usuários exportado com sucesso",
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório de usuários",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/loginmaster');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'pro_plus_verified':
      case 'pro_plus':
        return 'default';
      case 'pro':
        return 'secondary';
      case 'verified':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Master</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {master?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadDashboardData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Pagantes</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.paidUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Usuários da Plataforma</CardTitle>
                    <CardDescription>
                      Lista completa de usuários registrados
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportUsers}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Expira em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.store_name}</TableCell>
                        <TableCell>
                          <Badge variant={getPlanBadgeVariant(user.subscription_plan)}>
                            {user.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {user.subscription_expires_at 
                            ? formatDate(user.subscription_expires_at)
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Receita</CardTitle>
                <CardDescription>
                  Métricas financeiras da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Receita Mensal</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics ? formatCurrency(metrics.monthlyRevenue) : '-'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Receita Anual</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics ? formatCurrency(metrics.annualRevenue) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Gere e baixe relatórios detalhados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportUsers} className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <p>Relatório de Usuários</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20" disabled>
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <p>Relatório Financeiro</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Master</CardTitle>
                <CardDescription>
                  Configurações da conta de administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Alterar Senha</h3>
                      <p className="text-sm text-muted-foreground">
                        Atualize sua senha de acesso
                      </p>
                    </div>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterDashboard;
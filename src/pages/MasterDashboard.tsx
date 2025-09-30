import { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LogOut, RefreshCw, Download, Users, TrendingUp, DollarSign, ExternalLink, Package, Loader2, BarChart3, Store, Search, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MasterAnalyticsTab } from '@/components/MasterAnalyticsTab';
import { RealtimeVisitors } from '@/components/RealtimeVisitors';
import { ExpirationSettings } from '@/components/ExpirationSettings';

const MasterDashboard = () => {
  const { master, signOut } = useMasterAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [stripeRevenue, setStripeRevenue] = useState<any>(null);
  const [catalogStats, setCatalogStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteUser = async () => {
    if (!userToDelete || deleteConfirmText !== 'DELETAR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Digite DELETAR para confirmar',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: {
          user_id: userToDelete.id,
          deleted_by: master?.email || 'master',
        },
      });

      if (error) throw error;

      toast({
        title: 'Usuário deletado',
        description: 'Todos os dados foram removidos com sucesso',
      });

      setUserToDelete(null);
      setDeleteConfirmText('');
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.store_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === 'all' || user.subscription_plan === planFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dateFilter === 'today') return daysDiff < 1;
      if (dateFilter === 'week') return daysDiff < 7;
      if (dateFilter === 'month') return daysDiff < 30;
      return true;
    })();

    const matchesVerified = 
      verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && user.is_verified) ||
      (verifiedFilter === 'unverified' && !user.is_verified);

    return matchesSearch && matchesPlan && matchesDate && matchesVerified;
  });

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
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <RealtimeVisitors />
              
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
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
                  <Button onClick={handleExportUsers} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
                
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os planos</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="pro_plus">Pro Plus</SelectItem>
                      <SelectItem value="verified">Verificado</SelectItem>
                      <SelectItem value="pro_plus_verified">Pro Plus Verificado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Verificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="verified">Verificados</SelectItem>
                      <SelectItem value="unverified">Não verificados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 100).map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.store_name}</TableCell>
                        <TableCell>
                          <Badge>{user.subscription_plan}</Badge>
                        </TableCell>
                        <TableCell>{user.product_count}</TableCell>
                        <TableCell>{user.lead_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(user.catalog_url, '_blank')}
                              title="Ver catálogo"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setUserToDelete(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Deletar usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <MasterAnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ExpirationSettings />
          </TabsContent>
        </Tabs>

        {/* Delete User Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Usuário e Todos os Dados?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Esta ação é <strong>irreversível</strong> e irá deletar:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Perfil do usuário: <strong>{userToDelete?.name}</strong></li>
                  <li>Email: <strong>{userToDelete?.email}</strong></li>
                  <li>Todos os produtos ({userToDelete?.product_count || 0})</li>
                  <li>Todas as categorias</li>
                  <li>Todos os leads ({userToDelete?.lead_count || 0})</li>
                  <li>Links personalizados</li>
                  <li>Analytics e estatísticas</li>
                  <li>Assinaturas e pagamentos</li>
                  <li>Todas as imagens do storage</li>
                  <li>Conta de autenticação</li>
                </ul>
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Para confirmar, digite <strong>DELETAR</strong> abaixo:
                  </p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Digite DELETAR"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setUserToDelete(null);
                setDeleteConfirmText('');
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== 'DELETAR' || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  'Deletar Permanentemente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MasterDashboard;

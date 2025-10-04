import { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AffiliatesList } from '@/components/AffiliatesList';
import { AffiliateForm } from '@/components/AffiliateForm';
import { AffiliateDetails } from '@/components/AffiliateDetails';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  affiliate_code: string;
  affiliate_url: string;
  commission_rate: number;
  status: string;
  created_at: string;
}

const AffiliatesManagement = () => {
  const { master } = useMasterAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!master) {
      navigate('/loginmaster');
      return;
    }
    loadAffiliates();
  }, [master, navigate]);

  const loadAffiliates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAffiliates(data || []);
      
      // Calculate stats
      const active = data?.filter(a => a.status === 'active').length || 0;
      setStats({
        total: data?.length || 0,
        active,
        totalRevenue: 0 // Will be calculated from commissions
      });

    } catch (error) {
      console.error('Error loading affiliates:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar afiliados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAffiliate = () => {
    setSelectedAffiliate(null);
    setShowForm(true);
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAffiliate(null);
    loadAffiliates();
  };

  const handleViewDetails = (affiliate: Affiliate) => {
    navigate(`/master/affiliates/${affiliate.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/master')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Gestão de Afiliados</h1>
                <p className="text-sm text-muted-foreground">Gerencie afiliados e comissões</p>
              </div>
            </div>
            <Button onClick={handleCreateAffiliate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Afiliado
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {showForm ? (
          <AffiliateForm
            affiliate={selectedAffiliate}
            onClose={handleCloseForm}
          />
        ) : selectedAffiliate ? (
          <AffiliateDetails
            affiliate={selectedAffiliate}
            onBack={() => setSelectedAffiliate(null)}
            onEdit={handleEditAffiliate}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliatesList
                affiliates={affiliates}
                onEdit={handleEditAffiliate}
                onViewDetails={handleViewDetails}
                onRefresh={loadAffiliates}
                loading={loading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AffiliatesManagement;
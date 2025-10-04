import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AffiliateDetails } from '@/components/AffiliateDetails';
import { useMasterAuth } from '@/hooks/useMasterAuth';

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

const AffiliateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { master } = useMasterAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!master) {
      navigate('/loginmaster');
      return;
    }
    if (id) fetchAffiliate(id);
  }, [id, master]);

  const fetchAffiliate = async (affiliateId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();
      if (error) throw error;
      setAffiliate(data as Affiliate);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível carregar o afiliado', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Afiliado não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/master/affiliates')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/master/affiliates')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">Afiliado: {affiliate.name}</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6">
        <AffiliateDetails
          affiliate={affiliate}
          onBack={() => navigate('/master/affiliates')}
          onEdit={() => navigate('/master/affiliates')}
        />
      </div>
    </div>
  );
};

export default AffiliateProfile;

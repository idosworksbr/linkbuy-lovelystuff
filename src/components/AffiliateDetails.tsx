import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Copy, Users, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface AffiliateDetailsProps {
  affiliate: Affiliate;
  onBack: () => void;
  onEdit: (affiliate: Affiliate) => void;
}

interface Referral {
  id: string;
  user_id: string;
  referred_at: string;
  first_purchase_at: string | null;
  user_name: string;
  user_email: string;
  subscription_plan: string;
}

export const AffiliateDetails = ({ affiliate, onBack, onEdit }: AffiliateDetailsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadReferrals();
  }, [affiliate.id]);

  const loadReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
          id,
          user_id,
          referred_at,
          first_purchase_at,
          user:user_id(name, email, subscription_plan)
        `)
        .eq('affiliate_id', affiliate.id)
        .order('referred_at', { ascending: false });

      if (error) throw error;

      // Transform data
      const transformedData = data?.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        referred_at: r.referred_at,
        first_purchase_at: r.first_purchase_at,
        user_name: r.user?.name || 'N/A',
        user_email: r.user?.email || 'N/A',
        subscription_plan: r.user?.subscription_plan || 'free'
      })) || [];

      setReferrals(transformedData);

      // Calculate stats
      const active = transformedData.filter(r => r.subscription_plan !== 'free').length;
      setStats({
        totalReferrals: transformedData.length,
        activeSubscriptions: active,
        totalRevenue: 0, // TODO: Calculate from commissions table
        monthlyRevenue: 0 // TODO: Calculate from commissions table
      });

    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Link copiado para a área de transferência',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <CardTitle>{affiliate.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{affiliate.email}</p>
              </div>
            </div>
            <Button onClick={() => onEdit(affiliate)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Affiliate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Código do Afiliado</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                  {affiliate.affiliate_code}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(affiliate.affiliate_code)}
                >
                  {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Taxa de Comissão</p>
              <p className="text-lg font-semibold mt-1">{affiliate.commission_rate}%</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                className="mt-1"
                variant={affiliate.status === 'active' ? 'default' : 'secondary'}
              >
                {affiliate.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="text-sm mt-1">
                {new Date(affiliate.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Affiliate Link */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Link de Afiliado</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                {affiliate.affiliate_url}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(affiliate.affiliate_url)}
              >
                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Referências</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toFixed(2)}</div>
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

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Referenciados</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário referenciado ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Referido em</TableHead>
                  <TableHead>Primeira Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.user_name}</TableCell>
                    <TableCell>{referral.user_email}</TableCell>
                    <TableCell>
                      <Badge>{referral.subscription_plan.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(referral.referred_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {referral.first_purchase_at
                        ? new Date(referral.first_purchase_at).toLocaleDateString('pt-BR')
                        : 'Sem compra'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
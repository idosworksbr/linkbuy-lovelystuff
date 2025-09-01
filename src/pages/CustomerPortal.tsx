import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  Crown, 
  ExternalLink, 
  Receipt, 
  Download,
  RefreshCw,
  Settings,
  XCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlans } from "@/hooks/usePlans";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_url?: string;
  description?: string;
}

const CustomerPortal = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { subscription, loading: subscriptionLoading, checkSubscription, openCustomerPortal, cancelSubscription } = useSubscription();
  const { plans, getPlanName, isExpired } = usePlans();
  const { toast } = useToast();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (profile) {
      checkSubscription();
      loadPaymentHistory();
    }
  }, [profile, checkSubscription]);

  const loadPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-history');
      if (error) throw error;
      setPaymentHistory(data?.payments || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefreshStatus = async () => {
    await checkSubscription();
    await loadPaymentHistory();
    toast({
      title: "Status atualizado",
      description: "Informações de assinatura e pagamentos atualizadas com sucesso.",
    });
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'usd' ? 'USD' : 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  if (profileLoading || subscriptionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando portal do cliente...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = profile?.subscription_plan || 'free';
  const isSubscribed = subscription?.subscribed || false;
  const hasExpired = isExpired(profile);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portal do Cliente</h1>
            <p className="text-muted-foreground">
              Gerencie sua assinatura e histórico de pagamentos
            </p>
          </div>
          <Button variant="outline" onClick={handleRefreshStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Current Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Status da Assinatura Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{getPlanName(currentPlan)}</h3>
                  {isSubscribed && !hasExpired ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : hasExpired ? (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expirado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Gratuito
                    </Badge>
                  )}
                </div>
                
                {profile?.subscription_expires_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {hasExpired ? 'Expirou em: ' : 'Próxima cobrança: '}
                      {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {isSubscribed && (
                  <>
                    <Button onClick={openCustomerPortal} className="gap-2" variant="outline">
                      <Settings className="h-4 w-4" />
                      Gerenciar no Stripe
                    </Button>
                    <Button 
                      onClick={() => cancelSubscription(false)} 
                      variant="outline"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar Assinatura
                    </Button>
                  </>
                )}
              </div>
            </div>

            {currentPlan !== 'free' && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Recursos inclusos no seu plano:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {plans.find(p => p.name.toLowerCase().replace(/\s+/g, '_').replace('+', '_plus') === currentPlan.replace('_plus', '_plus'))?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Notice */}
            {isSubscribed && profile?.subscription_expires_at && !hasExpired && (
              <div className="pt-4 border-t">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-1">
                        Informação sobre cancelamento
                      </h4>
                      <p className="text-sm text-orange-700">
                        Se você cancelar sua assinatura, ela permanecerá ativa até{' '}
                        <strong>{new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}</strong>.
                        Após essa data, sua conta retornará ao plano gratuito.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Histórico de Pagamentos
            </CardTitle>
            <CardDescription>
              Visualize todas as suas transações e faturas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span>Carregando histórico...</span>
              </div>
            ) : paymentHistory.length > 0 ? (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                        <Badge 
                          variant={payment.status === 'paid' ? 'default' : 'secondary'}
                          className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.created)} • {payment.description || 'Assinatura'}
                      </p>
                    </div>
                    {payment.invoice_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Fatura
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pagamento encontrado</p>
                <p className="text-sm">Seus pagamentos aparecerão aqui quando realizados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Gerenciar Assinatura</h4>
                <p className="text-sm text-muted-foreground">
                  Altere seu plano, atualize forma de pagamento ou cancele sua assinatura
                </p>
                {isSubscribed ? (
                  <Button variant="outline" onClick={openCustomerPortal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Stripe Portal
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard/plans'}>
                    <Crown className="h-4 w-4 mr-2" />
                    Ver Planos
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Suporte</h4>
                <p className="text-sm text-muted-foreground">
                  Precisa de ajuda? Entre em contato com nosso suporte
                </p>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contatar Suporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerPortal;
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Calendar, CreditCard, Crown, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlans } from "@/hooks/usePlans";
import { PlanCard } from "@/components/PlanCard";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { subscription, loading: subscriptionLoading, checkSubscription, openCustomerPortal } = useSubscription();
  const { plans, getPlanName, isExpired } = usePlans();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      checkSubscription();
    }
  }, [profile]);

  const handleRefreshStatus = async () => {
    await checkSubscription();
    toast({
      title: "Status atualizado",
      description: "Status da assinatura foi verificado com sucesso.",
    });
  };

  const handleUpgradeClick = (planName: string) => {
    // Redirect to plans page or trigger checkout
    window.location.href = '/dashboard/plans';
  };

  if (profileLoading || subscriptionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando informações da assinatura...</p>
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
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano atual e explore outras opções
          </p>
        </div>

        {/* Current Plan Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Status da Assinatura
            </CardTitle>
            <CardDescription>
              Informações sobre seu plano atual e status de pagamento
            </CardDescription>
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
                      {hasExpired ? 'Expirou em: ' : 'Expira em: '}
                      {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefreshStatus}>
                  Atualizar Status
                </Button>
                {isSubscribed && (
                  <Button onClick={openCustomerPortal} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Portal do Cliente
                  </Button>
                )}
              </div>
            </div>

            {/* Plan Features */}
            {currentPlan !== 'free' && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Recursos do seu plano:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {plans.find(p => p.name.toLowerCase().replace(/\s+/g, '_').replace('+', '_plus') === currentPlan.replace('_plus', '_plus'))?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>
              Explore nossos planos e faça upgrade para desbloquear mais recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const planKey = plan.name.toLowerCase().replace(/\s+/g, '_').replace('+', '_plus');
                const isCurrentPlan = planKey === currentPlan;
                
                return (
                  <PlanCard
                    key={plan.name}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan}
                    onSelectPlan={() => handleUpgradeClick(plan.name)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Users */}
        {currentPlan === 'free' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Crown className="h-12 w-12 text-blue-600 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">
                    Desbloqueie Todo o Potencial da sua Loja
                  </h3>
                  <p className="text-blue-700 mt-2">
                    Faça upgrade para um plano pago e tenha acesso a recursos avançados como links personalizados, temas exclusivos e muito mais.
                  </p>
                </div>
                <Button onClick={() => handleUpgradeClick('Pro')} className="bg-blue-600 hover:bg-blue-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Portal do Cliente Stripe</h4>
                <p className="text-sm text-muted-foreground">
                  Gerencie sua forma de pagamento, veja faturas e cancele sua assinatura
                </p>
                {isSubscribed && (
                  <Button variant="outline" size="sm" onClick={openCustomerPortal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Portal
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Suporte</h4>
                <p className="text-sm text-muted-foreground">
                  Entre em contato conosco se tiver dúvidas sobre sua assinatura
                </p>
                <Button variant="outline" size="sm">
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

export default Subscription;
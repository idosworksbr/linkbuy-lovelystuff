import { PlanCard } from "@/components/PlanCard";
import { usePlans } from "@/hooks/usePlans";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

export default function Plans() {
  const { plans, getPlanName } = usePlans();
  const { profile } = useProfile();
  const { subscription, loading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();

  // Temporary price IDs - these will be configured in Stripe later
  const priceIds = {
    "Pro": "price_pro_temp", // To be replaced with actual Stripe price ID
    "Pro+": "price_pro_plus_temp", // To be replaced with actual Stripe price ID
    "Selo Verificado": "price_verified_temp", // To be replaced with actual Stripe price ID
    "Pro+ Verificado": "price_pro_plus_verified_temp", // To be replaced with actual Stripe price ID
  };

  const handleSelectPlan = (planName: string) => {
    if (planName === "Free") {
      toast({
        title: "Plano gratuito",
        description: "Você já tem acesso ao plano gratuito!",
      });
      return;
    }

    const priceId = priceIds[planName as keyof typeof priceIds];
    if (!priceId || priceId.includes("temp")) {
      toast({
        title: "Em configuração",
        description: `O plano ${planName} ainda está sendo configurado. Configure as chaves de produto no Stripe primeiro.`,
      });
      return;
    }

    createCheckout(priceId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          Desbloqueie recursos premium para seu catálogo online
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            isCurrentPlan={profile ? getPlanName(profile.subscription_plan) === plan.name : false}
            onSelectPlan={() => handleSelectPlan(plan.name)}
          />
        ))}
      </div>

      {profile && (
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={checkSubscription}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Atualizar Status"
              )}
            </Button>
            
            {subscription?.subscribed && (
              <Button 
                variant="outline" 
                onClick={openCustomerPortal}
                disabled={loading}
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Plano atual: <strong>{getPlanName(profile.subscription_plan)}</strong>
            {profile.subscription_expires_at && (
              <span> • Expira em {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}</span>
            )}
          </p>
          
          {subscription && (
            <div className="text-xs text-muted-foreground">
              Status da assinatura: {subscription.subscribed ? "Ativa" : "Inativa"}
              {subscription.subscription_tier && (
                <span> • Tier: {subscription.subscription_tier}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
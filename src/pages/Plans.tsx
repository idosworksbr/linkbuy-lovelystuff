import { PlanCard } from "@/components/PlanCard";
import { usePlans } from "@/hooks/usePlans";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Plans() {
  const { plans, getPlanName } = usePlans();
  const { profile } = useProfile();
  const { subscription, loading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cancelingAll, setCancelingAll] = useState(false);

  // Stripe price IDs for subscription plans
  const priceIds = {
    "Pro": "price_1S2k58FhG2EqaMMaAifmR8iL",
    "Pro+": "price_1S2k55FhG2EqaMMaNHnafbQR",
    "Selo Verificado": "price_1S2k51FhG2EqaMMaJqiDgzMI",
    "Pro+ Verificado": "price_1S2k54FhG2EqaMMa5PNk8gfV",
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

  const handleCancelAllSubscriptions = async () => {
    try {
      setCancelingAll(true);
      
      const { data, error } = await supabase.functions.invoke('cancel-all-subscriptions');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Assinaturas canceladas",
        description: data.message || "Todas as assinaturas foram canceladas com sucesso.",
      });
      
      // Atualizar status das assinaturas
      await checkSubscription();
      
    } catch (error) {
      console.error('Error canceling subscriptions:', error);
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao cancelar as assinaturas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCancelingAll(false);
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      {/* Header com botão de voltar */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 p-2 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Escolha seu plano</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Desbloqueie recursos premium para seu catálogo online
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
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
        <div className="mt-6 sm:mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={checkSubscription}
              disabled={loading}
              size="sm"
              className="w-full sm:w-auto"
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
              <>
                <Button 
                  variant="outline" 
                  onClick={openCustomerPortal}
                  disabled={loading}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled={cancelingAll}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Todas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 sm:mx-0">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar todas as assinaturas?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação cancelará todas as suas assinaturas ativas. Você perderá o acesso aos recursos premium imediatamente. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelAllSubscriptions}
                        disabled={cancelingAll}
                        className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                      >
                        {cancelingAll ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          "Sim, cancelar todas"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
          
          <div className="px-4 sm:px-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Plano atual: <strong>{getPlanName(profile.subscription_plan)}</strong>
              {profile.subscription_expires_at && (
                <span className="block sm:inline"> • Expira em {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}</span>
              )}
            </p>
            
            {subscription && (
              <div className="text-xs text-muted-foreground mt-2">
                Status da assinatura: {subscription.subscribed ? "Ativa" : "Inativa"}
                {subscription.subscription_tier && (
                  <span className="block sm:inline"> • Tier: {subscription.subscription_tier}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
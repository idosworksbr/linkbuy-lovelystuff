import { PlanCard } from "@/components/PlanCard";
import { usePlans } from "@/hooks/usePlans";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export default function Plans() {
  const { plans, getPlanName } = usePlans();
  const { profile } = useProfile();
  const { toast } = useToast();

  const handleSelectPlan = (planName: string) => {
    toast({
      title: "Em breve!",
      description: `A funcionalidade de upgrade para ${planName} será implementada em breve.`,
    });
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
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Plano atual: <strong>{getPlanName(profile.subscription_plan)}</strong>
            {profile.subscription_expires_at && (
              <span> • Expira em {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
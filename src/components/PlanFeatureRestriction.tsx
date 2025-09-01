import { Lock, Crown } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface PlanFeatureRestrictionProps {
  requiredPlan: string;
  featureName: string;
  description?: string;
}

export const PlanFeatureRestriction = ({ 
  requiredPlan, 
  featureName, 
  description 
}: PlanFeatureRestrictionProps) => {
  const navigate = useNavigate();

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro';
      case 'pro_plus': return 'Pro+';
      case 'verified': return 'Selo Verificado';
      case 'pro_plus_verified': return 'Pro+ Verificado';
      default: return 'Pro';
    }
  };

  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{featureName}</h3>
          <p className="text-sm text-muted-foreground">
            {description || `Este recurso está disponível no plano ${getPlanDisplayName(requiredPlan)}`}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard/plans')}
          className="gap-2"
        >
          <Crown className="h-4 w-4" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};
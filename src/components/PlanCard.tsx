import { Check, Star, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PlanFeatures } from "@/hooks/usePlans";

interface PlanCardProps {
  plan: PlanFeatures;
  isCurrentPlan?: boolean;
  onSelectPlan?: () => void;
}

export const PlanCard = ({ plan, isCurrentPlan, onSelectPlan }: PlanCardProps) => {
  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          <Star className="h-3 w-3 mr-1" />
          Mais Popular
        </Badge>
      )}
      {plan.verified && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
          <Shield className="h-3 w-3 mr-1" />
          Verificado
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="text-2xl font-bold text-primary">{plan.price}</div>
        {isCurrentPlan && (
          <Badge variant="outline" className="mt-2">Plano Atual</Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          onClick={onSelectPlan}
          disabled={isCurrentPlan}
          variant={plan.popular ? "default" : "outline"}
        >
          {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
        </Button>
      </CardContent>
    </Card>
  );
};
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
    <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg md:scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 z-10">
          <Star className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Mais Popular</span>
          <span className="sm:hidden">Popular</span>
        </Badge>
      )}
      {plan.verified && !plan.popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 z-10">
          <Shield className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Verificado</span>
          <span className="sm:hidden">Selo</span>
        </Badge>
      )}
      
      <CardHeader className="text-center pb-3 pt-6 flex-shrink-0">
        <CardTitle className="text-lg sm:text-xl font-bold leading-tight">{plan.name}</CardTitle>
        <div className="text-xl sm:text-2xl font-bold text-primary">{plan.price}</div>
        {isCurrentPlan && (
          <Badge variant="outline" className="mt-2 text-xs">Plano Atual</Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
        <ul className="space-y-2 flex-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-xs sm:text-sm leading-relaxed">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="break-words">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full mt-auto text-sm sm:text-base py-2 sm:py-3" 
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
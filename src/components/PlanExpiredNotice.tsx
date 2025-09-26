import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanExpiredNoticeProps {
  className?: string;
  compact?: boolean;
}

export const PlanExpiredNotice: React.FC<PlanExpiredNoticeProps> = ({
  className = "",
  compact = false
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/dashboard/plans');
  };

  if (compact) {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-orange-800 font-medium">
            Plano expirado - Recursos limitados
          </span>
          <Button
            onClick={handleUpgrade}
            size="sm"
            variant="outline"
            className="ml-auto text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Crown className="h-3 w-3 mr-1" />
            Renovar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Seu plano expirou
      </AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <p className="mb-3">
          Sua conta retornou ao plano gratuito. Para continuar usando recursos premium como 
          temas personalizados, links customizados e analytics, renove sua assinatura.
        </p>
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Crown className="h-4 w-4 mr-2" />
          Ver Planos
        </Button>
      </AlertDescription>
    </Alert>
  );
};
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Shield, Star, Crown } from "lucide-react";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { usePlans } from "@/hooks/usePlans";

export const MultipleSubscriptionsInfo = () => {
  const { subscriptions, loading, getActiveSubscriptions } = useUserSubscriptions();
  const { getPlanName } = usePlans();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Carregando assinaturas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSubscriptions = getActiveSubscriptions();

  if (activeSubscriptions.length === 0) {
    return null;
  }

  const getSubscriptionIcon = (type: string) => {
    switch (type) {
      case 'pro':
        return <Star className="h-4 w-4" />;
      case 'pro_plus':
        return <Crown className="h-4 w-4" />;
      case 'verified':
        return <Shield className="h-4 w-4" />;
      case 'pro_plus_verified':
        return <Crown className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'pro_plus':
        return 'bg-purple-100 text-purple-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pro_plus_verified':
        return 'bg-gradient-to-r from-purple-100 to-green-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CheckCircle className="h-5 w-5" />
          {activeSubscriptions.length > 1 ? 'Suas Assinaturas Ativas' : 'Sua Assinatura Ativa'}
        </CardTitle>
        <CardDescription className="text-blue-700">
          {activeSubscriptions.length > 1 
            ? 'Você possui múltiplas assinaturas ativas que se complementam'
            : 'Sua assinatura atual e seus benefícios'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeSubscriptions.map((subscription) => (
          <div key={subscription.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              {getSubscriptionIcon(subscription.subscription_type)}
              <div>
                <p className="font-medium text-gray-900">
                  {getPlanName(subscription.subscription_type)}
                </p>
                <p className="text-sm text-gray-600">
                  Expira em {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge className={getSubscriptionColor(subscription.subscription_type)}>
              Ativo
            </Badge>
          </div>
        ))}
        
        {activeSubscriptions.length > 1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Dica:</strong> Você pode economizar assinando o plano "Pro+ Verificado" que inclui todos os recursos em um único valor.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
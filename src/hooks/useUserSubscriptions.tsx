import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export const useUserSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserSubscriptions = async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user subscriptions:', error);
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, [user]);

  // Verificar se o usuário tem um tipo específico de assinatura
  const hasSubscriptionType = (type: string): boolean => {
    return subscriptions.some(sub => sub.subscription_type === type && sub.status === 'active');
  };

  // Verificar se o usuário tem múltiplas assinaturas ativas
  const hasMultipleSubscriptions = (): boolean => {
    return subscriptions.filter(sub => sub.status === 'active').length > 1;
  };

  // Obter todas as assinaturas ativas
  const getActiveSubscriptions = (): UserSubscription[] => {
    return subscriptions.filter(sub => sub.status === 'active');
  };

  // Verificar se tem alguma assinatura ativa
  const hasAnyActiveSubscription = (): boolean => {
    return subscriptions.some(sub => sub.status === 'active');
  };

  // Obter data de expiração mais distante
  const getLatestExpirationDate = (): string | null => {
    const activeSubscriptions = getActiveSubscriptions();
    if (activeSubscriptions.length === 0) return null;

    return activeSubscriptions.reduce((latest, sub) => {
      return new Date(sub.current_period_end) > new Date(latest) 
        ? sub.current_period_end 
        : latest;
    }, activeSubscriptions[0].current_period_end);
  };

  return {
    subscriptions,
    loading,
    hasSubscriptionType,
    hasMultipleSubscriptions,
    getActiveSubscriptions,
    hasAnyActiveSubscription,
    getLatestExpirationDate,
    refetch: fetchUserSubscriptions
  };
};
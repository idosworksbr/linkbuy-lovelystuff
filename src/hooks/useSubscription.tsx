import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isCheckingRef = useRef(false);

  const checkSubscription = useCallback(async () => {
    if (!user || isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Check subscription error:', error);
        throw error;
      }
      
      setSubscription(data);
      return data;
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      
      // Don't show toast for rate limit errors - just log them
      if (error?.message?.includes("rate limit")) {
        console.warn('Rate limit reached - subscription check will retry later');
        return;
      }
      
      // Only show toast for other types of errors
      toast({
        title: "Erro ao verificar assinatura",
        description: "Não foi possível verificar o status da assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  }, [user, toast]);

  const createCheckout = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível iniciar o processo de pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      
      // Show more specific error messages
      let errorMessage = "Não foi possível abrir o portal do cliente.";
      if (error?.message?.includes("No Stripe customer")) {
        errorMessage = "Você ainda não possui uma conta no Stripe. Assine um plano primeiro.";
      } else if (error?.message?.includes("rate limit")) {
        errorMessage = "Muitas solicitações. Aguarde um momento e tente novamente.";
      }
      
      toast({
        title: "Erro ao abrir portal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (cancelImmediately: boolean = false) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelImmediately }
      });
      
      if (error) throw error;
      
      toast({
        title: "Assinatura cancelada",
        description: data.message,
        variant: "default",
      });

      // Refresh subscription status
      await checkSubscription();
      
      return data;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      
      let errorMessage = "Não foi possível cancelar a assinatura.";
      if (error?.message?.includes("No active subscription")) {
        errorMessage = "Você não possui uma assinatura ativa para cancelar.";
      }
      
      toast({
        title: "Erro ao cancelar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
  };
};
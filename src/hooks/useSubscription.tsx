import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_CONFIG } from '@/lib/stripe';

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
      console.log('[useSubscription] Verificando status da assinatura...');
      
      // Timeout otimizado para produção
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação de assinatura')), STRIPE_CONFIG.timeouts.subscription)
      );
      
      const result = await Promise.race([
        supabase.functions.invoke('check-subscription'),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.error('Check subscription error:', error);
        throw error;
      }
      
      console.log('[useSubscription] Status da assinatura:', data);
      setSubscription(data);
      return data;
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      
      // Don't show toast for rate limit errors - just log them
      if (error?.message?.includes("rate limit") || error?.message?.includes("Timeout")) {
        console.warn('Rate limit or timeout reached - subscription check will retry later');
        return;
      }
      
      // Only show toast for other types of errors
      toast({
        title: "Erro ao verificar assinatura",
        description: "Não foi possível verificar o status da assinatura. Dados locais serão usados.",
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
      console.log('[useSubscription] Criando checkout para:', priceId);
      setLoading(true);
      
      // Timeout otimizado para produção
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na criação do checkout')), STRIPE_CONFIG.timeouts.checkout)
      );
      
      const result = await Promise.race([
        supabase.functions.invoke('create-checkout', {
          body: { priceId }
        }),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.error('[useSubscription] Erro ao criar checkout:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('[useSubscription] URL do checkout:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL do checkout não encontrada na resposta');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      
      let errorMessage = "Não foi possível iniciar o processo de pagamento.";
      if (error?.message?.includes("Timeout")) {
        errorMessage = "Timeout na criação do checkout. Tente novamente.";
      }
      
      toast({
        title: "Erro no checkout",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      console.log('[useSubscription] Abrindo portal do cliente...');
      setLoading(true);
      
      // Timeout otimizado para produção
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao abrir portal')), STRIPE_CONFIG.timeouts.subscription)
      );
      
      const result = await Promise.race([
        supabase.functions.invoke('customer-portal'),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      console.log('[useSubscription] URL do portal:', data.url);
      
      // Use direct redirect with retry mechanism
      const openPortal = () => {
        try {
          window.location.href = data.url;
        } catch (redirectError) {
          console.error('Redirect failed, trying window.open:', redirectError);
          const newWindow = window.open(data.url, '_blank');
          if (!newWindow) {
            throw new Error('Pop-up bloqueado. Permita pop-ups para este site.');
          }
        }
      };
      
      openPortal();
      
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      
      // Show more specific error messages
      let errorMessage = "Não foi possível abrir o portal do cliente.";
      if (error?.message?.includes("No Stripe customer")) {
        errorMessage = "Você ainda não possui uma conta no Stripe. Assine um plano primeiro.";
      } else if (error?.message?.includes("rate limit")) {
        errorMessage = "Muitas solicitações. Aguarde um momento e tente novamente.";
      } else if (error?.message?.includes("Timeout")) {
        errorMessage = "Timeout ao abrir portal. Tente novamente.";
      } else if (error?.message?.includes("Pop-up bloqueado")) {
        errorMessage = error.message;
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
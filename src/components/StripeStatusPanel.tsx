import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { STRIPE_CONFIG } from '@/lib/stripe';

interface StripeStatus {
  secretKey: boolean;
  connectivity: boolean;
  prices: boolean;
  checkout: boolean;
  subscription: boolean;
}

export const StripeStatusPanel = () => {
  const [status, setStatus] = useState<StripeStatus>({
    secretKey: false,
    connectivity: false,
    prices: false,
    checkout: false,
    subscription: false
  });
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testStripeIntegration = async () => {
    if (!user) {
      addLog("❌ Usuário não autenticado");
      return;
    }

    setTesting(true);
    addLog("🔄 Iniciando testes da integração Stripe...");

    // Reset status
    setStatus({
      secretKey: false,
      connectivity: false,
      prices: false,
      checkout: false,
      subscription: false
    });

    try {
      // 1. Test get-stripe-prices (also tests secret key and connectivity)
      addLog("🔄 Testando busca de preços...");
      const pricesResult = await supabase.functions.invoke('get-stripe-prices');
      
      if (pricesResult.error) {
        addLog(`❌ Erro na busca de preços: ${pricesResult.error.message}`);
        if (pricesResult.error.message.includes('STRIPE_SECRET_KEY')) {
          addLog("❌ STRIPE_SECRET_KEY não configurada");
        }
      } else {
        addLog("✅ Preços obtidos com sucesso");
        setStatus(prev => ({ 
          ...prev, 
          secretKey: true, 
          connectivity: true, 
          prices: true 
        }));
      }

      // 2. Test check-subscription
      addLog("🔄 Testando verificação de assinatura...");
      const subscriptionResult = await supabase.functions.invoke('check-subscription');
      
      if (subscriptionResult.error) {
        addLog(`❌ Erro na verificação de assinatura: ${subscriptionResult.error.message}`);
      } else {
        addLog("✅ Verificação de assinatura funcionando");
        setStatus(prev => ({ ...prev, subscription: true }));
      }

      // 3. Test checkout (dry run - não criar sessão real)
      addLog("🔄 Validando configuração de checkout...");
      const testPriceId = STRIPE_CONFIG.priceIds.pro;
      if (testPriceId) {
        addLog(`✅ Price ID configurado: ${testPriceId}`);
        setStatus(prev => ({ ...prev, checkout: true }));
      } else {
        addLog("❌ Price IDs não configurados");
      }

    } catch (error) {
      addLog(`❌ Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    setTesting(false);
    addLog("✅ Testes concluídos");
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "OK" : "ERRO"}
      </Badge>
    );
  };

  useEffect(() => {
    if (user) {
      testStripeIntegration();
    }
  }, [user]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Status da Integração Stripe</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testStripeIntegration}
          disabled={testing || !user}
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Status Components */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.secretKey)}
                <span className="text-sm font-medium">Chave Secreta</span>
              </div>
              {getStatusBadge(status.secretKey)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.connectivity)}
                <span className="text-sm font-medium">Conectividade</span>
              </div>
              {getStatusBadge(status.connectivity)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.prices)}
                <span className="text-sm font-medium">Busca de Preços</span>
              </div>
              {getStatusBadge(status.prices)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.subscription)}
                <span className="text-sm font-medium">Verificação Assinatura</span>
              </div>
              {getStatusBadge(status.subscription)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checkout)}
                <span className="text-sm font-medium">Config. Checkout</span>
              </div>
              {getStatusBadge(status.checkout)}
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="mb-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-semibold mb-2">Configuração Atual:</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• Timeout Checkout: {STRIPE_CONFIG.timeouts.checkout / 1000}s</div>
            <div>• Timeout Subscription: {STRIPE_CONFIG.timeouts.subscription / 1000}s</div>
            <div>• Price IDs configurados: {Object.keys(STRIPE_CONFIG.priceIds).length}</div>
            <div>• URL Sucesso: {STRIPE_CONFIG.urls.success}</div>
            <div>• URL Cancelamento: {STRIPE_CONFIG.urls.cancel}</div>
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Logs dos Testes:</h4>
            <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Faça login para testar a integração Stripe
          </div>
        )}
      </CardContent>
    </Card>
  );
};
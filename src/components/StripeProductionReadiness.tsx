import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { STRIPE_CONFIG } from '@/lib/stripe';

interface ProductionCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  action?: string;
  url?: string;
}

export const StripeProductionReadiness = () => {
  const [checks, setChecks] = useState<ProductionCheck[]>([]);

  const performProductionChecks = () => {
    const newChecks: ProductionCheck[] = [];

    // 1. Check Stripe Key Format
    const isLiveKey = STRIPE_CONFIG.publishableKey.startsWith('pk_live_');
    newChecks.push({
      name: 'Chave Pública Stripe',
      status: isLiveKey ? 'ok' : 'warning',
      message: isLiveKey 
        ? 'Usando chave de produção (pk_live_)'
        : 'Usando chave de teste ou desenvolvimento',
      action: isLiveKey ? undefined : 'Configurar chave de produção'
    });

    // 2. Check Price IDs
    const hasPriceIds = Object.values(STRIPE_CONFIG.priceIds).every(id => id.startsWith('price_'));
    newChecks.push({
      name: 'Price IDs Configurados',
      status: hasPriceIds ? 'ok' : 'error',
      message: hasPriceIds 
        ? `${Object.keys(STRIPE_CONFIG.priceIds).length} Price IDs configurados`
        : 'Price IDs inválidos ou não configurados',
      action: hasPriceIds ? undefined : 'Configurar Price IDs no Stripe'
    });

    // 3. Check Timeouts
    const hasOptimalTimeouts = STRIPE_CONFIG.timeouts.checkout <= 15000 && 
                             STRIPE_CONFIG.timeouts.subscription <= 15000;
    newChecks.push({
      name: 'Timeouts Otimizados',
      status: hasOptimalTimeouts ? 'ok' : 'warning',
      message: hasOptimalTimeouts 
        ? 'Timeouts otimizados para produção (≤15s)'
        : 'Timeouts muito altos para produção',
      action: hasOptimalTimeouts ? undefined : 'Reduzir timeouts para ≤15s'
    });

    // 4. Check URLs
    const hasProductionUrls = !STRIPE_CONFIG.urls.success.includes('localhost') && 
                            !STRIPE_CONFIG.urls.cancel.includes('localhost');
    newChecks.push({
      name: 'URLs de Redirecionamento',
      status: hasProductionUrls ? 'ok' : 'warning',
      message: hasProductionUrls 
        ? 'URLs configuradas para produção'
        : 'URLs apontam para localhost/desenvolvimento',
      action: hasProductionUrls ? undefined : 'Configurar URLs de produção'
    });

    // 5. Check Webhook Configuration
    newChecks.push({
      name: 'Webhook Stripe',
      status: 'warning',
      message: 'Verifique se o webhook está configurado no painel Stripe',
      action: 'Configurar webhook',
      url: 'https://dashboard.stripe.com/webhooks'
    });

    // 6. Environment Variables
    newChecks.push({
      name: 'Variáveis de Ambiente',
      status: 'warning',
      message: 'STRIPE_SECRET_KEY deve estar configurada no Supabase',
      action: 'Verificar secrets no Supabase',
      url: 'https://supabase.com/dashboard/project/rpkawimruhfqhxbpavce/settings/functions'
    });

    setChecks(newChecks);
  };

  const getStatusIcon = (status: ProductionCheck['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ProductionCheck['status']) => {
    const variants = {
      'ok': 'default' as const,
      'warning': 'secondary' as const,
      'error': 'destructive' as const
    };

    const labels = {
      'ok': 'OK',
      'warning': 'ATENÇÃO',
      'error': 'ERRO'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getOverallStatus = () => {
    const hasError = checks.some(check => check.status === 'error');
    const hasWarning = checks.some(check => check.status === 'warning');
    
    if (hasError) return { status: 'error', message: 'Não pronto para produção' };
    if (hasWarning) return { status: 'warning', message: 'Atenção necessária' };
    return { status: 'ok', message: 'Pronto para produção' };
  };

  useEffect(() => {
    performProductionChecks();
  }, []);

  const overallStatus = getOverallStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">Prontidão para Produção</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus.status as ProductionCheck['status'])}
            {getStatusBadge(overallStatus.status as ProductionCheck['status'])}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{overallStatus.message}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start justify-between p-3 border rounded-md">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{check.message}</p>
                  {check.action && (
                    <div className="flex items-center gap-2">
                      {check.url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(check.url, '_blank')}
                        >
                          {check.action}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-blue-600">
                          ⚠️ {check.action}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-md">
          <h4 className="text-sm font-semibold mb-2">Checklist de Produção:</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>✅ Configurar STRIPE_SECRET_KEY no Supabase (modo live)</div>
            <div>✅ Configurar webhook no painel Stripe</div>
            <div>✅ Testar fluxo completo de checkout</div>
            <div>✅ Validar redirecionamentos pós-pagamento</div>
            <div>✅ Verificar logs em produção</div>
            <div>✅ Configurar URLs de produção</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
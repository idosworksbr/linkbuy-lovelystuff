import DashboardLayout from '@/components/DashboardLayout';
import { StripeStatusPanel } from '@/components/StripeStatusPanel';
import { StripeProductionReadiness } from '@/components/StripeProductionReadiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STRIPE_CONFIG } from '@/lib/stripe';

export default function StripeDebug() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'Stripe Dashboard',
      description: 'Painel principal do Stripe',
      url: 'https://dashboard.stripe.com',
      badge: 'Externo'
    },
    {
      title: 'Webhooks Stripe',
      description: 'Configurar e monitorar webhooks',
      url: 'https://dashboard.stripe.com/webhooks',
      badge: 'Externo'
    },
    {
      title: 'Supabase Edge Functions',
      description: 'Logs das edge functions',
      url: 'https://supabase.com/dashboard/project/rpkawimruhfqhxbpavce/functions',
      badge: 'Externo'
    },
    {
      title: 'Supabase Secrets',
      description: 'Configurar variáveis de ambiente',
      url: 'https://supabase.com/dashboard/project/rpkawimruhfqhxbpavce/settings/functions',
      badge: 'Externo'
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Debug Stripe</h1>
              <p className="text-muted-foreground">
                Diagnóstico e monitoramento da integração Stripe
              </p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StripeStatusPanel />
          <StripeProductionReadiness />
        </div>

        {/* Configuration Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price IDs */}
              <div>
                <h4 className="font-semibold mb-3">Price IDs Configurados</h4>
                <div className="space-y-2">
                  {Object.entries(STRIPE_CONFIG.priceIds).map(([plan, priceId]) => (
                    <div key={plan} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium capitalize">
                        {plan.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {priceId}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {priceId.startsWith('price_') ? 'Válido' : 'Inválido'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeouts */}
              <div>
                <h4 className="font-semibold mb-3">Configurações de Timeout</h4>
                <div className="space-y-2">
                  {Object.entries(STRIPE_CONFIG.timeouts).map(([type, timeout]) => (
                    <div key={type} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {timeout / 1000}s
                        </code>
                        <Badge 
                          variant={timeout <= 15000 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {timeout <= 15000 ? 'Otimizado' : 'Alto'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* URLs */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">URLs de Redirecionamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(STRIPE_CONFIG.urls).map(([type, url]) => (
                  <div key={type} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <Badge 
                        variant={url.includes('localhost') ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {url.includes('localhost') ? 'Dev' : 'Prod'}
                      </Badge>
                    </div>
                    <code className="text-xs text-muted-foreground break-all">{url}</code>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{link.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {link.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Projeto Supabase:</span>
                <div className="text-muted-foreground font-mono">rpkawimruhfqhxbpavce</div>
              </div>
              <div>
                <span className="font-medium">Stripe Key Type:</span>
                <div className="text-muted-foreground">
                  Configurada via variáveis de ambiente (seguro)
                </div>
              </div>
              <div>
                <span className="font-medium">Total Price IDs:</span>
                <div className="text-muted-foreground">{Object.keys(STRIPE_CONFIG.priceIds).length}</div>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
                <div className="text-muted-foreground">{new Date().toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Página de Desenvolvimento
                </h4>
                <p className="text-sm text-yellow-700">
                  Esta página é destinada ao debug e monitoramento da integração Stripe. 
                  Em produção, considere restringir o acesso ou remover esta página.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
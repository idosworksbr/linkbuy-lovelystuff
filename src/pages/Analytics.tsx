import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Eye, MessageCircle, Instagram, TrendingUp } from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAnalytics, useProductAnalytics } from '@/hooks/useAnalytics'
import { useProfile } from '@/hooks/useProfile'
import { usePlans } from '@/hooks/usePlans'
import { PlanFeatureRestriction } from '@/components/PlanFeatureRestriction'

type CustomDateRange = {
  from: Date | undefined
  to: Date | undefined
}

const Analytics = () => {
  const { profile } = useProfile();
  const { canAccessFeature } = usePlans();
  const [timeFilter, setTimeFilter] = useState<string>('all-time')
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    from: undefined,
    to: undefined
  })

  // Verificar acesso ao analytics
  if (!canAccessFeature(profile, 'analytics')) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho da sua loja
            </p>
          </div>
          
          <PlanFeatureRestriction 
            requiredPlan="pro_plus"
            featureName="Analytics Avançado"
            description="O acesso ao analytics está disponível exclusivamente no plano Pro+. Upgrade para ver métricas detalhadas da sua loja."
          />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date()
    switch (timeFilter) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) }
      case 'week':
        return { startDate: startOfDay(subDays(now, 7)), endDate: endOfDay(now) }
      case 'month':
        return { startDate: startOfDay(subDays(now, 30)), endDate: endOfDay(now) }
      case 'year':
        return { startDate: startOfDay(subDays(now, 365)), endDate: endOfDay(now) }
      case 'custom':
        return { 
          startDate: customDateRange.from ? startOfDay(customDateRange.from) : undefined,
          endDate: customDateRange.to ? endOfDay(customDateRange.to) : undefined
        }
      default:
        return { startDate: undefined, endDate: undefined }
    }
  }

  const { startDate, endDate } = getDateRange()
  const { storeAnalytics, loading: analyticsLoading } = useAnalytics(startDate, endDate)
  const { productAnalytics, loading: productLoading } = useProductAnalytics(startDate, endDate)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho do seu catálogo e produtos
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Últimos 30 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all-time">Todo o tempo</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>

            {timeFilter === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-60 justify-start text-left font-normal",
                      !customDateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange?.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "dd MMM", { locale: ptBR })} -{" "}
                          {format(customDateRange.to, "dd MMM yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(customDateRange.from, "dd MMM yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecionar período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange?.from}
                    selected={customDateRange}
                    onSelect={(range) => setCustomDateRange(range ? { from: range.from, to: range.to } : { from: undefined, to: undefined })}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações do Catálogo</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatNumber(storeAnalytics?.total_catalog_views || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    visitantes únicos: {storeAnalytics?.unique_visitors || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Visualizados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(storeAnalytics?.total_product_views || 0)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques WhatsApp</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(storeAnalytics?.total_whatsapp_clicks || 0)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques Instagram</CardTitle>
              <Instagram className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(storeAnalytics?.total_instagram_clicks || 0)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Analytics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Produto</CardTitle>
            <CardDescription>
              Métricas detalhadas de cada produto do seu catálogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productAnalytics.length > 0 ? (
              <div className="space-y-4">
                {productAnalytics.map((product) => (
                  <div key={product.product_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {product.product_image ? (
                        <img 
                          src={product.product_image} 
                          alt={product.product_name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Sem imagem</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{product.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          R$ {product.product_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{product.total_views}</div>
                        <div className="text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{product.whatsapp_clicks}</div>
                        <div className="text-muted-foreground">WhatsApp</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{product.instagram_clicks}</div>
                        <div className="text-muted-foreground">Instagram</div>
                      </div>
                      <div className="text-center">
                        <Badge variant={product.conversion_rate > 5 ? "default" : "secondary"}>
                          {product.conversion_rate.toFixed(1)}%
                        </Badge>
                        <div className="text-muted-foreground text-xs">Conversão</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado disponível para o período selecionado</p>
                <p className="text-sm">Compartilhe seu catálogo para começar a receber dados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Analytics
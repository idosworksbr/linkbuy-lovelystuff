import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Users, MousePointerClick, Clock, TrendingUp, TrendingDown, Activity, Calendar, Download, Filter, Eye, Target, Percent } from 'lucide-react';
import { useWebsiteAnalytics, useConversionFunnel } from '@/hooks/useWebsiteAnalytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
  description?: string;
  compareValue?: string | number;
}

const MetricCard = ({ title, value, icon, trend, suffix = '', description, compareValue }: MetricCardProps) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? "default" : "destructive"} className="text-xs">
              {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <h3 className="text-3xl font-bold mt-2">
          {value}{suffix}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {compareValue && (
          <p className="text-xs text-muted-foreground mt-1">
            Período anterior: {compareValue}{suffix}
          </p>
        )}
      </div>
      <div className="p-4 bg-primary/10 rounded-xl">
        {icon}
      </div>
    </div>
  </Card>
);

export const MasterAnalyticsTab = () => {
  const [period, setPeriod] = useState('30');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  
  // Memoize dates to prevent infinite loop
  const { startDate, endDate, compareStartDate, compareEndDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(period));
    
    const compareEnd = new Date(start);
    const compareStart = new Date(compareEnd);
    compareStart.setDate(compareStart.getDate() - parseInt(period));
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      compareStartDate: compareStart.toISOString(),
      compareEndDate: compareEnd.toISOString(),
    };
  }, [period]);

  const { data: analytics, loading: analyticsLoading } = useWebsiteAnalytics(
    startDate,
    endDate
  );

  const { data: compareAnalytics, loading: compareLoading } = useWebsiteAnalytics(
    compareMode ? compareStartDate : startDate,
    compareMode ? compareEndDate : endDate
  );

  const { data: funnel, loading: funnelLoading } = useConversionFunnel(
    startDate,
    endDate
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || !compareMode) return undefined;
    return Math.round(((current - previous) / previous) * 100);
  };

  const exportToCSV = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Sessões Totais', analytics.metrics.total_sessions],
      ['Usuários Únicos', analytics.metrics.unique_users],
      ['Páginas/Sessão', analytics.metrics.avg_pages_per_session],
      ['Duração Média (s)', analytics.metrics.avg_duration_seconds],
      ['Taxa de Rejeição (%)', analytics.metrics.bounce_rate],
      ['Taxa de Conversão (%)', analytics.metrics.conversion_rate],
      [''],
      ['Fonte de Tráfego', 'Sessões', 'Conversões', 'Taxa (%)'],
      ...analytics.traffic_sources.map(s => [s.source, s.sessions, s.conversions, s.conversion_rate]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter data by traffic source
  const filteredTrafficSources = useMemo(() => {
    if (!analytics?.traffic_sources) return [];
    if (selectedSource === 'all') return analytics.traffic_sources;
    return analytics.traffic_sources.filter(s => s.source === selectedSource);
  }, [analytics, selectedSource]);

  if (analyticsLoading || funnelLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics do Site</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitore o desempenho e comportamento dos visitantes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Comparar Períodos
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Últimas 24h</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Sessões Totais"
          value={analytics?.metrics.total_sessions || 0}
          icon={<Activity className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.total_sessions || 0,
            compareAnalytics?.metrics.total_sessions || 0
          )}
          description="Número total de visitas ao site"
          compareValue={compareMode ? compareAnalytics?.metrics.total_sessions : undefined}
        />
        <MetricCard
          title="Usuários Únicos"
          value={analytics?.metrics.unique_users || 0}
          icon={<Users className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.unique_users || 0,
            compareAnalytics?.metrics.unique_users || 0
          )}
          description="Visitantes únicos identificados"
          compareValue={compareMode ? compareAnalytics?.metrics.unique_users : undefined}
        />
        <MetricCard
          title="Duração Média"
          value={formatDuration(analytics?.metrics.avg_duration_seconds || 0)}
          icon={<Clock className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.avg_duration_seconds || 0,
            compareAnalytics?.metrics.avg_duration_seconds || 0
          )}
          description="Tempo médio de permanência"
          compareValue={compareMode ? formatDuration(compareAnalytics?.metrics.avg_duration_seconds || 0) : undefined}
        />
        <MetricCard
          title="Páginas/Sessão"
          value={analytics?.metrics.avg_pages_per_session.toFixed(2) || '0'}
          icon={<Eye className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.avg_pages_per_session || 0,
            compareAnalytics?.metrics.avg_pages_per_session || 0
          )}
          description="Média de páginas visualizadas"
          compareValue={compareMode ? compareAnalytics?.metrics.avg_pages_per_session.toFixed(2) : undefined}
        />
        <MetricCard
          title="Taxa de Rejeição"
          value={analytics?.metrics.bounce_rate.toFixed(1) || '0'}
          suffix="%"
          icon={<Percent className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.bounce_rate || 0,
            compareAnalytics?.metrics.bounce_rate || 0
          )}
          description="Visitantes que saíram rapidamente"
          compareValue={compareMode ? compareAnalytics?.metrics.bounce_rate.toFixed(1) : undefined}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={analytics?.metrics.conversion_rate.toFixed(1) || '0'}
          suffix="%"
          icon={<Target className="w-6 h-6 text-primary" />}
          trend={calculateTrend(
            analytics?.metrics.conversion_rate || 0,
            compareAnalytics?.metrics.conversion_rate || 0
          )}
          description="Visitantes que se cadastraram"
          compareValue={compareMode ? compareAnalytics?.metrics.conversion_rate.toFixed(1) : undefined}
        />
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="conversion">Conversão</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sessões ao Longo do Tempo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.timeline || []}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#8884d8" 
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    name="Sessões" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Traffic Sources Pie Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Distribuição de Fontes
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.traffic_sources || []}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ source, sessions, percent }) => 
                      `${source}: ${sessions} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="sessions"
                  >
                    {(analytics?.traffic_sources || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Análise de Tráfego
              </h3>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as fontes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  {analytics?.traffic_sources.map((source) => (
                    <SelectItem key={source.source} value={source.source}>
                      {source.source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Fonte</th>
                    <th className="text-right py-3 px-2 font-semibold">Sessões</th>
                    <th className="text-right py-3 px-2 font-semibold">Conversões</th>
                    <th className="text-right py-3 px-2 font-semibold">Taxa Conv.</th>
                    <th className="text-right py-3 px-2 font-semibold">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrafficSources.map((source, index) => {
                    const totalSessions = analytics?.metrics.total_sessions || 1;
                    const percentage = ((source.sessions / totalSessions) * 100).toFixed(1);
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2 font-medium">{source.source}</td>
                        <td className="text-right py-3 px-2">{source.sessions}</td>
                        <td className="text-right py-3 px-2">{source.conversions}</td>
                        <td className="text-right py-3 px-2">
                          <Badge variant={parseFloat(source.conversion_rate) > 5 ? "default" : "secondary"}>
                            {source.conversion_rate}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-2">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Comparação de Fontes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.traffic_sources || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#8884d8" name="Sessões" />
                <Bar dataKey="conversions" fill="#82ca9d" name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Páginas Mais Visitadas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Página</th>
                    <th className="text-right py-3 px-2 font-semibold">Visualizações</th>
                    <th className="text-right py-3 px-2 font-semibold">Tempo Médio</th>
                    <th className="text-right py-3 px-2 font-semibold">Taxa Rejeição</th>
                    <th className="text-right py-3 px-2 font-semibold">Qualidade</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.popular_pages.map((page, index) => {
                    const bounceRate = parseFloat(page.bounce_rate);
                    const quality = bounceRate < 40 ? 'Excelente' : bounceRate < 60 ? 'Boa' : 'Regular';
                    const qualityColor = bounceRate < 40 ? 'default' : bounceRate < 60 ? 'secondary' : 'destructive';
                    
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2 truncate max-w-xs font-medium">{page.url}</td>
                        <td className="text-right py-3 px-2">{page.views}</td>
                        <td className="text-right py-3 px-2">{formatDuration(page.avg_time)}</td>
                        <td className="text-right py-3 px-2">{page.bounce_rate}%</td>
                        <td className="text-right py-3 px-2">
                          <Badge variant={qualityColor as any}>{quality}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Engajamento Médio</h4>
              <p className="text-2xl font-bold">
                {analytics?.metrics.avg_pages_per_session.toFixed(1) || '0'} páginas
              </p>
              <p className="text-xs text-muted-foreground mt-1">por sessão</p>
            </Card>
            <Card className="p-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Tempo de Permanência</h4>
              <p className="text-2xl font-bold">
                {formatDuration(analytics?.metrics.avg_duration_seconds || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">duração média</p>
            </Card>
            <Card className="p-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Qualidade do Tráfego</h4>
              <p className="text-2xl font-bold">
                {analytics?.metrics.bounce_rate ? (100 - analytics.metrics.bounce_rate).toFixed(0) : '0'}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">visitantes engajados</p>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Funil de Conversão Detalhado
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Usuários" />
                <Bar dataKey="percentage" fill="#82ca9d" name="% do Total" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Etapas do Funil</h3>
              <div className="space-y-4">
                {funnel?.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{step.name}</span>
                      <Badge>{step.count} usuários</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary rounded-full h-3 transition-all" 
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{step.percentage}% do total</span>
                      {step.drop_off && <span className="text-destructive">-{step.drop_off}% drop-off</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Insights de Conversão</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Taxa de Conversão Global</h4>
                  <p className="text-3xl font-bold text-primary">
                    {analytics?.metrics.conversion_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analytics?.metrics.total_conversions || 0} conversões de {analytics?.metrics.total_sessions || 0} sessões
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Melhor Fonte de Conversão</h4>
                  <p className="text-2xl font-bold">
                    {analytics?.traffic_sources.reduce((best, curr) => 
                      parseFloat(curr.conversion_rate) > parseFloat(best.conversion_rate) ? curr : best
                    , analytics?.traffic_sources[0])?.source || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analytics?.traffic_sources.reduce((best, curr) => 
                      parseFloat(curr.conversion_rate) > parseFloat(best.conversion_rate) ? curr : best
                    , analytics?.traffic_sources[0])?.conversion_rate || '0'}% de taxa de conversão
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

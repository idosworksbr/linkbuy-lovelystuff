import { useState } from 'react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Users, MousePointerClick, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useWebsiteAnalytics, useConversionFunnel } from '@/hooks/useWebsiteAnalytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
}

const MetricCard = ({ title, value, icon, trend, suffix = '' }: MetricCardProps) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-bold mt-2">
          {value}{suffix}
        </h3>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-lg">
        {icon}
      </div>
    </div>
  </Card>
);

export const MasterAnalyticsTab = () => {
  const [period, setPeriod] = useState('30');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  const endDate = new Date();

  const { data: analytics, loading: analyticsLoading } = useWebsiteAnalytics(
    startDate.toISOString(),
    endDate.toISOString()
  );

  const { data: funnel, loading: funnelLoading } = useConversionFunnel(
    startDate.toISOString(),
    endDate.toISOString()
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics do Site</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Sessões Totais"
          value={analytics?.metrics.total_sessions || 0}
          icon={<Activity className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Usuários Únicos"
          value={analytics?.metrics.unique_users || 0}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Duração Média"
          value={formatDuration(analytics?.metrics.avg_duration_seconds || 0)}
          icon={<Clock className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Páginas/Sessão"
          value={analytics?.metrics.avg_pages_per_session.toFixed(2) || '0'}
          icon={<MousePointerClick className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Taxa de Rejeição"
          value={analytics?.metrics.bounce_rate.toFixed(1) || '0'}
          suffix="%"
          icon={<TrendingDown className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={analytics?.metrics.conversion_rate.toFixed(1) || '0'}
          suffix="%"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sessões ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessões" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Traffic Sources Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fontes de Tráfego</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.traffic_sources || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, sessions }) => `${source}: ${sessions}`}
                outerRadius={80}
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

        {/* Conversion Funnel */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Usuários" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Origens do Tráfego</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Fonte</th>
                  <th className="text-right py-2">Sessões</th>
                  <th className="text-right py-2">Conversões</th>
                  <th className="text-right py-2">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.traffic_sources.map((source, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{source.source}</td>
                    <td className="text-right py-2">{source.sessions}</td>
                    <td className="text-right py-2">{source.conversions}</td>
                    <td className="text-right py-2">{source.conversion_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Popular Pages Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Páginas Mais Visitadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Página</th>
                  <th className="text-right py-2">Visualizações</th>
                  <th className="text-right py-2">Tempo Médio</th>
                  <th className="text-right py-2">Rejeição</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.popular_pages.map((page, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 truncate max-w-xs">{page.url}</td>
                    <td className="text-right py-2">{page.views}</td>
                    <td className="text-right py-2">{formatDuration(page.avg_time)}</td>
                    <td className="text-right py-2">{page.bounce_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

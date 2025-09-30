import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const RealtimeVisitors = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('realtime-visitors');
        if (error) throw error;
        setOnlineCount(data?.online_visitors || 0);
      } catch (error) {
        console.error('Erro ao buscar visitantes:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchVisitors();

    // Refresh every 10 seconds
    const interval = setInterval(fetchVisitors, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-600 animate-pulse" />
          Visitantes Online
        </CardTitle>
        <Badge variant="outline" className="text-green-600 border-green-600">
          AO VIVO
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-2xl font-bold text-muted-foreground">...</div>
        ) : (
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{onlineCount}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Últimos 5 minutos
        </p>
      </CardContent>
    </Card>
  );
};
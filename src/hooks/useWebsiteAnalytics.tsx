import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteMetrics {
  total_sessions: number;
  unique_users: number;
  avg_pages_per_session: number;
  avg_duration_seconds: number;
  bounce_rate: number;
  conversion_rate: number;
  total_conversions: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  conversions: number;
  conversion_rate: string;
}

export interface PopularPage {
  url: string;
  views: number;
  avg_time: number;
  bounce_rate: string;
}

export interface TimelineData {
  date: string;
  sessions: number;
}

export interface WebsiteAnalytics {
  metrics: WebsiteMetrics;
  traffic_sources: TrafficSource[];
  popular_pages: PopularPage[];
  timeline: TimelineData[];
}

export const useWebsiteAnalytics = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<WebsiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke(
          'admin-website-analytics',
          {
            body: {
              start_date: startDate,
              end_date: endDate,
            },
          }
        );

        if (analyticsError) throw analyticsError;

        if (mounted) {
          setData(analyticsData);
        }
      } catch (err: any) {
        console.error('Error fetching website analytics:', err);
        if (mounted) {
          setError(err.message || 'Erro ao carregar analytics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  return { data, loading, error };
};

export interface FunnelStep {
  step: string;
  name: string;
  count: number;
  percentage: string | number;
  drop_off: string | number;
}

export const useConversionFunnel = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchFunnel = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: funnelData, error: funnelError } = await supabase.functions.invoke(
          'admin-conversion-funnel',
          {
            body: {
              start_date: startDate,
              end_date: endDate,
            },
          }
        );

        if (funnelError) throw funnelError;

        if (mounted) {
          setData(funnelData.funnel || []);
        }
      } catch (err: any) {
        console.error('Error fetching conversion funnel:', err);
        if (mounted) {
          setError(err.message || 'Erro ao carregar funil de conversão');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFunnel();

    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  return { data, loading, error };
};

-- Criar tabela para sessões do website
CREATE TABLE public.website_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  page_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  converted_to_signup BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para visualizações de página
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer_page TEXT,
  time_on_page_seconds INTEGER DEFAULT 0,
  bounce BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna session_id na tabela analytics_events existente
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX idx_website_sessions_session_id ON public.website_sessions(session_id);
CREATE INDEX idx_website_sessions_start_time ON public.website_sessions(start_time);
CREATE INDEX idx_website_sessions_user_id ON public.website_sessions(user_id);
CREATE INDEX idx_website_sessions_converted ON public.website_sessions(converted_to_signup);
CREATE INDEX idx_website_sessions_utm_source ON public.website_sessions(utm_source);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_page_url ON public.page_views(page_url);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.website_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para website_sessions (apenas service_role pode inserir/atualizar)
CREATE POLICY "Service role can manage website sessions"
ON public.website_sessions
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Políticas RLS para page_views (apenas service_role pode inserir)
CREATE POLICY "Service role can manage page views"
ON public.page_views
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Trigger para atualizar updated_at em website_sessions
CREATE TRIGGER update_website_sessions_updated_at
BEFORE UPDATE ON public.website_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Adicionar campo nicho na tabela profiles
ALTER TABLE public.profiles ADD COLUMN niche text;

-- Adicionar novos campos na tabela products para gestão avançada
ALTER TABLE public.products ADD COLUMN weight text;
ALTER TABLE public.products ADD COLUMN cost numeric;
ALTER TABLE public.products ADD COLUMN discount numeric;
ALTER TABLE public.products ADD COLUMN code text;
ALTER TABLE public.products ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
ALTER TABLE public.products ADD COLUMN discount_animation_enabled boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN discount_animation_color text DEFAULT '#ff0000';

-- Criar índices para melhor performance
CREATE INDEX idx_products_status ON public.products(user_id, status);
CREATE INDEX idx_products_code ON public.products(user_id, code) WHERE code IS NOT NULL;
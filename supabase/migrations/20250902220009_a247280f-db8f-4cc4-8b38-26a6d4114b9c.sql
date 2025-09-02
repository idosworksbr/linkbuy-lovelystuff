-- Adicionar coluna display_order à tabela products para permitir reordenação customizada
ALTER TABLE public.products ADD COLUMN display_order integer DEFAULT 0;

-- Criar índice para performance na ordenação
CREATE INDEX idx_products_display_order ON public.products(user_id, display_order);

-- Atualizar display_order existente baseado na ordem de criação
UPDATE public.products 
SET display_order = row_number() OVER (PARTITION BY user_id ORDER BY created_at);
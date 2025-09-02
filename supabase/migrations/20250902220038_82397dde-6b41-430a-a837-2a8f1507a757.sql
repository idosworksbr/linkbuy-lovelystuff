-- Adicionar coluna display_order à tabela products para permitir reordenação customizada
ALTER TABLE public.products ADD COLUMN display_order integer DEFAULT 0;

-- Criar índice para performance na ordenação
CREATE INDEX idx_products_display_order ON public.products(user_id, display_order);

-- Inicializar display_order com valores sequenciais baseado em created_at
WITH ranked_products AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.products
)
UPDATE public.products 
SET display_order = ranked_products.rn
FROM ranked_products 
WHERE products.id = ranked_products.id;

-- Adicionar colunas para Instagram, configurações de tema e layout do catálogo
ALTER TABLE public.profiles 
ADD COLUMN instagram_url text,
ADD COLUMN catalog_theme text DEFAULT 'light' CHECK (catalog_theme IN ('light', 'dark', 'beige')),
ADD COLUMN catalog_layout text DEFAULT 'overlay' CHECK (catalog_layout IN ('overlay', 'bottom')),
ADD COLUMN custom_whatsapp_message text DEFAULT 'Olá! Vi seu catálogo e gostaria de saber mais sobre seus produtos.';

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN public.profiles.instagram_url IS 'URL do perfil do Instagram da loja';
COMMENT ON COLUMN public.profiles.catalog_theme IS 'Tema do catálogo: light, dark ou beige';
COMMENT ON COLUMN public.profiles.catalog_layout IS 'Layout dos produtos no catálogo: overlay (título/preço sobre a imagem) ou bottom (título/preço abaixo da imagem)';
COMMENT ON COLUMN public.profiles.custom_whatsapp_message IS 'Mensagem personalizada para o WhatsApp';

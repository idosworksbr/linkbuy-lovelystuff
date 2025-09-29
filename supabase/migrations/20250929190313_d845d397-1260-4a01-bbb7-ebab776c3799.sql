-- Adicionar coluna catalog_visible à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS catalog_visible boolean DEFAULT true;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_catalog_visible 
ON profiles(catalog_visible);

-- Adicionar comentário explicativo
COMMENT ON COLUMN profiles.catalog_visible IS 'Define se o catálogo está visível publicamente. Quando false, apenas o proprietário pode visualizar.';

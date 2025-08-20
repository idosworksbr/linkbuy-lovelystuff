
-- Adicionar campo whatsapp_number à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_number TEXT;

-- Atualizar a função get_public_store_info para incluir whatsapp_number
CREATE OR REPLACE FUNCTION public.get_public_store_info(store_url_param text)
 RETURNS TABLE(id uuid, store_url text, store_name text, store_description text, profile_photo_url text, background_color text, whatsapp_number text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.store_url,
    p.store_name,
    p.store_description,
    p.profile_photo_url,
    p.background_color,
    p.whatsapp_number,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.store_url = store_url_param;
$function$

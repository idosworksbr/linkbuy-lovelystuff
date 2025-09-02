-- Update handle_new_user function to set correct default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, store_url, store_name, catalog_theme, catalog_layout, product_grid_layout)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    LOWER(REPLACE(COALESCE(new.raw_user_meta_data->>'name', 'loja-' || SUBSTRING(new.id::text, 1, 8)), ' ', '-')),
    COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja'),
    'light',     -- Default theme is light
    'bottom',    -- Default layout shows title/price visible (bottom)
    'default'    -- Default grid layout
  );
  RETURN new;
END;
$function$;
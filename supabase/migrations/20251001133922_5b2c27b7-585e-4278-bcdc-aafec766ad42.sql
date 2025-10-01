-- Fix handle_new_user function to generate unique store_url on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_url text;
  final_url text;
  url_counter integer := 0;
BEGIN
  -- Generate base URL from user name or email
  base_url := LOWER(
    REGEXP_REPLACE(
      COALESCE(
        new.raw_user_meta_data->>'name',
        SPLIT_PART(new.email, '@', 1)
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
  
  -- Remove leading/trailing hyphens
  base_url := TRIM(BOTH '-' FROM base_url);
  
  -- Ensure minimum length
  IF LENGTH(base_url) < 3 THEN
    base_url := 'loja-' || SUBSTRING(new.id::text, 1, 8);
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(base_url) > 40 THEN
    base_url := SUBSTRING(base_url, 1, 40);
  END IF;
  
  final_url := base_url;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE store_url = final_url) LOOP
    url_counter := url_counter + 1;
    final_url := base_url || '-' || url_counter;
  END LOOP;
  
  -- Insert profile with generated store_url
  INSERT INTO public.profiles (
    id, 
    name, 
    store_url,
    store_name, 
    catalog_theme, 
    catalog_layout, 
    product_grid_layout
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    final_url,
    COALESCE(new.raw_user_meta_data->>'name', 'Minha Loja'),
    'light',
    'bottom',
    'default'
  );
  
  RETURN new;
END;
$function$;
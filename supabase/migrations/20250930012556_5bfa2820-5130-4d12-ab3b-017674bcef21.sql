-- Add show_on_catalog_open field to lead_capture_settings
ALTER TABLE public.lead_capture_settings 
ADD COLUMN IF NOT EXISTS show_on_catalog_open boolean NOT NULL DEFAULT false;
-- Add trigger_mode column to lead_capture_settings
ALTER TABLE public.lead_capture_settings 
ADD COLUMN trigger_mode text NOT NULL DEFAULT 'always';

-- Add comment for documentation
COMMENT ON COLUMN public.lead_capture_settings.trigger_mode IS 'Controls when lead capture is triggered: always or once_per_session';
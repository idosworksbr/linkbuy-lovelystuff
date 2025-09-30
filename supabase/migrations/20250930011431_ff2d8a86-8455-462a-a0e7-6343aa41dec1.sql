-- Add cancel_at_period_end field to track subscription cancellation status
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Fix master password (encode "My.4658" as base64 = "TXkuNDY1OA==")
UPDATE public.masters 
SET password_hash = 'TXkuNDY1OA==' 
WHERE email = 'MARCELOMUNDOCLICK@GMAIL.COM';
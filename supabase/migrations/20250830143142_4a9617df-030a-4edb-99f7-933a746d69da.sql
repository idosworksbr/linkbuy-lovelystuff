-- Create function to update updated_at column if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for custom_links
CREATE POLICY "Users can view their own custom links" 
ON public.custom_links 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert their own custom links" 
ON public.custom_links 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update their own custom links" 
ON public.custom_links 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete their own custom links" 
ON public.custom_links 
FOR DELETE 
USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create trigger to update updated_at column for custom_links
CREATE TRIGGER update_custom_links_updated_at
BEFORE UPDATE ON public.custom_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
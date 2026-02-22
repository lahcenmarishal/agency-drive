
-- Table des licences
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  allowed_domain TEXT DEFAULT NULL,
  client_name TEXT DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Super admins can manage licenses
CREATE POLICY "Super admins can manage licenses"
ON public.licenses
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Public read for verification (edge function uses service role, but just in case)
CREATE POLICY "Allow anon select for verification"
ON public.licenses
FOR SELECT
USING (true);

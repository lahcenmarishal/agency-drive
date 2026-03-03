
-- Table to store pending registrations before Stripe payment completes
CREATE TABLE public.pending_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  agency_name text NOT NULL,
  agency_city text,
  agency_address text,
  agency_phone text,
  agency_email text,
  plan_key text NOT NULL DEFAULT 'basic',
  price_id text NOT NULL,
  billing_interval text NOT NULL DEFAULT 'monthly',
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (via edge functions)
-- No public policies needed since this is handled server-side only
CREATE POLICY "Service role only" ON public.pending_registrations
  FOR ALL USING (false) WITH CHECK (false);

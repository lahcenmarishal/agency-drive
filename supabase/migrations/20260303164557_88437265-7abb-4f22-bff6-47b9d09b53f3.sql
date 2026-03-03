
-- Tenant subscription tracking table
CREATE TABLE public.tenant_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'trial',
  billing_interval text NOT NULL DEFAULT 'monthly',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_ends_at timestamp with time zone,
  max_vehicles integer NOT NULL DEFAULT 10,
  max_users integer NOT NULL DEFAULT 3,
  max_agencies integer NOT NULL DEFAULT 1,
  price_id text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'usd',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agency_id)
);

-- Enable RLS
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all subscriptions
CREATE POLICY "Super admins can manage all subscriptions"
ON public.tenant_subscriptions FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Admins can view their agency subscription
CREATE POLICY "Admins can view their agency subscription"
ON public.tenant_subscriptions FOR SELECT
USING (can_access_agency(auth.uid(), agency_id));

-- Agents can view their agency subscription
CREATE POLICY "Agents can view their agency subscription"
ON public.tenant_subscriptions FOR SELECT
USING (get_user_agency_id(auth.uid()) = agency_id);

-- Trigger for updated_at
CREATE TRIGGER update_tenant_subscriptions_updated_at
BEFORE UPDATE ON public.tenant_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for subscription changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_subscriptions;

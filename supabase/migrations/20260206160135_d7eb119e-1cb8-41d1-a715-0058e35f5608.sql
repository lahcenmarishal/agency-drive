-- Table de liaison admin-agences (un admin peut gérer plusieurs agences)
CREATE TABLE public.admin_agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agency_id)
);

-- Enable RLS
ALTER TABLE public.admin_agencies ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all admin-agency associations
CREATE POLICY "Super admins can manage admin_agencies"
ON public.admin_agencies FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Admins can view their own agency associations
CREATE POLICY "Admins can view their agencies"
ON public.admin_agencies FOR SELECT
USING (user_id = auth.uid());

-- Function to check if admin has access to a specific agency
CREATE OR REPLACE FUNCTION public.admin_has_agency_access(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.admin_agencies
      WHERE user_id = _user_id AND agency_id = _agency_id
    )
$$;

-- Update can_access_agency to use the new logic
CREATE OR REPLACE FUNCTION public.can_access_agency(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    is_super_admin(_user_id)
    OR admin_has_agency_access(_user_id, _agency_id)
    OR get_user_agency_id(_user_id) = _agency_id
$$;
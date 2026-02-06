-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Update RLS policies for user_roles to allow super_admin to manage all roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Admin can view roles in their agency (based on profiles)
CREATE POLICY "Admins can view roles in their agency"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') AND 
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id
    AND p1.agency_id = p2.agency_id
  )
);

-- Admin can manage roles for users in their agency (agents only)
CREATE POLICY "Admins can create agent roles in their agency"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') AND
  role = 'agent' AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id
    AND p1.agency_id = p2.agency_id
  )
);

-- Update profiles RLS to allow super_admin and admin to manage profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage profiles in their agency"
ON public.profiles
FOR ALL
USING (
  has_role(auth.uid(), 'admin') AND 
  agency_id = get_user_agency_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin') AND 
  agency_id = get_user_agency_id(auth.uid())
);
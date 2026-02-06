-- Drop and recreate the profiles policies to allow Super Admin without agency
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their agency" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;

-- Super admins can view and manage all profiles
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Agency admins can manage profiles in their agency
CREATE POLICY "Admins can manage profiles in their agency" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  AND agency_id IS NOT NULL 
  AND agency_id = get_user_agency_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin') 
  AND agency_id IS NOT NULL 
  AND agency_id = get_user_agency_id(auth.uid())
);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Users can always view their own roles (critical for login)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());
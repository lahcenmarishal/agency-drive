-- Fix profiles policies - make them PERMISSIVE (default)
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their agency" ON public.profiles;

-- Super admins can view and manage all profiles (PERMISSIVE)
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Users can view their own profile (PERMISSIVE)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own profile (PERMISSIVE)
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile (PERMISSIVE)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Agency admins can manage profiles in their agency (PERMISSIVE)
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

-- Fix user_roles policies - make them PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles in their agency" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can create agent roles in their agency" ON public.user_roles;

-- Users can view their own roles (PERMISSIVE)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own role (for new user trigger)
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Super admins can manage all roles (PERMISSIVE)
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Admins can view roles in their agency (PERMISSIVE)
CREATE POLICY "Admins can view roles in their agency" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  AND EXISTS (
    SELECT 1 FROM profiles p1, profiles p2 
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id 
    AND p1.agency_id = p2.agency_id
  )
);

-- Admins can create agent roles in their agency (PERMISSIVE)
CREATE POLICY "Admins can create agent roles in their agency" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') 
  AND role = 'agent' 
  AND EXISTS (
    SELECT 1 FROM profiles p1, profiles p2 
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id 
    AND p1.agency_id = p2.agency_id
  )
);
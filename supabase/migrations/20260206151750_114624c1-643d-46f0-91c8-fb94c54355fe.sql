-- Simplify user_roles policies to avoid any recursion
-- The key is that "Users can view their own roles" should be the ONLY policy needed for basic access

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles in their agency" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can create agent roles in their agency" ON public.user_roles;

-- SIMPLE policy: Users can always view their own role (no function calls)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- For inserting (used by trigger), allow authenticated users to insert their own role
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Super admin management - use a direct subquery instead of is_super_admin() function
-- This avoids the recursion by checking directly
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  )
);

-- Admins can view and create agent roles - also use direct check
CREATE POLICY "Admins can manage agent roles in their agency" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  role = 'agent' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
  AND EXISTS (
    SELECT 1 FROM profiles p1, profiles p2 
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id 
    AND p1.agency_id = p2.agency_id
  )
)
WITH CHECK (
  role = 'agent' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
  AND EXISTS (
    SELECT 1 FROM profiles p1, profiles p2 
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = user_roles.user_id 
    AND p1.agency_id = p2.agency_id
  )
);

-- Also simplify profiles policies
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their agency" ON public.profiles;

-- Users can always view their own profile (simple, no recursion)
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

-- Users can insert their own profile (for trigger)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Super admins can manage all profiles - direct subquery
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  )
);

-- Admins can manage profiles in their agency - direct subquery
CREATE POLICY "Admins can manage profiles in their agency" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
  AND agency_id IS NOT NULL 
  AND agency_id = get_user_agency_id(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
  AND agency_id IS NOT NULL 
  AND agency_id = get_user_agency_id(auth.uid())
);
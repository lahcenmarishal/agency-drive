-- Fix restrictive RLS policies so admins can view/update other users' profiles and roles

-- profiles: allow admins through the "own profile" policies (these are RESTRICTIVE, so they must not block admins)
ALTER POLICY "Users can view their own profile"
ON public.profiles
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

ALTER POLICY "Users can update their own profile"
ON public.profiles
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- user_roles: allow admins to see all roles
ALTER POLICY "Users can view their own roles"
ON public.user_roles
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

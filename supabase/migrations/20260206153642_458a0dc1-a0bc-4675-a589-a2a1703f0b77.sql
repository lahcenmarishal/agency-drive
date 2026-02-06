DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@autorent.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Super admin user not found for admin@autorent.com';
    RETURN;
  END IF;

  -- Force a single super_admin role row
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin'::public.app_role);

  -- Ensure profile exists and is consistent
  INSERT INTO public.profiles (user_id, full_name, email, agency_id, is_active)
  VALUES (v_user_id, 'Super Administrateur', 'admin@autorent.com', NULL, TRUE)
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      agency_id = NULL,
      is_active = TRUE;
END $$;
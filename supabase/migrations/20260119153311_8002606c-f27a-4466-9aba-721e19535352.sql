-- Drop all existing restrictive policies and recreate them as permissive

-- CLIENTS TABLE
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Agents can manage clients in their agency" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in accessible agencies" ON public.clients;

CREATE POLICY "Admins can manage clients" ON public.clients
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage clients in their agency" ON public.clients
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- VEHICLES TABLE
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Agents can manage vehicles in their agency" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view vehicles in accessible agencies" ON public.vehicles;

CREATE POLICY "Admins can manage vehicles" ON public.vehicles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage vehicles in their agency" ON public.vehicles
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- RENTALS TABLE
DROP POLICY IF EXISTS "Admins can manage rentals" ON public.rentals;
DROP POLICY IF EXISTS "Agents can manage rentals in their agency" ON public.rentals;
DROP POLICY IF EXISTS "Users can view rentals in accessible agencies" ON public.rentals;

CREATE POLICY "Admins can manage rentals" ON public.rentals
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage rentals in their agency" ON public.rentals
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- RESERVATIONS TABLE
DROP POLICY IF EXISTS "Admins can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Agents can manage reservations in their agency" ON public.reservations;
DROP POLICY IF EXISTS "Users can view reservations in accessible agencies" ON public.reservations;

CREATE POLICY "Admins can manage reservations" ON public.reservations
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage reservations in their agency" ON public.reservations
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- DRIVERS TABLE
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Agents can manage drivers in their agency" ON public.drivers;
DROP POLICY IF EXISTS "Users can view drivers in accessible agencies" ON public.drivers;

CREATE POLICY "Admins can manage drivers" ON public.drivers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage drivers in their agency" ON public.drivers
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- EMPLOYEES TABLE
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Agents can manage employees in their agency" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees in accessible agencies" ON public.employees;

CREATE POLICY "Admins can manage employees" ON public.employees
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage employees in their agency" ON public.employees
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can manage transactions in their agency" ON public.transactions;
DROP POLICY IF EXISTS "Users can view transactions in accessible agencies" ON public.transactions;

CREATE POLICY "Admins can manage transactions" ON public.transactions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage transactions in their agency" ON public.transactions
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- BLACKLIST_NOTES TABLE
DROP POLICY IF EXISTS "Admins can manage notes" ON public.blacklist_notes;
DROP POLICY IF EXISTS "Agents can manage notes in their agency" ON public.blacklist_notes;
DROP POLICY IF EXISTS "Users can view notes in accessible agencies" ON public.blacklist_notes;

CREATE POLICY "Admins can manage notes" ON public.blacklist_notes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can manage notes in their agency" ON public.blacklist_notes
FOR ALL USING (get_user_agency_id(auth.uid()) = agency_id)
WITH CHECK (get_user_agency_id(auth.uid()) = agency_id);

-- AGENCIES TABLE
DROP POLICY IF EXISTS "Admins can do everything on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Agents can view their own agency" ON public.agencies;

CREATE POLICY "Admins can do everything on agencies" ON public.agencies
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view their own agency" ON public.agencies
FOR SELECT USING (id = get_user_agency_id(auth.uid()));

-- USER_ROLES TABLE
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own role" ON public.user_roles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- PROFILES TABLE - Add missing INSERT policy for profile creation
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());
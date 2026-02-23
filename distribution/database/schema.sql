-- ============================================
-- AutoRent Pro — Schéma complet de base de données
-- Version: 1.0.0
-- Compatible: Supabase (PostgreSQL 15+)
-- ============================================

-- ============================================
-- 1. TYPES ENUM
-- ============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'super_admin');
CREATE TYPE public.rental_status AS ENUM ('active', 'completed', 'overdue');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'converted');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'rented', 'reserved', 'maintenance');

-- ============================================
-- 2. TABLES
-- ============================================

-- Agences
CREATE TABLE public.agencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  city text,
  phone text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profils utilisateurs
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  agency_id uuid REFERENCES public.agencies(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rôles utilisateurs
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'agent'
);

-- Agences admin (multi-agences pour admins)
CREATE TABLE public.admin_agencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Véhicules
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  brand text NOT NULL,
  model text NOT NULL,
  registration text NOT NULL,
  year integer,
  color text,
  daily_rate numeric DEFAULT 0,
  status vehicle_status DEFAULT 'available',
  fuel_type text,
  transmission text,
  seats integer DEFAULT 5,
  insurance_expiry date,
  technical_visit_expiry date,
  registration_card_expiry date,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Clients
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  id_number text,
  license_number text,
  is_blacklisted boolean DEFAULT false,
  blacklist_reason text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Chauffeurs
CREATE TABLE public.drivers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  full_name text NOT NULL,
  license_number text,
  license_expiry date,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employés
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  full_name text NOT NULL,
  email text,
  phone text,
  position text,
  hire_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Réservations
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  client_id uuid REFERENCES public.clients(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status reservation_status DEFAULT 'pending',
  total_amount numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Locations (rentals)
CREATE TABLE public.rentals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  client_id uuid REFERENCES public.clients(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  reservation_id uuid REFERENCES public.reservations(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  actual_return_date date,
  status rental_status DEFAULT 'active',
  daily_rate numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  amount_paid numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Transactions (comptabilité)
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  type transaction_type NOT NULL,
  amount numeric NOT NULL,
  category text,
  description text,
  rental_id uuid REFERENCES public.rentals(id),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Notes de liste noire
CREATE TABLE public.blacklist_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES public.agencies(id),
  title text NOT NULL,
  content text,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Licences
CREATE TABLE public.licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key text NOT NULL UNIQUE,
  allowed_domain text,
  client_name text,
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================
-- 3. FONCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT agency_id FROM public.profiles WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (_role = 'admin'::app_role AND role = 'super_admin'::app_role))
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_has_agency_access(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 
    is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.admin_agencies WHERE user_id = _user_id AND agency_id = _agency_id
    )
$$;

CREATE OR REPLACE FUNCTION public.can_access_agency(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 
    is_super_admin(_user_id)
    OR admin_has_agency_access(_user_id, _agency_id)
    OR get_user_agency_id(_user_id) = _agency_id
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'agent');
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour créer automatiquement le profil lors de l'inscription
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Policies: Agencies
CREATE POLICY "Users can view accessible agencies" ON public.agencies FOR SELECT USING (can_access_agency(auth.uid(), id));
CREATE POLICY "Super admins can manage agencies" ON public.agencies FOR ALL USING (is_super_admin(auth.uid()));

-- Policies: Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies: Vehicles, Clients, Drivers, Employees, Reservations, Rentals, Transactions, Blacklist Notes
-- (Accès basé sur can_access_agency pour l'agency_id de chaque enregistrement)
CREATE POLICY "Agency access for vehicles" ON public.vehicles FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for clients" ON public.clients FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for drivers" ON public.drivers FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for employees" ON public.employees FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for reservations" ON public.reservations FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for rentals" ON public.rentals FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for transactions" ON public.transactions FOR ALL USING (can_access_agency(auth.uid(), agency_id));
CREATE POLICY "Agency access for blacklist_notes" ON public.blacklist_notes FOR ALL USING (can_access_agency(auth.uid(), agency_id));

-- Policies: User Roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (is_super_admin(auth.uid()));

-- Policies: Admin Agencies
CREATE POLICY "Super admins can manage admin_agencies" ON public.admin_agencies FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Admins can view own agencies" ON public.admin_agencies FOR SELECT USING (auth.uid() = user_id);

-- Policies: Licenses (service_role only via Edge Functions)
CREATE POLICY "No direct access to licenses" ON public.licenses FOR SELECT USING (false);

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

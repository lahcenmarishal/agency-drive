# 🏗️ Technical Documentation — AutoRent Pro

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Structure](#database-structure)
5. [Role Management Logic](#role-management-logic)
6. [Subscription System](#subscription-system)
7. [State Management](#state-management)
8. [Security Considerations](#security-considerations)
9. [Server Requirements](#server-requirements)
10. [Browser Compatibility](#browser-compatibility)

---

## Tech Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.3+ |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | Latest |
| **Build Tool** | Vite | 5.x |
| **Backend** | Supabase | Latest |
| **Database** | PostgreSQL | 15+ (via Supabase) |
| **Authentication** | Supabase Auth | Built-in |
| **Payments** | Stripe | Latest |
| **Serverless Functions** | Supabase Edge Functions | Deno runtime |
| **State Management** | TanStack Query v5 | 5.x |
| **Routing** | React Router | 6.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Charts** | Recharts | 2.x |
| **i18n** | i18next + react-i18next | 25.x / 16.x |
| **Icons** | Lucide React | Latest |
| **Date Handling** | date-fns | 3.x |
| **Notifications** | Sonner | Latest |

---

## Frontend Architecture

### Folder Structure

```
src/
├── components/           # UI Components
│   ├── ui/               # Base shadcn/ui components (40+)
│   ├── layout/           # AppLayout, Sidebar, MobileSidebar, AgencySelector
│   ├── dashboard/        # StatCard, FleetStatus, AlertsCard, UpcomingEvents, etc.
│   ├── vehicles/         # VehicleForm, VehicleCard, DocumentAlerts
│   ├── clients/          # ClientForm, ClientDetailsDialog, BlacklistDialog
│   ├── rentals/          # RentalForm
│   ├── reservations/     # ReservationForm
│   ├── accounting/       # TransactionForm, FinancialChart, CategoryBreakdown
│   ├── employees/        # EmployeeForm
│   ├── drivers/          # DriverForm
│   ├── agencies/         # AgencyForm
│   ├── users/            # CreateAdminForm (with plan selection), EditUserForm
│   ├── billing/          # AdminBillingPanel (subscription management)
│   └── landing/          # DemoRequestForm
├── pages/                # Route-level components
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Vehicules.tsx     # Vehicle management
│   ├── Clients.tsx       # Client management
│   ├── Locations.tsx     # Rental management
│   ├── Reservations.tsx  # Reservation management
│   ├── Comptabilite.tsx  # Accounting
│   ├── Employes.tsx      # Employee management
│   ├── Chauffeurs.tsx    # Driver management
│   ├── Agences.tsx       # Agency listing
│   ├── AgenceDetails.tsx # Single agency view
│   ├── Parametres.tsx    # Settings
│   ├── UsersManagement   # User/role management + AdminBillingPanel
│   ├── Billing.tsx       # Subscription plans & management (agency admins only)
│   ├── Onboarding.tsx    # Self-service registration + checkout
│   ├── Auth.tsx          # Login page
│   ├── AdminAuth.tsx     # Admin login
│   ├── Landing.tsx       # Public landing page with pricing
│   ├── Activation.tsx    # License activation
│   └── NotFound.tsx      # 404 page
├── hooks/                # Custom React hooks
│   ├── useVehicles.ts    # Vehicle CRUD operations
│   ├── useClients.ts     # Client CRUD operations
│   ├── useRentals.ts     # Rental CRUD operations
│   ├── useReservations   # Reservation CRUD operations
│   ├── useTransactions   # Transaction CRUD operations
│   ├── useEmployees.ts   # Employee CRUD + account creation
│   ├── useDrivers.ts     # Driver CRUD operations
│   ├── useAgencies.ts    # Agency CRUD operations
│   ├── useUsers.ts       # User management (with plan_key support)
│   ├── useDashboardStats # Dashboard metrics
│   ├── usePlanLimits.ts  # Feature gating based on subscription
│   ├── useAgencyFilter   # Agency-based filtering
│   └── useAccessibleAgencies # Multi-agency access
├── contexts/             # React Context providers
│   ├── AuthContext.tsx    # Authentication state & role management
│   ├── AgencyFilterContext # Agency selection & filtering
│   ├── SubscriptionContext # Subscription state & auto-refresh
│   └── LicenseContext    # License validation
├── config/
│   └── subscriptionPlans.ts # Plan definitions (Basic, Pro, Enterprise)
├── i18n/                 # Internationalization
│   ├── index.ts          # i18n configuration
│   └── locales/
│       ├── en.json       # English translations
│       └── fr.json       # French translations
├── integrations/
│   └── supabase/
│       ├── client.ts     # Supabase client (auto-generated)
│       └── types.ts      # Database types (auto-generated)
└── lib/
    └── utils.ts          # Utility functions (cn, etc.)
```

### Routing

```
/                    → Landing page with pricing (public)
/auth                → User login
/admin-auth          → Admin login
/onboarding          → Self-service registration + Stripe checkout (public)
/activation          → License activation
/dashboard           → Main dashboard (protected + subscription guard)
/vehicules           → Vehicle management (protected + subscription guard)
/clients             → Client management (protected + subscription guard)
/locations           → Rental management (protected + subscription guard)
/reservations        → Reservation management (protected + subscription guard)
/comptabilite        → Accounting (protected, admin only + subscription guard)
/employes            → Employee management (protected + subscription guard)
/chauffeurs          → Driver management (protected + subscription guard)
/agences             → Agency management (protected, admin only + subscription guard)
/agences/:id         → Agency details (protected, admin only + subscription guard)
/parametres          → Settings (protected, admin only)
/utilisateurs        → User + subscription management (protected, super admin only)
/billing             → Subscription plans (protected, agency admins only — hidden for super admin)
```

---

## Backend Architecture

### Edge Functions

| Function | Purpose | JWT Required |
|----------|---------|:---:|
| `seed-admin` | Create the first Super Admin account | ❌ |
| `create-user` | Provision new user accounts + optional subscription | ❌ |
| `manage-user` | Update/deactivate user accounts | ❌ |
| `verify-license` | Validate license keys against domains | ❌ |
| `create-checkout` | Create Stripe checkout for existing users | ❌ |
| `onboard-checkout` | Create Stripe checkout for new registrations | ❌ |
| `check-subscription` | Verify subscription status from DB | ❌ |
| `customer-portal` | Open Stripe billing portal | ❌ |
| `stripe-webhook` | Handle Stripe events (payment, cancellation) | ❌ |

---

## Database Structure

### Tables Summary

| Table | RLS | Description |
|-------|:-:|-------------|
| `agencies` | ✅ | Rental agency locations |
| `profiles` | ✅ | User profile data |
| `user_roles` | ✅ | Role assignments (admin/agent/super_admin) |
| `admin_agencies` | ✅ | Admin-to-agency mapping |
| `vehicles` | ✅ | Vehicle fleet |
| `clients` | ✅ | Customer database |
| `drivers` | ✅ | Driver registry |
| `employees` | ✅ | Staff records |
| `reservations` | ✅ | Booking records |
| `rentals` | ✅ | Rental contracts |
| `transactions` | ✅ | Financial transactions |
| `blacklist_notes` | ✅ | Operational notes |
| `licenses` | ✅ | License keys |
| `tenant_subscriptions` | ✅ | Subscription plans per agency (Stripe) |
| `pending_registrations` | ✅ | Temporary onboarding data (24h expiry) |

---

## Subscription System

### Architecture

```
Landing Page → Select Plan → Onboarding Form → Stripe Checkout → Webhook → Auto-provision
                                                                     ↓
                                                            Agency + Admin + Subscription created
```

### Super Admin Flow
```
Super Admin → Users Panel → Create Admin → Select Plan + Interval → User + Subscription created
Super Admin → AdminBillingPanel → Edit/Extend/Cancel any subscription manually
```

### Plan Definitions

| Plan | Vehicles | Users | Agencies | Monthly | Yearly |
|------|:--------:|:-----:|:--------:|:-------:|:------:|
| Basic | 10 | 3 | 1 | $29 | $290 |
| Pro | 50 | 10 | 3 | $59 | $590 |
| Enterprise | ∞ | ∞ | ∞ | $99 | $990 |

### Subscription Guard

The `SubscriptionGuard` component wraps protected routes:
- **Super Admins**: Always bypass (no subscription needed)
- **Active subscriptions**: Full access
- **Expired/cancelled**: Redirected to `/billing`
- **Allowed bypass**: `/billing`, `/parametres`, `/auth`

### Key Files
- `src/config/subscriptionPlans.ts` — Plan definitions with Stripe price IDs
- `src/contexts/SubscriptionContext.tsx` — Subscription state + auto-refresh (60s)
- `src/components/SubscriptionGuard.tsx` — Route access control
- `src/components/billing/AdminBillingPanel.tsx` — Super Admin subscription management
- `src/pages/Billing.tsx` — Agency admin billing page
- `src/pages/Onboarding.tsx` — Self-service registration

---

## Role Management Logic

### Role Hierarchy

```
Super Admin (super_admin)
    │
    ├── Full system access (NO subscription required)
    ├── Manage all agencies
    ├── Create/manage admins with subscription assignment
    ├── View/edit/extend all tenant subscriptions
    ├── View all data across agencies
    └── System settings
    
Agency Admin (admin)
    │
    ├── Requires active subscription
    ├── Manage assigned agencies only
    ├── Create agents within their agencies
    ├── View agency-specific data
    ├── Accounting access
    ├── Billing & subscription management (self-service)
    └── Employee management
    
Employee / Agent (agent)
    │
    ├── Access own agency only (inherits subscription status)
    ├── Manage clients, vehicles, rentals
    ├── No accounting access
    ├── No settings access
    └── No user management
```

---

## Security Considerations

### Authentication
- Email/password authentication via Supabase Auth
- JWT tokens with automatic refresh
- Session persistence in localStorage
- Protected routes with `ProtectedRoute` component
- Subscription-based access control with `SubscriptionGuard`

### Payment Security
- Stripe webhook signature verification (`STRIPE_WEBHOOK_SECRET`)
- No sensitive Stripe keys in client-side code
- Password hashed before storage in `pending_registrations`
- Pending registrations expire after 24 hours

### Data Isolation
- Multi-tenant data isolation via `agency_id` on all business tables
- `can_access_agency()` function enforces access at query level
- Super Admins can access all agencies
- Admins access only assigned agencies
- Agents access only their own agency

---

## Browser Compatibility

| Browser | Minimum Version | Status |
|---------|:-:|:-:|
| Google Chrome | 90+ | ✅ Fully supported |
| Mozilla Firefox | 88+ | ✅ Fully supported |
| Apple Safari | 14+ | ✅ Fully supported |
| Microsoft Edge | 90+ | ✅ Fully supported |
| Chrome (Android) | Latest | ✅ Fully supported |
| Safari (iOS) | 14+ | ✅ Fully supported |
| Internet Explorer | Any | ❌ Not supported |

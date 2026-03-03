# 🏗️ Technical Documentation — AutoRent Pro

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Structure](#database-structure)
5. [Role Management Logic](#role-management-logic)
6. [State Management](#state-management)
7. [Security Considerations](#security-considerations)
8. [Server Requirements](#server-requirements)
9. [Browser Compatibility](#browser-compatibility)

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
│   ├── users/            # CreateAdminForm, EditUserForm
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
│   ├── UsersManagement   # User/role management
│   ├── Auth.tsx          # Login page
│   ├── AdminAuth.tsx     # Admin login
│   ├── Landing.tsx       # Public landing page
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
│   ├── useUsers.ts       # User management
│   ├── useDashboardStats # Dashboard metrics
│   ├── useAgencyFilter   # Agency-based filtering
│   └── useAccessibleAgencies # Multi-agency access
├── contexts/             # React Context providers
│   ├── AuthContext.tsx    # Authentication state & role management
│   ├── AgencyFilterContext # Agency selection & filtering
│   └── LicenseContext    # License validation
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

### Component Architecture

The application follows a **composition-based architecture**:

1. **Pages** → Top-level route components. Handle layout and data orchestration.
2. **Feature Components** → Domain-specific components (e.g., `VehicleForm`, `ClientDetailsDialog`).
3. **UI Components** → Reusable, headless-style components from shadcn/ui.
4. **Hooks** → All data fetching and mutations are encapsulated in custom hooks using TanStack Query.
5. **Contexts** → Global state (Auth, Agency filter, License) is managed via React Context.

### Routing

```
/                    → Landing page (public)
/auth                → User login
/admin-auth          → Admin login
/activation          → License activation
/dashboard           → Main dashboard (protected)
/vehicules           → Vehicle management (protected)
/clients             → Client management (protected)
/locations           → Rental management (protected)
/reservations        → Reservation management (protected)
/comptabilite        → Accounting (protected, admin only)
/employes            → Employee management (protected)
/chauffeurs          → Driver management (protected)
/agences             → Agency management (protected, admin only)
/agences/:id         → Agency details (protected, admin only)
/parametres          → Settings (protected, admin only)
/utilisateurs        → User management (protected, super admin only)
```

---

## Backend Architecture

### Supabase Services Used

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Relational database with RLS |
| **Auth** | Email/password authentication |
| **Edge Functions** | Serverless functions (Deno) |
| **Realtime** | (Available, not currently used) |
| **Storage** | (Available for vehicle images) |

### Edge Functions

| Function | Purpose | JWT Required |
|----------|---------|:---:|
| `seed-admin` | Create the first Super Admin account | ❌ |
| `create-user` | Provision new user accounts (admin/agent) | ❌ |
| `manage-user` | Update/deactivate user accounts | ❌ |
| `verify-license` | Validate license keys against domains | ❌ |

> **Note:** Edge Functions use `service_role` key internally for privileged database operations. They validate permissions by checking the caller's role in the database.

---

## Database Structure

### Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    ├── profiles (1:1) ──── agencies (N:1)
    ├── user_roles (1:N)
    └── admin_agencies (N:M) ──── agencies
    
agencies
    ├── vehicles (1:N)
    ├── clients (1:N)
    ├── drivers (1:N)
    ├── employees (1:N)
    ├── reservations (1:N)
    │       └── clients, vehicles
    ├── rentals (1:N)
    │       └── clients, vehicles, reservations
    ├── transactions (1:N)
    │       └── rentals
    └── blacklist_notes (1:N)

licenses (standalone)
```

### Tables Summary

| Table | Rows (typical) | RLS | Description |
|-------|:-:|:-:|-------------|
| `agencies` | 1–100 | ✅ | Rental agency locations |
| `profiles` | 1–500 | ✅ | User profile data |
| `user_roles` | 1–500 | ✅ | Role assignments (admin/agent/super_admin) |
| `admin_agencies` | 1–200 | ✅ | Admin-to-agency mapping |
| `vehicles` | 10–1000 | ✅ | Vehicle fleet |
| `clients` | 50–10000 | ✅ | Customer database |
| `drivers` | 5–200 | ✅ | Driver registry |
| `employees` | 5–500 | ✅ | Staff records |
| `reservations` | 50–5000 | ✅ | Booking records |
| `rentals` | 50–10000 | ✅ | Rental contracts |
| `transactions` | 100–50000 | ✅ | Financial transactions |
| `blacklist_notes` | 0–100 | ✅ | Operational notes |
| `licenses` | 1–100 | ✅ | License keys |

### Database Functions

| Function | Type | Purpose |
|----------|------|---------|
| `handle_new_user()` | Trigger | Auto-creates profile + agent role on signup |
| `is_super_admin(uuid)` | Security Definer | Checks if user is super admin |
| `has_role(uuid, role)` | Security Definer | Checks if user has a specific role |
| `can_access_agency(uuid, uuid)` | Security Definer | Checks agency access permission |
| `admin_has_agency_access(uuid, uuid)` | Security Definer | Checks admin agency assignment |
| `get_user_agency_id(uuid)` | Security Definer | Returns user's primary agency |
| `update_updated_at_column()` | Trigger | Auto-updates `updated_at` timestamps |

---

## Role Management Logic

### Role Hierarchy

```
Super Admin (super_admin)
    │
    ├── Full system access
    ├── Manage all agencies
    ├── Create/manage admins
    ├── View all data across agencies
    └── System settings
    
Agency Admin (admin)
    │
    ├── Manage assigned agencies only
    ├── Create agents within their agencies
    ├── View agency-specific data
    ├── Accounting access
    └── Employee management
    
Employee / Agent (agent)
    │
    ├── Access own agency only
    ├── Manage clients, vehicles, rentals
    ├── No accounting access
    ├── No settings access
    └── No user management
```

### How Roles Are Enforced

1. **Database Level (RLS)** — Every table query is filtered by `can_access_agency()` which checks the user's role and agency assignments.
2. **API Level (Edge Functions)** — Privileged operations (user creation, management) verify the caller's role before executing.
3. **UI Level** — Components conditionally render based on `useAuth()` context (`isAdmin`, `isSuperAdmin`).

### Role Assignment Flow

1. New user signs up → `handle_new_user()` trigger → assigned `agent` role by default
2. Super Admin creates admin → Edge Function → assigns `admin` role + `admin_agencies` entries
3. Admin creates employee with account → Edge Function → assigns `agent` role + `profiles.agency_id`

---

## State Management

### TanStack Query (Server State)

All data fetching uses TanStack Query with custom hooks:

```typescript
// Example: useVehicles hook
const { data: vehicles, isLoading } = useQuery({
  queryKey: ['vehicles', agencyFilter],
  queryFn: () => fetchVehicles(agencyFilter),
});

const createVehicle = useMutation({
  mutationFn: (data) => supabase.from('vehicles').insert(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
});
```

### React Context (Client State)

| Context | Purpose |
|---------|---------|
| `AuthContext` | Current user, role, agency, session |
| `AgencyFilterContext` | Selected agency for multi-agency admins |
| `LicenseContext` | License validation status |

### Data Flow

```
User Action → Hook (useMutation) → Supabase API → PostgreSQL (RLS filtered)
                                                        │
                                                        ↓
UI Update ← TanStack Query (cache invalidation) ← Response
```

---

## Security Considerations

### Authentication
- Email/password authentication via Supabase Auth
- JWT tokens with automatic refresh
- Session persistence in localStorage
- Protected routes with `ProtectedRoute` component

### Authorization
- **Row Level Security (RLS)** on all 13 tables
- **Security Definer Functions** prevent recursive RLS issues
- Role checks at database level — not bypassable from client
- Edge Functions use `service_role` for privileged operations

### Data Isolation
- Multi-tenant data isolation via `agency_id` on all business tables
- `can_access_agency()` function enforces access at query level
- Super Admins can access all agencies
- Admins access only assigned agencies
- Agents access only their own agency

### Best Practices Implemented
- No sensitive keys in client-side code
- Environment variables for configuration
- HTTPS enforced (via Supabase)
- Input validation with Zod schemas
- SQL injection prevention (parameterized queries via Supabase SDK)

---

## Server Requirements

### Development
- Node.js 18+
- npm 8+ or yarn 1.22+ or bun 1.x
- Modern browser with DevTools

### Production (Static Hosting)
- Any static hosting service (Netlify, Vercel, Cloudflare Pages)
- No server-side runtime required (Supabase handles backend)
- SSL certificate (provided by hosting platforms)

### Supabase Project
- Free tier sufficient for development and small deployments
- Pro plan recommended for production (better performance, backups)

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

### Required Browser Features
- ES2020+ JavaScript
- CSS Grid & Flexbox
- CSS Custom Properties
- Fetch API
- LocalStorage
- ResizeObserver

---

## Performance

### Build Output
- **Bundle size:** ~350KB gzipped (typical)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** 90+ (Performance)

### Optimization Techniques
- Code splitting via React.lazy (route-level)
- TanStack Query caching (reduces API calls)
- Vite tree-shaking (removes unused code)
- Tailwind CSS purging (minimal CSS output)
- Image lazy loading
- Debounced search inputs

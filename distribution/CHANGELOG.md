# 📋 Changelog — AutoRent Pro

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.1.0] — 2026-03-04

### ✨ Added
- **SaaS Subscription System** — Full Stripe integration with 3 plans (Basic, Pro, Enterprise)
  - Monthly and yearly billing intervals
  - Feature-gating based on subscription limits (vehicles, users, agencies)
  - Automated subscription lifecycle via Stripe webhooks
- **Self-Service Onboarding** — New customers can register from the landing page
  - Multi-step form: plan selection → agency details → Stripe payment
  - Automatic account + agency creation after successful payment
  - `pending_registrations` table for secure temporary data storage
- **Subscription Guard** — Restricts access for expired/cancelled subscriptions
  - Automatic redirect to billing page for inactive subscriptions
  - Allowed bypass for critical pages (Auth, Settings, Billing)
- **Super Admin Subscription Management**
  - Manual subscription creation when adding agency admins (plan, interval, limits)
  - Full edit/modify panel: change plan, extend dates, adjust limits, toggle status
  - Search and filter across all tenant subscriptions
- **Super Admin Isolation** — Super admins have no subscription of their own
  - Billing page hidden from super admin navigation
  - Super admin bypasses all subscription checks
  - Dedicated subscription management via Users panel
- **Billing Page** — Agency admins can view their plan, subscribe, upgrade, and manage billing via Stripe Customer Portal
- **Edge Functions**
  - `onboard-checkout` — Creates Stripe Checkout for unauthenticated onboarding
  - `create-checkout` — Creates Stripe Checkout for existing users
  - `check-subscription` — Verifies subscription status from `tenant_subscriptions`
  - `customer-portal` — Opens Stripe Customer Portal for self-service management
  - `stripe-webhook` — Handles `checkout.session.completed` for automatic provisioning

### 🔧 Changed
- `create-user` Edge Function now accepts `plan_key` and `billing_interval` to auto-create subscriptions
- Sidebar navigation hides Billing link for Super Admins
- `SubscriptionContext` no longer assigns fake subscriptions to Super Admins
- Updated all documentation to reflect SaaS features

### 🗄️ Database
- Added `tenant_subscriptions` table (plan, status, limits, Stripe IDs, billing info)
- Added `pending_registrations` table (temporary onboarding data with 24h expiry)

### 🔒 Security
- RLS on `tenant_subscriptions`: Super admins manage all, admins/agents read their own
- RLS on `pending_registrations`: Service role only (no client access)
- Stripe webhook signature verification via `STRIPE_WEBHOOK_SECRET`

---

## [1.0.0] — 2025-06-XX

### ✨ Added
- Dashboard with real-time statistics (vehicles, rentals, revenue)
- Multi-agency management with role-based access control
- Vehicles module: add, edit, document tracking (insurance, technical inspection, registration card)
- Clients module: database with blacklist system
- Reservations module: create, confirm, cancel, convert to rental
- Rentals module: contracts, payment tracking, returns
- Accounting module: income, expenses, charts by category
- Drivers module: management and license tracking
- Employees module: staff management per agency
- Authentication system with 3 roles (Super Admin, Admin, Agent)
- Dark / light theme with automatic toggle
- Responsive interface (mobile, tablet, desktop)
- License system with domain-based activation and server-side verification
- Automatic activation if the domain is already linked to an active license
- Landing page with demo request form
- Vehicle document alerts (upcoming expirations)
- Edge Functions: verify-license, create-user, manage-user, seed-admin
- Row Level Security (RLS) on all tables
- Complete documentation (Installation, Configuration, Activation, Deployment, FAQ)

### 🔒 Security
- RLS enabled on all tables
- Authentication based on Supabase Auth
- Server-side license verification
- Granular roles and permissions

---

## [Upcoming]

### 🔮 Planned
- PDF export of rental contracts
- Email notifications (document expiration, late returns)
- Advanced analytics dashboard
- Mobile application (React Native)
- Multi-language support (EN, FR, AR)

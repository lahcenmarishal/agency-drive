# 📋 Changelog — AutoRent Pro

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
- Online payment integration

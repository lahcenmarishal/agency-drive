# ⚙️ Configuration Guide — AutoRent Pro

## Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public key (anon key) | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ |

---

## Application Customization

### Name and Branding

The application name is defined in several files:

- `index.html` → `<title>` tag
- `src/pages/Landing.tsx` → landing page text
- `src/components/layout/Sidebar.tsx` → sidebar logo
- `public/favicon.svg` → browser icon

### Theme and Colors

Colors are defined in `src/index.css` using HSL CSS variables:

```css
:root {
  --primary: 221 83% 53%;        /* Primary color */
  --secondary: 210 40% 96%;      /* Secondary color */
  --accent: 210 40% 96%;         /* Accent color */
  --background: 0 0% 100%;       /* Background */
  --foreground: 222 47% 11%;     /* Text */
}
```

The dark theme is also configurable in the same file under `.dark { }`.

### Currency

The default currency is USD (US Dollar). To change it, search for `$` in the accounting and rental component files.

---

## User Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access, all agencies, user management |
| `admin` | Manage assigned agencies, create agents |
| `agent` | Limited access to their agency (no accounting, no settings) |

Roles are managed in the `user_roles` table.

### Creating Users

#### 1. Super Admin (First Setup)

The first super admin is created during installation using the `seed-admin` Edge Function (see `INSTALLATION.md`, Step 6).

#### 2. Agency Admins

1. Log in as **Super Admin**
2. Navigate to **Users** in the sidebar menu
3. Click **"Create Admin"**
4. Fill in the form: name, email, password
5. Select one or more agencies to assign
6. The admin will be able to log in immediately

#### 3. Agents (Employees with App Access)

1. Log in as **Super Admin** or **Agency Admin**
2. Navigate to **Employees** in the sidebar menu
3. Click **"Add Employee"**
4. Fill in the employee details
5. Check **"Create user account"** to give them login access
6. Set a temporary password — the agent can then log in

> **Note:** Admins can only create agents within their own assigned agencies. Only the Super Admin can create other admins.

---

## Supabase Configuration

### Authentication

In Supabase Dashboard → **Authentication → Settings**:

- **Site URL**: Your deployed application URL
- **Redirect URLs**: Add your production domain
- **Email confirmation**: Enabled by default (recommended)

### Row Level Security (RLS)

All tables have RLS policies enabled. **Never** disable them in production.

### Storage (Optional)

If you want to store vehicle images:

1. Create a `vehicle-images` bucket in Supabase Storage
2. Configure public read policies
3. Update the code to use storage

---

## License System

The license system is configured via:

- **`licenses` table**: stores keys and allowed domains
- **`verify-license` Edge Function**: validates the license

### Create a License for a Client

```sql
INSERT INTO licenses (license_key, client_name, is_active, expires_at)
VALUES ('XXXX-XXXX-XXXX-XXXX', 'Client Name', true, '2026-12-31');
```

### Development Bypass

The license system is automatically disabled on `localhost` and `127.0.0.1`.

---

> 📖 For deployment, see `DEPLOYMENT.md`.

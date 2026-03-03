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

The application name is configured in several files:

| File | What to change |
|------|---------------|
| `index.html` | `<title>` tag — browser tab title |
| `src/pages/Landing.tsx` | Landing page text and branding |
| `src/components/layout/Sidebar.tsx` | Sidebar logo and app name |
| `public/favicon.svg` | Browser icon |
| `src/i18n/locales/en.json` | English text strings |
| `src/i18n/locales/fr.json` | French text strings |

### Theme and Colors

Colors are defined in `src/index.css` using HSL CSS variables:

```css
:root {
  --primary: 221 83% 53%;        /* Primary brand color */
  --secondary: 210 40% 96%;      /* Secondary color */
  --accent: 210 40% 96%;         /* Accent color */
  --background: 0 0% 100%;       /* Background */
  --foreground: 222 47% 11%;     /* Text color */
  --muted: 210 40% 96%;          /* Muted backgrounds */
  --destructive: 0 84% 60%;      /* Error / danger */
}
```

The dark theme is also configurable under `.dark { }` in the same file.

**To change the primary brand color:**
1. Choose your HSL color values
2. Update `--primary` in both `:root` and `.dark`
3. The entire application will update automatically

### Currency

The default currency is **USD ($)**. To change it:
1. Search for `$` in accounting and rental component files
2. Replace with your currency symbol
3. For full localization, add currency formatting to the i18n configuration

### Language

AutoRent Pro ships with **English** and **French**. To add a new language:

1. Copy `src/i18n/locales/en.json` to `src/i18n/locales/[lang].json`
2. Translate all string values
3. Register the new locale in `src/i18n/index.ts`
4. Add the language option to `src/components/LanguageSwitcher.tsx`

---

## User Roles

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to all agencies, user management, system settings |
| `admin` | Manage assigned agencies, create agents, accounting access |
| `agent` | Limited access to their agency only (no accounting, no settings) |

Roles are stored in the `user_roles` table and enforced via database RLS policies.

### Creating Users

#### 1. Super Admin (First Setup)

Created during installation using the `seed-admin` Edge Function. See [INSTALLATION.md](INSTALLATION.md), Step 6.

#### 2. Agency Admins

1. Log in as **Super Admin**
2. Navigate to **Users** in the sidebar
3. Click **"Create Admin"**
4. Fill in: name, email, password
5. Select one or more agencies to assign
6. The admin can log in immediately

#### 3. Agents (Employee Accounts)

1. Log in as **Super Admin** or **Agency Admin**
2. Navigate to **Employees**
3. Click **"Add Employee"**
4. Fill in employee details
5. Check **"Create user account"** to enable login
6. Set a password — the employee can then log in

> **Note:** Admins can only create agents within their assigned agencies. Only Super Admins can create other admins.

---

## Supabase Configuration

### Authentication Settings

In Supabase Dashboard → **Authentication → Settings**:

| Setting | Recommended Value |
|---------|------------------|
| Site URL | Your deployed application URL |
| Redirect URLs | Your production domain |
| Email confirmation | Enabled (recommended) |
| Password minimum length | 8 characters |

### Row Level Security (RLS)

All tables have RLS policies enabled. **Never disable them in production.**

The RLS architecture uses Security Definer functions to prevent recursive policy evaluation:

```
can_access_agency(user_id, agency_id)
├── is_super_admin(user_id)          → Always true
├── admin_has_agency_access(user_id)  → Check admin_agencies table
└── get_user_agency_id(user_id)       → Check profiles.agency_id
```

### Storage (Optional)

To enable vehicle image uploads:

1. Create a `vehicle-images` bucket in Supabase Storage
2. Configure public read policies:
   ```sql
   CREATE POLICY "Public read for vehicle images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'vehicle-images');
   ```
3. Configure authenticated upload policies:
   ```sql
   CREATE POLICY "Authenticated users can upload vehicle images"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
   ```

---

## License System

### How It Works

The license system validates the deployment domain against stored license keys:

1. On app load, `LicenseContext` calls the `verify-license` Edge Function
2. The function checks the `licenses` table for active, non-expired keys
3. If valid, the app loads normally. If invalid, the activation page is shown.

### Development Bypass

The license system is **automatically disabled** on:
- `localhost`
- `127.0.0.1`
- Any `.lovable.app` domain

### Creating a License

```sql
INSERT INTO licenses (license_key, allowed_domain, client_name, is_active, expires_at)
VALUES (
  'XXXX-XXXX-XXXX-XXXX',
  'client-domain.com',
  'Client Company Name',
  true,
  '2026-12-31'
);
```

### Disabling the License System

To completely remove the license check:
1. Remove `<LicenseGuard>` from `src/App.tsx`
2. Delete the `LicenseContext.tsx` file
3. Remove the `verify-license` Edge Function

---

## Advanced Configuration

### API Rate Limiting

Supabase applies default rate limits. For production:
- Free tier: 500 requests/minute
- Pro tier: 10,000 requests/minute
- Adjust in Supabase Dashboard → Settings → API

### Email Configuration

For production email delivery (password resets, invitations):
1. Configure a custom SMTP provider in Supabase Auth settings
2. Recommended providers: Resend, SendGrid, Postmark
3. Update email templates in Supabase Dashboard → Authentication → Email Templates

### Backup Strategy

- Supabase Pro plan includes daily backups
- For additional safety, schedule regular `pg_dump` exports
- Export critical tables periodically via the dashboard

---

> 📖 For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).
> ❓ For common questions, see [FAQ.md](FAQ.md).

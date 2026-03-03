# 📦 Installation Guide — AutoRent Pro

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18+ | [Download](https://nodejs.org) |
| npm / yarn / bun | Latest | Included with Node.js |
| Supabase | Free or paid | [Create account](https://supabase.com) |
| Git | 2.x+ | [Download](https://git-scm.com) |

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**
3. Choose a name, database password, and region
4. Wait for the project to finish provisioning (~2 minutes)
5. Note down the following from **Settings → API**:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon / public key`
   - `service_role key` (for Edge Functions — keep this secret!)

---

## Step 2: Import the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the `database/schema.sql` file included in this package
3. Copy and paste the **entire contents** into the SQL editor
4. Click **Run** to execute the script
5. Verify that all tables are created in **Table Editor**

You should see the following tables:
- `agencies`, `profiles`, `user_roles`, `admin_agencies`
- `vehicles`, `clients`, `drivers`, `employees`
- `reservations`, `rentals`, `transactions`
- `blacklist_notes`, `licenses`

---

## Step 3: Install the Source Code

```bash
# Navigate to the app directory
cd app/

# Install dependencies
npm install

# Copy the environment file
cp .env.example .env
```

---

## Step 4: Configure Environment Variables

Edit the `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

> ⚠️ **Important:** Never commit your `.env` file to version control. The `.gitignore` file is already configured to exclude it.

---

## Step 5: Deploy Edge Functions

AutoRent Pro uses Supabase Edge Functions for secure server-side operations.

```bash
# Install the Supabase CLI
npm install -g supabase

# Log in to your Supabase account
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all Edge Functions
supabase functions deploy verify-license
supabase functions deploy create-user
supabase functions deploy manage-user
supabase functions deploy seed-admin
```

### Edge Function Secrets

Set the required secrets for Edge Functions:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 6: Create the First Administrator

The first Super Admin account is created using the `seed-admin` Edge Function:

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/seed-admin" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!"
  }'
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number

After creating the Super Admin, you can log in and create additional users through the application interface.

---

## Step 7: Run in Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Default Login

Use the credentials you set in Step 6 to log in as Super Admin.

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "Invalid login credentials" | Verify email/password are correct. Check that the `seed-admin` function executed successfully. |
| Tables not visible | Re-run the `schema.sql` in SQL Editor. Check for error messages. |
| Edge Functions not working | Ensure you've set the `SUPABASE_SERVICE_ROLE_KEY` secret. Check function logs in the Supabase dashboard. |
| CORS errors | Verify your `VITE_SUPABASE_URL` is correct. Ensure your domain is allowed in Supabase Auth settings. |
| Blank screen after login | Check browser console for errors. Ensure all tables and RLS policies were created. |
| "User already registered" | The email is already in use. Use a different email or reset the password. |

### Verifying the Installation

1. ✅ Open `http://localhost:5173` — Landing page loads
2. ✅ Click "Login" — Auth page loads
3. ✅ Log in with Super Admin credentials — Dashboard loads
4. ✅ Navigate to Agencies — Create a test agency
5. ✅ Navigate to Vehicles — Add a test vehicle
6. ✅ Check dark mode toggle — Theme switches correctly

---

## Post-Installation Checklist

- [ ] Supabase project created
- [ ] Database schema imported (all 13 tables visible)
- [ ] Edge Functions deployed (4 functions)
- [ ] `.env` file configured with correct keys
- [ ] Super Admin account created and tested
- [ ] Application launches without console errors
- [ ] At least one agency created
- [ ] Dark/Light theme toggle works
- [ ] Language switcher works (EN/FR)

---

## What's Next?

- 📖 **[CONFIGURATION.md](CONFIGURATION.md)** — Customize branding, colors, and settings
- 🔑 **[ACTIVATION.md](ACTIVATION.md)** — Set up the license system
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deploy to production
- ❓ **[FAQ.md](FAQ.md)** — Common questions and answers

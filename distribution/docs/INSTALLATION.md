# 📦 Installation Guide — AutoRent Pro

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18+ |
| npm / yarn / bun | Latest version |
| Supabase | Free or paid account |
| Git | 2.x+ |

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **New Project**
3. Choose a name, database password, and region
4. Note down the following information (available in **Settings → API**):
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon / public key`
   - `service_role key` (for Edge Functions)

---

## Step 2: Import the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the `database/schema.sql` file included in this package
3. Copy and paste the entire contents into the SQL editor
4. Click **Run** to execute the script
5. Verify that all tables are created in **Table Editor**

---

## Step 3: Install the Source Code

```bash
# Extract the app/ folder from the ZIP
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

---

## Step 5: Deploy Edge Functions

```bash
# Install the Supabase CLI
npm install -g supabase

# Log in
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy functions
supabase functions deploy verify-license
supabase functions deploy create-user
supabase functions deploy manage-user
supabase functions deploy seed-admin
```

---

## Step 6: Create the First Administrator

Call the `seed-admin` Edge Function via curl or from the SQL Editor:

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/seed-admin" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourcompany.com", "password": "YourPassword123!"}'
```

---

## Step 7: Run in Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Post-Installation Checklist

- [ ] Tables are visible in Supabase Table Editor
- [ ] Edge Functions are deployed (check in Supabase → Edge Functions)
- [ ] The `.env` file is correctly configured
- [ ] The application launches without errors on `localhost:5173`
- [ ] You can log in with the admin account you created

---

> 📖 See `CONFIGURATION.md` for advanced customization and `DEPLOYMENT.md` for production deployment.

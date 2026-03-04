# 📦 Installation Guide — AutoRent Pro

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18+ | [Download](https://nodejs.org) |
| npm / yarn / bun | Latest | Included with Node.js |
| Supabase | Free or paid | [Create account](https://supabase.com) |
| Stripe | Account required | [Create account](https://stripe.com) |
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
- `tenant_subscriptions`, `pending_registrations`

---

## Step 3: Configure Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create 3 products with monthly + yearly prices:
   - **Basic** — $29/mo, $290/yr
   - **Pro** — $59/mo, $590/yr
   - **Enterprise** — $99/mo, $990/yr
3. Copy the product IDs and price IDs
4. Update `src/config/subscriptionPlans.ts` with your IDs
5. Set up a webhook:
   - URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`
6. Copy the webhook signing secret

---

## Step 4: Install the Source Code

```bash
cd app/
npm install
cp .env.example .env
```

---

## Step 5: Configure Environment Variables

Edit the `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

---

## Step 6: Deploy Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all Edge Functions
supabase functions deploy verify-license
supabase functions deploy create-user
supabase functions deploy manage-user
supabase functions deploy seed-admin
supabase functions deploy create-checkout
supabase functions deploy check-subscription
supabase functions deploy customer-portal
supabase functions deploy onboard-checkout
supabase functions deploy stripe-webhook
```

### Edge Function Secrets

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
```

---

## Step 7: Create the First Administrator

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/seed-admin" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!"
  }'
```

> **Note:** The Super Admin does NOT need a subscription. They manage all agency subscriptions from the Users panel.

---

## Step 8: Run in Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Post-Installation Checklist

- [ ] Supabase project created
- [ ] Database schema imported (all 15 tables visible)
- [ ] Edge Functions deployed (9 functions)
- [ ] Stripe products and prices created
- [ ] Stripe webhook configured
- [ ] `.env` file configured with correct keys
- [ ] Edge Function secrets set (service role, Stripe keys)
- [ ] Super Admin account created and tested
- [ ] Application launches without console errors
- [ ] At least one agency created
- [ ] Subscription flow tested (landing → checkout → auto-provision)

---

## What's Next?

- 📖 **[CONFIGURATION.md](CONFIGURATION.md)** — Customize branding, colors, plans, and settings
- 🔑 **[ACTIVATION.md](ACTIVATION.md)** — Set up the license system
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deploy to production
- ❓ **[FAQ.md](FAQ.md)** — Common questions and answers

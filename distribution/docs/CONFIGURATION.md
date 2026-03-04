# ⚙️ Configuration Guide — AutoRent Pro

## Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public key (anon key) | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ |

### Edge Function Secrets

| Secret | Description | Required |
|--------|-------------|:--------:|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret API key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ |

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

### Currency

The default currency is **USD ($)**. To change it:
1. Search for `$` in accounting and rental component files
2. Replace with your currency symbol
3. Update `src/config/subscriptionPlans.ts` with correct prices

### Subscription Plans

Plans are defined in `src/config/subscriptionPlans.ts`:

```typescript
export const PLANS = {
  basic: {
    name: "Basic",
    productId: "prod_...",
    monthlyPriceId: "price_...",
    yearlyPriceId: "price_...",
    monthlyPrice: 29,
    yearlyPrice: 290,
    maxVehicles: 10,
    maxUsers: 3,
    maxAgencies: 1,
    features: [...],
  },
  // pro, enterprise...
};
```

To customize:
1. Create products and prices in your Stripe Dashboard
2. Update the IDs in `subscriptionPlans.ts`
3. Adjust limits and pricing as needed

---

## User Roles

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to all agencies, user management, subscription management. **No subscription required.** |
| `admin` | Manage assigned agencies, create agents, accounting access. **Requires active subscription.** |
| `agent` | Limited access to their agency only (no accounting, no settings). Inherits subscription from agency. |

### Creating Users

#### 1. Super Admin (First Setup)

Created during installation using the `seed-admin` Edge Function. See [INSTALLATION.md](INSTALLATION.md), Step 6.

#### 2. Agency Admins (with subscription)

1. Log in as **Super Admin**
2. Navigate to **Users** in the sidebar
3. Click **"Create Admin"**
4. Fill in: name, email, password
5. Select one or more agencies to assign
6. **Select subscription plan** (Basic, Pro, Enterprise) and billing interval
7. The admin + subscription are created immediately

#### 3. Self-Service Registration (from Landing Page)

1. Customer visits the landing page and clicks a plan
2. Fills out registration form (personal info + agency details)
3. Completes Stripe Checkout
4. Account, agency, and subscription are created automatically

#### 4. Agents (Employee Accounts)

1. Log in as **Super Admin** or **Agency Admin**
2. Navigate to **Employees**
3. Click **"Add Employee"**
4. Fill in employee details
5. Check **"Create user account"** to enable login

---

## Stripe Configuration

### Required Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create 3 products (Basic, Pro, Enterprise) with monthly and yearly prices
3. Set up a webhook endpoint pointing to your Edge Function URL
4. Configure the webhook to listen for `checkout.session.completed`
5. Copy your API keys and webhook secret to Edge Function secrets

### Webhook URL

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
```

### Webhook Events

| Event | Handling |
|-------|---------|
| `checkout.session.completed` | Creates agency + user + subscription for onboarding; updates subscription for existing users |

### Customer Portal

Users can manage their billing via the Stripe Customer Portal. Configure it in Stripe Dashboard → Settings → Billing → Customer Portal.

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

### Disabling the License System

To completely remove the license check:
1. Remove `<LicenseGuard>` from `src/App.tsx`
2. Delete the `LicenseContext.tsx` file
3. Remove the `verify-license` Edge Function

---

> 📖 For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).
> ❓ For common questions, see [FAQ.md](FAQ.md).

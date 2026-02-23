# 🔑 Activation Guide — AutoRent Pro

## How the License System Works

AutoRent Pro uses a domain-linked license system to protect your product.

### Activation Flow

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  App loaded  │ ──► │ Is localhost?    │ ──► │ Bypass (dev)   │
└─────────────┘     └──────────────────┘     └────────────────┘
                            │ No
                            ▼
                    ┌──────────────────┐
                    │ Check localStorage│
                    └──────────────────┘
                            │ Not found
                            ▼
                    ┌──────────────────┐     ┌────────────────┐
                    │ Server check     │ ──► │ Known domain?  │
                    │ (by domain)      │     │ → Auto-activate│
                    └──────────────────┘     └────────────────┘
                            │ No
                            ▼
                    ┌──────────────────┐
                    │ Activation page  │
                    │ (enter key)      │
                    └──────────────────┘
```

---

## For the Seller: Generate a License

### Via SQL (Supabase SQL Editor)

```sql
-- License without a pre-linked domain (client will activate it)
INSERT INTO public.licenses (license_key, client_name, is_active, expires_at)
VALUES (
  'RENT-2025-ABCD-EF01',
  'Client Name',
  true,
  '2026-12-31T23:59:59Z'
);

-- License pre-linked to a domain
INSERT INTO public.licenses (license_key, client_name, allowed_domain, is_active, expires_at)
VALUES (
  'RENT-2025-WXYZ-9876',
  'Client Name',
  'app.clientdomain.com',
  true,
  '2026-12-31T23:59:59Z'
);
```

### Recommended Key Format

```
RENT-YYYY-XXXX-XXXX
```

Where `YYYY` = year, `XXXX` = random alphanumeric characters.

---

## For the Buyer: Activate the License

### Automatic Activation

If the seller has pre-linked your domain to the license, the application activates automatically on first load. No action required.

### Manual Activation

1. Deploy the application to your domain
2. Navigate to your application URL
3. The activation page will appear automatically
4. Enter the license key provided by the seller
5. Click **Activate License**
6. The application reloads and is ready to use

---

## License Management

### Deactivate a License

```sql
UPDATE public.licenses SET is_active = false WHERE license_key = 'RENT-2025-ABCD-EF01';
```

### Transfer to Another Domain

```sql
UPDATE public.licenses SET allowed_domain = 'new-domain.com' WHERE license_key = 'RENT-2025-ABCD-EF01';
```

### Extend a License

```sql
UPDATE public.licenses SET expires_at = '2027-12-31T23:59:59Z' WHERE license_key = 'RENT-2025-ABCD-EF01';
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid license key" | Verify the key exists in the `licenses` table and `is_active = true` |
| "License linked to another domain" | The key is already used on another domain. Create a new one or transfer it. |
| "License expired" | Update the `expires_at` field in the database |
| Activation page loop | Clear the browser's localStorage and try again |
| Localhost bypass not working | Make sure you're accessing via `localhost`, not an IP address |

---

> ⚠️ **Important**: The verification API URL (`LICENSE_API_URL`) in `LicenseContext.tsx` must point to **your** Supabase project, not the original developer's. Update it before distribution.

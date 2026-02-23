# ❓ FAQ — AutoRent Pro

## Installation

### Q: What version of Node.js should I use?
**A:** Node.js 18 or higher. We recommend the latest LTS version.

### Q: Can I use yarn or bun instead of npm?
**A:** Yes, all three package managers are supported. Replace `npm install` with `yarn install` or `bun install`.

### Q: Installation fails with dependency errors
**A:** Delete `node_modules/` and `package-lock.json`, then run `npm install` again. If the issue persists, check your Node.js version.

---

## Database

### Q: Can I use a database other than Supabase?
**A:** No. AutoRent Pro is designed specifically for Supabase (PostgreSQL + Auth + Edge Functions). Migrating to another database would require significant rewrites.

### Q: How do I reset the database?
**A:** Delete all tables in the Supabase SQL Editor, then re-import `database/schema.sql`.

### Q: Can I modify the database schema?
**A:** Yes, but make sure to update `src/integrations/supabase/types.ts` accordingly (via `supabase gen types typescript`).

---

## License

### Q: The app asks for a license on localhost
**A:** This should not happen. The system automatically bypasses on `localhost` and `127.0.0.1`. If the issue persists, make sure you're accessing via `http://localhost:5173`.

### Q: How do I transfer a license to another domain?
**A:** Update the `allowed_domain` field of the license in the `licenses` table via the Supabase SQL Editor.

### Q: Does the license expire?
**A:** Yes, if the `expires_at` field is set. Set it to `NULL` for a perpetual license.

---

## Deployment

### Q: The app shows a blank page after deployment
**A:** Check that:
1. `VITE_*` environment variables are configured
2. SPA redirects are in place (`_redirects` for Netlify, `vercel.json` for Vercel)
3. The build completed without errors

### Q: Edge Functions are not working
**A:** Verify they are deployed via `supabase functions list`. Redeploy if necessary with `supabase functions deploy`.

### Q: Can I host on a subdomain?
**A:** Yes, the license is linked to the full hostname (e.g., `app.mysite.com`).

---

## Features

### Q: How many agencies can I create?
**A:** Unlimited. The super_admin can create as many agencies as needed.

### Q: Does the system support multiple currencies?
**A:** By default, the currency is MAD (Moroccan Dirham). To change it, modify the references in the accounting components.

### Q: Can I add new features?
**A:** Yes! The code is fully modifiable. The stack (React + TypeScript + Tailwind + Supabase) is modern and well-documented.

---

## Support

### Q: How do I get help?
**A:** See `SUPPORT.txt` for contact information.

### Q: Are updates available?
**A:** Updates are published on the marketplace. Check regularly for new versions.

# 🚀 Deployment Guide — AutoRent Pro

## Deployment Options

| Platform | Difficulty | Cost | Free SSL | CDN |
|----------|:----------:|:----:|:--------:|:---:|
| Netlify | ⭐ Easy | Free tier | ✅ | ✅ |
| Vercel | ⭐ Easy | Free tier | ✅ | ✅ |
| Cloudflare Pages | ⭐ Easy | Free tier | ✅ | ✅ |
| VPS (Nginx) | ⭐⭐⭐ Advanced | $5+/mo | Let's Encrypt | Manual |

> **Recommended:** Netlify or Vercel for simplicity. Cloudflare Pages for global performance.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Database schema imported in Supabase
- [ ] Edge Functions deployed
- [ ] Super Admin account created and tested
- [ ] License created for production domain (if using license system)
- [ ] Application tested locally with production Supabase keys

---

## Option 1: Deploy on Netlify (Recommended)

### Via Netlify Dashboard (Easiest)

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Connect your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables in **Site settings → Environment variables**:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = your_anon_key
   VITE_SUPABASE_PROJECT_ID = your_project_id
   ```
6. Click **Deploy site**

### Via Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Build the project
cd app/
npm run build

# Initialize and deploy
netlify init
netlify deploy --prod --dir=dist
```

### SPA Routing

The `public/_redirects` file is already included and configured:

```
/*    /index.html   200
```

A `netlify.toml` file is also included for automatic configuration.

---

## Option 2: Deploy on Vercel

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd app/
vercel --prod
```

Add a `vercel.json` file at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Option 3: Deploy on Cloudflare Pages

1. Connect your Git repository at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 18+
3. Add environment variables in the Pages settings
4. Deploy

---

## Option 4: Deploy on VPS (Nginx)

### 1. Build the Application

```bash
cd app/
npm install
npm run build
```

### 2. Transfer to Server

```bash
scp -r dist/* user@your-server:/var/www/autorent/
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/autorent;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 4. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Production Environment Variables

> ⚠️ `VITE_*` variables are injected at **build time**, not runtime. You must rebuild after any change.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

---

## Custom Domain Setup

1. Add a DNS `A` or `CNAME` record pointing to your hosting provider
2. Configure the domain in your platform's settings
3. Wait for DNS propagation (minutes to 48 hours)
4. SSL is automatically provisioned on Netlify/Vercel/Cloudflare

### Domain Configuration for License System

If using the license system, create a license entry for your production domain:

```sql
INSERT INTO licenses (license_key, allowed_domain, client_name, is_active, expires_at)
VALUES ('YOUR-LICENSE-KEY', 'your-domain.com', 'Your Company', true, '2027-12-31');
```

---

## Post-Deployment Verification

After deploying, verify:

- [ ] Application loads correctly at your domain
- [ ] Login works with Super Admin credentials
- [ ] Dashboard displays data correctly
- [ ] CRUD operations work (create a test vehicle, client, etc.)
- [ ] Dark/Light theme toggle works
- [ ] Language switcher works
- [ ] Mobile responsive layout works
- [ ] No console errors in browser DevTools
- [ ] SSL certificate is active (HTTPS)

---

## Performance Optimization

### CDN & Caching
- Netlify/Vercel/Cloudflare automatically serve assets via global CDN
- Static assets are cached with long expiry headers
- HTML is served with short cache for quick updates

### Supabase Performance
- Enable connection pooling in Supabase Dashboard
- Consider upgrading to Supabase Pro for better compute
- Add database indexes for frequently queried columns

---

## Monitoring

### Application Monitoring
- Use browser DevTools → Console for client-side errors
- Supabase Dashboard → Logs for API and database logs
- Edge Function logs in Supabase Dashboard → Edge Functions

### Uptime Monitoring
- Use services like UptimeRobot, Pingdom, or Better Uptime
- Monitor both your frontend domain and Supabase API endpoint

---

> 📖 See [ACTIVATION.md](ACTIVATION.md) to configure the license on your domain.
> ❓ See [FAQ.md](FAQ.md) for common deployment issues.

# 🚀 Deployment Guide — AutoRent Pro

## Deployment Options

| Platform | Difficulty | Cost | Free SSL |
|----------|:----------:|:----:|:--------:|
| Netlify | ⭐ Easy | Free | ✅ |
| Vercel | ⭐ Easy | Free | ✅ |
| Cloudflare Pages | ⭐ Easy | Free | ✅ |
| VPS (Nginx) | ⭐⭐⭐ Advanced | Variable | Let's Encrypt |

---

## Deploy on Netlify (Recommended)

### 1. Production Build

```bash
cd app/
npm run build
```

The `dist/` folder is generated.

### 2. Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=dist
```

### 3. Via Netlify Dashboard

1. Connect your Git repo on [netlify.com](https://netlify.com)
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. Click **Deploy**

### 4. SPA Configuration

The `public/_redirects` file is already included:

```
/*    /index.html   200
```

---

## Deploy on Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Create a `vercel.json` file at the root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Deploy on Cloudflare Pages

1. Connect your repo on [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Build command**: `npm run build`
3. **Build output directory**: `dist`
4. Add environment variables in the settings

---

## Deploy on VPS (Nginx)

### 1. Build and Transfer

```bash
npm run build
scp -r dist/* user@your-server:/var/www/autorent/
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/autorent;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Production Environment Variables

Make sure these variables are set in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

> ⚠️ `VITE_*` variables are injected at **build time**, not at runtime. Rebuild after each change.

---

## Custom Domain

1. Add a DNS `A` or `CNAME` record pointing to your host
2. Configure the domain in your platform's settings
3. Wait for DNS propagation (a few minutes to 48h)
4. SSL is automatically provisioned (Netlify/Vercel/Cloudflare)

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Edge Functions deployed on Supabase
- [ ] SQL schema imported
- [ ] Admin created via `seed-admin`
- [ ] License created for the production domain
- [ ] SSL enabled
- [ ] Login test successful
- [ ] Data creation test successful

---

> 📖 See `ACTIVATION.md` to configure the license on your domain.

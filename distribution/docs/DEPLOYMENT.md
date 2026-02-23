# 🚀 Guide de Déploiement — AutoRent Pro

## Options de déploiement

| Plateforme | Difficulté | Coût | SSL gratuit |
|------------|:----------:|:----:|:-----------:|
| Netlify | ⭐ Facile | Gratuit | ✅ |
| Vercel | ⭐ Facile | Gratuit | ✅ |
| Cloudflare Pages | ⭐ Facile | Gratuit | ✅ |
| VPS (Nginx) | ⭐⭐⭐ Avancé | Variable | Let's Encrypt |

---

## Déploiement sur Netlify (Recommandé)

### 1. Build de production

```bash
cd app/
npm run build
```

Le dossier `dist/` est généré.

### 2. Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=dist
```

### 3. Via l'interface Netlify

1. Connectez votre repo Git sur [netlify.com](https://netlify.com)
2. **Build command** : `npm run build`
3. **Publish directory** : `dist`
4. Cliquez sur **Deploy**

### 4. Configuration SPA

Le fichier `public/_redirects` est déjà inclus :

```
/*    /index.html   200
```

---

## Déploiement sur Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Créez un fichier `vercel.json` à la racine :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Déploiement sur Cloudflare Pages

1. Connectez votre repo sur [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Build command** : `npm run build`
3. **Build output directory** : `dist`
4. Ajoutez les variables d'environnement dans les settings

---

## Déploiement sur VPS (Nginx)

### 1. Build et transfert

```bash
npm run build
scp -r dist/* user@votre-serveur:/var/www/autorent/
```

### 2. Configuration Nginx

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
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

### 3. SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d votre-domaine.com
```

---

## Variables d'environnement en production

Assurez-vous que ces variables sont définies dans votre plateforme de déploiement :

```env
VITE_SUPABASE_URL=https://votre-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_anon_key
VITE_SUPABASE_PROJECT_ID=votre_project_id
```

> ⚠️ Les variables `VITE_*` sont injectées au **build time**, pas au runtime. Rebuilez après chaque changement.

---

## Domaine personnalisé

1. Ajoutez un enregistrement DNS `A` ou `CNAME` pointant vers votre hébergeur
2. Configurez le domaine dans les settings de votre plateforme
3. Attendez la propagation DNS (quelques minutes à 48h)
4. Le SSL est provisionné automatiquement (Netlify/Vercel/Cloudflare)

---

## Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Edge Functions déployées sur Supabase
- [ ] Schéma SQL importé
- [ ] Admin créé via `seed-admin`
- [ ] Licence créée pour le domaine de production
- [ ] SSL activé
- [ ] Test de connexion réussi
- [ ] Test de création de données réussi

---

> 📖 Consultez `ACTIVATION.md` pour configurer la licence sur votre domaine.

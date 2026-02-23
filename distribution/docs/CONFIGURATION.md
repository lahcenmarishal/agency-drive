# ⚙️ Guide de Configuration — AutoRent Pro

## Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|:-----------:|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique (anon key) | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | ID du projet Supabase | ✅ |

---

## Personnalisation de l'application

### Nom et branding

Le nom de l'application est défini dans plusieurs fichiers :

- `index.html` → balise `<title>`
- `src/pages/Landing.tsx` → texte de la page d'accueil
- `src/components/layout/Sidebar.tsx` → logo dans la barre latérale
- `public/favicon.svg` → icône du navigateur

### Thème et couleurs

Les couleurs sont définies dans `src/index.css` via des variables CSS HSL :

```css
:root {
  --primary: 221 83% 53%;        /* Couleur principale */
  --secondary: 210 40% 96%;      /* Couleur secondaire */
  --accent: 210 40% 96%;         /* Couleur d'accentuation */
  --background: 0 0% 100%;       /* Fond */
  --foreground: 222 47% 11%;     /* Texte */
}
```

Le thème sombre est aussi configurable dans le même fichier sous `.dark { }`.

### Devise

Pour changer la devise (par défaut DA - Dinar Algérien), recherchez `DA` dans les fichiers de composants comptabilité et locations.

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `super_admin` | Accès total, toutes les agences, gestion des utilisateurs |
| `admin` | Gestion des agences assignées |
| `agent` | Accès limité à son agence |

Les rôles sont gérés dans la table `user_roles`.

---

## Configuration Supabase

### Authentication

Dans Supabase Dashboard → **Authentication → Settings** :

- **Site URL** : URL de votre application déployée
- **Redirect URLs** : Ajoutez votre domaine de production
- **Email confirmation** : Activé par défaut (recommandé)

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS activées. Ne les désactivez **jamais** en production.

### Storage (optionnel)

Si vous souhaitez stocker des images de véhicules :

1. Créez un bucket `vehicle-images` dans Supabase Storage
2. Configurez les politiques de lecture publique
3. Mettez à jour le code pour utiliser le storage

---

## Système de licence

Le système de licence est configuré via :

- **Table `licenses`** : stocke les clés et domaines autorisés
- **Edge Function `verify-license`** : vérifie la validité

### Créer une licence pour un client

```sql
INSERT INTO licenses (license_key, client_name, is_active, expires_at)
VALUES ('XXXX-XXXX-XXXX-XXXX', 'Nom du client', true, '2026-12-31');
```

### Bypass en développement

Le système de licence est automatiquement désactivé sur `localhost` et `127.0.0.1`.

---

> 📖 Pour le déploiement, consultez `DEPLOYMENT.md`.

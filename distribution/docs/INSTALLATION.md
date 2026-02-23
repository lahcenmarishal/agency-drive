# 📦 Guide d'Installation — AutoRent Pro

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18+ |
| npm / yarn / bun | Dernière version |
| Supabase | Compte gratuit ou payant |
| Git | 2.x+ |

---

## Étape 1 : Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur **New Project**
3. Choisissez un nom, un mot de passe pour la base de données, et une région
4. Notez les informations suivantes (disponibles dans **Settings → API**) :
   - `Project URL` (ex: `https://xxxxx.supabase.co`)
   - `anon / public key`
   - `service_role key` (pour les Edge Functions)

---

## Étape 2 : Importer le schéma de base de données

1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `database/schema.sql` fourni dans ce package
3. Copiez-collez le contenu complet dans l'éditeur SQL
4. Cliquez sur **Run** pour exécuter le script
5. Vérifiez que toutes les tables sont créées dans **Table Editor**

---

## Étape 3 : Installer le code source

```bash
# Extraire le dossier app/ du ZIP
cd app/

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

---

## Étape 4 : Configurer les variables d'environnement

Éditez le fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_anon_key_ici
VITE_SUPABASE_PROJECT_ID=votre_project_id_ici
```

---

## Étape 5 : Déployer les Edge Functions

```bash
# Installer le CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier au projet
supabase link --project-ref VOTRE_PROJECT_ID

# Déployer les fonctions
supabase functions deploy verify-license
supabase functions deploy create-user
supabase functions deploy manage-user
supabase functions deploy seed-admin
```

---

## Étape 6 : Créer le premier administrateur

Appelez la Edge Function `seed-admin` via curl ou depuis le SQL Editor :

```bash
curl -X POST "https://VOTRE_PROJECT_ID.supabase.co/functions/v1/seed-admin" \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@votreentreprise.com", "password": "VotreMotDePasse123!"}'
```

---

## Étape 7 : Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## Vérification post-installation

- [ ] Les tables sont visibles dans Supabase Table Editor
- [ ] Les Edge Functions sont déployées (vérifier dans Supabase → Edge Functions)
- [ ] Le fichier `.env` est correctement configuré
- [ ] L'application se lance sans erreurs sur `localhost:5173`
- [ ] Vous pouvez vous connecter avec le compte admin créé

---

> 📖 Consultez `CONFIGURATION.md` pour la personnalisation avancée et `DEPLOYMENT.md` pour le déploiement en production.

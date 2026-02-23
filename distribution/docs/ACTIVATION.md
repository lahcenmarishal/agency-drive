# 🔑 Guide d'Activation — AutoRent Pro

## Fonctionnement du système de licence

AutoRent Pro utilise un système de licence lié au domaine pour protéger votre produit.

### Flux d'activation

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  App lancée │ ──► │ Vérif. localhost? │ ──► │ Bypass (dev)   │
└─────────────┘     └──────────────────┘     └────────────────┘
                            │ Non
                            ▼
                    ┌──────────────────┐
                    │ Vérif. localStorage│
                    └──────────────────┘
                            │ Non trouvé
                            ▼
                    ┌──────────────────┐     ┌────────────────┐
                    │ Vérif. serveur   │ ──► │ Domaine connu? │
                    │ (par domaine)    │     │ → Auto-activé  │
                    └──────────────────┘     └────────────────┘
                            │ Non
                            ▼
                    ┌──────────────────┐
                    │ Page d'activation│
                    │ (saisie clé)     │
                    └──────────────────┘
```

---

## Pour le vendeur : Générer une licence

### Via SQL (Supabase SQL Editor)

```sql
-- Licence sans domaine pré-lié (le client l'activera)
INSERT INTO public.licenses (license_key, client_name, is_active, expires_at)
VALUES (
  'RENT-2025-ABCD-EF01',
  'Nom du client',
  true,
  '2026-12-31T23:59:59Z'
);

-- Licence pré-liée à un domaine
INSERT INTO public.licenses (license_key, client_name, allowed_domain, is_active, expires_at)
VALUES (
  'RENT-2025-WXYZ-9876',
  'Nom du client',
  'app.clientdomaine.com',
  true,
  '2026-12-31T23:59:59Z'
);
```

### Format recommandé des clés

```
RENT-YYYY-XXXX-XXXX
```

Où `YYYY` = année, `XXXX` = caractères alphanumériques aléatoires.

---

## Pour l'acheteur : Activer la licence

### Activation automatique

Si le vendeur a pré-lié votre domaine à la licence, l'application s'active automatiquement au premier chargement. Aucune action requise.

### Activation manuelle

1. Déployez l'application sur votre domaine
2. Accédez à l'URL de votre application
3. La page d'activation s'affiche automatiquement
4. Entrez la clé de licence fournie par le vendeur
5. Cliquez sur **Activer la licence**
6. L'application se recharge et est prête à l'emploi

---

## Gestion des licences

### Désactiver une licence

```sql
UPDATE public.licenses SET is_active = false WHERE license_key = 'RENT-2025-ABCD-EF01';
```

### Transférer à un autre domaine

```sql
UPDATE public.licenses SET allowed_domain = 'nouveau-domaine.com' WHERE license_key = 'RENT-2025-ABCD-EF01';
```

### Prolonger une licence

```sql
UPDATE public.licenses SET expires_at = '2027-12-31T23:59:59Z' WHERE license_key = 'RENT-2025-ABCD-EF01';
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| "Clé de licence invalide" | Vérifiez que la clé existe dans la table `licenses` et que `is_active = true` |
| "Licence liée à un autre domaine" | La clé est déjà utilisée sur un autre domaine. Créez-en une nouvelle ou transférez. |
| "Licence expirée" | Mettez à jour le champ `expires_at` dans la base de données |
| Page d'activation en boucle | Videz le localStorage du navigateur et réessayez |
| Bypass sur localhost ne fonctionne pas | Vérifiez que vous accédez bien via `localhost` et non une IP |

---

> ⚠️ **Important** : L'URL de l'API de vérification (`LICENSE_API_URL`) dans `LicenseContext.tsx` doit pointer vers **votre** projet Supabase, pas celui du développeur original. Mettez-la à jour avant la distribution.

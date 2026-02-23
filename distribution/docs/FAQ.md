# ❓ FAQ — AutoRent Pro

## Installation

### Q: Quelle version de Node.js dois-je utiliser ?
**R:** Node.js 18 ou supérieur. Nous recommandons la version LTS la plus récente.

### Q: Puis-je utiliser yarn ou bun au lieu de npm ?
**R:** Oui, les trois gestionnaires de paquets sont supportés. Remplacez `npm install` par `yarn install` ou `bun install`.

### Q: L'installation échoue avec des erreurs de dépendances
**R:** Supprimez `node_modules/` et `package-lock.json`, puis relancez `npm install`. Si le problème persiste, vérifiez votre version de Node.js.

---

## Base de données

### Q: Puis-je utiliser une autre base de données que Supabase ?
**R:** Non. AutoRent Pro est conçu spécifiquement pour Supabase (PostgreSQL + Auth + Edge Functions). La migration vers une autre base nécessiterait une réécriture significative.

### Q: Comment réinitialiser la base de données ?
**R:** Supprimez toutes les tables dans Supabase SQL Editor, puis réimportez `database/schema.sql`.

### Q: Puis-je modifier le schéma de la base ?
**R:** Oui, mais assurez-vous de mettre à jour le fichier `src/integrations/supabase/types.ts` en conséquence (via `supabase gen types typescript`).

---

## Licence

### Q: L'application demande une licence sur localhost
**R:** Cela ne devrait pas arriver. Le système bypass automatiquement sur `localhost` et `127.0.0.1`. Si le problème persiste, vérifiez que vous accédez bien via `http://localhost:5173`.

### Q: Comment transférer une licence à un autre domaine ?
**R:** Mettez à jour le champ `allowed_domain` de la licence dans la table `licenses` via Supabase SQL Editor.

### Q: La licence expire-t-elle ?
**R:** Oui, si le champ `expires_at` est renseigné. Mettez-le à `NULL` pour une licence perpétuelle.

---

## Déploiement

### Q: L'application affiche une page blanche après déploiement
**R:** Vérifiez que :
1. Les variables d'environnement `VITE_*` sont configurées
2. Le redirecting SPA est en place (`_redirects` pour Netlify, `vercel.json` pour Vercel)
3. Le build a réussi sans erreurs

### Q: Les Edge Functions ne fonctionnent pas
**R:** Vérifiez qu'elles sont bien déployées via `supabase functions list`. Redéployez si nécessaire avec `supabase functions deploy`.

### Q: Puis-je héberger sur un sous-domaine ?
**R:** Oui, la licence est liée au hostname complet (ex: `app.monsite.com`).

---

## Fonctionnalités

### Q: Combien d'agences puis-je créer ?
**R:** Illimité. Le super_admin peut créer autant d'agences que nécessaire.

### Q: Le système supporte-t-il plusieurs devises ?
**R:** Par défaut, la devise est le DA (Dinar Algérien). Pour changer, modifiez les références dans les composants de comptabilité.

### Q: Puis-je ajouter de nouvelles fonctionnalités ?
**R:** Oui ! Le code est entièrement modifiable. La stack (React + TypeScript + Tailwind + Supabase) est moderne et bien documentée.

---

## Support

### Q: Comment obtenir de l'aide ?
**R:** Consultez `SUPPORT.txt` pour les informations de contact.

### Q: Des mises à jour sont-elles disponibles ?
**R:** Les mises à jour sont publiées sur la marketplace. Vérifiez régulièrement pour les nouvelles versions.

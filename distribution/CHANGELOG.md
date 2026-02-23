# 📋 Changelog — AutoRent Pro

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [1.0.0] — 2025-06-XX

### ✨ Ajouté
- Dashboard avec statistiques en temps réel (véhicules, locations, revenus)
- Gestion multi-agences avec accès contrôlé par rôle
- Module véhicules : ajout, modification, suivi des documents (assurance, visite technique, carte grise)
- Module clients : base de données avec système de liste noire
- Module réservations : création, confirmation, annulation, conversion en location
- Module locations : contrats, suivi des paiements, retours
- Module comptabilité : revenus, dépenses, graphiques par catégorie
- Module chauffeurs : gestion et suivi des permis
- Module employés : gestion du personnel par agence
- Système d'authentification avec 3 rôles (Super Admin, Admin, Agent)
- Thème sombre / clair avec basculement automatique
- Interface responsive (mobile, tablette, desktop)
- Système de licence avec activation par domaine et vérification serveur
- Activation automatique si le domaine est déjà lié à une licence active
- Page d'accueil (Landing) avec formulaire de démonstration
- Alertes documents véhicules (expirations proches)
- Edge Functions : verify-license, create-user, manage-user, seed-admin
- Row Level Security (RLS) sur toutes les tables
- Documentation complète (Installation, Configuration, Activation, Déploiement, FAQ)

### 🔒 Sécurité
- RLS activé sur toutes les tables
- Authentification basée sur Supabase Auth
- Vérification de licence côté serveur
- Rôles et permissions granulaires

---

## [À venir]

### 🔮 Prévu
- Export PDF des contrats de location
- Notifications email (expiration documents, retours en retard)
- Tableau de bord analytique avancé
- Application mobile (React Native)
- Multi-langue (FR, AR, EN)
- Intégration paiement en ligne

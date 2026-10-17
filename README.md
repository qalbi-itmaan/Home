# Qalbi ITMAAN — Site Web Public 🌸

Portail web officiel du centre **Qalbi ITMAAN (قلبي اطمأن)** — *Pour des foyers apaisés*.  
Centre spécialisé en conseil familial, accompagnement éducatif, médiation conjugale et formations certifiantes, situé à Bouzaréah (Alger).

---

## 🌟 Fonctionnalités Clés

- 🏠 **Page d'Accueil dynamique** : Présentation du centre, chiffres clés (+1200 familles, 4.9/5), catalogue des services, experts & thérapeutes qualifiés, avis et FAQ interactive.
- 📚 **Catalogue de Formations** : Filtres par catégories (Langues, Sciences Religieuses, Soutien Scolaire, Soft Skills), niveaux (Débutant, Intermédiaire, Avancé) et formats (Présentiel, En ligne, Hybride).
- 📖 **Fiches Formations Détaillées** : Objectifs pédagogiques, public cible, prérequis, programme interactif par modules, tarifs en DZD et inscription instantanée.
- 🤝 **Réservation de Consultations** : Prise de rendez-vous en ligne ou en présentiel (Individuelle, Couple, Famille), sélection de durée (30, 45, 60 min) avec calcul automatique du prix.
- 🎓 **Espace Étudiant Sécurisé** : Accès aux supports de cours et liens Google Drive via le code de suivi (`WEB-INS-XXXXXX`) et mot de passe.
- 🌍 **Internationalisation Intégrale (i18n)** : Support trilingue fluide (Français, Arabe avec mise en page RTL native, Anglais).
- 💬 **Contact Direct** : Formulaire de contact, coordonnées du centre et bouton d'action rapide WhatsApp.

---

## 🛠️ Stack Technologique

- **Framework** : [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler** : [Vite 8](https://vite.dev/)
- **Routage** : [React Router v7](https://reactrouter.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Base de données & Authentification** : [Google Firebase 12](https://firebase.google.com/) (Firestore & Auth)
- **Qualité de code** : [Oxlint](https://oxc.rs/)

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- npm ou pnpm

### Installation
```bash
npm install
```

### Configuration Firebase
Créez un fichier `.env` à la racine de `Website` (ou copiez `.env.example`) :
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Commandes Disponibles
- **Développement** : `npm run dev` (démarre le serveur local sur `http://localhost:5173`)
- **Build de Production** : `npm run build` (génère les fichiers optimisés dans `dist/`)
- **Vérification du code (Lint)** : `npm run lint` (validation Oxlint ultra-rapide)
- **Prévisualisation du Build** : `npm run preview`

---

## 🔄 Synchronisation avec l'Application de Gestion (`APP`)

Le site web communique directement avec l'application de gestion via Firebase Firestore :
- **Formations** : Les formations créées dans `APP` avec la coche *"Publier sur le site web"* sont chargées depuis la collection Firestore `services`.
- **Rendez-vous** : Les consultations réservées sont transmises à la collection `reservations` et apparaissent immédiatement dans le planning de `APP`.
- **Inscriptions** : Les inscriptions en ligne sont enregistrées dans `inscriptions` et peuvent être validées par le secrétariat dans `APP`.

---
© 2026 Qalbi ITMAAN - Tous droits réservés.

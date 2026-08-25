# English Academy — Plateforme d'apprentissage de l'anglais

Plateforme complète pour un professeur (toi) qui gère sa propre école
d'anglais en ligne : cours structuré sur 9 mois / 36 semaines, Speaking Lab
piloté par IA, correction des compositions, gestion des professeurs et des
administrateurs avec des droits précis, upload d'audio, et apparence
entièrement personnalisable.

Architecture inspirée de ton projet Clo-Clo : frontend statique (HTML/CSS/JS
vanilla, sans framework), backend Node.js natif (sans Express), base de
données **Turso (libSQL)** persistante avec repli SQLite local en dev.

## Structure

```
/backend                API REST (Node.js natif + @libsql/client)
  src/
    db/
      client.js          Connexion Turso / SQLite local
      schema.sql          Schéma complet de la base
      curriculum-data.js  Contenu du programme (9 mois / 36 semaines) extrait de tes documents
      seed.js             Applique le schéma + crée le super admin + injecte le programme
    controllers/          Un fichier par domaine (auth, students, teachers, admins, courses, compositions, speaking, media, appearance)
    services/
      ai.service.js       TOUTE la logique IA (Speaking Lab + aide à la correction)
    middleware/auth.js     JWT + vérification des rôles + permissions admin
    routes.js              Table de routage
  server.js                Point d'entrée (serveur HTTP natif)
  .env.example

/frontend                Frontend statique — AUCUN build requis
  config.js               URL de l'API (à modifier avant déploiement)
  index.html               Page publique (visiteur non connecté)
  connexion.html            Connexion ÉLÈVE
  inscription.html          Inscription ÉLÈVE (seul rôle en auto-inscription)
  connexion-staff.html      Connexion PROF/ADMIN/SUPER ADMIN — jamais liée publiquement
  /student  /teacher /admin  Un dossier par espace, jamais mélangés
  /assets/js/shell.js         Cœur de la séparation par rôle (voir plus bas)
```

## Comment tester en local

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env
```
Édite `.env` et renseigne au minimum :
- `JWT_SECRET` (génère avec `openssl rand -hex 32`)
- `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` — ton compte, créé automatiquement au premier démarrage
- `ANTHROPIC_API_KEY` — indispensable pour que le Speaking Lab fonctionne (récupérable sur console.anthropic.com)

```bash
node server.js
```
Le premier démarrage crée automatiquement : le schéma, ton compte super
admin, les réglages d'apparence par défaut, **le programme complet (9 mois,
36 semaines)**, les scénarios de Speaking Lab, et les 9 compositions.

**2. Frontend**
```bash
cd frontend
npx serve .
```
Ouvre l'URL affichée (ex: `http://localhost:5500`). Le fichier `config.js`
pointe vers `http://localhost:4000/api` par défaut — parfait pour le local.

## Les 4 comptes, strictement séparés

C'est le cœur de ce que tu as demandé : **un élève ne voit jamais la nav
prof/admin, un prof ne voit jamais la nav admin (sauf toi), et personne ne
peut se créer un compte prof/admin lui-même.**

| Rôle | Comment il obtient un compte | Ce qu'il voit |
|---|---|---|
| **Élève** | Inscription libre sur `/inscription.html` | Uniquement `/student/*` |
| **Professeur** | Créé par toi (super admin) ou un admin habilité, depuis Admin → Teachers | Uniquement `/teacher/*` |
| **Admin** | Créé par toi UNIQUEMENT, avec des droits précis que tu choisis | Uniquement `/admin/*`, filtré selon ses droits |
| **Toi (Super Admin)** | Créé automatiquement au 1er démarrage via `.env` | `/teacher/*` ET `/admin/*`, avec un petit lien "Switch to..." — jamais affiché aux autres |

Comment ça fonctionne techniquement (`frontend/assets/js/shell.js`) :
chaque page appelle `renderShell({ roles: [...] })` en tout début de
chargement. Si le rôle du compte connecté n'est pas dans la liste, la page
redirige **immédiatement** vers l'espace du bon rôle — impossible d'atterrir
sur une page qui ne te concerne pas, même en tapant l'URL à la main. Comme
pour `connexion-directeur.html` dans Clo-Clo, `connexion-staff.html` n'est
jamais lié depuis les pages publiques.

## Toi = Super Admin + Professeur titulaire

Ton compte a le rôle `superadmin`, avec **en plus** un profil professeur
(table `teacher_profiles`). Concrètement :
- Dans l'espace **Professeur**, tu vois par défaut TOUS les élèves de tous
  les profs (pas seulement "tes" élèves), avec un badge `géré par X`.
- Dans l'espace **Admin**, tu as accès à absolument tout, y compris la page
  **Admins** (`/admin/admins.html`) que personne d'autre ne peut voir.
- Tu peux nommer d'autres admins et cocher précisément ce qu'ils ont le
  droit de faire : gérer les profs, gérer/réassigner les élèves, éditer le
  contenu des cours, éditer l'apparence, uploader des audios. Un admin que
  tu crées **ne peut jamais** gérer d'autres admins ni modifier ses propres
  droits — ce privilège t'est réservé (`can_manage_admins` n'est même pas
  exposé dans le formulaire de création).
- Si tu désactives un prof ou un admin, ses élèves repassent automatiquement
  "Non assigné" — à toi de les rediriger vers un autre prof.

## Le Speaking Lab (le cœur IA)

Fichier clé : `backend/src/services/ai.service.js`.

1. L'élève choisit un scénario (chez le médecin, restaurant, entretien
   d'embauche...).
2. Sa voix est transcrite en direct par le navigateur (**Web Speech API**,
   gratuite, aucune clé requise) — avec repli automatique sur un champ texte
   si le navigateur ne supporte pas la reconnaissance vocale (ex. Firefox
   desktop).
3. Le texte est envoyé à `POST /api/speaking/turn`, qui appelle **Claude**
   côté serveur (clé API jamais exposée au navigateur) avec un prompt
   calibré sur le **niveau réel de l'élève** (déduit de son mois en cours) :
   un débutant reçoit des phrases très simples, un niveau avancé reçoit un
   anglais plus naturel — exactement le principe que tu avais demandé au
   tout début du projet.
4. La réponse de l'IA est lue à voix haute (**SpeechSynthesis**, gratuite)
   et affichée dans une bulle de chat.
5. À la fin, `POST /api/speaking/finish` fait noter toute la conversation
   par l'IA (prononciation, fluidité, grammaire, vocabulaire + feedback),
   et enregistre la session pour que le prof puisse la relire.

L'IA assiste aussi le prof pour pré-corriger une composition
(`ai-assist`) — mais la correction finale reste **toujours humaine** : le
score suggéré et les remarques ne sont qu'un brouillon que le prof peut
ignorer, modifier ou valider.

Sans `ANTHROPIC_API_KEY`, ces deux fonctionnalités renvoient une erreur
claire ; tout le reste de la plateforme continue de fonctionner normalement.

## Le programme (9 mois / 36 semaines)

Injecté depuis `backend/src/db/curriculum-data.js`, construit à partir de
tes documents (`Programme_Anglais_9_Mois_Adultes.pdf` pour la structure des
36 semaines, le workbook pour le contenu détaillé des premières semaines et
de la semaine 15). Les semaines 1-4, 15 et 31 ont un contenu de grammaire
et de vocabulaire complet ; les autres ont un titre + thème de grammaire +
tâche de speaking prêts, à toi de compléter le détail (grammar_html,
vocabulaire, exercices) depuis **Admin → Courses** — aucune ligne de code à
toucher.

Ce seed ne s'exécute qu'une seule fois (si la table `months` est vide) :
tu peux redémarrer le serveur autant de fois que tu veux sans jamais écraser
ton travail d'édition.

## Base de données persistante avec Turso

En local, sans rien configurer, tout tourne sur un fichier SQLite
(`backend/data/angloba.sqlite`). **Ce fichier est perdu si tu déploies sur
un disque éphémère** (Render/Railway gratuit).

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso db create angloba
turso db show angloba --url
turso db tokens create angloba
```
Renseigne `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans les variables
d'environnement de ton hébergeur (jamais dans le code) — le code bascule
automatiquement dessus (`backend/src/db/client.js`).

## Upload audio

Prof et admin (avec la permission `can_manage_media`) peuvent uploader des
fichiers audio depuis leur espace → **Audio Library**. En MVP, les fichiers
sont stockés sur le disque du serveur (`backend/uploads/`) et servis
statiquement. ⚠️ Sur un disque éphémère, ces fichiers sont perdus au
redéploiement — pour la prod, branche un stockage objet persistant
(Cloudflare R2, Backblaze B2, S3...) : il suffit de modifier
`backend/src/controllers/media.controller.js` pour uploader vers ce service
au lieu du disque local, sans toucher au reste de l'app.

## Déploiement en production

**Backend** (Render, Railway, Fly.io, VPS...) : déploie le dossier
`/backend`. Configure `JWT_SECRET`, `SUPERADMIN_*`, `TURSO_*`,
`ANTHROPIC_API_KEY`, `CORS_ORIGIN` (URL exacte du frontend déployé) comme
variables d'environnement.

**Frontend** (Vercel, Netlify, GitHub Pages...) : déploie le dossier
`/frontend`, 100% statique, aucun build. **Avant de déployer**, modifie
`frontend/config.js` : remplace `API_BASE_URL` par l'URL réelle de ton
backend déployé (ex: `https://angloba-backend.onrender.com/api`). Une
alerte s'affiche dans la console si tu oublies cette étape.

## Responsive / mobile

Tout `frontend/assets/css/base.css` est écrit mobile-first : en dessous de
768px, la sidebar disparaît au profit d'une barre de navigation fixe en bas
d'écran (comme une vraie app mobile), les grilles passent de 3-4 colonnes à
1-2, et le Speaking Lab (le plus exigeant visuellement) reste pleinement
utilisable sur petit écran, y compris le bouton micro tactile.

## Ce qui reste à faire de ton côté

- Configurer Turso et coller les identifiants (5 minutes, voir plus haut).
- Récupérer une clé API Anthropic pour activer le Speaking Lab.
- Compléter le contenu des semaines 5-14, 16-30, 32-36 depuis
  **Admin → Courses** (grammaire, vocabulaire, exercices) — la structure
  (titres, thème de grammaire, tâche de speaking) est déjà en place pour
  les 36 semaines.
- Uploader tes propres audios de listening/prononciation.
- Éventuellement brancher un vrai stockage objet pour les audios en
  production (voir section "Upload audio" ci-dessus).

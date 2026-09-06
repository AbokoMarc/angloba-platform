# English Academy

Plateforme web destinée à la gestion d'une école d'anglais en ligne.

Le projet permet de gérer les élèves, les professeurs, les administrateurs, les cours, les compositions et les séances de Speaking Lab. L'application comprend également un système d'upload audio et une interface personnalisable.

## Stack

### Frontend

* HTML
* CSS
* JavaScript vanilla
* Aucun framework
* Aucun bundler

### Backend

* Node.js
* Serveur HTTP natif
* API REST
* JWT
* `scrypt` pour les mots de passe

### Base de données

* Turso / libSQL en production
* SQLite en local

### IA

* Claude via l'API Anthropic
* Speaking Lab
* Assistance à la correction des compositions

## Structure

```text
english-academy/
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── client.js
│   │   │   ├── schema.sql
│   │   │   ├── curriculum-data.js
│   │   │   └── seed.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth
│   │   │   ├── students
│   │   │   ├── teachers
│   │   │   ├── admins
│   │   │   ├── courses
│   │   │   ├── compositions
│   │   │   ├── speaking
│   │   │   ├── media
│   │   │   └── appearance
│   │   │
│   │   ├── services/
│   │   │   └── ai.service.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   └── routes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── connexion.html
│   ├── inscription.html
│   ├── connexion-staff.html
│   ├── config.js
│   │
│   ├── student/
│   ├── teacher/
│   ├── admin/
│   │
│   └── assets/
│       ├── js/
│       └── css/
│
└── README.md
```

## Installation

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configurer ensuite le fichier `.env`.

Variables principales :

```env
JWT_SECRET=
SUPERADMIN_EMAIL=
SUPERADMIN_PASSWORD=

TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

ANTHROPIC_API_KEY=
CORS_ORIGIN=
```

Pour générer un secret JWT :

```bash
openssl rand -hex 32
```

Lancer le serveur :

```bash
node server.js
```

Au premier démarrage, la base est initialisée automatiquement avec :

* le schéma de la base
* le compte super administrateur
* les paramètres d'apparence
* le programme des 9 mois
* les 36 semaines
* les scénarios du Speaking Lab
* les compositions prévues

Le seed ne réécrit pas les données à chaque démarrage.

### 2. Frontend

Le frontend ne nécessite aucune compilation.

```bash
cd frontend
npx serve .
```

L'adresse affichée par `serve` permet ensuite d'ouvrir l'application dans le navigateur.

En local, `config.js` utilise l'API locale :

```javascript
window.MELORA_API_BASE = 'http://localhost:4000/api';
```

Adapte cette valeur si la configuration du projet utilise un autre nom de variable ou un autre port.

## Gestion des rôles

L'application possède quatre niveaux d'accès.

| Rôle        | Création du compte         | Accès                                   |
| ----------- | -------------------------- | --------------------------------------- |
| Élève       | Inscription libre          | Espace élève                            |
| Professeur  | Créé par un admin autorisé | Espace professeur                       |
| Admin       | Créé par le super admin    | Espace administration selon permissions |
| Super Admin | Créé au premier démarrage  | Accès complet                           |

Les inscriptions publiques sont limitées aux élèves.

Un professeur ne peut pas créer lui-même un compte administrateur et un administrateur ne peut pas modifier ses propres permissions.

Les permissions disponibles permettent notamment de gérer :

* les professeurs
* les élèves
* les affectations
* les cours
* l'apparence
* les fichiers audio

La gestion des autres administrateurs reste réservée au super administrateur.

## Super administrateur

Le compte configuré avec `SUPERADMIN_EMAIL` et `SUPERADMIN_PASSWORD` est créé automatiquement au premier lancement.

Ce compte possède également un profil professeur.

Dans l'espace professeur, il peut consulter les élèves de l'ensemble de la plateforme.

Dans l'espace administration, il dispose de tous les droits.

Si un professeur ou un administrateur est désactivé, les élèves qui lui étaient associés passent automatiquement en statut non assigné.

## Speaking Lab

Le Speaking Lab est la partie IA de la plateforme.

Le fonctionnement est le suivant :

1. L'élève choisit un scénario.
2. Le navigateur utilise la Web Speech API pour reconnaître sa voix.
3. Le texte est envoyé au backend.
4. Le backend transmet la demande à Claude.
5. La réponse est renvoyée au navigateur.
6. La réponse peut être lue avec SpeechSynthesis.
7. À la fin de la session, l'ensemble de la conversation peut être évalué.

Les évaluations portent notamment sur :

* la prononciation
* la fluidité
* la grammaire
* le vocabulaire
* le feedback général

Les sessions sont enregistrées afin que le professeur puisse les consulter.

Si la reconnaissance vocale n'est pas disponible dans le navigateur, un champ texte est utilisé à la place.

La clé Anthropic reste uniquement côté serveur.

```text
Navigateur
    │
    │ texte
    ▼
POST /api/speaking/turn
    │
    ▼
Backend
    │
    │ API Anthropic
    ▼
Claude
    │
    ▼
Réponse
    │
    ▼
Navigateur
```

## Correction des compositions

Le professeur peut utiliser l'IA pour obtenir une première proposition de correction.

L'IA peut fournir :

* un score suggéré
* des remarques
* des corrections
* des pistes d'amélioration

La correction générée n'est pas considérée comme définitive.

Le professeur peut modifier, ignorer ou valider les propositions avant d'enregistrer la correction finale.

## Programme

Le programme couvre :

**9 mois — 36 semaines**

Les données du programme sont stockées dans :

```text
backend/src/db/curriculum-data.js
```

Certaines semaines disposent déjà d'un contenu détaillé.

Pour les autres, la structure est déjà créée avec notamment :

* titre
* thème grammatical
* tâche de speaking

Le reste du contenu peut être complété depuis :

```text
Admin → Courses
```

Il n'est donc pas nécessaire de modifier le code pour mettre à jour le contenu des cours.

## Base de données

En développement, l'application peut utiliser SQLite localement :

```text
backend/data/angloba.sqlite
```

En production, la connexion peut être configurée avec Turso.

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

Le backend sélectionne automatiquement la connexion configurée.

### Turso

Exemple de création d'une base :

```bash
turso db create angloba
turso db show angloba --url
turso db tokens create angloba
```

Les identifiants Turso doivent être ajoutés dans les variables d'environnement du serveur.

Ils ne doivent pas être ajoutés au dépôt Git.

## Upload audio

Les professeurs et administrateurs disposant de la permission nécessaire peuvent ajouter des fichiers audio depuis :

```text
Audio Library
```

Dans la version actuelle, les fichiers sont stockés dans :

```text
backend/uploads/
```

Ce stockage convient pour les tests et le développement.

Sur un hébergement utilisant un disque éphémère, les fichiers peuvent être supprimés lors d'un redéploiement.

Pour la production, un stockage persistant peut être utilisé, par exemple :

* Cloudflare R2
* Backblaze B2
* Amazon S3

La logique d'upload se trouve dans :

```text
backend/src/controllers/media.controller.js
```

## Déploiement

### Backend

Le dossier `backend` peut être déployé sur :

* Render
* Railway
* Fly.io
* VPS

Configurer les variables suivantes :

```text
JWT_SECRET
SUPERADMIN_EMAIL
SUPERADMIN_PASSWORD
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
ANTHROPIC_API_KEY
CORS_ORIGIN
```

`CORS_ORIGIN` doit correspondre à l'adresse du frontend en production.

### Frontend

Le dossier `frontend` est statique et peut être déployé sur :

* Vercel
* Netlify
* GitHub Pages
* autre hébergement statique

Aucune commande de build n'est nécessaire.

Avant le déploiement, modifier `frontend/config.js` afin d'utiliser l'URL du backend.

Exemple :

```javascript
window.MELORA_API_BASE = 'https://angloba-backend.onrender.com/api';
```

## Responsive

L'interface est développée en mobile-first.

Sur les petits écrans :

* la sidebar est remplacée par une navigation en bas
* les grilles sont adaptées à la largeur disponible
* les pages restent utilisables sur téléphone
* le Speaking Lab conserve ses fonctions principales, notamment le bouton microphone

Le breakpoint principal utilisé est `768px`.

## Vérifications

Avant un déploiement, vérifier au minimum :

```text
[ ] Inscription élève
[ ] Connexion élève
[ ] Connexion staff
[ ] Création d'un professeur
[ ] Création d'un administrateur
[ ] Permissions admin
[ ] Gestion des élèves
[ ] Affectation des élèves
[ ] Cours
[ ] Compositions
[ ] Speaking Lab
[ ] Upload audio
[ ] Modification de l'apparence
[ ] Responsive mobile
```

## À terminer

Les éléments restant à compléter ou à configurer dépendent principalement du contenu de l'école :

* Configuration de Turso
* Configuration de l'API Anthropic
* Contenu détaillé des semaines restantes
* Ajout des fichiers audio
* Mise en place éventuelle d'un stockage objet pour les fichiers audio

## Notes

Le projet utilise volontairement une architecture sans framework frontend et sans framework backend.

Le code est organisé par domaine afin de pouvoir faire évoluer chaque partie indépendamment sans ajouter une couche de build supplémentaire.

Le contenu pédagogique peut être modifié depuis l'administration sans modifier directement le code source.

## Licence

Projet privé.

Tous les droits sur le code source, l'architecture et les éléments propres au projet sont réservés, sauf indication contraire concernant les dépendances utilisées.

# Organisateur Personnel

Application Kanban full-stack développée en local avec Angular, Express, Prisma et PostgreSQL.

L'objectif du projet est de proposer un tableau Kanban moderne, lisible et réellement persistant, avec une interface sombre soignée, un drag & drop fluide, des commentaires par tâche et une base PostgreSQL reliée au backend.

## Aperçu

Fonctionnalités principales :

- colonnes Kanban avec workflow complet
- création, modification et suppression de tâches
- drag & drop entre colonnes avec sauvegarde en base
- commentaires par tâche
- couleurs de classification
- vue rapide pour consulter la tâche sélectionnée
- persistance PostgreSQL via Prisma

## Stack

- Frontend : Angular standalone
- UI : Angular Material
- Drag & Drop : Angular CDK
- Backend : Node.js + Express
- ORM : Prisma
- Base de données : PostgreSQL

## Structure

```text
Kanban/
├── client/
│   ├── src/app/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── models/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── prisma/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## Installation

### 1. Base de données

Option recommandée avec Docker :

```bash
docker compose up -d
```

Configuration utilisée par défaut :

- base : `kanban_db`
- utilisateur : `postgres`
- mot de passe : `postgres`
- port : `5432`

### 2. Backend

```bash
cd server
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API disponible sur :

```text
http://127.0.0.1:3000
```

### 3. Frontend

```bash
cd client
npm install
npm start
```

Application disponible sur :

```text
http://127.0.0.1:4200
```

## Variables d'environnement

Créer `server/.env` :

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban_db?schema=public"
```

## API REST

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `DELETE /api/comments/:id`

## Points clés du projet

- architecture simple et lisible pour un projet portfolio
- frontend recentré sur une expérience Kanban claire
- backend REST structuré avec validation et Prisma
- données persistées après redémarrage de l'application
- interface en français, pensée pour un usage personnel ou démonstratif

## Lancement rapide

```bash
docker compose up -d
cd server && npm install && copy .env.example .env && npm run prisma:migrate && npm run dev
cd client && npm install && npm start
```

## Auteur

Projet réalisé pour démontrer une mise en place full-stack propre d'un Kanban moderne avec Angular et PostgreSQL.

# Backend Kanban

API REST locale construite avec Express, Prisma et PostgreSQL.

## Installation

```bash
cd server
npm install
copy .env.example .env
```

Adaptez ensuite `DATABASE_URL` dans `.env` selon votre instance PostgreSQL locale.

## Commandes utiles

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Endpoints principaux

- `GET /health`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `DELETE /api/comments/:id`

## Exemple de corps JSON

### Créer une tâche

```json
{
  "title": "Préparer la page Kanban",
  "description": "Créer les colonnes et le drag & drop",
  "status": "TODO",
  "color": "blue"
}
```

### Mettre à jour une tâche

```json
{
  "title": "Préparer la page Kanban",
  "description": "Interface et intégration API",
  "status": "IN_PROGRESS",
  "color": "yellow"
}
```

### Ajouter un commentaire

```json
{
  "content": "Penser à gérer les erreurs de chargement"
}
```

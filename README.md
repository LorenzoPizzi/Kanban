# Organisateur Personnel

Application Kanban full-stack locale avec Angular, Express, Prisma et SQLite.

L'application se lance comme une petite app locale Windows:

- double-clic sur un raccourci bureau
- ouverture automatique du navigateur
- persistance durable des taches
- bouton `Quitter l'application`
- arret cible des seuls processus du projet

## Lancement

Installation unique:

```bash
cd client
npm install
cd ../server
npm install
```

Lancement quotidien:

```bash
start-kanban.cmd
```

Arret manuel:

```bash
stop-kanban.cmd
```

## Scripts crees

- [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)
- [stop-kanban.cmd](c:/Users/User/Desktop/Kanban/stop-kanban.cmd)
- [start-kanban.ps1](c:/Users/User/Desktop/Kanban/scripts/start-kanban.ps1)
- [stop-kanban.ps1](c:/Users/User/Desktop/Kanban/scripts/stop-kanban.ps1)
- [kanban-orchestrator.js](c:/Users/User/Desktop/Kanban/scripts/kanban-orchestrator.js)
- [kanban-frontend-server.js](c:/Users/User/Desktop/Kanban/scripts/kanban-frontend-server.js)

## Fonctionnement

Le lancement:

- prepare la base SQLite locale
- build le frontend si necessaire
- lance le backend
- lance le serveur frontend local
- attend les endpoints de sante
- ouvre le navigateur sur `http://127.0.0.1:4318`

Si une instance tourne deja, le lancement n'en cree pas une seconde et rouvre simplement le navigateur.

## Persistance

Les donnees sont stockees dans:

- [kanban-local.db](c:/Users/User/Desktop/Kanban/server/prisma/kanban-local.db)

Les taches, statuts, descriptions, commentaires et dates sont conserves entre les relances.

## Ports

Ports fixes retenus:

- frontend: `4318`
- backend: `4319`
- controle orchestrateur: `4320`

Configuration centralisee:

- [kanban.config.js](c:/Users/User/Desktop/Kanban/config/kanban.config.js)

## Quitter l'application

Depuis l'interface:

- bouton `Quitter l'application`
- confirmation utilisateur
- message de fermeture

Depuis Windows:

- `stop-kanban.cmd`

L'arret vise uniquement les processus enfants du projet connus par l'orchestrateur.

## Inactivite

Une strategie d'inactivite longue existe mais reste desactivee par defaut.

- seuil d'inactivite: `6h`
- preavis avant fermeture: `5 min`
- annulation possible depuis l'interface

Configuration:

- [kanban.config.js](c:/Users/User/Desktop/Kanban/config/kanban.config.js)

## Raccourci bureau

1. Creer un raccourci vers [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)
2. Placer ce raccourci sur le bureau
3. Double-cliquer pour lancer l'application

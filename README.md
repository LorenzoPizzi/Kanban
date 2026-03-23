# Organisateur Personnel

Application Kanban locale avec Angular, Express, Prisma et SQLite.

Le projet est pense pour un usage quotidien sur Windows comme une petite application locale:

- ouverture par double-clic
- lancement automatique du frontend et du backend
- ouverture automatique du navigateur
- persistance locale des taches
- arret propre depuis l'interface ou via script

## ✨ Ce que fait l'application

- 📋 gestion de taches Kanban
- 💬 commentaires par tache
- 💾 sauvegarde locale durable en SQLite
- 🚀 lancement automatique en local
- 🛑 fermeture ciblee du projet uniquement

## 🧱 Prerequis

Avant tout, il faut sur la machine:

- Windows
- Node.js installe et accessible dans le `PATH`
- Git si le projet doit etre clone depuis GitHub

## 📥 Installation initiale

Cette etape est a faire une seule fois apres le clone.

### 1. Cloner le projet

```bash
git clone https://github.com/LorenzoPizzi/Kanban.git
cd Kanban
```

### 2. Installer les dependances

```bash
cd client
npm install
cd ../server
npm install
cd ..
```

Une fois cette etape terminee, l'application est prete a etre lancee par script ou raccourci bureau.

## ▶️ Lancement quotidien

Pour lancer l'application localement:

```bash
start-kanban.cmd
```

Au lancement, le systeme:

- 🧠 detecte si une instance tourne deja
- 🗄️ prepare la base SQLite locale si necessaire
- 🏗️ build le frontend si necessaire
- 🔌 lance le backend
- 🌐 lance le frontend local
- ✅ attend que tout soit pret
- 🪟 ouvre automatiquement le navigateur sur la bonne URL

URL locale utilisee:

- frontend: `http://127.0.0.1:4318`

Si l'application tourne deja, un second lancement ne cree pas de doublon. Le navigateur est simplement rouvert sur l'instance existante.

## 🖱️ Lancement pratique depuis un raccourci bureau

Si tu veux un usage "comme une vraie app":

### 1. Creer le raccourci

- clic droit sur [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)
- choisir `Creer un raccourci`

### 2. Mettre le raccourci sur le bureau

- deplacer le raccourci cree sur le bureau

### 3. Utiliser l'application

- double-cliquer sur le raccourci
- attendre quelques secondes
- le navigateur s'ouvre automatiquement sur l'application locale

## 🛑 Arret de l'application

Deux methodes existent.

### Depuis l'interface

- cliquer sur `Quitter l'application`
- confirmer la fermeture
- attendre le message de fermeture

### Depuis Windows

```bash
stop-kanban.cmd
```

Le systeme arrete uniquement les processus du projet qu'il a lui-meme lances. Il ne coupe pas tous les processus Node de la machine.

## 💾 Persistance des donnees

Les donnees sont stockees localement dans:

- [kanban-local.db](c:/Users/User/Desktop/Kanban/server/prisma/kanban-local.db)

Ce fichier contient:

- titres
- descriptions
- statuts
- commentaires
- dates

Les donnees restent presentes apres fermeture puis relance de l'application.

## ⚙️ Ports utilises

Ports fixes retenus:

- frontend: `4318`
- backend: `4319`
- controle interne orchestrateur: `4320`

Configuration centralisee:

- [kanban.config.js](c:/Users/User/Desktop/Kanban/config/kanban.config.js)

## 🧩 Scripts importants

- [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)
- [stop-kanban.cmd](c:/Users/User/Desktop/Kanban/stop-kanban.cmd)
- [start-kanban.ps1](c:/Users/User/Desktop/Kanban/scripts/start-kanban.ps1)
- [stop-kanban.ps1](c:/Users/User/Desktop/Kanban/scripts/stop-kanban.ps1)
- [kanban-orchestrator.js](c:/Users/User/Desktop/Kanban/scripts/kanban-orchestrator.js)
- [kanban-frontend-server.js](c:/Users/User/Desktop/Kanban/scripts/kanban-frontend-server.js)
- [prepare-local-db.js](c:/Users/User/Desktop/Kanban/server/scripts/prepare-local-db.js)

## 😴 Inactivite longue

Une strategie d'inactivite existe, mais elle est desactivee par defaut pour rester prudente et robuste.

Si elle est activee dans [kanban.config.js](c:/Users/User/Desktop/Kanban/config/kanban.config.js), le systeme:

- suit la derniere activite recente
- affiche un avertissement avant fermeture
- laisse la possibilite d'annuler
- ferme proprement l'application si aucune activite ne reprend

Configuration actuelle:

- inactivite avant avertissement: `6h`
- delai d'avertissement avant fermeture: `5 min`

## 👥 Si quelqu'un clone le projet depuis GitHub

Oui, une autre personne peut aussi l'utiliser chez elle de la meme maniere, a condition de:

- cloner le repo
- installer `Node.js`
- lancer une fois `npm install` dans `client` et `server`
- utiliser ensuite [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)

Apres cela, le lancement automatique local fonctionne aussi chez elle.

## 📌 Limites actuelles

- solution ciblee Windows
- `Node.js` doit etre installe au prealable
- les dependances doivent etre installees une premiere fois
- si les ports `4318`, `4319` ou `4320` sont deja pris, il faudra les changer dans la config

## ✅ Resume rapide

1. 📥 Cloner le repo
2. 📦 Faire `npm install` dans `client` puis `server`
3. 🖱️ Lancer [start-kanban.cmd](c:/Users/User/Desktop/Kanban/start-kanban.cmd)
4. 🌐 Utiliser l'application dans le navigateur
5. 🛑 Fermer via le bouton `Quitter l'application` ou [stop-kanban.cmd](c:/Users/User/Desktop/Kanban/stop-kanban.cmd)

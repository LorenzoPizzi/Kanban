import { KanbanColumnDefinition, TaskStatus } from '../models/task.model';

export const LABELS = {
  noTask: 'Aucune tache enregistree',
  noTaskSelected: 'Selectionnez une tache pour afficher ses details.',
  addTask: 'Ajouter une tache',
  localMode: 'Application locale active',
  lastActivity: 'Derniere activite',
  quitApp: "Quitter l'application",
  quitAppConfirm: "Voulez-vous vraiment fermer l'application ?",
  quittingApp: 'Fermeture en cours...',
  quitAppError: "Impossible de fermer l'application",
  idleWarningTitle: 'Fermeture automatique bientot',
  idleWarningBody:
    "L'application va se fermer automatiquement pour liberer les ressources si aucune activite ne reprend.",
  keepOpen: 'Rester ouverte',
  saveTask: 'Enregistrer la tache',
  taskSaved: 'Tache enregistree',
  taskCreated: 'Tache creee avec succes',
  taskDeleted: 'Tache supprimee',
  taskLoadError: 'Impossible de charger les taches',
  taskMoveError: 'Impossible de deplacer la tache',
  taskSaveError: "Impossible d'enregistrer la tache",
  taskDeleteError: 'Impossible de supprimer la tache',
  deleteTask: 'Supprimer',
  deleteTaskConfirm: 'Voulez-vous vraiment supprimer cette tache ?',
  detailTitle: 'Vue rapide',
  detailDescription: 'Titre, statut, description, date et commentaires de la tache selectionnee.',
  organizerName: 'Organisateur personnel'
} as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'A faire',
  IN_PROGRESS: 'En cours',
  WAITING: 'En test',
  BLOCKED: 'A valider',
  DONE: 'Terminee'
};

export const KANBAN_COLUMNS: KanbanColumnDefinition[] = [
  { key: 'TODO', title: STATUS_LABELS.TODO, hint: 'Ce qui reste a lancer' },
  { key: 'IN_PROGRESS', title: STATUS_LABELS.IN_PROGRESS, hint: 'Travail actif en cours' },
  { key: 'WAITING', title: STATUS_LABELS.WAITING, hint: 'Verification fonctionnelle' },
  { key: 'BLOCKED', title: STATUS_LABELS.BLOCKED, hint: 'Retour ou validation attendue' },
  { key: 'DONE', title: STATUS_LABELS.DONE, hint: 'Travail finalise' }
];

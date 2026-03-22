import { KanbanColumnDefinition, TaskStatus } from '../models/task.model';

export const LABELS = {
  noTask: 'Aucune tâche enregistrée',
  noTaskSelected: 'Sélectionnez une tâche pour afficher ses détails.',
  addTask: 'Ajouter une tâche',
  saveTask: 'Enregistrer la tâche',
  taskSaved: 'Tâche enregistrée',
  taskCreated: 'Tâche créée avec succès',
  taskDeleted: 'Tâche supprimée',
  taskLoadError: 'Impossible de charger les tâches',
  taskMoveError: 'Impossible de déplacer la tâche',
  taskSaveError: "Impossible d'enregistrer la tâche",
  taskDeleteError: 'Impossible de supprimer la tâche',
  deleteTask: 'Supprimer',
  deleteTaskConfirm: 'Voulez-vous vraiment supprimer cette tâche ?',
  detailTitle: 'Vue rapide',
  detailDescription: 'Titre, statut, description, date et commentaires de la tâche sélectionnée.',
  organizerName: 'Organisateur personnel'
} as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  WAITING: 'En test',
  BLOCKED: 'À valider',
  DONE: 'Terminée'
};

export const KANBAN_COLUMNS: KanbanColumnDefinition[] = [
  { key: 'TODO', title: STATUS_LABELS.TODO, hint: 'Ce qui reste à lancer' },
  { key: 'IN_PROGRESS', title: STATUS_LABELS.IN_PROGRESS, hint: 'Travail actif en cours' },
  { key: 'WAITING', title: STATUS_LABELS.WAITING, hint: 'Vérification fonctionnelle' },
  { key: 'BLOCKED', title: STATUS_LABELS.BLOCKED, hint: 'Retour ou validation attendue' },
  { key: 'DONE', title: STATUS_LABELS.DONE, hint: 'Travail finalisé' }
];

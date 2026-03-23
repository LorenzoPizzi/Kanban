import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, interval, merge, of, timer } from 'rxjs';
import { catchError, switchMap, throttleTime } from 'rxjs/operators';

import { TaskDialogComponent } from '../../components/task-dialog/task-dialog.component';
import { KANBAN_COLUMNS, LABELS, STATUS_LABELS } from '../../constants/labels';
import { Task, TaskStatus } from '../../models/task.model';
import { AppControlService, AppControlStatus } from '../../services/app-control.service';
import { TaskApiService } from '../../services/task-api.service';

const APP_ACTIVITY = {
  activityThrottleMs: 30_000,
  statusPollMs: 30_000
};

@Component({
  selector: 'app-kanban-board-page',
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './kanban-board-page.component.html',
  styleUrl: './kanban-board-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardPageComponent {
  private readonly api = inject(TaskApiService);
  private readonly appControl = inject(AppControlService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columns = KANBAN_COLUMNS;
  protected readonly labels = LABELS;
  protected readonly selectedTask = signal<Task | null>(null);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly appStatus = signal<AppControlStatus | null>(null);
  protected readonly isQuitting = signal(false);
  protected readonly now = signal(Date.now());
  protected readonly connectedDropLists = this.columns.map((column) => column.key);
  protected readonly boardSummary = computed(() => {
    const total = this.tasks().length;
    return total === 0 ? LABELS.noTask : `${total} tache(s) au total`;
  });
  protected readonly selectedTaskStatus = computed(() => {
    const task = this.selectedTask();
    return task ? STATUS_LABELS[task.status] : null;
  });
  protected readonly selectedTaskCommentCount = computed(() => this.selectedTask()?.comments.length ?? 0);
  protected readonly selectedTaskUpdatedAt = computed(() => this.selectedTask()?.updatedAt ?? null);
  protected readonly inactivityWarningCountdown = computed(() => {
    const shutdownAt = this.appStatus()?.inactivity.shutdownAt;

    if (!shutdownAt) {
      return null;
    }

    const remainingMs = new Date(shutdownAt).getTime() - this.now();
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    this.loadTasks();
    this.refreshAppStatus();
    this.bindActivityTracking();
    this.bindStatusPolling();
  }

  protected tasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((task) => task.status === status);
  }

  protected openCreateDialogForStatus(status: TaskStatus): void {
    this.dialog
      .open(TaskDialogComponent, {
        width: '960px',
        maxWidth: '96vw',
        autoFocus: false,
        data: { mode: 'create', initialStatus: status }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.selectedTask.set(result.deleted ? null : result);
          this.loadTasks();
        }
      });
  }

  protected openTaskDialog(task: Task): void {
    this.dialog
      .open(TaskDialogComponent, {
        width: '960px',
        maxWidth: '96vw',
        autoFocus: false,
        data: { mode: 'edit', task }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.selectedTask.set(result.deleted ? null : result);
          this.loadTasks();
        }
      });
  }

  protected selectTask(task: Task): void {
    this.selectedTask.set(task);
  }

  protected deleteSelectedTask(): void {
    const task = this.selectedTask();

    if (!task) {
      return;
    }

    if (!window.confirm(LABELS.deleteTaskConfirm)) {
      return;
    }

    this.api.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
        this.selectedTask.set(null);
        this.snackBar.open(LABELS.taskDeleted, 'Fermer', { duration: 2600 });
      },
      error: () => {
        this.snackBar.open(LABELS.taskDeleteError, 'Fermer', { duration: 3200 });
      }
    });
  }

  protected handleDrop(event: CdkDragDrop<Task[]>, status: TaskStatus): void {
    const task = event.item.data as Task;

    if (task.status === status) {
      return;
    }

    const previousTasks = this.tasks();
    this.tasks.update((tasks) =>
      tasks.map((item) =>
        item.id === task.id ? { ...item, status, updatedAt: new Date().toISOString() } : item
      )
    );

    this.api.updateTask(task.id, { status }).subscribe({
      next: (updatedTask) => {
        this.tasks.update((tasks) =>
          tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item))
        );

        if (this.selectedTask()?.id === updatedTask.id) {
          this.selectedTask.set(updatedTask);
        }
      },
      error: () => {
        this.tasks.set(previousTasks);
        this.snackBar.open(LABELS.taskMoveError, 'Fermer', { duration: 3000 });
      }
    });
  }

  protected trackTask(_index: number, task: Task): number {
    return task.id;
  }

  protected getColorStyle(color: string): string {
    return color;
  }

  protected getColorLabel(color: string): string {
    const labels: Record<string, string> = {
      '#D64545': 'Urgent',
      '#2F6FED': 'Priorite',
      '#3BA55D': 'Personnel',
      '#D8A100': 'Relecture',
      '#8A5CF6': 'Idee'
    };

    return labels[color] ?? color;
  }

  protected getColorTextColor(color: string): string {
    const textColors: Record<string, string> = {
      '#D64545': '#ffffff',
      '#2F6FED': '#ffffff',
      '#3BA55D': '#ffffff',
      '#D8A100': '#1f2937',
      '#8A5CF6': '#ffffff'
    };

    return textColors[color] ?? '#ffffff';
  }

  protected requestApplicationQuit(): void {
    if (this.isQuitting() || !window.confirm(LABELS.quitAppConfirm)) {
      return;
    }

    this.isQuitting.set(true);

    this.appControl.quit().subscribe({
      next: () => {
        this.snackBar.open(LABELS.quittingApp, undefined, { duration: 3000 });
      },
      error: () => {
        this.isQuitting.set(false);
        this.snackBar.open(LABELS.quitAppError, 'Fermer', { duration: 3200 });
      }
    });
  }

  protected cancelIdleWarning(): void {
    this.appControl.cancelIdleWarning().subscribe({
      next: () => this.refreshAppStatus(),
      error: () => {
        this.snackBar.open(LABELS.quitAppError, 'Fermer', { duration: 3200 });
      }
    });
  }

  protected hasIdleWarning(): boolean {
    return Boolean(this.appStatus()?.inactivity.warningStartedAt);
  }

  private loadTasks(): void {
    this.isLoading.set(true);

    this.api.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        const selectedTask = this.selectedTask();

        if (selectedTask) {
          this.selectedTask.set(tasks.find((task) => task.id === selectedTask.id) ?? null);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open(LABELS.taskLoadError, 'Fermer', { duration: 3000 });
      }
    });
  }

  private refreshAppStatus(): void {
    this.appControl
      .getStatus()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        this.appStatus.set(status);
      });
  }

  private bindActivityTracking(): void {
    merge(
      timer(0),
      interval(APP_ACTIVITY.activityThrottleMs),
      new Observable<Event>((subscriber) => {
        const notify = (event: Event) => subscriber.next(event);
        window.addEventListener('pointerdown', notify);
        window.addEventListener('keydown', notify);
        window.addEventListener('focus', notify);
        document.addEventListener('visibilitychange', notify);

        return () => {
          window.removeEventListener('pointerdown', notify);
          window.removeEventListener('keydown', notify);
          window.removeEventListener('focus', notify);
          document.removeEventListener('visibilitychange', notify);
        };
      })
    )
      .pipe(
        throttleTime(APP_ACTIVITY.activityThrottleMs, undefined, { leading: true, trailing: true }),
        switchMap(() => {
          if (document.visibilityState === 'hidden') {
            return of(null);
          }

          return this.appControl.recordActivity().pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private bindStatusPolling(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));

    interval(APP_ACTIVITY.statusPollMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshAppStatus());
  }
}

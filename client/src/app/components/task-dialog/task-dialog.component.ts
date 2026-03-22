import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { LABELS, STATUS_LABELS } from '../../constants/labels';
import { CreateTaskPayload, TASK_COLORS, Task, TaskComment, TaskStatus } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';

interface TaskDialogData {
  mode: 'create' | 'edit';
  task?: Task;
  initialStatus?: TaskStatus;
}

@Component({
  selector: 'app-task-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TaskApiService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  protected readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);
  protected readonly labels = LABELS;
  protected readonly colorOptions = TASK_COLORS;
  protected readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'TODO', label: STATUS_LABELS.TODO },
    { value: 'IN_PROGRESS', label: STATUS_LABELS.IN_PROGRESS },
    { value: 'BLOCKED', label: STATUS_LABELS.BLOCKED },
    { value: 'WAITING', label: STATUS_LABELS.WAITING },
    { value: 'DONE', label: STATUS_LABELS.DONE }
  ];

  protected readonly isSaving = signal(false);
  protected readonly isCommentSaving = signal(false);
  protected readonly comments = signal<TaskComment[]>(this.data.task?.comments ?? []);
  protected readonly title = computed(() => {
    if (this.data.mode === 'edit') {
      return 'Détails de la tâche';
    }

    const currentStatus = this.taskForm.controls.status.value;
    const label = this.statusOptions.find((status) => status.value === currentStatus)?.label.toLowerCase();
    return label ? `Nouvelle tâche dans ${label}` : 'Nouvelle tâche';
  });

  protected readonly taskForm = this.fb.nonNullable.group({
    title: [this.data.task?.title ?? '', [Validators.required, Validators.maxLength(120)]],
    description: [this.data.task?.description ?? ''],
    status: [this.data.task?.status ?? (this.data.initialStatus ?? 'TODO' as TaskStatus), Validators.required],
    color: [this.data.task?.color ?? TASK_COLORS[1].value, Validators.required]
  });

  protected readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(600)]]
  });

  protected saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload: CreateTaskPayload = this.taskForm.getRawValue();
    this.isSaving.set(true);
    console.log('Task save payload', payload);

    const request$ =
      this.data.mode === 'create'
        ? this.api.createTask(payload)
        : this.api.updateTask(this.data.task!.id, payload);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (task) => {
          this.snackBar.open(
            this.data.mode === 'create' ? LABELS.taskCreated : LABELS.taskSaved,
            'Fermer',
            { duration: 2600 }
          );
          this.dialogRef.close(task);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Task save failed', error);
          this.snackBar.open(this.getTaskSaveErrorMessage(error), 'Fermer', { duration: 4200 });
        }
      });
  }

  protected addComment(): void {
    if (!this.data.task || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isCommentSaving.set(true);

    this.api
      .addComment(this.data.task.id, this.commentForm.getRawValue())
      .pipe(finalize(() => this.isCommentSaving.set(false)))
      .subscribe({
        next: (comment) => {
          this.comments.update((comments) => [...comments, comment]);
          this.commentForm.reset({ content: '' });
          this.snackBar.open('Commentaire ajouté', 'Fermer', { duration: 2200 });
        },
        error: () => {
          this.snackBar.open("Impossible d'ajouter le commentaire", 'Fermer', { duration: 3200 });
        }
      });
  }

  protected deleteComment(commentId: number): void {
    this.api.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update((comments) => comments.filter((comment) => comment.id !== commentId));
        this.snackBar.open('Commentaire supprimé', 'Fermer', { duration: 2200 });
      },
      error: () => {
        this.snackBar.open('Suppression impossible', 'Fermer', { duration: 3200 });
      }
    });
  }

  protected deleteTask(): void {
    if (!this.data.task) {
      return;
    }

    if (!window.confirm(LABELS.deleteTaskConfirm)) {
      return;
    }

    this.isSaving.set(true);

    this.api
      .deleteTask(this.data.task.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open(LABELS.taskDeleted, 'Fermer', { duration: 2200 });
          this.dialogRef.close({ deleted: true });
        },
        error: () => {
          this.snackBar.open(LABELS.taskDeleteError, 'Fermer', { duration: 3200 });
        }
      });
  }

  private getTaskSaveErrorMessage(error: HttpErrorResponse): string {
    const apiMessage = error.error?.message;
    const apiErrors = Array.isArray(error.error?.errors) ? error.error.errors.join(', ') : null;

    if (error.status === 400 && apiErrors) {
      return `Impossible d'enregistrer la tâche : ${apiErrors}`;
    }

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return `Impossible d'enregistrer la tâche : ${apiMessage}`;
    }

    return LABELS.taskSaveError;
  }
}

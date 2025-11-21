import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// Interfaces de Datos
interface ReviewDetailMock {
    id: number;
    title: string; // Título del libro reseñado para mejor contexto
}

interface Comment {
    id: number;
    content: string;
    review: ReviewDetailMock;
    createdAt: string;
}

interface DialogData {
    comment: Comment | null;
}

// Mock de Reseñas disponibles para comentar
const MOCK_REVIEWS: ReviewDetailMock[] = [
    { id: 701, title: 'Reseña de: Fundación (5/5)' },
    { id: 702, title: 'Reseña de: Cien Años de Soledad (4/5)' },
    { id: 703, title: 'Reseña de: Juego de Tronos (2/5)' },
];

@Component({
    selector: 'app-comments-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule, MatSelectModule
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-green-400">{{ isEditMode() ? 'comment' : 'rate_review' }}</mat-icon>
        {{ isEditMode() ? 'Editar Comentario' : 'Crear Nuevo Comentario' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="commentForm" (ngSubmit)="saveComment()">

        <!-- Campo Reseña (Selección de la reseña a la que pertenece) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Reseña Asociada</mat-label>
            <mat-select formControlName="reviewId" required [disabled]="isEditMode()" class="dark:text-white">
                <mat-option *ngFor="let review of mockReviews" [value]="review.id">{{ review.title }}</mat-option>
            </mat-select>
            <mat-icon matSuffix>rate_review</mat-icon>
            <mat-error *ngIf="commentForm.get('reviewId')?.hasError('required')">La reseña es obligatoria</mat-error>
        </mat-form-field>

        <!-- Campo Contenido (Content) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Contenido del Comentario</mat-label>
            <textarea matInput formControlName="content" rows="4" required class="dark:text-white" placeholder="Escriba su respuesta o comentario..."></textarea>
            <mat-icon matSuffix>comment</mat-icon>
            <mat-error *ngIf="commentForm.get('content')?.hasError('required')">El contenido es obligatorio</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="commentForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Comentario' : 'Crear Comentario' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CommentsModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<CommentsModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    public mockReviews = MOCK_REVIEWS;

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.comment);

    // En modo edición, encontramos la reseña actual
    private currentReview = this.isEditMode()
        ? MOCK_REVIEWS.find(r => r.id === this.data.comment?.review.id)
        : null;

    // Inicialización del formulario
    commentForm = this.fb.group({
        id: [this.data.comment?.id || null],
        reviewId: [this.currentReview?.id || null, [Validators.required]],
        content: [this.data.comment?.content || '', [Validators.required, Validators.maxLength(1000)]],
    });

    saveComment(): void {
        this.errorMessage.set(null);
        if (this.commentForm.invalid) {
            this.commentForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios del comentario.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.commentForm.getRawValue();

        // Buscamos la reseña seleccionada para adjuntarla al payload
        const selectedReview = MOCK_REVIEWS.find(r => r.id === formValue.reviewId);

        if (!selectedReview) {
            this.errorMessage.set('Error: La reseña seleccionada no es válida.');
            this.isLoading.set(false);
            return;
        }

        const payload: Partial<Comment> = {
            id: formValue.id || 0,
            content: formValue.content!,
            review: selectedReview,
            createdAt: this.isEditMode() ? this.data.comment!.createdAt : new Date().toISOString(),
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de comentario:' : 'Creación simulada de comentario:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                comment: payload as Comment,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

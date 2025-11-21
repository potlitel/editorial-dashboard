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
interface BookDetailMock {
    id: number;
    title: string;
}

interface Review {
    id: number;
    rating: number; // 1-5
    body: string;
    book: BookDetailMock; // Solo necesitamos el ID y título para la selección
    createdAt: string;
}

interface DialogData {
    review: Review | null;
}

// Mock de libros disponibles para reseñar
const MOCK_BOOKS: BookDetailMock[] = [
    { id: 1, title: 'Cien Años de Soledad' },
    { id: 2, title: 'El Retorno del Rey' },
    { id: 3, title: 'Fundación' },
    { id: 4, title: 'Juego de Tronos' },
];

@Component({
    selector: 'app-reviews-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule, MatSelectModule
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-sky-400">{{ isEditMode() ? 'rate_review' : 'add_comment' }}</mat-icon>
        {{ isEditMode() ? 'Editar Reseña' : 'Crear Nueva Reseña' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="reviewForm" (ngSubmit)="saveReview()">

        <!-- Campo Libro (Selección del libro a reseñar) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Libro a Reseñar</mat-label>
            <mat-select formControlName="bookId" required [disabled]="isEditMode()" class="dark:text-white">
                <mat-option *ngFor="let book of mockBooks" [value]="book.id">{{ book.title }}</mat-option>
            </mat-select>
            <mat-icon matSuffix>menu_book</mat-icon>
            <mat-error *ngIf="reviewForm.get('bookId')?.hasError('required')">El libro es obligatorio</mat-error>
        </mat-form-field>

        <!-- Campo Puntuación (Rating 1-5) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Puntuación (1-5)</mat-label>
            <mat-select formControlName="rating" required class="dark:text-white">
                <mat-option *ngFor="let r of ratings" [value]="r">{{ r }} Estrella{{ r !== 1 ? 's' : '' }}</mat-option>
            </mat-select>
            <mat-icon matSuffix>star</mat-icon>
            <mat-error *ngIf="reviewForm.get('rating')?.hasError('required')">La puntuación es obligatoria</mat-error>
        </mat-form-field>

        <!-- Campo Contenido (Body) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Contenido de la Reseña</mat-label>
            <textarea matInput formControlName="body" rows="5" required class="dark:text-white" placeholder="Escriba aquí su crítica..."></textarea>
            <mat-icon matSuffix>article</mat-icon>
            <mat-error *ngIf="reviewForm.get('body')?.hasError('required')">El contenido es obligatorio</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="reviewForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Reseña' : 'Crear Reseña' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ReviewsModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<ReviewsModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    public mockBooks = MOCK_BOOKS;
    public ratings = [1, 2, 3, 4, 5];

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.review);

    // En modo edición, encontramos el libro actual
    private currentBook = this.isEditMode() ? MOCK_BOOKS.find(b => b.id === this.data.review?.book.id) : null;

    // Inicialización del formulario
    reviewForm = this.fb.group({
        id: [this.data.review?.id || null],
        bookId: [this.currentBook?.id || null, [Validators.required]],
        rating: [this.data.review?.rating || null, [Validators.required, Validators.min(1), Validators.max(5)]],
        body: [this.data.review?.body || '', [Validators.required, Validators.maxLength(2000)]],
    });

    saveReview(): void {
        this.errorMessage.set(null);
        if (this.reviewForm.invalid) {
            this.reviewForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios de la reseña.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.reviewForm.getRawValue();

        // Buscamos el libro seleccionado para adjuntarlo al payload
        const selectedBook = MOCK_BOOKS.find(b => b.id === formValue.bookId);

        if (!selectedBook) {
            this.errorMessage.set('Error: El libro seleccionado no es válido.');
            this.isLoading.set(false);
            return;
        }

        const payload: Partial<Review> = {
            id: formValue.id || 0,
            rating: formValue.rating!,
            body: formValue.body!,
            book: selectedBook,
            createdAt: this.isEditMode() ? this.data.review!.createdAt : new Date().toISOString(),
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de reseña:' : 'Creación simulada de reseña:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                review: payload as Review,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

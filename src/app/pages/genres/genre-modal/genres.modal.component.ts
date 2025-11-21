import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Interfaces de Datos
interface Genre {
  id: number;
  name: string;
  books: any[]; // Mantener compatibilidad con la estructura principal
}

interface DialogData {
  genre: Genre | null;
}

@Component({
  selector: 'app-genre-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2">
        {{ isEditMode() ? 'Editar Género' : 'Crear Nuevo Género' }}
      </h2>

      <!-- Mensaje de Error (Usando Signal) -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="genreForm" (ngSubmit)="saveGenre()">

        <!-- Campo Nombre del Género -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
          <mat-label class="dark:text-gray-300">Nombre del Género</mat-label>
          <input matInput formControlName="name" required class="dark:text-white">
          <mat-error *ngIf="genreForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <!-- NOTA: En un caso real, la gestión de 'books' (libros asociados) requeriría un formulario anidado complejo,
             pero para esta entidad simple, solo enfocamos en 'name'. -->

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="genreForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Cambios' : 'Crear' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class GenreModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<GenreModalComponent>);
  public data: DialogData = inject(MAT_DIALOG_DATA);

  // --- SIGNALS para el estado local del modal ---
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public isEditMode = signal(!!this.data.genre);

  // Inicialización del formulario
  genreForm = this.fb.group({
    id: [this.data.genre?.id || null],
    name: [this.data.genre?.name || '', [Validators.required, Validators.maxLength(50)]],
    // 'books' no se edita directamente en este modal simple, se hereda si es modo edición
  });

  saveGenre(): void {
    this.errorMessage.set(null);
    if (this.genreForm.invalid) {
      this.genreForm.markAllAsTouched();
      this.errorMessage.set('Por favor, complete el nombre del género.');
      return;
    }

    this.isLoading.set(true);

    const formValue = this.genreForm.getRawValue();
    const payload: Genre = {
      id: formValue.id || 0, // 0 si es nuevo, el ID si es edición
      name: formValue.name!,
      books: this.data.genre?.books || [], // Conservar los libros si existen
    };

    // --- Lógica Asíncrona Simulada ---
    setTimeout(() => {
      this.isLoading.set(false);

      // COMENTARIO API:
      if (this.isEditMode()) {
        // Lógica de Edición: this.apiService.put(`/api/genres/${payload.id}`, payload)...
        console.log('Edición simulada de género:', payload);
      } else {
        // Lógica de Creación: this.apiService.post('/api/genres', payload)...
        console.log('Creación simulada de género:', payload);
      }

      // Cerrar el modal y retornar el resultado (genre object + flag isNew)
      this.dialogRef.close({
        genre: payload,
        isNew: !this.isEditMode()
      });

    }, 1000);
  }
}

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

// Interfaces de Datos
interface Series {
    id: number;
    name: string;
    description: string;
    bookTitles: string[]; // Placeholder para la relación de Libros
}

interface DialogData {
    series: Series | null;
}

@Component({
    selector: 'app-series-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-pink-400">{{ isEditMode() ? 'bookmark' : 'post_add' }}</mat-icon>
        {{ isEditMode() ? 'Editar Serie' : 'Crear Nueva Serie' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="seriesForm" (ngSubmit)="saveSeries()">

        <!-- Campo Nombre -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Nombre de la Serie</mat-label>
            <input matInput formControlName="name" required class="dark:text-white" placeholder="Ej. El Señor de los Anillos">
            <mat-icon matSuffix>bookmarks</mat-icon>
            <mat-error *ngIf="seriesForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <!-- Campo Descripción -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Descripción Breve</mat-label>
            <textarea matInput formControlName="description" rows="3" class="dark:text-white" placeholder="Ej. Épica de fantasía sobre un anillo..."></textarea>
            <mat-icon matSuffix>info</mat-icon>
            <mat-error *ngIf="seriesForm.get('description')?.hasError('required')">La descripción es obligatoria</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="seriesForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Serie' : 'Crear Serie' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SeriesModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<SeriesModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.series);

    // Inicialización del formulario
    seriesForm = this.fb.group({
        id: [this.data.series?.id || null],
        name: [this.data.series?.name || '', [Validators.required, Validators.maxLength(100)]],
        description: [this.data.series?.description || '', [Validators.required, Validators.maxLength(500)]],
        // Conservar la lista de libros si estamos editando
        bookTitles: [this.data.series?.bookTitles || []]
    });

    saveSeries(): void {
        this.errorMessage.set(null);
        if (this.seriesForm.invalid) {
            this.seriesForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios de la serie.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.seriesForm.getRawValue();

        const payload: Series = {
            id: formValue.id || 0,
            name: formValue.name!,
            description: formValue.description!,
            bookTitles: formValue.bookTitles!,
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de serie:' : 'Creación simulada de serie:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                series: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

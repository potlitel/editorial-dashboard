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
interface Publisher {
    id: number;
    name: string;
    city: string;
    bookTitles: string[]; // Placeholder para la relación de Libros
}

interface DialogData {
    publisher: Publisher | null;
}

@Component({
    selector: 'app-publisher-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-indigo-400">{{ isEditMode() ? 'apartment' : 'add_business' }}</mat-icon>
        {{ isEditMode() ? 'Editar Editorial' : 'Crear Nueva Editorial' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="publisherForm" (ngSubmit)="savePublisher()">

        <!-- Campo Nombre -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Nombre de la Editorial</mat-label>
            <input matInput formControlName="name" required class="dark:text-white" placeholder="Ej. Editorial Planeta">
            <mat-icon matSuffix>business</mat-icon>
            <mat-error *ngIf="publisherForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <!-- Campo Ciudad -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Ciudad de Operación</mat-label>
            <input matInput formControlName="city" required class="dark:text-white" placeholder="Ej. Barcelona">
            <mat-icon matSuffix>location_city</mat-icon>
            <mat-error *ngIf="publisherForm.get('city')?.hasError('required')">La ciudad es obligatoria</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="publisherForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Editorial' : 'Crear Editorial' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class PublisherModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<PublisherModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.publisher);

    // Inicialización del formulario
    publisherForm = this.fb.group({
        id: [this.data.publisher?.id || null],
        name: [this.data.publisher?.name || '', [Validators.required, Validators.maxLength(100)]],
        city: [this.data.publisher?.city || '', [Validators.required, Validators.maxLength(50)]],
        // Conservar la lista de libros si estamos editando
        bookTitles: [this.data.publisher?.bookTitles || []]
    });

    savePublisher(): void {
        this.errorMessage.set(null);
        if (this.publisherForm.invalid) {
            this.publisherForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios de la editorial.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.publisherForm.getRawValue();

        const payload: Publisher = {
            id: formValue.id || 0,
            name: formValue.name!,
            city: formValue.city!,
            bookTitles: formValue.bookTitles!,
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de editorial:' : 'Creación simulada de editorial:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                publisher: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

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
interface Book {
    title: string;
    isbn: string;
}

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    bio: string;
    books: Book[];
}

interface DialogData {
    author: Author | null;
}

@Component({
    selector: 'app-author-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
        MatIconModule, MatProgressSpinnerModule
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-blue-400">{{ isEditMode() ? 'person_pin' : 'person_add' }}</mat-icon>
        {{ isEditMode() ? 'Editar Autor' : 'Crear Nuevo Autor' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="authorForm" (ngSubmit)="saveAuthor()">

        <!-- Campos de Nombre y Apellido -->
        <div class="flex gap-4 mb-4">
            <mat-form-field appearance="outline" class="flex-1 mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Nombre</mat-label>
                <input matInput formControlName="firstName" required class="dark:text-white">
                <mat-error *ngIf="authorForm.get('firstName')?.hasError('required')">El nombre es obligatorio</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1 mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Apellido</mat-label>
                <input matInput formControlName="lastName" required class="dark:text-white">
                <mat-error *ngIf="authorForm.get('lastName')?.hasError('required')">El apellido es obligatorio</mat-error>
            </mat-form-field>
        </div>

        <!-- Campo Biografía (Textarea) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Biografía (Resumen)</mat-label>
            <textarea matInput formControlName="bio" required rows="4" class="dark:text-white"></textarea>
            <mat-error *ngIf="authorForm.get('bio')?.hasError('required')">La biografía es obligatoria</mat-error>
            <mat-error *ngIf="authorForm.get('bio')?.hasError('maxlength')">Máximo 500 caracteres</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="authorForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Cambios' : 'Crear Autor' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AuthorModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<AuthorModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.author);

    // Inicialización del formulario
    authorForm = this.fb.group({
        id: [this.data.author?.id || null],
        firstName: [this.data.author?.firstName || '', [Validators.required, Validators.maxLength(50)]],
        lastName: [this.data.author?.lastName || '', [Validators.required, Validators.maxLength(50)]],
        bio: [this.data.author?.bio || '', [Validators.required, Validators.maxLength(500)]],
        // 'books' no se edita directamente aquí, se hereda si es modo edición
    });

    saveAuthor(): void {
        this.errorMessage.set(null);
        if (this.authorForm.invalid) {
            this.authorForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios del autor.');
            return;
        }

        this.isLoading.set(true);

        const formValue = this.authorForm.getRawValue();
        const payload: Author = {
            id: formValue.id || 0, // 0 si es nuevo, el ID si es edición
            firstName: formValue.firstName!,
            lastName: formValue.lastName!,
            bio: formValue.bio!,
            books: this.data.author?.books || [], // Conservar los libros si existen
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);

            console.log(this.isEditMode() ? 'Edición simulada de autor:' : 'Creación simulada de autor:', payload);

            // Cerrar el modal y retornar el resultado (author object + flag isNew)
            this.dialogRef.close({
                author: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

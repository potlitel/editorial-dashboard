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
interface User {
    id: number;
    email: string;
    username: string;
    followingIds: number[]; // IDs de usuarios que sigue
    followerIds: number[]; // IDs de usuarios que lo siguen
}

interface DialogData {
    user: User | null;
}

@Component({
    selector: 'app-users-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-indigo-400">{{ isEditMode() ? 'account_circle' : 'person_add' }}</mat-icon>
        {{ isEditMode() ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="userForm" (ngSubmit)="saveUser()">

        <!-- Campo Username -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Nombre de Usuario</mat-label>
            <input matInput formControlName="username" required class="dark:text-white" placeholder="Ej. autor_ejemplo">
            <mat-icon matSuffix>badge</mat-icon>
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">El nombre de usuario es obligatorio</mat-error>
        </mat-form-field>

        <!-- Campo Email -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Correo Electrónico</mat-label>
            <input matInput formControlName="email" type="email" required class="dark:text-white" placeholder="ejemplo@dominio.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">El email es obligatorio</mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Formato de email inválido</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Usuario' : 'Crear Usuario' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UsersModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<UsersModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.user);

    // Inicialización del formulario
    userForm = this.fb.group({
        id: [this.data.user?.id || null],
        email: [this.data.user?.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
        username: [this.data.user?.username || '', [Validators.required, Validators.maxLength(50)]],
        // Conservar las relaciones si estamos editando
        followingIds: [this.data.user?.followingIds || []],
        followerIds: [this.data.user?.followerIds || []]
    });

    saveUser(): void {
        this.errorMessage.set(null);
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete correctamente todos los campos obligatorios.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.userForm.getRawValue();

        const payload: User = {
            id: formValue.id || 0,
            email: formValue.email!,
            username: formValue.username!,
            followingIds: formValue.followingIds!,
            followerIds: formValue.followerIds!,
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de usuario:' : 'Creación simulada de usuario:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                user: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

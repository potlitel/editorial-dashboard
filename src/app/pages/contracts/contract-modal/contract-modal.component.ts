import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
// Importamos la función que provee el adaptador de fecha nativo
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';

// Interfaces de Datos
interface Author {
    id: number;
    firstName: string;
    lastName: string;
}

interface Contract {
    id: number;
    dateSigned: string; // Formato ISO 8601 (YYYY-MM-DD)
    royaltyRate: number; // Porcentaje de 0 a 100
    author: Author;
}

interface DialogData {
    contract: Contract | null;
    availableAuthors: Author[]; // Lista de autores para el selector
}

@Component({
    selector: 'app-contract-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule, MatSelectModule, MatDatepickerModule,
        MatNativeDateModule, MatSliderModule
    ],
    // CORRECCIÓN: Proveemos tanto el DatePipe (para la inyección en TS)
    // como el adaptador nativo (para el MatDatepicker).
    providers: [DatePipe, provideNativeDateAdapter()],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-yellow-400">{{ isEditMode() ? 'assignment' : 'post_add' }}</mat-icon>
        {{ isEditMode() ? 'Editar Contrato' : 'Crear Nuevo Contrato' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="contractForm" (ngSubmit)="saveContract()">

        <!-- Selector de Autor -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Autor Contratado</mat-label>
            <mat-select formControlName="authorId" required>
                <mat-option *ngFor="let author of data.availableAuthors" [value]="author.id">
                    {{ author.firstName }} {{ author.lastName }}
                </mat-option>
            </mat-select>
            <mat-error *ngIf="contractForm.get('authorId')?.hasError('required')">Debe seleccionar un autor</mat-error>
        </mat-form-field>

        <!-- Campo Fecha de Firma -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Fecha de Firma</mat-label>
            <!-- El input real es el de solo lectura, la selección se hace en el mat-datepicker -->
            <input matInput [matDatepicker]="picker" formControlName="dateSigned" required readonly class="dark:text-white">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="contractForm.get('dateSigned')?.hasError('required')">La fecha es obligatoria</mat-error>
        </mat-form-field>

        <!-- Tasa de Regalías (Royalty Rate) con Slider -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Tasa de Regalías (%)</mat-label>
            <input matInput type="number" formControlName="royaltyRate" required min="0" max="100" class="dark:text-white">
            <mat-icon matSuffix>percent</mat-icon>
            <mat-error *ngIf="contractForm.get('royaltyRate')?.hasError('required')">La tasa es obligatoria</mat-error>
            <mat-error *ngIf="contractForm.get('royaltyRate')?.hasError('min') || contractForm.get('royaltyRate')?.hasError('max')">Debe estar entre 0 y 100</mat-error>
        </mat-form-field>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="contractForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Contrato' : 'Crear Contrato' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ContractModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<ContractModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);
    private datePipe = inject(DatePipe);

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.contract);

    // Inicialización del formulario
    contractForm = this.fb.group({
        id: [this.data.contract?.id || null],
        authorId: [this.data.contract?.author?.id || null, [Validators.required]],
        dateSigned: [this.data.contract?.dateSigned ? new Date(this.data.contract.dateSigned) : null, [Validators.required]],
        royaltyRate: [this.data.contract?.royaltyRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });

    saveContract(): void {
        this.errorMessage.set(null);
        if (this.contractForm.invalid) {
            this.contractForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios del contrato.');
            return;
        }

        this.isLoading.set(true);

        const formValue = this.contractForm.getRawValue();

        // Encontrar el objeto Author completo basado en el authorId seleccionado
        const selectedAuthor = this.data.availableAuthors.find(a => a.id === formValue.authorId);

        if (!selectedAuthor) {
            this.errorMessage.set('Error: Autor no encontrado.');
            this.isLoading.set(false);
            return;
        }

        // Formatear la fecha a un string ISO 8601 para consistencia
        const formattedDate = this.datePipe.transform(formValue.dateSigned, 'yyyy-MM-dd')!;

        const payload: Contract = {
            id: formValue.id || 0,
            author: selectedAuthor,
            dateSigned: formattedDate,
            royaltyRate: formValue.royaltyRate!,
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de contrato:' : 'Creación simulada de contrato:', payload);

            // Cerrar el modal y retornar el resultado (contract object + flag isNew)
            this.dialogRef.close({
                contract: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

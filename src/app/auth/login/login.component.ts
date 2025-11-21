import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TermsModalComponent } from '../terms-modal/terms-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatDialogModule],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:block w-1/2 bg-cover bg-center relative" style="background-image: url('images/samet-kurtkus-_-WZZhP_J8U-unsplash.jpg')">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="absolute inset-0 flex items-center justify-center text-white">
          <div class="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center bg-black/30 backdrop-blur-sm">
            <mat-icon class="scale-[2.5] mb-6 opacity-90">auto_stories</mat-icon>

            <h1 class="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
                Nexus
                <span class="text-blue-400">Editorial</span>
            </h1>

            <div class="h-1 w-24 bg-blue-500 rounded mb-6"></div>

            <p class="text-lg font-light max-w-lg opacity-95 drop-shadow-md leading-relaxed">
                Plataforma integral para la gestión de manuscritos, coordinación de autores y control del ciclo de vida de cada publicación.
            </p>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div class="max-w-md w-full p-8">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {{ isRegistering() ? 'Crear Cuenta' : 'Iniciar Sesión' }}
          </h2>
          <p class="text-gray-500 mb-8">Por favor ingresa tus credenciales.</p>

          <form [formGroup]="authForm" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Usuario / Email</mat-label>
              <input matInput formControlName="username" placeholder="admin">
              <mat-error *ngIf="authForm.get('username')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="authForm.get('password')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <div *ngIf="isRegistering()" class="mb-4 flex items-center">
              <mat-checkbox formControlName="termsAccepted" color="primary">
                Acepto los
              </mat-checkbox>
              <span class="ml-1 text-blue-600 cursor-pointer hover:underline" (click)="openTerms()">
                Términos y Condiciones
              </span>
            </div>

            <button mat-flat-button color="primary" class="w-full !py-6 !text-lg" type="submit" [disabled]="authForm.invalid || isLoading">
              {{ isLoading ? 'Procesando...' : (isRegistering() ? 'Registrarse' : 'Ingresar') }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ isRegistering() ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
              <a (click)="toggleMode()" class="text-blue-600 font-semibold cursor-pointer hover:underline">
                {{ isRegistering() ? 'Inicia sesión' : 'Regístrate aquí' }}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  isRegistering = signal(false);
  hidePassword = true;
  isLoading = false;

  authForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    termsAccepted: [false] // Solo validado si isRegistering es true
  });

  toggleMode() {
    this.isRegistering.set(!this.isRegistering());
    // Resetear validación de términos según el modo
    const termsControl = this.authForm.get('termsAccepted');
    if (this.isRegistering()) {
      termsControl?.setValidators(Validators.requiredTrue);
    } else {
      termsControl?.clearValidators();
    }
    termsControl?.updateValueAndValidity();
  }

  openTerms() {
    const dialogRef = this.dialog.open(TermsModalComponent, {
    width: '750px',
    maxHeight: '90vh',
    disableClose: true // Opcional: obliga a usar los botones
  });

    // ESCUCHAMOS EL CIERRE DEL MODAL
    dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      // Marcamos el checkbox automáticamente
      this.authForm.patchValue({ termsAccepted: true });
      // Opcional: Marcamos el control como "dirty" para que visualmente se vea validado si es necesario
      this.authForm.get('termsAccepted')?.markAsDirty();
    }
    else
      this.authForm.patchValue({ termsAccepted: false });
  });
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.authForm.value;

    // --- LÓGICA DE MOCK ---
    // Aquí es donde luego conectarás: this.authService.login(username, password)...
    setTimeout(() => {
      if (username === 'admin' && password === '12345678') {
        this.router.navigate(['/dashboard']);
      } else {
        alert('Credenciales inválidas (Usa: admin / 12345678)');
        this.isLoading = false;
      }
    }, 1000);
  }
}

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col max-h-[85vh]">
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
        <div class="flex items-center gap-3">
            <mat-icon class="text-blue-600 scale-125">gavel</mat-icon>
            <h2 class="text-xl font-bold m-0 text-gray-800 dark:text-white">Términos de Servicio</h2>
        </div>
        <button mat-icon-button mat-dialog-close>
            <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="!p-6 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 leading-relaxed">
        <p class="text-sm text-gray-400 mb-6 uppercase tracking-wide font-bold">Última actualización: 20 Octubre 2025</p>

        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">1. Aceptación General</h3>
        <p class="mb-4">Bienvenido al ecosistema digital corporativo. Al acceder a nuestros servicios, usted confirma irrevocablemente su conformidad con los protocolos de seguridad y gestión de datos establecidos en este documento...</p>

        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">2. Propiedad Intelectual y Licencias</h3>
        <p class="mb-4">Todo el código fuente, interfaces visuales, bases de datos y funcionalidades son propiedad exclusiva de la Entidad. Se prohíbe estrictamente la ingeniería inversa, redistribución no autorizada o...</p>

        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">3. Responsabilidad del Usuario</h3>
        <p class="mb-4">El usuario es el único responsable de la custodia de sus credenciales de acceso (Usuario/API Keys). Cualquier actividad registrada bajo su identidad digital será auditada...</p>

        <div class="p-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded mb-4">
            <p class="text-sm italic m-0">Nota Importante: El incumplimiento de estas normas puede resultar en la suspensión inmediata del servicio sin previo aviso.</p>
        </div>

        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
      </mat-dialog-content>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3 rounded-b-xl">
        <button mat-stroked-button mat-dialog-close color="warn">Rechazar</button>
        <button mat-flat-button color="primary" mat-dialog-close cdkFocusInitial class="px-8">
            <mat-icon class="mr-2 text-sm">check</mat-icon>
            Acepto los Términos
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TermsModalComponent {}

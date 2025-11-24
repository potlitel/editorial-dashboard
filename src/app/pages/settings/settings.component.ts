import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material & Otros
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatSlideToggleModule, MatInputModule, MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      <!-- Título de la Sección -->
      <header class="mb-8 border-b border-indigo-200 dark:border-indigo-800 pb-3">
        <h1 class="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center">
          <mat-icon class="mr-3 text-4xl">tune</mat-icon>
          Ajustes Avanzados del Sistema Editorial
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Gestión del Ciclo de Vida del Sistema: Configure seguridad, transacciones y rendimiento.
        </p>
      </header>

      <!-- Grid de Tarjetas de Configuración -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- CARD 1: CONFIGURACIÓN DE SEGURIDAD (Permisos de Campo) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 border-t-4 border-indigo-500 hover:shadow-2xl transition duration-300">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <mat-icon class="mr-2 text-indigo-500">security</mat-icon> Seguridad y Autorización
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Control de acceso granular y configuración de roles predeterminados para las operaciones.
            </p>

            <mat-slide-toggle class="mb-4 w-full justify-between" color="primary" [(ngModel)]="securitySettings.fieldAuthEnabled">
              <span class="dark:text-gray-300 font-medium">Autorización por Campo (Field-Level)</span>
            </mat-slide-toggle>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Activar la validación de permisos a nivel de atributo de entidad (e.g., ocultar 'Precio de Costo' a 'Editor').
            </p>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label class="dark:text-gray-300">Rol por defecto para Handler</mat-label>
              <input matInput
                     [(ngModel)]="securitySettings.defaultHandlerRole"
                     required
                     class="dark:text-white dark:bg-gray-700 rounded-lg">
              <mat-icon matSuffix class="text-indigo-500">admin_panel_settings</mat-icon>
            </mat-form-field>

            <!-- Botón con estilos y loading mejorados -->
            <button mat-flat-button color="accent"
                    (click)="saveSecuritySettings()"
                    [disabled]="securitySettings.isSaving()"
                    class="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 custom-action-button">
              @if (securitySettings.isSaving()) {
                <!-- Spinner alineado con el texto usando flexbox -->
                <div class="flex items-center justify-center">
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  <span>Guardando...</span>
                </div>
              } @else {
                <div class="flex items-center justify-center">
                  <mat-icon class="mr-2">save</mat-icon>
                  <span>Aplicar Ajustes de Seguridad</span>
                </div>
              }
            </button>
          </div>
        </mat-card>

        <!-- CARD 2: CONFIGURACIÓN TRANSACCIONAL (Unit of Work) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 border-t-4 border-green-500 hover:shadow-2xl transition duration-300">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <mat-icon class="mr-2 text-green-500">mediation</mat-icon> Gestión Transaccional (UOW)
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define los parámetros de atomicidad y el comportamiento del Unit of Work para operaciones de datos.
            </p>

            <mat-slide-toggle class="mb-4 w-full justify-between" color="primary" [(ngModel)]="uowSettings.atomicWritesEnabled">
              <span class="dark:text-gray-300 font-medium">Escritura Atómica Obligatoria</span>
            </mat-slide-toggle>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Garantiza que todas las operaciones de persistencia en una transacción (Commit) sean exitosas o fallen por completo.
            </p>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label class="dark:text-gray-300">Umbral de Tiempo de Espera (ms)</mat-label>
              <input matInput
                     type="number"
                     [(ngModel)]="uowSettings.timeoutMs"
                     required
                     class="dark:text-white dark:bg-gray-700 rounded-lg">
              <mat-icon matSuffix class="text-green-500">timer</mat-icon>
            </mat-form-field>

            <!-- Botón con estilos y loading mejorados -->
            <button mat-flat-button color="accent"
                    (click)="saveUowSettings()"
                    [disabled]="uowSettings.isSaving()"
                    class="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200 custom-action-button">
              @if (uowSettings.isSaving()) {
                <!-- Spinner alineado con el texto usando flexbox -->
                <div class="flex items-center justify-center">
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  <span>Guardando...</span>
                </div>
              } @else {
                <div class="flex items-center justify-center">
                  <mat-icon class="mr-2">save</mat-icon>
                  <span>Aplicar Ajustes Transaccionales</span>
                </div>
              }
            </button>
          </div>
        </mat-card>

        <!-- CARD 3: CICLO DE VIDA Y RENDIMIENTO (Cache & Mantenimiento) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 border-t-4 border-orange-500 hover:shadow-2xl transition duration-300">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <mat-icon class="mr-2 text-orange-500">dns</mat-icon> Mantenimiento y Cache
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ejecute tareas de rendimiento y limpieza para optimizar la base de datos y la memoria caché.
            </p>

            <!-- Botón Limpiar Cache con estilos y loading mejorados -->
            <button mat-flat-button
                    color="warn"
                    (click)="executeMaintenance('cache')"
                    [disabled]="maintenanceLoading.cache()"
                    class="w-full mb-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-200 custom-action-button">
              @if (maintenanceLoading.cache()) {
                <!-- Spinner alineado con el texto usando flexbox -->
                <div class="flex items-center justify-center">
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  <span>Limpiando Cache...</span>
                </div>
              } @else {
                <div class="flex items-center justify-center">
                  <mat-icon class="mr-2">delete_sweep</mat-icon>
                  <span>Limpiar Cache de Entidades</span>
                </div>
              }
            </button>

            <!-- Botón Archivar Logs con estilos y loading mejorados -->
            <button mat-flat-button
                    color="primary"
                    (click)="executeMaintenance('logs')"
                    [disabled]="maintenanceLoading.logs()"
                    class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-200 custom-action-button">
              @if (maintenanceLoading.logs()) {
                <!-- Spinner alineado con el texto usando flexbox -->
                <div class="flex items-center justify-center">
                  <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  <span>Archivando Logs...</span>
                </div>
              } @else {
                <div class="flex items-center justify-center">
                  <mat-icon class="mr-2">archive</mat-icon>
                  <span>Archivar Logs Antiguos</span>
                </div>
              }
            </button>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Próximo mantenimiento programado: Lunes 01:00 AM.
            </p>
          </div>
        </mat-card>
      </div>

    </div>
  `,
  styles: [`
    /* Estilos para el modo oscuro y la apariencia general */
    :host {
        /* Color para los Spinners de guardado (Índigo) */
        --mat-progress-spinner-primary-color: #4f46e5;
        /* Color para el Toggle (Índigo) */
        --mat-slide-toggle-enabled-checked-state-container-color: #4f46e5;
    }

    /* Estilo Personalizado para todos los botones de acción */
    .custom-action-button {
      /* Aumentar la altura y asegurar el padding */
      height: 48px !important;
      padding-top: 0;
      padding-bottom: 0;
      line-height: 48px !important;
    }

    /* Asegurar que el contenido del botón sea flexible para centrar spinner/texto */
    .custom-action-button .mat-mdc-button-touch-target {
        display: none; /* Oculta el target de Material */
    }

    /* Asegurar que el Toggle use todo el espacio para la alineación */
    .mat-mdc-slide-toggle {
      --mdc-form-field-leading-space: 0;
      --mdc-form-field-trailing-space: 0;
    }

    /* Ajuste para el spinner dentro del botón para centrado vertical */
    .mat-mdc-progress-spinner {
        margin: 0 !important;
    }
  `]
})
export class SystemSettingsComponent implements OnInit {

    // --- Configuración de Ajustes ---

    // Ajuste 1: Seguridad (Field-Level Auth)
    securitySettings = {
        fieldAuthEnabled: true,
        defaultHandlerRole: 'Editor',
        // Signal para gestionar el estado de guardado
        isSaving: signal<boolean>(false),
    };

    // Ajuste 2: Transaccional (Unit of Work)
    uowSettings = {
        atomicWritesEnabled: true,
        timeoutMs: 5000,
        // Signal para gestionar el estado de guardado
        isSaving: signal<boolean>(false),
    };

    // Ajuste 3: Mantenimiento y Cache
    maintenanceLoading = {
        cache: signal<boolean>(false),
        logs: signal<boolean>(false)
    };

    ngOnInit(): void {
        // Al iniciar, cargar la configuración actual desde el API.
        this.loadInitialSettings();
    }

    /**
     * Simula la carga de ajustes iniciales desde la API (API SERVICE).
     */
    loadInitialSettings() {
        console.log('Simulando carga de ajustes iniciales...');
        /*
        // Para usar con un servicio real (asume un 'ApiService' inyectado):
        // this.apiService.getSystemSettings().subscribe({
        //     next: (data) => {
        //         this.securitySettings.fieldAuthEnabled = data.security.fieldAuthEnabled;
        //         this.securitySettings.defaultHandlerRole = data.security.defaultHandlerRole;
        //         this.uowSettings.atomicWritesEnabled = data.uow.atomicWritesEnabled;
        //         this.uowSettings.timeoutMs = data.uow.timeoutMs;
        //     },
        //     error: (err) => console.error("Error al cargar ajustes:", err)
        // });
        */
    }

    /**
     * Guarda la configuración de Seguridad (Field-Level Auth) con el API.
     */
    saveSecuritySettings() {
        this.securitySettings.isSaving.set(true);
        const payload = {
            fieldAuthEnabled: this.securitySettings.fieldAuthEnabled,
            defaultHandlerRole: this.securitySettings.defaultHandlerRole
        };
        console.log('Guardando ajustes de seguridad:', payload);

        // Simulación de API call con 2 segundos de latencia
        setTimeout(() => {
            this.securitySettings.isSaving.set(false);
            console.log('Ajustes de seguridad guardados con éxito.');
        }, 2000);

        /*
        // Para usar con un servicio real (asume un 'ApiService' inyectado):
        // this.apiService.updateSecuritySettings(payload).subscribe({
        //     next: () => {
        //         this.securitySettings.isSaving.set(false);
        //         // Mostrar notificación de éxito
        //     },
        //     error: (err) => {
        //         this.securitySettings.isSaving.set(false);
        //         console.error("Error al guardar seguridad:", err);
        //         // Mostrar notificación de error
        //     }
        // });
        */
    }

    /**
     * Guarda la configuración Transaccional (Unit of Work) con el API.
     */
    saveUowSettings() {
        this.uowSettings.isSaving.set(true);
        const payload = {
            atomicWritesEnabled: this.uowSettings.atomicWritesEnabled,
            timeoutMs: this.uowSettings.timeoutMs
        };
        console.log('Guardando ajustes transaccionales:', payload);

        // Simulación de API call con 2 segundos de latencia
        setTimeout(() => {
            this.uowSettings.isSaving.set(false);
            console.log('Ajustes UOW guardados con éxito.');
        }, 2000);

        /*
        // Para usar con un servicio real (asume un 'ApiService' inyectado):
        // this.apiService.updateUowSettings(payload).subscribe({
        //     next: () => {
        //         this.uowSettings.isSaving.set(false);
        //     },
        //     error: (err) => {
        //         this.uowSettings.isSaving.set(false);
        //         console.error("Error al guardar UOW:", err);
        //     }
        // });
        */
    }

    /**
     * Ejecuta una operación de limpieza o mantenimiento (API SERVICE).
     * @param type Tipo de operación: 'cache' (limpiar) o 'logs' (archivar).
     */
    executeMaintenance(type: 'cache' | 'logs') {
        if (type === 'cache') {
            this.maintenanceLoading.cache.set(true);
            console.log('Iniciando limpieza de cache de entidades...');

            setTimeout(() => {
                this.maintenanceLoading.cache.set(false);
                console.log('Cache de entidades limpiada con éxito.');
            }, 3000);

            /*
            // Para usar con un servicio real (asume un 'ApiService' inyectado):
            // this.apiService.clearEntityCache().subscribe({
            //     next: () => { this.maintenanceLoading.cache.set(false); },
            //     error: () => { this.maintenanceLoading.cache.set(false); console.error("Fallo al limpiar cache."); }
            // });
            */
        } else if (type === 'logs') {
            this.maintenanceLoading.logs.set(true);
            console.log('Iniciando archivo y purga de logs antiguos...');

            setTimeout(() => {
                this.maintenanceLoading.logs.set(false);
                console.log('Logs archivados y purgados con éxito.');
            }, 4000);

            /*
            // Para usar con un servicio real (asume un 'ApiService' inyectado):
            // this.apiService.archiveOldLogs().subscribe({
            //     next: () => { this.maintenanceLoading.logs.set(false); },
            //     error: () => { this.maintenanceLoading.logs.set(false); console.error("Fallo al archivar logs."); }
            // });
            */
        }
    }
}

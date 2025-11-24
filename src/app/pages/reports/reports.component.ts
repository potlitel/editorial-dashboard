import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material & Otros
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Necesario para sanitizar URLs de iframes en aplicaciones reales de Angular
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { inject } from '@angular/core';

// --- Interfaces para las Opciones de Reporte (Basado en Entidades) ---
interface ReportOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  endpoint: string;
}

@Component({
  selector: 'app-system-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      <!-- Título de la Sección -->
      <header class="mb-6 border-b border-red-200 dark:border-red-800 pb-3">
        <h1 class="text-3xl font-extrabold text-red-700 dark:text-red-400 flex items-center">
          <mat-icon class="mr-3 text-4xl">analytics</mat-icon>
          Generador de Reportes Ejecutivos
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Seleccione la entidad de negocio para generar su informe en formato PDF.
        </p>
      </header>

      <!-- SECCIÓN DE CONTROLES: SELECT + BOTÓN (Alineados Horizontalmente) -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">

        <!-- 1. Selector de Reporte -->
        <mat-form-field class="flex-grow w-full md:w-auto report-select" appearance="outline">
          <mat-label class="dark:text-gray-300">Seleccione el Reporte a Generar</mat-label>
          <mat-select [(ngModel)]="selectedReportId" class="dark:text-white dark:bg-gray-800">
            @for (option of reportOptions(); track option.id) {
              <mat-option [value]="option.id">
                <div class="flex items-center">
                  <mat-icon [class.text-red-600]="option.id === 'transactions'" class="mr-3">{{ option.icon }}</mat-icon>
                  <span class="font-medium">{{ option.name }}</span>
                </div>
                <small class="text-gray-500 ml-8 text-xs">{{ option.description }}</small>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- 2. Botón de Acción (Misma altura que el Select) -->
        <div class="flex-shrink-0 flex items-stretch">
          <button mat-flat-button color="primary"
                  (click)="viewReport()"
                  [disabled]="isLoading() || !selectedReportId()"
                  class="w-full md:w-48 h-full rounded-lg text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xl transition duration-300 transform active:scale-95">
            @if (isLoading()) {
              <mat-spinner diameter="24" class="mx-auto"></mat-spinner>
            } @else {
              <mat-icon class="mr-2">print</mat-icon>
              <span>{{ selectedReportId() ? 'Ver Reporte' : 'Seleccione Opción' }}</span>
            }
          </button>
        </div>
      </div>

      <!-- SECCIÓN DE VISUALIZACIÓN DEL PDF -->
      <mat-card class="rounded-xl shadow-2xl p-0 h-[600px] overflow-hidden dark:bg-gray-800 border dark:border-gray-700 relative">
        <div class="h-full w-full relative">

          <!-- 1. Estado de Carga (Loading con Estilo) -->
          @if (isLoading()) {
            <div class="absolute inset-0 bg-gray-200/90 dark:bg-gray-900/90 flex flex-col items-center justify-center z-10 transition-opacity duration-500">
              <mat-spinner color="accent" diameter="50"></mat-spinner>
              <p class="mt-4 text-xl font-semibold text-red-600 dark:text-red-400">
                Generando reporte de {{ activeReportDetails()?.name || 'la entidad seleccionada' }}...
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-2">Esto puede tardar unos segundos.</p>
            </div>
          }

          <!-- 2. Iframe / Visor PDF -->
          @if (currentPdfUrl()) {
            <iframe
                [src]="getPdfSrc()"
                class="w-full h-full border-0"
                title="Visor de Reporte PDF"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
            </iframe>
          } @else if (!isLoading()) {
            <!-- Mensaje Inicial -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gray-100 dark:bg-gray-850">
                <mat-icon class="text-7xl text-gray-400 dark:text-gray-600 mb-4">description</mat-icon>
                <p class="text-xl font-bold text-gray-700 dark:text-gray-300">
                    Visor de Reportes
                </p>
                <p class="text-gray-500 dark:text-gray-400 max-w-md">
                    Seleccione un tipo de informe en el menú superior y presione "Ver Reporte" para cargar el PDF en esta área.
                </p>
            </div>
          }

        </div>
      </mat-card>

    </div>
  `,
  styles: [`
    /* Sobrescribir estilos de Material para dark mode y personalización */
    :host {
        /* Define el color principal de la barra de progreso de Material para el loading */
        --mat-progress-spinner-primary-color: #ef4444; /* Rojo */
    }

    /* Estilo para que el MatFormField tome el 100% del espacio en la columna */
    .report-select {
        /* Esto asegura que el MatFormField.appearance="outline" tenga una altura fija consistente */
        height: 56px; /* Altura estándar de Material Form Field */
    }

    .mat-mdc-form-field {
        --mdc-filled-text-field-container-shape: 10px;
    }

    /* Ajuste para que el botón de acción coincida con la altura del MatFormField en pantallas pequeñas */
    @media (max-width: 768px) {
        .report-select {
            height: auto;
        }
    }
  `]
})
export class SystemReportsComponent implements OnInit {

    // Dependencia: DomSanitizer para asegurar la URL del iframe
    private sanitizer = inject(DomSanitizer);

    // Placeholder para la URL del PDF (usando un PDF público para demostración)
    PDF_PLACEHOLDER_URL = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

    // Estado del componente
    reportOptions = signal<ReportOption[]>([
        { id: 'users', name: 'Resumen de Usuarios', icon: 'person', description: 'Usuarios registrados, roles y actividad.', endpoint: '/reports/users-summary' },
        { id: 'books', name: 'Inventario y Catálogo', icon: 'book', description: 'Listado completo, stock y metadatos.', endpoint: '/reports/book-catalog' },
        { id: 'transactions', name: 'Detalle de Ventas', icon: 'trending_up', description: 'Transacciones, ingresos y regiones.', endpoint: '/reports/sales-transactions' },
        { id: 'publishers', name: 'Rendimiento de Editores', icon: 'apartment', description: 'Contribución y títulos publicados.', endpoint: '/reports/publisher-performance' },
    ]);

    selectedReportId = signal<string>(this.reportOptions()[0].id);
    isLoading = signal<boolean>(false);
    currentPdfUrl = signal<string>(''); // Contiene la URL NO sanitizada

    // ** Lógica Computada para la plantilla (Solución al error NG5002) **
    activeReportDetails = computed(() => {
        const id = this.selectedReportId();
        return this.reportOptions().find(opt => opt.id === id);
    });

    ngOnInit(): void {
        // Opción: cargar el primer reporte al iniciar.
        // this.viewReport();
    }

    /**
     * Genera el reporte: simula una llamada a la API y fuerza la carga del PDF.
     */
    viewReport() {
        if (this.isLoading() || !this.selectedReportId()) return;

        this.isLoading.set(true);

        // 1. Limpiamos la URL para forzar el mensaje "cargando" y asegurar que el iframe se refresque.
        this.currentPdfUrl.set('');

        const report = this.activeReportDetails();
        if (!report) {
            this.isLoading.set(false);
            console.error("Reporte no encontrado. El ID es inválido.");
            return;
        }

        console.log(`Simulando llamada a API para endpoint: ${report.endpoint}`);

        // --- SIMULACIÓN DE API CALL (5 segundos de loading) ---
        setTimeout(() => {
            this.isLoading.set(false);

            // Para forzar el refresco del iframe con el mismo PDF, se añade un timestamp.
            this.currentPdfUrl.set(this.PDF_PLACEHOLDER_URL + '#' + Date.now());

            console.log(`Reporte cargado con URL: ${this.currentPdfUrl()}`);
        }, 5000);

        // --- MECANISMO DINÁMICO LISTO PARA USAR CON api.service (Ejemplo Comentado) ---
        /*
        // Importante: Asuma que inyectó su servicio en el constructor (ej: private apiService: ApiService)

        // this.apiService.getReportPdf(report.endpoint).subscribe({
        //     next: (pdfBlob: Blob) => {
        //         // 1. Crear una URL de objeto a partir del Blob
        //         const url = URL.createObjectURL(pdfBlob);
        //
        //         // 2. Establecer la URL (sin sanitizar, la sanitización ocurre en getPdfSrc())
        //         this.currentPdfUrl.set(url);
        //         this.isLoading.set(false);
        //     },
        //     error: (err) => {
        //         console.error("Error al obtener el PDF:", err);
        //         this.isLoading.set(false);
        //     }
        // });
        */
    }

    /**
     * Obtiene la URL del PDF sanitizada para usar en el atributo [src] del iframe.
     * @returns URL sanitizada.
     */
    getPdfSrc(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.currentPdfUrl());
    }
}

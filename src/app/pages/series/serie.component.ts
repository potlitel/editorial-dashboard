import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

// Componentes de la aplicación
import { SeriesModalComponent } from './serie-modal/serie-modal.component';

// Interfaces de Datos
interface Series {
    id: number;
    name: string;
    description: string;
    bookTitles: string[]; // Placeholder para la relación de Libros
}

// Datos Fijos para Series
const MOCK_SERIES: Series[] = [
    {
        id: 501,
        name: 'El Señor de los Anillos',
        description: 'La épica fantasía de Tolkien sobre la Tierra Media y la lucha por destruir el Anillo Único.',
        bookTitles: ['La Comunidad del Anillo', 'Las Dos Torres', 'El Retorno del Rey']
    },
    {
        id: 502,
        name: 'Canción de Hielo y Fuego',
        description: 'Una saga de fantasía épica con múltiples tramas, intrigas políticas y magia.',
        bookTitles: ['Juego de Tronos', 'Choque de Reyes', 'Tormenta de Espadas', 'Festín de Cuervos', 'Danza de Dragones']
    },
    {
        id: 503,
        name: 'The Witcher',
        description: 'Las aventuras del brujo Geralt de Rivia, cazador de monstruos a sueldo.',
        bookTitles: ['El Último Deseo', 'La Espada del Destino']
    },
    {
        id: 504,
        name: 'Fundación',
        description: 'La obra maestra de ciencia ficción de Isaac Asimov sobre la caída de un imperio galáctico.',
        bookTitles: ['Fundación']
    },
];

@Component({
    selector: 'app-series',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule,
        SeriesModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Serie</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterSeries()" class="dark:text-white" placeholder="Ej. Anillos, Hielo y Fuego">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openSeriesModal()">
          <mat-icon>add_box</mat-icon>
          Nueva Serie
        </button>
      </div>

      <!-- Contenedor Principal de Series -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Serie (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let series of paginatedSeries()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-pink-500/30]="expandedSeriesId() === series.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre de la Serie -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-pink-400">bookmarks</mat-icon>
                {{ series.name }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0">
              <!-- Contador de Libros -->
              <span class="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">auto_stories</mat-icon>
                {{ series.bookTitles.length }} Títulos
              </span>

              <!-- ID de la Serie -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ series.id }}</span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openSeriesModal(series)" matTooltip="Editar Serie">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteSeries(series.id)" matTooltip="Eliminar Serie">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(series.id)"
                        matTooltip="{{ expandedSeriesId() === series.id ? 'Ocultar Detalles' : 'Ver Detalles' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedSeriesId() === series.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Descripción y Listado de Libros) -->
          <div *ngIf="expandedSeriesId() === series.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <!-- Descripción -->
            <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <mat-icon class="mr-1 text-pink-600">description</mat-icon> Descripción:
                </h3>
                <p class="text-gray-700 dark:text-gray-300 text-sm italic">{{ series.description }}</p>
            </div>

            <mat-divider class="dark:border-gray-600 my-4"></mat-divider>

            <!-- Libros Asociados -->
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-purple-600">menu_book</mat-icon> Libros en la Serie:
            </h3>

            <div *ngIf="series.bookTitles.length > 0; else noBooks">
              <!-- USO DE LISTA DESORDENADA (UL) CON ICONOS -->
              <ul class="space-y-2">
                <li *ngFor="let title of series.bookTitles; let i = index"
                    class="flex items-center text-sm p-2 rounded bg-white dark:bg-gray-800/80 shadow-sm border border-gray-200 dark:border-gray-700">
                  <span class="font-medium text-gray-500 dark:text-gray-400 mr-2 shrink-0 w-6 text-center">#{{ i + 1 }}</span>
                  <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ title }}</span>
                </li>
              </ul>
            </div>

            <ng-template #noBooks>
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">Esta serie aún no tiene libros asociados en el sistema.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredSeries().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de series"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay series -->
      <div *ngIf="seriesList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">local_library</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado series de libros.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openSeriesModal()">Crear la Primera</button>
      </div>

    </div>
  `,
})
export class SeriesComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de series. */
    seriesList = signal<Series[]>(MOCK_SERIES);

    /** ID de la serie que actualmente tiene la tarjeta expandida. */
    expandedSeriesId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de series basándose en el término de búsqueda.
     */
    filteredSeries = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.seriesList();

        if (!term) {
            return list;
        }

        return list.filter(series =>
            series.name.toLowerCase().includes(term) ||
            series.description.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedSeries = computed(() => {
        const list = this.filteredSeries();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(seriesId: number): void {
        if (this.expandedSeriesId() === seriesId) {
            this.expandedSeriesId.set(null);
        } else {
            this.expandedSeriesId.set(seriesId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedSeriesId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterSeries(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedSeriesId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar una serie.
     */
    openSeriesModal(series?: Series): void {
        const dialogRef = this.dialog.open(SeriesModalComponent, {
            width: '450px',
            data: {
                series: series ? { ...series } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.isNew) {
                    this.handleCreate(result.series);
                } else {
                    this.handleUpdate(result.series);
                }
            }
        });
    }

    handleCreate(newSeries: Series): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.seriesList().map(s => s.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 501;
        const finalNewSeries = { ...newSeries, id: newId };

        // 2. Actualizar la Signal de series
        this.seriesList.update(list => [...list, finalNewSeries]);
        console.log('Serie Creada:', finalNewSeries);
    }

    handleUpdate(updatedSeries: Series): void {
        // 1. Actualizar la Signal de series (mapeando y reemplazando el editado)
        this.seriesList.update(list =>
            list.map(s => s.id === updatedSeries.id ? updatedSeries : s)
        );
        console.log('Serie Actualizada:', updatedSeries);
    }

    deleteSeries(seriesId: number): void {
        console.log(`Eliminando serie ID: ${seriesId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.seriesList.update(list => list.filter(s => s.id !== seriesId));
    }
}

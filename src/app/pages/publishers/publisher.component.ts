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
import { PublisherModalComponent } from './publisher-modal/publisher-modal.component';

// Interfaces de Datos
interface Publisher {
    id: number;
    name: string;
    city: string;
    // Ahora, en lugar de solo títulos, podemos simular objetos más completos si fuera necesario,
    // pero por ahora mantenemos solo el título para la visualización.
    bookTitles: string[];
}

// Datos Fijos para Editoriales
const MOCK_PUBLISHERS: Publisher[] = [
    { id: 401, name: 'Editorial Planeta', city: 'Barcelona', bookTitles: ['Cien Años de Soledad', 'La Casa de los Espíritus'] },
    { id: 402, name: 'Penguin Random House', city: 'New York', bookTitles: ['The Martian', 'Where the Crawdads Sing', 'Orgullo y Prejuicio', 'Crimen y Castigo'] },
    { id: 403, name: 'Satori Ediciones', city: 'Gijón', bookTitles: ['Música en el Viento', 'El Libro de Arena'] },
    { id: 404, name: 'HarperCollins', city: 'London', bookTitles: ['The Silent Patient'] },
    { id: 405, name: 'Alfaguara', city: 'Madrid', bookTitles: [] },
    { id: 406, name: 'Minotauro', city: 'Buenos Aires', bookTitles: ['The Witcher: El Último Deseo'] },
];

@Component({
    selector: 'app-publisher',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule,
        PublisherModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Editorial</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterPublishers()" class="dark:text-white" placeholder="Ej. Planeta, Barcelona">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openPublisherModal()">
          <mat-icon>add_business</mat-icon>
          Nueva Editorial
        </button>
      </div>

      <!-- Contenedor Principal de Editoriales -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Editorial (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let publisher of paginatedPublishers()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-indigo-500/30]="expandedPublisherId() === publisher.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre y Ciudad -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-indigo-400">apartment</mat-icon>
                {{ publisher.name }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-8">
                <mat-icon class="text-sm align-sub mr-1">location_on</mat-icon>
                {{ publisher.city }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0">
              <!-- Contador de Libros (Placeholder) -->
              <span class="text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">menu_book</mat-icon>
                {{ publisher.bookTitles.length }} Libros
              </span>

              <!-- ID de la Editorial -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ publisher.id }}</span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openPublisherModal(publisher)" matTooltip="Editar Editorial">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deletePublisher(publisher.id)" matTooltip="Eliminar Editorial">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción (Añadido) -->
                <button mat-icon-button (click)="toggleExpand(publisher.id)"
                        matTooltip="{{ expandedPublisherId() === publisher.id ? 'Ocultar Libros' : 'Ver Libros' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedPublisherId() === publisher.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Listado de Libros) -->
          <div *ngIf="expandedPublisherId() === publisher.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <!-- Libros Asociados -->
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-teal-600">list_alt</mat-icon> Títulos Publicados:
            </h3>

            <div *ngIf="publisher.bookTitles.length > 0; else noBooks">
              <!-- USO DE LISTA DESORDENADA (UL) CON ICONOS -->
              <ul class="space-y-2">
                <li *ngFor="let title of publisher.bookTitles"
                    class="flex items-center text-sm p-2 rounded bg-white dark:bg-gray-800/80 shadow-sm border border-gray-200 dark:border-gray-700">
                  <mat-icon class="text-sm mr-2 text-yellow-600 dark:text-yellow-400 shrink-0">book</mat-icon>
                  <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ title }}</span>
                  <!-- Podríamos añadir más detalles del libro aquí si tuviéramos objetos Book completos -->
                </li>
              </ul>
            </div>

            <ng-template #noBooks>
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">Esta editorial aún no tiene títulos asociados en el sistema.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredPublishers().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de editoriales"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay editoriales -->
      <div *ngIf="publishers().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">domain</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado editoriales.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openPublisherModal()">Crear la Primera</button>
      </div>

    </div>
  `,
})
export class PublisherComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de editoriales. */
    publishers = signal<Publisher[]>(MOCK_PUBLISHERS);

    /** ID de la editorial que actualmente tiene la tarjeta expandida. */
    expandedPublisherId = signal<number | null>(null); // Nuevo signal para la expansión

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de editoriales basándose en el término de búsqueda.
     */
    filteredPublishers = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.publishers();

        if (!term) {
            return list;
        }

        return list.filter(publisher =>
            publisher.name.toLowerCase().includes(term) ||
            publisher.city.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedPublishers = computed(() => {
        const list = this.filteredPublishers();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(publisherId: number): void {
        if (this.expandedPublisherId() === publisherId) {
            this.expandedPublisherId.set(null);
        } else {
            this.expandedPublisherId.set(publisherId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedPublisherId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterPublishers(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedPublisherId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar una editorial.
     */
    openPublisherModal(publisher?: Publisher): void {
        const dialogRef = this.dialog.open(PublisherModalComponent, {
            width: '450px',
            data: {
                publisher: publisher ? { ...publisher } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.isNew) {
                    this.handleCreate(result.publisher);
                } else {
                    this.handleUpdate(result.publisher);
                }
            }
        });
    }

    handleCreate(newPublisher: Publisher): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.publishers().map(p => p.id);
        // Aseguramos que el ID sea único y alto (para no chocar con mocks de otras secciones)
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 401;
        const finalNewPublisher = { ...newPublisher, id: newId };

        // 2. Actualizar la Signal de editoriales
        this.publishers.update(list => [...list, finalNewPublisher]);
        console.log('Editorial Creada:', finalNewPublisher);
    }

    handleUpdate(updatedPublisher: Publisher): void {
        // 1. Actualizar la Signal de editoriales (mapeando y reemplazando el editado)
        this.publishers.update(list =>
            list.map(p => p.id === updatedPublisher.id ? updatedPublisher : p)
        );
        console.log('Editorial Actualizada:', updatedPublisher);
    }

    deletePublisher(publisherId: number): void {
        console.log(`Eliminando editorial ID: ${publisherId} (Delete).`);

        // Advertencia: En un sistema real, aquí se verificaría si tiene libros asociados antes de eliminar.

        // Actualizar la Signal de eliminación
        this.publishers.update(list => list.filter(p => p.id !== publisherId));
    }
}

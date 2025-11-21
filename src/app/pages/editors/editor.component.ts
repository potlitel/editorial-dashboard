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
import { EditorsModalComponent } from './editor-modal/editor-modal.component';

// Interfaces de Datos
interface Editor {
    id: number;
    name: string;
    bookTitles: string[]; // Placeholder para la relación de Libros
}

// Datos Fijos para Editores
const MOCK_EDITORS: Editor[] = [
    { id: 601, name: 'María García', bookTitles: ['La Comunidad del Anillo', 'Las Dos Torres', 'El Retorno del Rey'] },
    { id: 602, name: 'Carlos Sánchez', bookTitles: ['Cien Años de Soledad', 'El Amor en los Tiempos del Cólera'] },
    { id: 603, name: 'Elena López', bookTitles: ['Juego de Tronos', 'Choque de Reyes', 'Tormenta de Espadas', 'Danza de Dragones'] },
    { id: 604, name: 'Ricardo Morales', bookTitles: ['The Silent Patient'] },
    { id: 605, name: 'Ana Torres', bookTitles: [] },
];

@Component({
    selector: 'app-editors',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule,
        EditorsModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Editor</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterEditors()" class="dark:text-white" placeholder="Ej. María, Sánchez">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openEditorModal()">
          <mat-icon>person_add</mat-icon>
          Nuevo Editor
        </button>
      </div>

      <!-- Contenedor Principal de Editores -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Editor (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let editor of paginatedEditors()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-orange-500/30]="expandedEditorId() === editor.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre del Editor -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-orange-400">person_pin</mat-icon>
                {{ editor.name }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0">
              <!-- Contador de Libros -->
              <span class="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">edit_note</mat-icon>
                {{ editor.bookTitles.length }} Tareas
              </span>

              <!-- ID del Editor -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ editor.id }}</span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openEditorModal(editor)" matTooltip="Editar Editor">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteEditor(editor.id)" matTooltip="Eliminar Editor">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(editor.id)"
                        matTooltip="{{ expandedEditorId() === editor.id ? 'Ocultar Libros Asignados' : 'Ver Libros Asignados' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedEditorId() === editor.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Listado de Libros) -->
          <div *ngIf="expandedEditorId() === editor.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <!-- Libros Asociados -->
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-amber-600">book</mat-icon> Libros Asignados:
            </h3>

            <div *ngIf="editor.bookTitles.length > 0; else noBooks">
              <!-- USO DE LISTA DESORDENADA (UL) CON ICONOS -->
              <ul class="space-y-2">
                <li *ngFor="let title of editor.bookTitles; let i = index"
                    class="flex items-center text-sm p-2 rounded bg-white dark:bg-gray-800/80 shadow-sm border border-gray-200 dark:border-gray-700">
                  <span class="font-medium text-gray-500 dark:text-gray-400 mr-2 shrink-0 w-6 text-center">#{{ i + 1 }}</span>
                  <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ title }}</span>
                </li>
              </ul>
            </div>

            <ng-template #noBooks>
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">Este editor no tiene libros asignados en el sistema.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredEditors().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de editores"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay editores -->
      <div *ngIf="editorsList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">person_off</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado editores.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openEditorModal()">Crear el Primero</button>
      </div>

    </div>
  `,
})
export class EditorsComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de editores. */
    editorsList = signal<Editor[]>(MOCK_EDITORS);

    /** ID del editor que actualmente tiene la tarjeta expandida. */
    expandedEditorId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de editores basándose en el término de búsqueda.
     */
    filteredEditors = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.editorsList();

        if (!term) {
            return list;
        }

        return list.filter(editor =>
            editor.name.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedEditors = computed(() => {
        const list = this.filteredEditors();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(editorId: number): void {
        if (this.expandedEditorId() === editorId) {
            this.expandedEditorId.set(null);
        } else {
            this.expandedEditorId.set(editorId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedEditorId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterEditors(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedEditorId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar un editor.
     */
    openEditorModal(editor?: Editor): void {
        const dialogRef = this.dialog.open(EditorsModalComponent, {
            width: '450px',
            data: {
                editor: editor ? { ...editor } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.isNew) {
                    this.handleCreate(result.editor);
                } else {
                    this.handleUpdate(result.editor);
                }
            }
        });
    }

    handleCreate(newEditor: Editor): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.editorsList().map(e => e.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 601;
        const finalNewEditor = { ...newEditor, id: newId };

        // 2. Actualizar la Signal de editores
        this.editorsList.update(list => [...list, finalNewEditor]);
        console.log('Editor Creado:', finalNewEditor);
    }

    handleUpdate(updatedEditor: Editor): void {
        // 1. Actualizar la Signal de editores (mapeando y reemplazando el editado)
        this.editorsList.update(list =>
            list.map(e => e.id === updatedEditor.id ? updatedEditor : e)
        );
        console.log('Editor Actualizado:', updatedEditor);
    }

    deleteEditor(editorId: number): void {
        console.log(`Eliminando editor ID: ${editorId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.editorsList.update(list => list.filter(e => e.id !== editorId));
    }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

// Componentes de la aplicación
import { AuthorModalComponent } from './author-modal/author.modal.component';

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

// Datos Fijos para Autores
const MOCK_AUTHORS: Author[] = [
    {
        id: 201, firstName: 'Laura', lastName: 'Gallego',
        bio: 'Autora española de literatura juvenil, conocida por su saga "Memorias de Idhún". Su estilo combina fantasía y drama con gran profundidad emocional.',
        books: [{ title: 'Finis Mundi', isbn: '978-84-239-6500-1' }, { title: 'La Emperatriz de los Etéreos', isbn: '978-84-239-6501-8' }]
    },
    {
        id: 202, firstName: 'Haruki', lastName: 'Murakami',
        bio: 'Escritor japonés cuyas obras exploran la soledad, la música y el surrealismo. Sus novelas más destacadas incluyen "Kafka en la orilla" y "Tokio Blues".',
        books: [{ title: 'Tokio Blues', isbn: '978-0-307-59371-3' }, { title: '1Q84', isbn: '978-0-307-95996-5' }, { title: 'Kafka en la Orilla', isbn: '978-0-307-27515-3' }]
    },
    {
        id: 203, firstName: 'Gabriel García', lastName: 'Márquez',
        bio: 'Novelista colombiano, considerado uno de los autores más significativos del siglo XX. Ganador del Premio Nobel de Literatura en 1982.',
        books: [{ title: 'Cien Años de Soledad', isbn: '978-84-9793-688-6' }]
    },
    {
        id: 204, firstName: 'Jane', lastName: 'Austen',
        bio: 'Novelista británica cuyas obras son un comentario social de la gentry inglesa del siglo XIX. Su obra más famosa es "Orgullo y Prejuicio".',
        books: []
    },
    {
        id: 205, firstName: 'George R.R.', lastName: 'Martin',
        bio: 'Autor estadounidense de fantasía, terror y ciencia ficción. Es el creador de la saga "Canción de Hielo y Fuego", adaptada a la serie de HBO "Juego de Tronos".',
        books: [{ title: 'Juego de Tronos', isbn: '978-84-9793-689-3' }, { title: 'Choque de Reyes', isbn: '978-84-9793-690-9' }]
    },
];

@Component({
    selector: 'app-author',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
        MatTooltipModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatListModule,
        AuthorModalComponent // Importar el modal para su uso
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Autor</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterAuthors()" class="dark:text-white" placeholder="Ej. Márquez, Laura, Murakami">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openAuthorModal()">
          <mat-icon>person_add</mat-icon>
          Nuevo Autor
        </button>
      </div>

      <!-- Contenedor Principal de Autores -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Autor (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let author of paginatedAuthors()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-blue-500/30]="expandedAuthorId() === author.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre Completo y ID -->
            <div class="flex items-center flex-grow mb-3 sm:mb-0">
              <span class="text-xl font-semibold text-gray-800 dark:text-white mr-3">
                {{ author.firstName }} {{ author.lastName }}
              </span>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ author.id }}</span>
            </div>

            <!-- Contador de Libros y Acciones -->
            <div class="flex items-center gap-4">
              <!-- Contador de Libros -->
              <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center shrink-0">
                <mat-icon class="text-base mr-1">menu_book</mat-icon>
                {{ author.books.length }} Libros
              </div>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openAuthorModal(author)" matTooltip="Editar Autor">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteAuthor(author.id)" matTooltip="Eliminar Autor">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(author.id)"
                        matTooltip="{{ expandedAuthorId() === author.id ? 'Ocultar Detalles' : 'Ver Detalles' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedAuthorId() === author.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Biografía y Listado de Libros) -->
          <div *ngIf="expandedAuthorId() === author.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <!-- Biografía -->
            <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <mat-icon class="mr-1 text-purple-600">badge</mat-icon> Biografía:
                </h3>
                <p class="text-gray-700 dark:text-gray-300 text-sm italic">{{ author.bio }}</p>
            </div>

            <mat-divider class="dark:border-gray-600 my-4"></mat-divider>

            <!-- Libros Asociados -->
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-yellow-600">list_alt</mat-icon> Obras Publicadas:
            </h3>

            <div *ngIf="author.books.length > 0; else noBooks">
              <!-- USO DE LISTA DESORDENADA (UL) CON ICONOS -->
              <ul class="space-y-2">
                <li *ngFor="let book of author.books"
                    class="flex items-center text-sm p-2 rounded bg-white dark:bg-gray-800/80 shadow-sm border border-gray-200 dark:border-gray-700">
                  <mat-icon class="text-sm mr-2 text-green-600 dark:text-green-400 shrink-0">book</mat-icon>
                  <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ book.title }}</span>
                  <span class="font-mono text-gray-500 dark:text-gray-400 text-xs ml-auto shrink-0">
                    <mat-icon class="text-xs mr-1">qr_code_2</mat-icon>
                    ISBN: {{ book.isbn }}
                  </span>
                </li>
              </ul>
            </div>

            <ng-template #noBooks>
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">Este autor aún no tiene libros asociados en el sistema.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredAuthors().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de autores"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay autores -->
      <div *ngIf="authors().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">person_search</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado autores en la editorial.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openAuthorModal()">Crear el Primero</button>
      </div>

    </div>
  `,
})
export class AuthorComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---

    /** Lista completa de autores (mock data). Es la fuente de verdad. */
    authors = signal<Author[]>(MOCK_AUTHORS);

    /** Signal que rastrea el ID del autor actualmente expandido. */
    expandedAuthorId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPONENTE ANGULAR) ---

    /** Término de búsqueda para filtrar la lista. Usado con FormsModule. */
    searchTerm: string = '';

    /** Estado del paginador: página actual (0-indexed). */
    pageIndex = signal(0);

    /** Estado del paginador: cantidad de ítems por página. */
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de autores basándose en el término de búsqueda.
     */
    filteredAuthors = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.authors();

        if (!term) {
            return list;
        }

        return list.filter(author =>
            author.firstName.toLowerCase().includes(term) ||
            author.lastName.toLowerCase().includes(term) ||
            author.id.toString().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedAuthors = computed(() => {
        const list = this.filteredAuthors();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna el estado de expansión de una tarjeta.
     */
    toggleExpand(authorId: number): void {
        if (this.expandedAuthorId() === authorId) {
            this.expandedAuthorId.set(null); // Contrae
        } else {
            this.expandedAuthorId.set(authorId); // Expande
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterAuthors(): void {
        this.pageIndex.set(0);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar un autor.
     * @param author El autor a editar, o null/undefined para crear uno nuevo.
     */
    openAuthorModal(author?: Author): void {
        const dialogRef = this.dialog.open(AuthorModalComponent, {
            width: '500px',
            data: { author: author ? { ...author } : null },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Lógica para manejar la respuesta del modal (creación o actualización)
                if (result.isNew) {
                    this.handleCreate(result.author);
                } else {
                    this.handleUpdate(result.author);
                }
            }
        });
    }

    handleCreate(newAuthor: Author): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.authors().map(a => a.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1;
        const finalNewAuthor = { ...newAuthor, id: newId };

        // 2. Actualizar la Signal de autores
        this.authors.update(list => [...list, finalNewAuthor]);

        // COMENTARIO API (Create):
        // this.apiService.post<Author>('/api/authors', newAuthorData).subscribe(...)
    }

    handleUpdate(updatedAuthor: Author): void {
        // 1. Actualizar la Signal de autores (mapeando y reemplazando el editado)
        this.authors.update(list =>
            list.map(a => a.id === updatedAuthor.id ? updatedAuthor : a)
        );

        // COMENTARIO API (Update):
        // this.apiService.put<Author>(`/api/authors/${updatedAuthor.id}`, updatedAuthor).subscribe(...)
    }

    deleteAuthor(authorId: number): void {
        // Simulación de una confirmación de usuario
        console.log(`Eliminando autor ID: ${authorId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.authors.update(list => list.filter(a => a.id !== authorId));

        // Si el autor eliminado estaba expandido, contraerlo
        if (this.expandedAuthorId() === authorId) {
            this.expandedAuthorId.set(null);
        }

        // COMENTARIO API (Delete):
        // this.apiService.delete(`/api/authors/${authorId}`).subscribe(...)
    }
}

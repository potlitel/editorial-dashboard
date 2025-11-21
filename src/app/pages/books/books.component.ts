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
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

// Componentes y Interfaces
import { BooksModalComponent } from './book-modal/book-modal.component';

// --- Interfaces de Datos (Reutilizadas/Nuevas para el Contexto) ---
interface AuthorMock { id: number; name: string; }
interface PublisherMock { id: number; name: string; }
interface SeriesMock { id: number; name: string; }
interface EditorMock { id: number; name: string; }
interface GenreMock { id: number; name: string; }
interface ReviewMock { id: number; rating: number; user: string; contentSnippet: string; } // Simplificado para la vista de Libro

interface Book {
    id: number;
    title: string;
    isbn: string;
    publicationYear: number;
    // Relaciones M:1 (IDs)
    authorId: number;
    publisherId: number;
    seriesId: number | null;
    // Relaciones M:M (Arrays de IDs)
    editorIds: number[];
    genreIds: number[];
}

// --- MOCK Data para las Relaciones ---
const MOCK_AUTHORS: AuthorMock[] = [{ id: 101, name: 'Isaac Asimov' }, { id: 102, name: 'Gabriel García Márquez' }, { id: 103, name: 'J.R.R. Tolkien' }];
const MOCK_PUBLISHERS: PublisherMock[] = [{ id: 201, name: 'Debolsillo' }, { id: 202, name: 'Minotauro' }, { id: 203, name: 'Sudamericana' }];
const MOCK_SERIES: SeriesMock[] = [{ id: 301, name: 'Trilogía Fundación' }, { id: 302, name: 'Serie Cien Años' }, { id: 303, name: 'El Señor de los Anillos' }];
const MOCK_EDITORS: EditorMock[] = [{ id: 501, name: 'Elena Ramírez' }, { id: 502, name: 'Javier Alonso' }, { id: 503, name: 'Carmen Soto' }];
const MOCK_GENRES: GenreMock[] = [{ id: 601, name: 'Ciencia Ficción' }, { id: 602, name: 'Realismo Mágico' }, { id: 603, name: 'Fantasía Épica' }, { id: 604, name: 'Novela' }];

// Mocks de Reseñas para cada libro (lado inverso 1:M)
const MOCK_REVIEWS: Record<number, ReviewMock[]> = {
    1: [
        { id: 701, rating: 5, user: 'alice_reads', contentSnippet: 'Una obra maestra de la ciencia ficción.' },
        { id: 704, rating: 4, user: 'bob_writer', contentSnippet: 'El mejor libro para iniciar en el género.' },
    ],
    2: [
        { id: 702, rating: 4, user: 'charlie_critic', contentSnippet: 'Complicado al inicio, pero hermoso.' },
    ],
    3: [
        { id: 703, rating: 5, user: 'diana_bookworm', contentSnippet: 'El inicio de la gran aventura.' },
        { id: 705, rating: 5, user: 'eve_rookie', contentSnippet: 'Me encantó la mitología detrás.' },
        { id: 706, rating: 5, user: 'alice_reads', contentSnippet: 'Lo releo cada año, es perfecto.' },
    ],
};

// --- MOCK de Datos de Libros ---
const MOCK_BOOKS: Book[] = [
    {
        id: 1, title: 'Fundación', isbn: '978-8445075677', publicationYear: 1951,
        authorId: 101, publisherId: 202, seriesId: 301,
        editorIds: [501, 502], genreIds: [601, 604]
    },
    {
        id: 2, title: 'Cien Años de Soledad', isbn: '978-8497592939', publicationYear: 1967,
        authorId: 102, publisherId: 203, seriesId: null,
        editorIds: [503], genreIds: [602, 604]
    },
    {
        id: 3, title: 'La Comunidad del Anillo', isbn: '978-8445000570', publicationYear: 1954,
        authorId: 103, publisherId: 201, seriesId: 303,
        editorIds: [501], genreIds: [603, 604]
    },
];

@Component({
    selector: 'app-books',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule, MatListModule, MatChipsModule,
        BooksModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-lg mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Libro (Título, ISBN, Autor)</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterBooks()" class="dark:text-white" placeholder="Ej. Fundación, 1951, Asimov">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openBookModal()">
          <mat-icon>library_add</mat-icon>
          Nuevo Libro
        </button>
      </div>

      <!-- Contenedor Principal de Libros -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Libro (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let book of paginatedBooks()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-red-500/30]="expandedBookId() === book.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Título y Autor -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-red-500">book</mat-icon>
                {{ book.title }} <span class="text-sm font-light ml-3 text-gray-500 dark:text-gray-400">({{ book.publicationYear }})</span>
              </span>
              <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
                <mat-icon class="text-base mr-1">person</mat-icon>
                Autor: {{ getAuthorName(book.authorId) }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
              <!-- Información Rápida -->
              <span matTooltip="Editorial" class="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center hidden sm:flex">
                <mat-icon class="text-base mr-1">business</mat-icon>
                {{ getPublisherName(book.publisherId) }}
              </span>
              <span matTooltip="Cantidad de Reseñas" class="text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">star</mat-icon>
                Reseñas: {{ getReviewsByBookId(book.id).length }}
              </span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openBookModal(book)" matTooltip="Editar Libro">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteBook(book.id)" matTooltip="Eliminar Libro">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(book.id)"
                        matTooltip="{{ expandedBookId() === book.id ? 'Ocultar Detalles' : 'Ver Detalles y Reseñas' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedBookId() === book.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Detalles de Relaciones y Reviews) -->
          <div *ngIf="expandedBookId() === book.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <mat-divider class="mb-4 dark:bg-gray-600"></mat-divider>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- COLUMNA 1: Relaciones M:1 y M:M (Metadatos) -->
                <div class="lg:col-span-1 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-3">
                        <mat-icon class="mr-1 text-red-500">info</mat-icon> Metadatos del Libro
                    </h3>

                    <!-- ISBN y Serie -->
                    <div class="space-y-2 text-sm">
                        <p><span class="font-semibold dark:text-white">ISBN:</span> {{ book.isbn }}</p>
                        <p><span class="font-semibold dark:text-white">Serie:</span>
                            <span *ngIf="book.seriesId; else noSeries" class="text-indigo-600 dark:text-indigo-400 flex items-center">
                                <mat-icon class="text-base mr-1">view_day</mat-icon>
                                {{ getSeriesName(book.seriesId!) }}
                            </span>
                            <ng-template #noSeries><span class="italic text-gray-500">No pertenece a una serie</span></ng-template>
                        </p>
                    </div>

                    <mat-divider class="dark:bg-gray-600"></mat-divider>

                    <!-- Géneros (M:M) -->
                    <div>
                        <h4 class="font-semibold dark:text-white flex items-center mb-2">
                            <mat-icon class="text-base mr-1 text-green-500">category</mat-icon> Géneros
                        </h4>
                        <mat-chip-listbox aria-label="Géneros del libro">
                            <mat-chip *ngFor="let id of book.genreIds" color="accent" selected>
                                {{ getGenreName(id) }}
                            </mat-chip>
                        </mat-chip-listbox>
                    </div>

                    <!-- Editores (M:M) -->
                    <div>
                        <h4 class="font-semibold dark:text-white flex items-center mb-2 mt-4">
                            <mat-icon class="text-base mr-1 text-purple-500">people</mat-icon> Editores
                        </h4>
                        <mat-chip-listbox aria-label="Editores del libro">
                            <mat-chip *ngFor="let id of book.editorIds" color="primary" selected>
                                {{ getEditorName(id) }}
                            </mat-chip>
                        </mat-chip-listbox>
                    </div>
                </div>

                <!-- COLUMNA 2 Y 3: Reseñas (1:M - Lado Inverso) -->
                <div class="lg:col-span-2">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-3">
                        <mat-icon class="mr-1 text-teal-600">reviews</mat-icon> Reseñas Asociadas ({{ getReviewsByBookId(book.id).length }})
                    </h3>

                    <mat-list *ngIf="getReviewsByBookId(book.id).length > 0; else noReviews" class="dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                        <mat-list-item *ngFor="let review of getReviewsByBookId(book.id)" class="py-2 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                            <mat-icon matListItemIcon class="text-yellow-500">star</mat-icon>
                            <div matListItemTitle class="font-medium dark:text-white">
                                {{ review.rating }}/5 por <span class="text-teal-600 dark:text-teal-400">{{ review.user }}</span>
                            </div>
                            <div matListItemLine class="text-sm text-gray-600 dark:text-gray-400">
                                "{{ review.contentSnippet }}"...
                            </div>
                        </mat-list-item>
                    </mat-list>

                    <ng-template #noReviews>
                        <div class="text-center py-6 text-gray-500 dark:text-gray-400 border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700">
                            <mat-icon class="text-4xl">rate_review</mat-icon>
                            <p class="mt-2">Este libro aún no tiene reseñas.</p>
                        </div>
                    </ng-template>
                </div>
            </div>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredBooks().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de libros"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay libros -->
      <div *ngIf="booksList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">menu_book</mat-icon>
          <p class="mt-2 text-lg">No hay libros registrados en el inventario.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openBookModal()">Registrar el Primer Libro</button>
      </div>

    </div>
  `,
})
export class BooksComponent {
    private dialog = inject(MatDialog);

    // --- Mocks para lookup ---
    private authorsMap = new Map(MOCK_AUTHORS.map(a => [a.id, a.name]));
    private publishersMap = new Map(MOCK_PUBLISHERS.map(p => [p.id, p.name]));
    private seriesMap = new Map(MOCK_SERIES.map(s => [s.id, s.name]));
    private editorsMap = new Map(MOCK_EDITORS.map(e => [e.id, e.name]));
    private genresMap = new Map(MOCK_GENRES.map(g => [g.id, g.name]));

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de libros. */
    booksList = signal<Book[]>(MOCK_BOOKS);

    /** ID del libro que actualmente tiene la tarjeta expandida. */
    expandedBookId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de libros basándose en el término de búsqueda.
     */
    filteredBooks = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.booksList();

        if (!term) {
            return list;
        }

        return list.filter(book =>
            book.title.toLowerCase().includes(term) ||
            book.isbn.toLowerCase().includes(term) ||
            book.publicationYear.toString().includes(term) ||
            this.getAuthorName(book.authorId).toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedBooks = computed(() => {
        const list = this.filteredBooks();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Funciones de Resolución de Relaciones (Lookups) ---
    getAuthorName(id: number): string {
        return this.authorsMap.get(id) || `ID Autor ${id} (Error)`;
    }

    getPublisherName(id: number): string {
        return this.publishersMap.get(id) || `ID Editorial ${id} (Error)`;
    }

    getSeriesName(id: number): string {
        return this.seriesMap.get(id) || `ID Serie ${id} (Error)`;
    }

    getEditorName(id: number): string {
        return this.editorsMap.get(id) || `ID Editor ${id} (Error)`;
    }

    getGenreName(id: number): string {
        return this.genresMap.get(id) || `ID Género ${id} (Error)`;
    }

    getReviewsByBookId(bookId: number): ReviewMock[] {
        // Simulación del lado inverso 1:M
        return MOCK_REVIEWS[bookId] || [];
    }

    // --- Lógica de la UI (Basada en Signals) ---

    toggleExpand(bookId: number): void {
        if (this.expandedBookId() === bookId) {
            this.expandedBookId.set(null);
        } else {
            this.expandedBookId.set(bookId);
        }
    }

    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        this.expandedBookId.set(null);
    }

    filterBooks(): void {
        this.pageIndex.set(0);
        this.expandedBookId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    openBookModal(book?: Book): void {
        const dialogRef = this.dialog.open(BooksModalComponent, {
            width: '800px',
            data: {
                book: book ? { ...book } : null,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.book) {
                if (result.isNew) {
                    this.handleCreate(result.book);
                } else {
                    this.handleUpdate(result.book);
                }
            }
        });
    }

    handleCreate(newBook: Book): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.booksList().map(b => b.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1;
        const finalNewBook = { ...newBook, id: newId };

        // 2. Actualizar la Signal de libros
        this.booksList.update(list => [...list, finalNewBook]);
        console.log('Libro Creado:', finalNewBook);
    }

    handleUpdate(updatedBook: Book): void {
        // 1. Actualizar la Signal de libros (mapeando y reemplazando el editado)
        this.booksList.update(list =>
            list.map(b => b.id === updatedBook.id ? updatedBook : b)
        );
        console.log('Libro Actualizado:', updatedBook);
    }

    deleteBook(bookId: number): void {
        console.log(`Eliminando libro ID: ${bookId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.booksList.update(list => list.filter(b => b.id !== bookId));
    }
}

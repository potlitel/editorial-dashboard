import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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

// Componentes de la aplicación
import { ReviewsModalComponent } from './review-modal/review-modal.component';

// Interfaces de Datos
interface Comment {
    id: number;
    author: string;
    text: string;
    date: Date;
}

interface BookDetail {
    id: number;
    title: string;
    publicationYear: number;
    ISBN: string;
    publisherName: string; // Editorial
    editorNames: string[]; // Editores
}

interface Review {
    id: number;
    rating: number; // 1-5
    body: string;
    createdAt: string; // ISO date string
    book: BookDetail;
    comments: Comment[];
}

// Mock de Datos
const MOCK_COMMENTS: Comment[] = [
    { id: 1, author: 'Alex V.', text: 'Totalmente de acuerdo, una obra maestra.', date: new Date('2024-01-10') },
    { id: 2, author: 'Laura P.', text: 'El final me pareció un poco flojo, pero el desarrollo es genial.', date: new Date('2024-01-11') },
];

const MOCK_REVIEWS: Review[] = [
    {
        id: 701,
        rating: 5,
        body: 'Una de las mejores novelas de ciencia ficción de todos los tiempos. Asimov logra crear un universo complejo y fascinante con la psico-historia como eje central.',
        createdAt: new Date('2024-01-09T10:00:00Z').toISOString(),
        book: {
            id: 3, title: 'Fundación', publicationYear: 1951, ISBN: '978-8445070211',
            publisherName: 'Ediciones B', editorNames: ['María García', 'Ricardo Morales']
        },
        comments: MOCK_COMMENTS
    },
    {
        id: 702,
        rating: 4,
        body: 'García Márquez en su cumbre. El realismo mágico es perfecto, aunque a veces la cantidad de personajes con el mismo nombre resulta confusa.',
        createdAt: new Date('2024-02-15T15:30:00Z').toISOString(),
        book: {
            id: 1, title: 'Cien Años de Soledad', publicationYear: 1967, ISBN: '978-0307474728',
            publisherName: 'Sudamericana', editorNames: ['Carlos Sánchez']
        },
        comments: []
    },
    {
        id: 703,
        rating: 2,
        body: 'No me convenció. La trama es demasiado lenta en los primeros capítulos y perdí el interés antes de llegar a la mitad.',
        createdAt: new Date('2024-03-20T08:15:00Z').toISOString(),
        book: {
            id: 4, title: 'Juego de Tronos', publicationYear: 1996, ISBN: '978-8496208940',
            publisherName: 'Gigamesh', editorNames: ['Elena López']
        },
        comments: []
    },
];

@Component({
    selector: 'app-reviews',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule, MatListModule, MatChipsModule,
        ReviewsModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Reseña</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterReviews()" class="dark:text-white" placeholder="Ej. Asimov, lenta, fascinante">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openReviewModal()">
          <mat-icon>add_comment</mat-icon>
          Nueva Reseña
        </button>
      </div>

      <!-- Contenedor Principal de Reseñas -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Reseña (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let review of paginatedReviews()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-sky-500/30]="expandedReviewId() === review.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Puntuación y Libro -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">RESEÑA SOBRE:</span>
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-sky-400">rate_review</mat-icon>
                {{ review.book.title }}
              </span>
              <div class="flex items-center mt-1">
                <mat-icon *ngFor="let i of [1, 2, 3, 4, 5]" [class.text-yellow-500]="i <= review.rating" [class.text-gray-400]="i > review.rating">star</mat-icon>
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">({{ review.rating }}/5)</span>
              </div>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
              <!-- Fecha de Creación -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">
                <mat-icon class="text-sm align-text-bottom">event</mat-icon>
                {{ review.createdAt | date: 'mediumDate' }}
              </span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openReviewModal(review)" matTooltip="Editar Reseña">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteReview(review.id)" matTooltip="Eliminar Reseña">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(review.id)"
                        matTooltip="{{ expandedReviewId() === review.id ? 'Ocultar Detalles' : 'Ver Detalles y Comentarios' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedReviewId() === review.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Detalles del Libro y Comentarios) -->
          <div *ngIf="expandedReviewId() === review.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <div class="grid md:grid-cols-2 gap-6">
                <!-- COLUMNA 1: Contenido de la Reseña y Detalles del Libro -->
                <div>
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                        <mat-icon class="mr-1 text-sky-600">article</mat-icon> Contenido de la Reseña:
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300 text-sm mb-6 p-3 bg-white dark:bg-gray-800/80 rounded-lg shadow-inner italic">{{ review.body }}</p>

                    <!-- Detalles Enriquecidos del Libro (Solicitado por el usuario) -->
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                        <mat-icon class="mr-1 text-teal-600">book</mat-icon> Detalles del Libro:
                    </h3>
                    <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300 p-3 border dark:border-gray-600 rounded-lg">
                        <p><span class="font-semibold text-gray-800 dark:text-white">Título:</span> {{ review.book.title }}</p>
                        <p><span class="font-semibold text-gray-800 dark:text-white">Año Pub.:</span> {{ review.book.publicationYear }}</p>
                        <p><span class="font-semibold text-gray-800 dark:text-white">ISBN:</span> {{ review.book.ISBN }}</p>
                        <p><span class="font-semibold text-gray-800 dark:text-white">Editorial:</span> {{ review.book.publisherName }}</p>
                        <p>
                            <span class="font-semibold text-gray-800 dark:text-white block mb-1">Editores Asignados:</span>
                            <mat-chip-listbox>
                                <mat-chip *ngIf="review.book.editorNames.length === 0" color="warn" disabled>Sin Editor</mat-chip>
                                <mat-chip *ngFor="let editor of review.book.editorNames" color="accent">
                                    {{ editor }}
                                </mat-chip>
                            </mat-chip-listbox>
                        </p>
                    </div>
                </div>

                <!-- COLUMNA 2: Comentarios (One-to-Many) -->
                <div>
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                        <mat-icon class="mr-1 text-purple-600">chat_bubble</mat-icon> Comentarios ({{ review.comments.length }})
                    </h3>

                    <div class="h-64 overflow-y-auto pr-2">
                        <div *ngIf="review.comments.length > 0; else noComments">
                            <mat-list role="list" class="bg-transparent dark:bg-transparent">
                                <div *ngFor="let comment of review.comments" role="listitem" class="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
                                    <div class="flex justify-between items-start text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span class="font-semibold text-gray-800 dark:text-white flex items-center">
                                            <mat-icon class="text-base mr-1">person</mat-icon> {{ comment.author }}
                                        </span>
                                        <span>{{ comment.date | date: 'short' }}</span>
                                    </div>
                                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ comment.text }}</p>
                                </div>
                            </mat-list>
                        </div>
                        <ng-template #noComments>
                          <p class="text-center text-gray-500 dark:text-gray-400 py-4 italic">No hay comentarios para esta reseña.</p>
                        </ng-template>
                    </div>
                </div>
            </div>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredReviews().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de reseñas"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay reseñas -->
      <div *ngIf="reviewsList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">sentiment_dissatisfied</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado reseñas de libros.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openReviewModal()">Crear la Primera Reseña</button>
      </div>

    </div>
  `,
})
export class ReviewsComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de reseñas. */
    reviewsList = signal<Review[]>(MOCK_REVIEWS);

    /** ID de la reseña que actualmente tiene la tarjeta expandida. */
    expandedReviewId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de reseñas basándose en el término de búsqueda.
     */
    filteredReviews = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.reviewsList();

        if (!term) {
            return list;
        }

        return list.filter(review =>
            review.body.toLowerCase().includes(term) ||
            review.book.title.toLowerCase().includes(term) ||
            review.book.publisherName.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedReviews = computed(() => {
        const list = this.filteredReviews();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(reviewId: number): void {
        if (this.expandedReviewId() === reviewId) {
            this.expandedReviewId.set(null);
        } else {
            this.expandedReviewId.set(reviewId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedReviewId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterReviews(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedReviewId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar una reseña.
     */
    openReviewModal(review?: Review): void {
        const dialogRef = this.dialog.open(ReviewsModalComponent, {
            width: '600px',
            data: {
                review: review ? { id: review.id, rating: review.rating, body: review.body, book: review.book, createdAt: review.createdAt } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.review) {
                // Para simular la estructura completa (comments)
                const fullReview: Review = {
                    ...result.review,
                    // Mantenemos los comentarios si es edición, o asignamos vacíos si es nueva
                    comments: review?.comments || [],
                };

                if (result.isNew) {
                    this.handleCreate(fullReview);
                } else {
                    this.handleUpdate(fullReview);
                }
            }
        });
    }

    handleCreate(newReview: Review): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.reviewsList().map(r => r.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 701;
        const finalNewReview = { ...newReview, id: newId };

        // 2. Actualizar la Signal de reseñas
        this.reviewsList.update(list => [...list, finalNewReview]);
        console.log('Reseña Creada:', finalNewReview);
    }

    handleUpdate(updatedReview: Review): void {
        // 1. Actualizar la Signal de reseñas (mapeando y reemplazando el editado)
        this.reviewsList.update(list =>
            list.map(r => r.id === updatedReview.id ? updatedReview : r)
        );
        console.log('Reseña Actualizada:', updatedReview);
    }

    deleteReview(reviewId: number): void {
        console.log(`Eliminando reseña ID: ${reviewId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.reviewsList.update(list => list.filter(r => r.id !== reviewId));
    }
}

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

// Componentes de la aplicación
import { CommentsModalComponent } from './comments-modals/comment.modal.component';

// Interfaces de Datos
interface ReviewDetail {
    id: number;
    title: string; // Título del libro reseñado
    rating: number; // Puntuación de la reseña
    bodySnippet: string; // Snippet del cuerpo de la reseña
}

interface Comment {
    id: number;
    content: string;
    createdAt: string; // ISO date string
    review: ReviewDetail;
    author: string; // Autor simulado
}

// Mock de Datos
const MOCK_COMMENTS: Comment[] = [
    {
        id: 801,
        content: 'Totalmente de acuerdo, la psico-historia es el motor narrativo más interesante de la obra. Un 10.',
        createdAt: new Date('2024-05-01T10:30:00Z').toISOString(),
        author: 'Alex V.',
        review: {
            id: 701, title: 'Fundación', rating: 5,
            bodySnippet: 'Una de las mejores novelas de ciencia ficción de todos los tiempos...'
        }
    },
    {
        id: 802,
        content: 'Entiendo el punto de la lentitud, pero el desarrollo de personajes en el primer libro de la saga lo compensa con creces.',
        createdAt: new Date('2024-05-05T12:00:00Z').toISOString(),
        author: 'Felipe M.',
        review: {
            id: 703, title: 'Juego de Tronos', rating: 2,
            bodySnippet: 'No me convenció. La trama es demasiado lenta en los primeros capítulos...'
        }
    },
    {
        id: 803,
        content: 'El realismo mágico es complicado, pero es lo que hace única la novela. No es para cualquiera.',
        createdAt: new Date('2024-05-10T14:45:00Z').toISOString(),
        author: 'Laura P.',
        review: {
            id: 702, title: 'Cien Años de Soledad', rating: 4,
            bodySnippet: 'García Márquez en su cumbre. El realismo mágico es perfecto...'
        }
    },
];

@Component({
    selector: 'app-comments',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule, MatListModule,
        CommentsModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Comentario</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterComments()" class="dark:text-white" placeholder="Ej. lenta, Asimov, realismo">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openCommentModal()">
          <mat-icon>comment</mat-icon>
          Nuevo Comentario
        </button>
      </div>

      <!-- Contenedor Principal de Comentarios -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Comentario (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let comment of paginatedComments()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-green-500/30]="expandedCommentId() === comment.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Autor y Contenido -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">COMENTARIO DE {{ comment.author | uppercase }}</span>
              <span class="text-lg font-medium text-gray-800 dark:text-white line-clamp-2">{{ comment.content }}</span>
              <span class="mt-1 text-sm font-light text-teal-600 dark:text-teal-400 flex items-center">
                <mat-icon class="text-base mr-1">rate_review</mat-icon>
                Respuesta a Reseña ID: {{ comment.review.id }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
              <!-- Fecha de Creación -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">
                <mat-icon class="text-sm align-text-bottom">event</mat-icon>
                {{ comment.createdAt | date: 'short' }}
              </span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openCommentModal(comment)" matTooltip="Editar Comentario">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteComment(comment.id)" matTooltip="Eliminar Comentario">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(comment.id)"
                        matTooltip="{{ expandedCommentId() === comment.id ? 'Ocultar Reseña Asociada' : 'Ver Reseña Asociada' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedCommentId() === comment.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Detalles de la Reseña Asociada) -->
          <div *ngIf="expandedCommentId() === comment.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <!-- Detalles Enriquecidos de la Reseña -->
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                <mat-icon class="mr-1 text-teal-600">rate_review</mat-icon> Detalles de la Reseña Original:
            </h3>
            <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <p><span class="font-semibold text-gray-800 dark:text-white">Libro Reseñado:</span> {{ comment.review.title }}</p>
                <div class="flex items-center">
                    <span class="font-semibold text-gray-800 dark:text-white mr-2">Puntuación:</span>
                    <mat-icon *ngFor="let i of [1, 2, 3, 4, 5]" [class.text-yellow-500]="i <= comment.review.rating" [class.text-gray-400]="i > comment.review.rating">star</mat-icon>
                    <span class="ml-2">({{ comment.review.rating }}/5)</span>
                </div>
                <p><span class="font-semibold text-gray-800 dark:text-white">Snippet del Cuerpo:</span> <span class="italic">"{{ comment.review.bodySnippet }}..."</span></p>
                <p><span class="font-semibold text-gray-800 dark:text-white">ID Reseña:</span> {{ comment.review.id }}</p>
            </div>
          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredComments().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de comentarios"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay comentarios -->
      <div *ngIf="commentsList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">forum</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado comentarios.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openCommentModal()">Crear el Primer Comentario</button>
      </div>

    </div>
  `,
})
export class CommentsComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de comentarios. */
    commentsList = signal<Comment[]>(MOCK_COMMENTS);

    /** ID del comentario que actualmente tiene la tarjeta expandida. */
    expandedCommentId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de comentarios basándose en el término de búsqueda.
     */
    filteredComments = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.commentsList();

        if (!term) {
            return list;
        }

        return list.filter(comment =>
            comment.content.toLowerCase().includes(term) ||
            comment.author.toLowerCase().includes(term) ||
            comment.review.title.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedComments = computed(() => {
        const list = this.filteredComments();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(commentId: number): void {
        if (this.expandedCommentId() === commentId) {
            this.expandedCommentId.set(null);
        } else {
            this.expandedCommentId.set(commentId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedCommentId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterComments(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedCommentId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar un comentario.
     */
    openCommentModal(comment?: Comment): void {
        const dialogRef = this.dialog.open(CommentsModalComponent, {
            width: '450px',
            data: {
                comment: comment ? { ...comment } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.comment) {
                // Para simular la estructura completa (autor)
                const fullComment: Comment = {
                    ...result.comment,
                    author: comment?.author || 'Nuevo Usuario',
                };

                if (result.isNew) {
                    this.handleCreate(fullComment);
                } else {
                    this.handleUpdate(fullComment);
                }
            }
        });
    }

    handleCreate(newComment: Comment): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.commentsList().map(c => c.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 801;
        const finalNewComment = { ...newComment, id: newId };

        // 2. Actualizar la Signal de comentarios
        this.commentsList.update(list => [...list, finalNewComment]);
        console.log('Comentario Creado:', finalNewComment);
    }

    handleUpdate(updatedComment: Comment): void {
        // 1. Actualizar la Signal de comentarios (mapeando y reemplazando el editado)
        this.commentsList.update(list =>
            list.map(c => c.id === updatedComment.id ? updatedComment : c)
        );
        console.log('Comentario Actualizado:', updatedComment);
    }

    deleteComment(commentId: number): void {
        console.log(`Eliminando comentario ID: ${commentId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.commentsList.update(list => list.filter(c => c.id !== commentId));
    }
}

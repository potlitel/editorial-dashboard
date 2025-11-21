import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaces de Datos (Mock Data)
interface Book {
  title: string;
  isbn: string;
}

interface Genre {
  id: number;
  name: string;
  books: Book[];
}

@Component({
  selector: 'app-genre',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <div class="w-full">

      <!-- Título y Acción Principal -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <mat-icon class="mr-2 text-blue-600 dark:text-blue-400 text-3xl">category</mat-icon>
          Gestión de Géneros Literarios
        </h1>
        <button mat-flat-button color="primary" (click)="addGenre()">
          <mat-icon>add</mat-icon>
          Nuevo Género
        </button>
      </div>

      <!-- Contenedor Principal de Géneros -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Género (Loop principal) -->
        <mat-card *ngFor="let genre of genres()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-blue-500/30]="expandedGenreId() === genre.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex items-center justify-between">

            <!-- Nombre y ID -->
            <div class="flex items-center flex-grow">
              <span class="text-xl font-semibold text-gray-800 dark:text-white mr-3">{{ genre.name }}</span>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ genre.id }}</span>
            </div>

            <!-- Contador de Libros -->
            <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center mr-4">
              <mat-icon class="text-base mr-1">menu_book</mat-icon>
              {{ genre.books.length }} Libros
            </div>

            <!-- Acciones de Fila -->
            <div class="flex items-center gap-2">
              <button mat-icon-button (click)="editGenre(genre)" matTooltip="Editar Género">
                <mat-icon class="text-blue-500">edit</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteGenre(genre.id)" matTooltip="Eliminar Género">
                <mat-icon class="text-red-500">delete</mat-icon>
              </button>

              <!-- Botón de Expansión/Contracción -->
              <button mat-icon-button (click)="toggleExpand(genre.id)"
                      matTooltip="{{ expandedGenreId() === genre.id ? 'Ocultar Libros' : 'Ver Libros' }}">
                <mat-icon class="transition-transform duration-300"
                          [class.rotate-180]="expandedGenreId() === genre.id">
                  expand_more
                </mat-icon>
              </button>
            </div>
          </div>

          <!-- Contenido Expandido (Listado de Libros) -->
          <div *ngIf="expandedGenreId() === genre.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Libros en este Género:</h3>

            <div *ngIf="genre.books.length > 0; else noBooks">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div *ngFor="let book of genre.books" class="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                  <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ book.title }}</span>
                  <span class="font-mono text-gray-500 dark:text-gray-400 text-xs ml-4">ISBN: {{ book.isbn }}</span>
                </div>
              </div>
            </div>

            <ng-template #noBooks>
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">No hay libros asociados a este género.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Mensaje si no hay géneros -->
      <div *ngIf="genres().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">bookmark_border</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado géneros literarios.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="addGenre()">Crear el Primero</button>
      </div>

    </div>
  `,
})
export class GenreComponent {

  // --- SIGNALS para el estado de la UI y los Datos ---

  /** * Signal que contiene la lista de géneros.
   * Se inicializa con datos fijos (mock data).
   */
  genres = signal<Genre[]>([
    {
      id: 101,
      name: 'Ficción Contemporánea',
      books: [
        { title: 'La Ciudad de Cristal', isbn: '978-3-16-148410-0' },
        { title: 'El Silencio del Mar', isbn: '978-0-13-708170-9' }
      ]
    },
    {
      id: 102,
      name: 'Thriller Psicológico',
      books: [
        { title: 'El Paciente Silencioso', isbn: '978-1-56619-909-4' }
      ]
    },
    {
      id: 103,
      name: 'Fantasía Épica',
      books: []
    }
  ]);

  /** * Signal que rastrea el ID del género actualmente expandido.
   * Esto controla el comportamiento de acordeón de las tarjetas.
   */
  expandedGenreId = signal<number | null>(null);

  // --- Lógica de la UI (Basada en Signals) ---

  /**
   * Alterna el estado de expansión de una tarjeta.
   * Si el ID ya está expandido, lo contrae (null). Si no, lo expande.
   * @param genreId El ID del género a expandir/contraer.
   */
  toggleExpand(genreId: number): void {
    if (this.expandedGenreId() === genreId) {
      this.expandedGenreId.set(null); // Contrae
    } else {
      this.expandedGenreId.set(genreId); // Expande
    }
  }

  // --- Operaciones CRUD Simuladas (con Comentarios de API) ---

  addGenre(): void {
    console.log('Lógica para abrir modal/formulario de adición de género (Create).');

    // COMENTARIO API:
    // this.apiService.post<Genre>('/api/genres', newGenreData).subscribe({
    //   next: (addedGenre) => this.genres.update(list => [...list, addedGenre]),
    //   error: (err) => console.error('Error al añadir:', err)
    // });
  }

  editGenre(genre: Genre): void {
    console.log(`Lógica para abrir modal/formulario de edición para ID: ${genre.id} (Update).`);

    // COMENTARIO API:
    // this.apiService.put<Genre>(`/api/genres/${genre.id}`, updatedData).subscribe({
    //   next: (updatedGenre) => {
    //     this.genres.update(list => list.map(g => g.id === updatedGenre.id ? updatedGenre : g));
    //   },
    //   error: (err) => console.error('Error al editar:', err)
    // });
  }

  deleteGenre(genreId: number): void {
    if (confirm(`¿Está seguro de eliminar el género ID ${genreId}?`)) {
      console.log(`Eliminando género ID: ${genreId} (Delete).`);

      // Mock de eliminación exitosa, actualizando la Signal
      this.genres.update(list => list.filter(g => g.id !== genreId));

      // Si el género eliminado estaba expandido, contraerlo
      if (this.expandedGenreId() === genreId) {
        this.expandedGenreId.set(null);
      }

      // COMENTARIO API:
      // this.apiService.delete(`/api/genres/${genreId}`).subscribe({
      //   next: () => this.genres.update(list => list.filter(g => g.id !== genreId)),
      //   error: (err) => console.error('Error al eliminar:', err)
      // });
    }
  }

  // --- Carga Inicial de Datos (Simulada) ---

  // COMENTARIO API:
  // En ngOnInit:
  // this.apiService.get<Genre[]>('/api/genres').subscribe({
  //   next: (data) => this.genres.set(data), // Usar .set() para reemplazar todo el array
  //   error: (err) => console.error('No se pudieron cargar los géneros.', err)
  // });
}

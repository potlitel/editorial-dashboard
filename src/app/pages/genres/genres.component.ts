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
import { GenreModalComponent } from './genre-modal/genres.modal.component';

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

// Datos Fijos con más elementos para el paginado
const MOCK_GENRES: Genre[] = [
    { id: 101, name: 'Ficción Contemporánea', books: [{ title: 'La Ciudad de Cristal', isbn: '978-3-16-148410-0' }, { title: 'El Silencio del Mar', isbn: '978-0-13-708170-9' }] },
    { id: 102, name: 'Thriller Psicológico', books: [{ title: 'El Paciente Silencioso', isbn: '978-1-56619-909-4' }, { title: 'El Manuscrito Secreto', isbn: '978-1-56619-909-5' }] },
    { id: 103, name: 'Fantasía Épica', books: [] },
    { id: 104, name: 'Ciencia Ficción Clásica', books: [{ title: 'Dune', isbn: '978-1-56619-909-6' }] },
    { id: 105, name: 'Romance Histórico', books: [{ title: 'El Jardín de Invierno', isbn: '978-1-56619-909-7' }, { title: 'La Promesa', isbn: '978-1-56619-909-8' }, { title: 'Corazones Valientes', isbn: '978-1-56619-909-9' }] },
    { id: 106, name: 'Biografía y Memorias', books: [{ title: 'Una Vida', isbn: '978-1-56619-901-0' }] },
    { id: 107, name: 'Poesía Lírica', books: [{ title: 'El Viento y el Mar', isbn: '978-1-56619-902-1' }] },
    { id: 108, name: 'Misterio y Crimen', books: [{ title: 'El Caso del Hotel', isbn: '978-1-56619-903-2' }] },
    { id: 109, name: 'Literatura Juvenil', books: [{ title: 'Los Cien Días', isbn: '978-1-56619-904-3' }] },
    { id: 110, name: 'Terror y Horror', books: [{ title: 'La Casa Oscura', isbn: '978-1-56619-905-4' }] }
];

@Component({
  selector: 'app-genre',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatTooltipModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatListModule
  ],
  template: `
    <div class="w-full p-4">

      <!-- Título y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Género</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterGenres()" class="dark:text-white" placeholder="Ej. Fantasía, Thriller">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openGenreModal()">
          <mat-icon>add</mat-icon>
          Nuevo Género
        </button>
      </div>



      <!-- Contenedor Principal de Géneros -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Género (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let genre of paginatedGenres()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-blue-500/30]="expandedGenreId() === genre.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre y ID -->
            <div class="flex items-center flex-grow mb-3 sm:mb-0">
              <span class="text-xl font-semibold text-gray-800 dark:text-white mr-3">{{ genre.name }}</span>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ genre.id }}</span>
            </div>

            <!-- Contador de Libros y Acciones -->
            <div class="flex items-center gap-4">
              <!-- Contador de Libros -->
              <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center shrink-0">
                <mat-icon class="text-base mr-1">menu_book</mat-icon>
                {{ genre.books.length }} Libros
              </div>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openGenreModal(genre)" matTooltip="Editar Género">
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
          </div>

          <!-- Contenido Expandido (Listado de Libros) -->
          <div *ngIf="expandedGenreId() === genre.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-yellow-600">list_alt</mat-icon> Libros Asociados:
            </h3>

            <div *ngIf="genre.books.length > 0; else noBooks">
              <!-- USO DE LISTA DESORDENADA (UL) CON ICONOS -->
              <ul class="space-y-2">
                <li *ngFor="let book of genre.books"
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
              <p class="text-center text-gray-500 dark:text-gray-400 py-4">No hay libros asociados a este género.</p>
            </ng-template>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredGenres().length"
                     [pageSize]="pageSize()"
                     [pageSizeOptions]="[5, 10, 20]"
                     [pageIndex]="pageIndex()"
                     (page)="handlePageEvent($event)"
                     aria-label="Seleccionar página de géneros"
                     class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay géneros -->
      <div *ngIf="genres().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">bookmark_border</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado géneros literarios.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openGenreModal()">Crear el Primero</button>
      </div>

    </div>
  `,
})
export class GenreComponent {
  private dialog = inject(MatDialog);

  // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---

  /** Lista completa de géneros (mock data). Es la fuente de verdad. */
  genres = signal<Genre[]>(MOCK_GENRES);

  /** * Signal que rastrea el ID del género actualmente expandido.
   * Esto controla el comportamiento de acordeón de las tarjetas.
   */
  expandedGenreId = signal<number | null>(null);

  // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPONENTE ANGULAR) ---

  /** Término de búsqueda para filtrar la lista. Usado con FormsModule. */
  searchTerm: string = '';

  /** Estado del paginador: página actual (0-indexed). */
  pageIndex = signal(0);

  /** Estado del paginador: cantidad de ítems por página. */
  pageSize = signal(5);

  /**
   * COMPUTED: Filtra la lista de géneros basándose en el término de búsqueda.
   * Se re-calcula automáticamente cuando 'genres' o 'searchTerm' cambian.
   */
  filteredGenres = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    const list = this.genres();

    if (!term) {
      return list;
    }

    return list.filter(genre =>
      genre.name.toLowerCase().includes(term) ||
      genre.id.toString().includes(term)
    );
  });

  /**
   * COMPUTED: Aplica el paginado a la lista ya filtrada.
   * Se re-calcula automáticamente cuando 'filteredGenres', 'pageIndex' o 'pageSize' cambian.
   */
  paginatedGenres = computed(() => {
    const list = this.filteredGenres();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

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

  /**
   * Maneja el cambio de página y/o tamaño de página del paginador.
   * Actualiza las Signals de paginado, lo que automáticamente actualiza paginatedGenres.
   * @param event El evento PageEvent de MatPaginator.
   */
  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  /**
   * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
   */
  filterGenres(): void {
    this.pageIndex.set(0);
    // La signal 'filteredGenres' se actualiza automáticamente con el nuevo 'searchTerm'
  }

  // --- Operaciones CRUD (Uso de Modals) ---

  /**
   * Abre el modal para crear o editar un género.
   * @param genre El género a editar, o null/undefined para crear uno nuevo.
   */
  openGenreModal(genre?: Genre): void {
    const dialogRef = this.dialog.open(GenreModalComponent, {
      width: '500px',
      data: { genre: genre ? { ...genre } : null }, // Pasamos una copia para no modificar el original
      // NOTA: Se necesita una clase CSS global o en el main component para que los diálogos
      // hereden el tema oscuro de fondo.
      // panelClass: 'dialog-container-dark'
    });

    // Se subscribe al resultado del modal
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Lógica para manejar la respuesta del modal (creación o actualización)
        if (result.isNew) {
          this.handleCreate(result.genre);
        } else {
          this.handleUpdate(result.genre);
        }
      }
    });
  }

  handleCreate(newGenre: Genre): void {
    // 1. Asignar un ID temporal para el mock
    const newId = Math.max(...this.genres().map(g => g.id)) + 1;
    const finalNewGenre = { ...newGenre, id: newId };

    // 2. Actualizar la Signal de géneros (agregando el nuevo)
    this.genres.update(list => [...list, finalNewGenre]);

    // COMENTARIO API (Create):
    // this.apiService.post<Genre>('/api/genres', newGenreData).subscribe({
    //   next: (addedGenre) => this.genres.update(list => [...list, addedGenre]),
    //   error: (err) => console.error('Error al crear:', err)
    // });
  }

  handleUpdate(updatedGenre: Genre): void {
    // 1. Actualizar la Signal de géneros (mapeando y reemplazando el editado)
    this.genres.update(list =>
      list.map(g => g.id === updatedGenre.id ? updatedGenre : g)
    );

    // COMENTARIO API (Update):
    // this.apiService.put<Genre>(`/api/genres/${updatedGenre.id}`, updatedGenre).subscribe({
    //   next: (result) => this.genres.update(list => list.map(g => g.id === result.id ? result : g)),
    //   error: (err) => console.error('Error al actualizar:', err)
    // });
  }

  deleteGenre(genreId: number): void {
    // Simulación de una confirmación de usuario
    console.log(`Eliminando género ID: ${genreId} (Delete).`);

    // Actualizar la Signal de eliminación
    this.genres.update(list => list.filter(g => g.id !== genreId));

    // Si el género eliminado estaba expandido, contraerlo
    if (this.expandedGenreId() === genreId) {
      this.expandedGenreId.set(null);
    }

    // COMENTARIO API (Delete):
    // this.apiService.delete(`/api/genres/${genreId}`).subscribe({
    //   next: () => this.genres.update(list => list.filter(g => g.id !== genreId)),
    //   error: (err) => console.error('Error al eliminar:', err)
    // });
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

  deleteGenree(genreId: number): void {
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

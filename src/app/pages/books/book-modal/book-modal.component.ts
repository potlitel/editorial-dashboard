import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// --- Interfaces de Datos (Reutilizadas/Nuevas para el Contexto) ---
interface AuthorMock { id: number; name: string; }
interface PublisherMock { id: number; name: string; }
interface SeriesMock { id: number; name: string; }
interface EditorMock { id: number; name: string; }
interface GenreMock { id: number; name: string; }

interface Book {
    id: number;
    title: string;
    isbn: string;
    publicationYear: number;
    // Relaciones M:1 (IDs)
    authorId: number;
    publisherId: number;
    seriesId: number | null; // Opcional
    // Relaciones M:M (Arrays de IDs)
    editorIds: number[];
    genreIds: number[];
    // Lado Inverso 1:M (Reviews se gestionan desde otro componente)
}

interface DialogData {
    book: Book | null;
}

// --- MOCK Data para las Relaciones ---
const MOCK_AUTHORS: AuthorMock[] = [{ id: 101, name: 'Isaac Asimov' }, { id: 102, name: 'Gabriel García Márquez' }, { id: 103, name: 'J.R.R. Tolkien' }];
const MOCK_PUBLISHERS: PublisherMock[] = [{ id: 201, name: 'Debolsillo' }, { id: 202, name: 'Minotauro' }, { id: 203, name: 'Sudamericana' }];
const MOCK_SERIES: SeriesMock[] = [{ id: 301, name: 'Trilogía Fundación' }, { id: 302, name: 'Serie Cien Años' }, { id: 303, name: 'El Señor de los Anillos' }];
const MOCK_EDITORS: EditorMock[] = [{ id: 501, name: 'Elena Ramírez' }, { id: 502, name: 'Javier Alonso' }, { id: 503, name: 'Carmen Soto' }];
const MOCK_GENRES: GenreMock[] = [{ id: 601, name: 'Ciencia Ficción' }, { id: 602, name: 'Realismo Mágico' }, { id: 603, name: 'Fantasía Épica' }, { id: 604, name: 'Novela' }];


@Component({
    selector: 'app-books-modal',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule, MatSelectModule
    ],
    template: `
    <div class="p-4 dark:bg-gray-800 rounded-lg">
      <h2 class="text-2xl font-bold dark:text-white mb-4 border-b dark:border-gray-700 pb-2 flex items-center">
        <mat-icon class="mr-2 text-red-400">{{ isEditMode() ? 'book' : 'library_add' }}</mat-icon>
        {{ isEditMode() ? 'Editar Libro' : 'Registrar Nuevo Libro' }}
      </h2>

      <!-- Mensaje de Error -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg" role="alert">
        <mat-icon class="align-middle mr-2 text-red-500">error</mat-icon>
        {{ errorMessage() }}
      </div>

      <form [formGroup]="bookForm" (ngSubmit)="saveBook()">

        <!-- Título y ISBN (Fila 1) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <mat-form-field appearance="outline" class="col-span-2 mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Título</mat-label>
                <input matInput formControlName="title" required class="dark:text-white" placeholder="Ej. Un Mundo Feliz">
                <mat-icon matSuffix>title</mat-icon>
                <mat-error *ngIf="bookForm.get('title')?.hasError('required')">El título es obligatorio</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Año Publicación</mat-label>
                <input matInput formControlName="publicationYear" type="number" required class="dark:text-white" placeholder="Ej. 1951">
                <mat-icon matSuffix>date_range</mat-icon>
                <mat-error *ngIf="bookForm.get('publicationYear')?.hasError('required')">El año es obligatorio</mat-error>
            </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">ISBN</mat-label>
            <input matInput formControlName="isbn" required class="dark:text-white" placeholder="Ej. 978-0571086047">
            <mat-icon matSuffix>barcode</mat-icon>
            <mat-error *ngIf="bookForm.get('isbn')?.hasError('required')">El ISBN es obligatorio</mat-error>
        </mat-form-field>

        <!-- Relaciones M:1 (Fila 2: Author, Publisher) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <mat-form-field appearance="outline" class="mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Autor</mat-label>
                <mat-select formControlName="authorId" required class="dark:text-white">
                    <mat-option *ngFor="let author of mockAuthors" [value]="author.id">{{ author.name }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="bookForm.get('authorId')?.hasError('required')">El autor es obligatorio</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Editorial</mat-label>
                <mat-select formControlName="publisherId" required class="dark:text-white">
                    <mat-option *ngFor="let publisher of mockPublishers" [value]="publisher.id">{{ publisher.name }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>business</mat-icon>
                <mat-error *ngIf="bookForm.get('publisherId')?.hasError('required')">La editorial es obligatoria</mat-error>
            </mat-form-field>
        </div>

        <!-- Relaciones M:1 (Fila 3: Series - Opcional) -->
        <mat-form-field appearance="outline" class="w-full mat-form-field-dark mb-4">
            <mat-label class="dark:text-gray-300">Serie (Opcional)</mat-label>
            <mat-select formControlName="seriesId" class="dark:text-white">
                <mat-option [value]="null">-- Ninguna Serie --</mat-option>
                <mat-option *ngFor="let series of mockSeries" [value]="series.id">{{ series.name }}</mat-option>
            </mat-select>
            <mat-icon matSuffix>view_day</mat-icon>
        </mat-form-field>

        <!-- Relaciones M:M (Fila 4: Editors, Genres) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <mat-form-field appearance="outline" class="mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Editores</mat-label>
                <mat-select formControlName="editorIds" multiple required class="dark:text-white">
                    <mat-option *ngFor="let editor of mockEditors" [value]="editor.id">{{ editor.name }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>people</mat-icon>
                <mat-error *ngIf="bookForm.get('editorIds')?.hasError('required')">Debe seleccionar al menos un editor</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="mat-form-field-dark">
                <mat-label class="dark:text-gray-300">Géneros</mat-label>
                <mat-select formControlName="genreIds" multiple required class="dark:text-white">
                    <mat-option *ngFor="let genre of mockGenres" [value]="genre.id">{{ genre.name }}</mat-option>
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
                <mat-error *ngIf="bookForm.get('genreIds')?.hasError('required')">Debe seleccionar al menos un género</mat-error>
            </mat-form-field>
        </div>


        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4">
          <button mat-button type="button" (click)="dialogRef.close()" class="dark:text-gray-400">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="bookForm.invalid || isLoading()" class="text-lg">
            <span *ngIf="!isLoading()">{{ isEditMode() ? 'Guardar Libro' : 'Registrar Libro' }}</span>
            <mat-spinner *ngIf="isLoading()" [diameter]="24" color="accent"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class BooksModalComponent {
    private fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<BooksModalComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA);

    // Mocks disponibles en el componente
    public mockAuthors = MOCK_AUTHORS;
    public mockPublishers = MOCK_PUBLISHERS;
    public mockSeries = MOCK_SERIES;
    public mockEditors = MOCK_EDITORS;
    public mockGenres = MOCK_GENRES;

    // --- SIGNALS para el estado local del modal ---
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);
    public isEditMode = signal(!!this.data.book);

    // Inicialización del formulario
    bookForm = this.fb.group({
        id: [this.data.book?.id || null],
        title: [this.data.book?.title || '', [Validators.required, Validators.maxLength(255)]],
        isbn: [this.data.book?.isbn || '', [Validators.required, Validators.maxLength(20)]],
        publicationYear: [this.data.book?.publicationYear || null, [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())]],

        // Relaciones M:1
        authorId: [this.data.book?.authorId || null, [Validators.required]],
        publisherId: [this.data.book?.publisherId || null, [Validators.required]],
        seriesId: [this.data.book?.seriesId || null],

        // Relaciones M:M
        editorIds: [this.data.book?.editorIds || [], [Validators.required]],
        genreIds: [this.data.book?.genreIds || [], [Validators.required]],
    });

    saveBook(): void {
        this.errorMessage.set(null);
        if (this.bookForm.invalid) {
            this.bookForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete todos los campos obligatorios del libro.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.bookForm.getRawValue();

        const payload: Book = {
            id: formValue.id || 0,
            title: formValue.title!,
            isbn: formValue.isbn!,
            publicationYear: formValue.publicationYear!,
            authorId: formValue.authorId!,
            publisherId: formValue.publisherId!,
            seriesId: formValue.seriesId,
            editorIds: formValue.editorIds!,
            genreIds: formValue.genreIds!,
        };

        // --- Lógica Asíncrona Simulada ---
        setTimeout(() => {
            this.isLoading.set(false);
            console.log(this.isEditMode() ? 'Edición simulada de libro:' : 'Creación simulada de libro:', payload);

            // Cerrar el modal y retornar el resultado
            this.dialogRef.close({
                book: payload,
                isNew: !this.isEditMode()
            });

        }, 1000);
    }
}

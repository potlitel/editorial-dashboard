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

// Componentes de la aplicación
import { UsersModalComponent } from './user-modal/user-modal.component';

// Interfaces de Datos
interface User {
    id: number;
    email: string;
    username: string;
    followingIds: number[]; // IDs de usuarios que sigue
    followerIds: number[]; // IDs de usuarios que lo siguen
}

// Datos Fijos (Mock) para Usuarios
const MOCK_USERS: User[] = [
    { id: 901, email: 'alice@example.com', username: 'alice_reads', followingIds: [902, 903], followerIds: [902] },
    { id: 902, email: 'bob@example.com', username: 'bob_writer', followingIds: [901, 904], followerIds: [901, 903] },
    { id: 903, email: 'charlie@example.com', username: 'charlie_critic', followingIds: [902], followerIds: [901, 904] },
    { id: 904, email: 'diana@example.com', username: 'diana_bookworm', followingIds: [903], followerIds: [902, 903] },
    { id: 905, email: 'eve@example.com', username: 'eve_rookie', followingIds: [], followerIds: [] },
];

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,
        MatPaginatorModule, MatFormFieldModule, MatInputModule,
        MatDividerModule, MatListModule, MatChipsModule,
        UsersModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título, Filtro y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Usuario</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterUsers()" class="dark:text-white" placeholder="Ej. alice, writer, example.com">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openUserModal()">
          <mat-icon>person_add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <!-- Contenedor Principal de Usuarios -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Usuario (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let user of paginatedUsers()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-indigo-500/30]="expandedUserId() === user.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Nombre de Usuario y Email -->
            <div class="flex items-start flex-col mb-3 sm:mb-0 flex-grow">
              <span class="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <mat-icon class="mr-2 text-indigo-400">account_circle</mat-icon>
                {{ user.username }}
              </span>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <mat-icon class="text-base mr-1">email</mat-icon>
                {{ user.email }}
              </span>
            </div>

            <!-- Información y Acciones -->
            <div class="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
              <!-- Contador de Relaciones -->
              <span class="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">person_add</mat-icon>
                Siguiendo: {{ user.followingIds.length }}
              </span>
              <span class="text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <mat-icon class="text-base mr-1">group</mat-icon>
                Seguidores: {{ user.followerIds.length }}
              </span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openUserModal(user)" matTooltip="Editar Usuario">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteUser(user.id)" matTooltip="Eliminar Usuario">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción -->
                <button mat-icon-button (click)="toggleExpand(user.id)"
                        matTooltip="{{ expandedUserId() === user.id ? 'Ocultar Relaciones' : 'Ver Relaciones' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedUserId() === user.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Listado de Following/Followers) -->
          <div *ngIf="expandedUserId() === user.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <div class="grid md:grid-cols-2 gap-6">
                <!-- COLUMNA 1: Siguiendo (Following) -->
                <div>
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                        <mat-icon class="mr-1 text-amber-600">person_add</mat-icon> Siguiendo ({{ user.followingIds.length }})
                    </h3>
                    <div *ngIf="user.followingIds.length > 0; else noFollowing">
                        <mat-chip-listbox aria-label="Usuarios que sigue">
                            <mat-chip *ngFor="let id of user.followingIds" color="accent" selected>
                                {{ getUserNameById(id) }}
                            </mat-chip>
                        </mat-chip-listbox>
                    </div>
                    <ng-template #noFollowing>
                        <p class="text-center text-gray-500 dark:text-gray-400 py-4 italic">No sigue a ningún otro usuario.</p>
                    </ng-template>
                </div>

                <!-- COLUMNA 2: Seguidores (Followers) -->
                <div>
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                        <mat-icon class="mr-1 text-teal-600">group</mat-icon> Seguidores ({{ user.followerIds.length }})
                    </h3>
                    <div *ngIf="user.followerIds.length > 0; else noFollowers">
                        <mat-chip-listbox aria-label="Usuarios que siguen a este usuario">
                            <mat-chip *ngFor="let id of user.followerIds" color="primary" selected>
                                {{ getUserNameById(id) }}
                            </mat-chip>
                        </mat-chip-listbox>
                    </div>
                    <ng-template #noFollowers>
                        <p class="text-center text-gray-500 dark:text-gray-400 py-4 italic">Aún no tiene seguidores.</p>
                    </ng-template>
                </div>
            </div>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredUsers().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de usuarios"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay usuarios -->
      <div *ngIf="usersList().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">sentiment_dissatisfied</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado usuarios en la plataforma.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openUserModal()">Crear el Primer Usuario</button>
      </div>

    </div>
  `,
})
export class UsersComponent {
    private dialog = inject(MatDialog);

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de usuarios. */
    usersList = signal<User[]>(MOCK_USERS);

    /** ID del usuario que actualmente tiene la tarjeta expandida. */
    expandedUserId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPUTED) ---
    searchTerm: string = '';
    pageIndex = signal(0);
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de usuarios basándose en el término de búsqueda (username o email).
     */
    filteredUsers = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.usersList();

        if (!term) {
            return list;
        }

        return list.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedUsers = computed(() => {
        const list = this.filteredUsers();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Resuelve el nombre de usuario dado un ID. Utilizado en la vista expandida.
     */
    getUserNameById(id: number): string {
        return this.usersList().find(u => u.id === id)?.username || `Usuario ID ${id} (No encontrado)`;
    }

    /**
     * Alterna la expansión de una tarjeta.
     */
    toggleExpand(userId: number): void {
        if (this.expandedUserId() === userId) {
            this.expandedUserId.set(null);
        } else {
            this.expandedUserId.set(userId);
        }
    }

    /**
     * Maneja el cambio de página y/o tamaño de página del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
        // Colapsar si cambiamos de página
        this.expandedUserId.set(null);
    }

    /**
     * Reinicia el índice de página a 0 cada vez que se aplica un filtro.
     */
    filterUsers(): void {
        this.pageIndex.set(0);
        // Colapsar si cambiamos el filtro
        this.expandedUserId.set(null);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar un usuario.
     */
    openUserModal(user?: User): void {
        const dialogRef = this.dialog.open(UsersModalComponent, {
            width: '450px',
            data: {
                user: user ? { ...user } : null,
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.user) {
                if (result.isNew) {
                    this.handleCreate(result.user);
                } else {
                    this.handleUpdate(result.user);
                }
            }
        });
    }

    handleCreate(newUser: User): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.usersList().map(u => u.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 901;
        const finalNewUser = { ...newUser, id: newId, followingIds: [], followerIds: [] }; // Nuevos usuarios empiezan sin relaciones

        // 2. Actualizar la Signal de usuarios
        this.usersList.update(list => [...list, finalNewUser]);
        console.log('Usuario Creado:', finalNewUser);
    }

    handleUpdate(updatedUser: User): void {
        // 1. Actualizar la Signal de usuarios (mapeando y reemplazando el editado)
        this.usersList.update(list =>
            list.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        console.log('Usuario Actualizado:', updatedUser);
    }

    deleteUser(userId: number): void {
        console.log(`Eliminando usuario ID: ${userId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.usersList.update(list => list.filter(u => u.id !== userId));
    }
}

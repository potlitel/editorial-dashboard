import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { ContractModalComponent } from './contract-modal/contract-modal.component';

// Interfaces de Datos
interface Author {
    id: number;
    firstName: string;
    lastName: string;
}

interface Contract {
    id: number;
    dateSigned: string; // YYYY-MM-DD
    royaltyRate: number; // Porcentaje
    author: Author;
}

// Datos Fijos para Autores (Mismos IDs que el mock de AutorComponent para coherencia)
const MOCK_AUTHORS: Author[] = [
    { id: 201, firstName: 'Laura', lastName: 'Gallego' },
    { id: 202, firstName: 'Haruki', lastName: 'Murakami' },
    { id: 203, firstName: 'Gabriel García', lastName: 'Márquez' },
    { id: 204, firstName: 'Jane', lastName: 'Austen' },
    { id: 205, firstName: 'George R.R.', lastName: 'Martin' },
];

// Datos Fijos para Contratos
const MOCK_CONTRACTS: Contract[] = [
    { id: 301, dateSigned: '2023-10-15', royaltyRate: 15, author: MOCK_AUTHORS[0] }, // Laura Gallego
    { id: 302, dateSigned: '2022-04-20', royaltyRate: 12, author: MOCK_AUTHORS[1] }, // Haruki Murakami
    { id: 303, dateSigned: '2024-01-01', royaltyRate: 18, author: MOCK_AUTHORS[2] }, // Gabriel García Márquez
    { id: 304, dateSigned: '2023-11-30', royaltyRate: 10, author: MOCK_AUTHORS[4] }, // George R.R. Martin
    { id: 305, dateSigned: '2021-08-05', royaltyRate: 20, author: MOCK_AUTHORS[0] }, // Laura Gallego (segundo contrato)
];

@Component({
    selector: 'app-contract',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule, DatePipe,
        MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
        MatTooltipModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatListModule,
        ContractModalComponent
    ],
    template: `
    <div class="w-full p-4">

      <!-- Título y Acción Principal -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <!-- Filtro de Búsqueda -->
        <mat-form-field appearance="outline" class="w-full max-w-sm mb-6 mat-form-field-dark">
          <mat-label class="dark:text-gray-300">Buscar Contrato</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterContracts()" class="dark:text-white" placeholder="Ej. Murakami, 15%">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openContractModal()">
          <mat-icon>post_add</mat-icon>
          Nuevo Contrato
        </button>
      </div>

      <!-- Contenedor Principal de Contratos -->
      <div class="space-y-4 w-full">

        <!-- Tarjeta de Contrato (Loop principal sobre la lista PAGINADA) -->
        <mat-card *ngFor="let contract of paginatedContracts()"
                  class="rounded-xl shadow-lg dark:bg-gray-800 transition-shadow duration-300 overflow-hidden"
                  [class.shadow-yellow-500/30]="expandedContractId() === contract.id">

          <!-- Encabezado de la Tarjeta (Fila) -->
          <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">

            <!-- Autor y Tasa de Regalías -->
            <div class="flex items-center flex-grow mb-3 sm:mb-0 flex-wrap gap-x-4">
              <span class="text-xl font-semibold text-gray-800 dark:text-white mr-3">
                <mat-icon class="align-sub text-blue-400">person</mat-icon>
                {{ contract.author.firstName }} {{ contract.author.lastName }}
              </span>
              <span class="text-lg font-mono text-green-600 dark:text-green-400">
                <mat-icon class="align-sub text-lg">paid</mat-icon>
                {{ contract.royaltyRate }}%
              </span>
            </div>

            <!-- ID y Acciones -->
            <div class="flex items-center gap-4 shrink-0">
              <!-- ID del Contrato -->
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">ID: {{ contract.id }}</span>

              <!-- Acciones de Fila -->
              <div class="flex items-center gap-2">
                <button mat-icon-button (click)="openContractModal(contract)" matTooltip="Editar Contrato">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteContract(contract.id)" matTooltip="Eliminar Contrato">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>

                <!-- Botón de Expansión/Contracción (Detalles de Fecha) -->
                <button mat-icon-button (click)="toggleExpand(contract.id)"
                        matTooltip="{{ expandedContractId() === contract.id ? 'Ocultar Detalles' : 'Ver Detalles' }}">
                  <mat-icon class="transition-transform duration-300"
                            [class.rotate-180]="expandedContractId() === contract.id">
                    expand_more
                  </mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido Expandido (Detalles del Contrato) -->
          <div *ngIf="expandedContractId() === contract.id"
               class="bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 border-t dark:border-gray-700 p-4">

            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <mat-icon class="mr-1 text-teal-600">info</mat-icon> Detalles de la Transacción:
            </h3>

            <div class="flex flex-col sm:flex-row justify-around gap-4 text-sm">
                <!-- Fecha de Firma -->
                <div class="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md flex-1">
                    <mat-icon class="mr-2 text-indigo-500 shrink-0">event</mat-icon>
                    <div>
                        <p class="font-medium text-gray-600 dark:text-gray-400">Fecha de Firma</p>
                        <p class="text-gray-800 dark:text-white font-semibold">
                            {{ contract.dateSigned | date:'longDate' }}
                        </p>
                    </div>
                </div>

                <!-- Tasa de Regalías Repetida para énfasis -->
                <div class="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md flex-1">
                    <mat-icon class="mr-2 text-green-500 shrink-0">money</mat-icon>
                    <div>
                        <p class="font-medium text-gray-600 dark:text-gray-400">Tasa de Regalías</p>
                        <p class="text-gray-800 dark:text-white font-semibold text-2xl">
                            {{ contract.royaltyRate }}%
                        </p>
                    </div>
                </div>
            </div>

          </div>

        </mat-card>
      </div>

      <!-- Paginador -->
      <mat-paginator [length]="filteredContracts().length"
                      [pageSize]="pageSize()"
                      [pageSizeOptions]="[5, 10, 20]"
                      [pageIndex]="pageIndex()"
                      (page)="handlePageEvent($event)"
                      aria-label="Seleccionar página de contratos"
                      class="mt-6 dark:bg-gray-800 dark:text-white rounded-xl">
      </mat-paginator>

      <!-- Mensaje si no hay contratos -->
      <div *ngIf="contracts().length === 0" class="text-center py-12 dark:text-gray-400">
          <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">description</mat-icon>
          <p class="mt-2 text-lg">Aún no se han registrado contratos.</p>
          <button mat-flat-button color="accent" class="mt-4" (click)="openContractModal()">Crear el Primero</button>
      </div>

    </div>
  `,
})
export class ContractComponent {
    private dialog = inject(MatDialog);
    public availableAuthors = MOCK_AUTHORS; // Lista de autores para pasar al modal

    // --- ESTADO PRINCIPAL DE DATOS Y UI (SIGNALS) ---
    /** Lista completa de contratos (mock data). */
    contracts = signal<Contract[]>(MOCK_CONTRACTS);

    /** Signal que rastrea el ID del contrato actualmente expandido. */
    expandedContractId = signal<number | null>(null);

    // --- ESTADO DE PAGINADO Y FILTRO (SIGNALS Y COMPONENTE ANGULAR) ---

    /** Término de búsqueda para filtrar la lista. */
    searchTerm: string = '';

    /** Estado del paginador: página actual (0-indexed). */
    pageIndex = signal(0);

    /** Estado del paginador: cantidad de ítems por página. */
    pageSize = signal(5);

    /**
     * COMPUTED: Filtra la lista de contratos basándose en el término de búsqueda.
     */
    filteredContracts = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        const list = this.contracts();

        if (!term) {
            return list;
        }

        return list.filter(contract =>
            contract.author.firstName.toLowerCase().includes(term) ||
            contract.author.lastName.toLowerCase().includes(term) ||
            contract.dateSigned.includes(term) || // Permite buscar por año/mes
            contract.royaltyRate.toString().includes(term)
        );
    });

    /**
     * COMPUTED: Aplica el paginado a la lista ya filtrada.
     */
    paginatedContracts = computed(() => {
        const list = this.filteredContracts();
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return list.slice(start, end);
    });

    // --- Lógica de la UI (Basada en Signals) ---

    /**
     * Alterna el estado de expansión de una tarjeta.
     */
    toggleExpand(contractId: number): void {
        if (this.expandedContractId() === contractId) {
            this.expandedContractId.set(null); // Contrae
        } else {
            this.expandedContractId.set(contractId); // Expande
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
    filterContracts(): void {
        this.pageIndex.set(0);
    }

    // --- Operaciones CRUD (Uso de Modals) ---

    /**
     * Abre el modal para crear o editar un contrato.
     */
    openContractModal(contract?: Contract): void {
        const dialogRef = this.dialog.open(ContractModalComponent, {
            width: '500px',
            data: {
                contract: contract ? { ...contract } : null,
                availableAuthors: this.availableAuthors, // Pasar la lista de autores
            },
        });

        // Se subscribe al resultado del modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.isNew) {
                    this.handleCreate(result.contract);
                } else {
                    this.handleUpdate(result.contract);
                }
            }
        });
    }

    handleCreate(newContract: Contract): void {
        // 1. Asignar un ID temporal para el mock
        const currentIds = this.contracts().map(c => c.id);
        const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 301;
        const finalNewContract = { ...newContract, id: newId };

        // 2. Actualizar la Signal de contratos
        this.contracts.update(list => [...list, finalNewContract]);
        console.log('Contrato Creado:', finalNewContract);

        // COMENTARIO API (Create):
        // this.apiService.post<Contract>('/api/contracts', newContractData).subscribe(...)
    }

    handleUpdate(updatedContract: Contract): void {
        // 1. Actualizar la Signal de contratos (mapeando y reemplazando el editado)
        this.contracts.update(list =>
            list.map(c => c.id === updatedContract.id ? updatedContract : c)
        );
        console.log('Contrato Actualizado:', updatedContract);

        // COMENTARIO API (Update):
        // this.apiService.put<Contract>(`/api/contracts/${updatedContract.id}`, updatedContract).subscribe(...)
    }

    deleteContract(contractId: number): void {
        console.log(`Eliminando contrato ID: ${contractId} (Delete).`);

        // Actualizar la Signal de eliminación
        this.contracts.update(list => list.filter(c => c.id !== contractId));

        // Si el contrato eliminado estaba expandido, contraerlo
        if (this.expandedContractId() === contractId) {
            this.expandedContractId.set(null);
        }

        // COMENTARIO API (Delete):
        // this.apiService.delete(`/api/contracts/${contractId}`).subscribe(...)
    }
}

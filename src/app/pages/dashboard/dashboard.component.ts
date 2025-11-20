import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Añadido CurrencyPipe si no está globalmente
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/services/api.service';

// Interfaz para datos dummy
export interface Transaction {
  id: string;
  user: string;
  date: Date;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule,
    // El CurrencyPipe es necesario para el pipe 'currency' en el template
    CurrencyPipe
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Tarjetas: Se mantiene el dark:bg-gray-800 en mat-card -->
      <mat-card *ngFor="let card of cards" class="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <!-- Texto de la tarjeta ajustado para Dark Mode -->
            <p class="text-gray-500 text-sm font-medium uppercase dark:text-gray-400">{{card.title}}</p>
            <h3 class="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{{card.value}}</h3>
          </div>
          <div [class]="'p-3 rounded-full ' + card.colorBg">
            <mat-icon [class]="card.colorText">{{card.icon}}</mat-icon>
          </div>
        </div>
      </mat-card>
    </div>

    <!-- Título ajustado para Dark Mode -->
    <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Transacciones Recientes</h2>

    <!-- Form Field: Se añade 'mat-form-field-dark' para estilos internos -->
    <mat-form-field appearance="outline" class="w-full md:w-1/3 rounded-lg mat-form-field-dark">
      <mat-label>Buscar</mat-label>
      <!-- Input: El color del texto del input debe ser blanco/claro en Dark Mode -->
      <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Juan Perez" #input class="text-gray-800 dark:text-white">
      <!-- Icono: Se ajusta el color del icono en Dark Mode -->
      <mat-icon matSuffix class="dark:text-gray-400">search</mat-icon>
    </mat-form-field>

    <!-- Tabla: Se aplica la clase de fondo a la tabla misma para que herede el color. -->
    <div class="mat-elevation-z8 rounded-lg overflow-hidden bg-white dark:bg-gray-800 border dark:border-gray-700">
      <table mat-table [dataSource]="dataSource" matSort class="w-full">

        <!-- Columnas: Añadimos dark:text-white/dark:text-gray-200 para el texto de la tabla -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="dark:text-white"> ID </th>
          <td mat-cell *matCellDef="let row" class="dark:text-gray-200"> {{row.id}} </td>
        </ng-container>

        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="dark:text-white"> Usuario </th>
          <td mat-cell *matCellDef="let row" class="dark:text-gray-200"> {{row.user}} </td>
        </ng-container>

        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="dark:text-white"> Monto </th>
          <td mat-cell *matCellDef="let row" class="dark:text-gray-200"> {{row.amount | currency}} </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="dark:text-white"> Estado </th>
          <td mat-cell *matCellDef="let row">
            <!-- Los estados ya usan clases relativas al color y Tailwind (ej: text-green-800),
                 que generalmente funcionan bien. Si necesitas Dark Mode en los estados,
                 tendrías que añadir clases dark:text-green-300 dark:bg-green-900/50 -->
            <span [ngClass]="{
              'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': row.status === 'Completed',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': row.status === 'Pending',
              'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': row.status === 'Failed'
            }" class="px-2 py-1 rounded-full text-xs font-bold">
              {{row.status}}
            </span>
          </td>
        </ng-container>

        <!-- Filas y encabezados. El fondo de la tabla ahora se maneja por la clase 'dark:bg-gray-800' en el div contenedor -->
        <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-100 dark:bg-gray-700"></tr>
        <!-- Las filas alternan color para mejorar lectura en Dark Mode -->
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-white dark:even:bg-gray-800 odd:bg-gray-50 dark:odd:bg-gray-800/80"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell dark:text-gray-400" colspan="4">No hay datos para "{{input.value}}"</td>
        </tr>
      </table>

      <!-- Paginador: Necesita estilos globales para el Dark Mode (ver paso siguiente) -->
      <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);

  displayedColumns: string[] = ['id', 'user', 'amount', 'status'];
  dataSource: MatTableDataSource<Transaction>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Datos Dummy para las Cards
  cards = [
    { title: 'Ventas Totales', value: '$24,500', icon: 'payments', colorBg: 'bg-green-100', colorText: 'text-green-600' },
    { title: 'Nuevos Usuarios', value: '+120', icon: 'group_add', colorBg: 'bg-blue-100', colorText: 'text-blue-600' },
    { title: 'Tareas', value: '12', icon: 'assignment', colorBg: 'bg-orange-100', colorText: 'text-orange-600' },
    { title: 'Alertas', value: '3', icon: 'warning', colorBg: 'bg-red-100', colorText: 'text-red-600' },
  ];

  constructor() {
    // Datos dummy iniciales (aquí llamarías a this.api.get<Transaction[]>...)
    const users: Transaction[] = Array.from({length: 20}, (_, k) => ({
      id: `TRX-${k + 1}`,
      user: `Usuario ${k + 1}`,
      date: new Date(),
      amount: Math.floor(Math.random() * 1000),
      status: k % 3 === 0 ? 'Failed' : (k % 2 === 0 ? 'Completed' : 'Pending')
    }));

    this.dataSource = new MatTableDataSource(users);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

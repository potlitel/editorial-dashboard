import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <mat-card *ngFor="let card of cards" class="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm font-medium uppercase">{{card.title}}</p>
            <h3 class="text-2xl font-bold mt-1">{{card.value}}</h3>
          </div>
          <div [class]="'p-3 rounded-full ' + card.colorBg">
            <mat-icon [class]="card.colorText">{{card.icon}}</mat-icon>
          </div>
        </div>
      </mat-card>
    </div>

    <h2 class="text-xl font-semibold mb-4">Transacciones Recientes</h2>

    <mat-form-field appearance="outline" class="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg">
      <mat-label>Buscar</mat-label>
      <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Juan Perez" #input>
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <div class="mat-elevation-z8 rounded-lg overflow-hidden">
      <table mat-table [dataSource]="dataSource" matSort class="w-full">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
          <td mat-cell *matCellDef="let row"> {{row.id}} </td>
        </ng-container>

        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Usuario </th>
          <td mat-cell *matCellDef="let row"> {{row.user}} </td>
        </ng-container>

        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Monto </th>
          <td mat-cell *matCellDef="let row"> {{row.amount | currency}} </td>
        </ng-container>

         <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let row">
            <span [ngClass]="{
              'bg-green-100 text-green-800': row.status === 'Completed',
              'bg-yellow-100 text-yellow-800': row.status === 'Pending',
              'bg-red-100 text-red-800': row.status === 'Failed'
            }" class="px-2 py-1 rounded-full text-xs font-bold">
              {{row.status}}
            </span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">No hay datos para "{{input.value}}"</td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService); // Inyectamos el servicio mejorado

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
     // Ejemplo de cómo usar el servicio API mejorado en el futuro:
     /*
     this.api.get<Transaction[]>('transactions').subscribe({
       next: (data) => this.dataSource.data = data,
       error: (err) => console.error(err)
     });
     */
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

import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- ¡IMPORTACIÓN AÑADIDA!

// Interfaz para el modelo de notificación
interface Notification {
  id: number;
  message: string;
  type: 'manuscript' | 'system' | 'review' | 'alert';
  timestamp: Date;
  isRead: boolean;
  link: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatBadgeModule, DatePipe, MatTooltipModule
  ],
  template: `
    <!-- Se elimina max-w-4xl mx-auto y se ajusta el padding -->
    <div class="w-full">

      <!-- Título y Acciones Globales -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <mat-icon class="mr-2 text-blue-600 dark:text-blue-400 text-3xl">notifications_active</mat-icon>
          Centro de Notificaciones
          <span matBadge="{{unreadCount()}}" matBadgeColor="warn" matBadgeSize="small" [matBadgeHidden]="unreadCount() === 0" class="ml-2"></span>
        </h1>

        <button mat-flat-button color="primary" (click)="markAllAsRead()" [disabled]="unreadCount() === 0">
          <mat-icon>done_all</mat-icon>
          Marcar Todo como Leído
        </button>
      </div>

      <!-- Listado de Notificaciones -->
      <div class="space-y-4">
        <mat-card *ngFor="let notification of notifications"
                  class="rounded-xl shadow-lg transition-all duration-300 cursor-pointer p-4"
                  [ngClass]="{
                    'bg-white dark:bg-gray-800 hover:shadow-xl': notification.isRead,
                    'bg-blue-50 dark:bg-gray-700/70 border-l-4 border-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700': !notification.isRead
                  }"
                  (click)="viewNotification(notification)">

          <div class="flex items-start justify-between">
            <div class="flex items-start">

              <!-- Icono basado en Tipo -->
              <mat-icon [ngClass]="getIconColor(notification.type)" class="mr-4 mt-1 shrink-0">
                {{getIcon(notification.type)}}
              </mat-icon>

              <!-- Mensaje y Detalles -->
              <div>
                <p class="font-medium text-gray-900 dark:text-white" [class.font-bold]="!notification.isRead">
                  {{notification.message}}
                </p>
                <p class="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  <mat-icon class="text-xs align-middle mr-1">schedule</mat-icon>
                  {{notification.timestamp | date:'medium'}}
                </p>
              </div>
            </div>

            <!-- Botón de Marcar como Leído/Ir a -->
            <button mat-icon-button (click)="$event.stopPropagation(); toggleReadStatus(notification)" [matTooltip]="notification.isRead ? 'Marcar como no leído' : 'Marcar como leído'">
              <mat-icon [ngClass]="notification.isRead ? 'text-gray-400' : 'text-blue-500'">
                {{ notification.isRead ? 'radio_button_checked' : 'radio_button_unchecked' }}
              </mat-icon>
            </button>
          </div>

        </mat-card>

        <div *ngIf="notifications.length === 0" class="text-center py-10 dark:text-gray-400">
            <mat-icon class="text-6xl text-gray-300 dark:text-gray-600">inbox</mat-icon>
            <p class="mt-2 text-lg">No tienes notificaciones pendientes.</p>
        </div>
      </div>

    </div>
  `,
})
export class NotificationsComponent {
  // Datos Fijos (Mock Data)
  notifications: Notification[] = [
    { id: 1, message: 'Nuevo manuscrito asignado para revisión: "El Viaje del Quetzal".', type: 'manuscript', timestamp: new Date(Date.now() - 3600000), isRead: false, link: '/manuscripts/101' },
    { id: 2, message: 'La revisión de "Crónicas de Ébano" ha sido completada por el autor.', type: 'review', timestamp: new Date(Date.now() - 7200000), isRead: false, link: '/manuscripts/203' },
    { id: 3, message: 'Actualización del sistema: Mejoras en la velocidad de carga del Dashboard.', type: 'system', timestamp: new Date(Date.now() - 10800000), isRead: true, link: '/reports/system-update' },
    { id: 4, message: 'ALERTA: El servidor de archivos adjuntos alcanzó el 90% de capacidad.', type: 'alert', timestamp: new Date(Date.now() - 86400000), isRead: true, link: '/settings/storage' },
  ];

  // Métodos de Ayuda en el Template
  getIcon(type: Notification['type']): string {
    switch (type) {
      case 'manuscript': return 'book';
      case 'review': return 'rate_review';
      case 'system': return 'settings_suggest';
      case 'alert': return 'error';
      default: return 'info';
    }
  }

  getIconColor(type: Notification['type']): string {
    switch (type) {
      case 'manuscript': return 'text-purple-500 dark:text-purple-400';
      case 'review': return 'text-blue-500 dark:text-blue-400';
      case 'system': return 'text-green-500 dark:text-green-400';
      case 'alert': return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  }

  unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Lógica de Interacción
  toggleReadStatus(notification: Notification): void {
    notification.isRead = !notification.isRead;
    // NOTA FUTURA: Aquí se enviaría una solicitud PATCH a la API para actualizar el estado.
    console.log(`Estado de notificación ${notification.id} cambiado a ${notification.isRead}`);
  }

  viewNotification(notification: Notification): void {
    if (!notification.isRead) {
      this.toggleReadStatus(notification);
    }
    // NOTA FUTURA: Redirigir usando el Router a notification.link
    console.log(`Navegando a: ${notification.link}`);
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    // NOTA FUTURA: Aquí se enviaría una solicitud PUT a la API para marcar todas como leídas.
    console.log('Todas las notificaciones marcadas como leídas.');
  }

  /**
   * NOTA PARA FUTURA INTEGRACIÓN:
   * 1. Al inicializar (ngOnInit), usar el ApiService para cargar los datos:
   * this.apiService.get<Notification[]>('/api/notifications').subscribe(data => this.notifications = data);
   * 2. Las acciones 'toggleReadStatus' y 'markAllAsRead' deben llamar a los endpoints correspondientes
   * (e.g., PUT /api/notifications/{id}/read o PUT /api/notifications/mark-all-read).
   * 3. Usar el Router (inyectado) en 'viewNotification' para navegar a 'notification.link'.
   */
}

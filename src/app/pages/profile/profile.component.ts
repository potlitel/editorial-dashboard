import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

// Interfaz para el modelo de datos (preparado para API)
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  bio: string;
  status: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatTabsModule
  ],
  template: `
    <!-- Se elimina max-w-4xl mx-auto y se ajusta el padding -->
    <div class="w-full">

      <!-- Título de la Página -->
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <mat-icon class="mr-2 text-blue-600 dark:text-blue-400 text-3xl">badge</mat-icon>
        Perfil de Editor
      </h1>

      <!-- Contenedor Principal: Tarjeta y Pestañas -->
      <mat-card class="p-6 dark:bg-gray-800 rounded-xl shadow-2xl">

        <!-- Sección Superior: Avatar y Rol -->
        <div class="flex flex-col md:flex-row items-center md:items-start pb-6 border-b dark:border-gray-700 mb-6">

          <!-- Avatar -->
          <div class="relative w-24 h-24 rounded-full overflow-hidden shrink-0 mb-4 md:mb-0">
             <!-- CORRECCIÓN: Se usa el event binding (error) para llamar al método del componente -->
             <img src="/images/editor-avatar.png"
                  (error)="handleImageError($event)"
                  alt="Avatar del Usuario"
                  class="w-full h-full object-cover border-4 border-white dark:border-gray-700 shadow-md">
             <button mat-icon-button class="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white w-7 h-7 leading-none">
                <mat-icon class="text-sm">photo_camera</mat-icon>
             </button>
          </div>

          <!-- Información de Rol y Contacto -->
          <div class="md:ml-6 text-center md:text-left">
            <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{user.firstName}} {{user.lastName}}</h2>

            <p class="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center md:justify-start">
               <mat-icon class="text-base mr-1">star</mat-icon> {{user.role}}
            </p>

            <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm flex items-center justify-center md:justify-start">
               <mat-icon class="text-base mr-1">mail</mat-icon> {{user.email}}
               <span class="mx-3 text-gray-300 dark:text-gray-600">|</span>
               <mat-icon class="text-base mr-1">phone</mat-icon> {{user.phone}}
            </p>
          </div>

          <!-- Botón de Acción -->
          <button mat-flat-button color="primary" class="md:ml-auto mt-4 md:mt-0">
             <mat-icon>edit</mat-icon>
             Editar Perfil
          </button>
        </div>

        <!-- Pestañas de Detalle -->
        <mat-tab-group animationDuration="500ms" class="mat-tab-group-dark">

          <mat-tab label="Información General">
            <div class="py-4">
              <!-- Campo Biografía/Descripción -->
              <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-3">Biografía</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">{{user.bio}}</p>

              <!-- Formulario de Edición (Simulado) -->
              <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-3 mt-8">Detalles de Contacto</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <mat-form-field appearance="outline" class="w-full mat-form-field-dark">
                  <mat-label>Nombre</mat-label>
                  <input matInput [value]="user.firstName">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full mat-form-field-dark">
                  <mat-label>Apellido</mat-label>
                  <input matInput [value]="user.lastName">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full mat-form-field-dark">
                  <mat-label>Correo Electrónico</mat-label>
                  <input matInput type="email" [value]="user.email" disabled>
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full mat-form-field-dark">
                  <mat-label>Teléfono</mat-label>
                  <input matInput [value]="user.phone">
                </mat-form-field>

              </div>
              <button mat-raised-button color="primary" class="mt-4">Guardar Cambios</button>
            </div>
          </mat-tab>

          <mat-tab label="Seguridad y Acceso">
             <div class="py-4 text-gray-600 dark:text-gray-400">
                <p class="mb-4">
                  Aquí se gestionarán las opciones de seguridad como el cambio de contraseña y la autenticación de dos factores (2FA).
                </p>
                <button mat-flat-button color="warn">Cambiar Contraseña</button>
             </div>
          </mat-tab>

          <mat-tab label="Actividad">
             <div class="py-4 text-gray-600 dark:text-gray-400">
                <p>
                  Registro de actividad reciente del usuario (últimos manuscritos revisados, comentarios dejados, inicio de sesión).
                </p>
             </div>
          </mat-tab>

        </mat-tab-group>

      </mat-card>
    </div>
  `,
})
export class ProfileComponent {
  // Datos Fijos (Mock Data)
  user: UserProfile = {
    id: 'ed-001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@nexus.com',
    role: 'Editor Jefe',
    phone: '+52 55 1234 5678',
    bio: 'Experimentado editor de ficción y literatura contemporánea. Responsable de la coordinación de equipos de revisión y el control de calidad final de los manuscritos. Con más de 10 años en la industria editorial.',
    status: 'Activo',
  };

  /**
   * Maneja el error de carga de la imagen del avatar.
   * Redirige la fuente (src) a un generador de avatares con las iniciales del usuario.
   * @param event El evento de error del elemento <img>.
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const name = `${this.user.firstName}+${this.user.lastName}`;
    // Construye la URL del placeholder dinámicamente
    imgElement.src = `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128`;
  }

  /**
   * NOTA PARA FUTURA INTEGRACIÓN:
   * 1. Al inicializar el componente (ngOnInit), usar el ApiService para llamar al endpoint:
   * this.apiService.get<UserProfile>('/api/profile/me').subscribe(data => this.user = data);
   * 2. El botón 'Guardar Cambios' debe implementar un método PUT/PATCH al mismo endpoint.
   * 3. El manejo del avatar requiere un endpoint de subida de archivos (File Upload).
   */
}

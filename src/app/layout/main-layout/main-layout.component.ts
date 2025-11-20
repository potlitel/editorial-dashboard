import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule,
    MatButtonModule, MatTooltipModule, MatMenuModule
  ],
  template: `
    <!-- Contenedor principal: h-screen para ocupar toda la altura. 'autosize' ajusta el contenido al sidebar -->
    <mat-sidenav-container class="h-screen w-full bg-gray-50 dark:bg-gray-900" autosize>

      <!-- SIDEBAR -->
      <mat-sidenav #sidenav mode="side" opened
        class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl fixed-sidenav"
        [style.width.px]="isExpanded() ? 260 : 80"
        style="transition: width 0.3s ease-in-out">

        <!-- HEADER CON BRANDING NEXUS EDITORIAL -->
        <div class="h-20 flex items-center justify-center border-b dark:border-gray-700 overflow-hidden relative">
           <!-- Icono auto_stories (siempre visible) -->
           <mat-icon class="transition-all duration-300 text-blue-600 dark:text-blue-400"
             [class.scale-[2.0]]="isExpanded()"
             [class.scale-125]="!isExpanded()"
             [class.mr-3]="isExpanded()">
             auto_stories
           </mat-icon>

           <!-- Texto Nexus Editorial (visible solo si está expandido) -->
           <div class="flex flex-col justify-center transition-all duration-300"
                [style.opacity]="isExpanded() ? 1 : 0"
                [style.width]="isExpanded() ? 'auto' : '0px'"
                [class.hidden]="!isExpanded()">

                <span class="text-xl font-extrabold tracking-tight dark:text-white leading-none">
                    Nexus
                </span>
                <span class="text-sm font-bold text-blue-500 tracking-widest uppercase leading-none mt-0.5">
                    Editorial
                </span>
           </div>
        </div>

        <!-- NAVEGACIÓN -->
        <mat-nav-list class="pt-4 px-2">
          <ng-container *ngFor="let item of menuItems">
            <a mat-list-item
               [routerLink]="item.link"
               routerLinkActive="bg-blue-50 dark:bg-gray-700 !text-blue-600 dark:!text-blue-400"
               class="mb-2 rounded-lg overflow-hidden h-12 group"
               [matTooltip]="item.label"
               [matTooltipDisabled]="isExpanded()"
               matTooltipPosition="right">

              <div class="flex items-center h-full pl-2">
                <!-- Icono: Color base ajustado al tema para que se vea bien cuando NO está activo -->
                <mat-icon class="mr-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{item.icon}}
                </mat-icon>

                <!-- Texto: Color base ajustado al tema para que se vea bien cuando NO está activo -->
                <span class="whitespace-nowrap transition-opacity duration-200 text-gray-700 dark:text-gray-200 font-medium"
                      [class.opacity-0]="!isExpanded()"
                      [class.hidden]="!isExpanded()">
                  {{item.label}}
                </span>
              </div>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <!-- CONTENIDO PRINCIPAL -->
      <mat-sidenav-content>
        <div class="flex flex-col h-screen">

            <!-- TOOLBAR -->
            <mat-toolbar class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 flex justify-between items-center shrink-0 z-20 relative">
                <div class="flex items-center">
                    <button mat-icon-button (click)="toggleMenu()" class="mr-4">
                        <mat-icon class="text-gray-600 dark:text-gray-300">{{isExpanded() ? 'menu_open' : 'menu'}}</mat-icon>
                    </button>
                    <h2 class="text-lg font-medium m-0 hidden sm:block text-gray-800 dark:text-white">Dashboard General</h2>
                </div>

                <div class="flex items-center gap-4">
                    <button mat-icon-button (click)="themeService.toggleTheme()">
                        <mat-icon class="text-gray-600 dark:text-gray-300">
                            {{themeService.isDarkMode() ? 'light_mode' : 'dark_mode'}}
                        </mat-icon>
                    </button>

                    <div class="flex items-center gap-3 border-l pl-4 border-gray-300 dark:border-gray-600">
                        <div class="text-right hidden md:block">
                            <!-- Datos de usuario ajustados al branding editorial -->
                            <p class="text-sm font-bold m-0 leading-none dark:text-white">Editor Jefe</p>
                            <p class="text-xs text-gray-500 m-0">editor@nexus.com</p>
                        </div>

                        <!-- Botón Avatar que activa el menú de usuario -->
                        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="!p-0 !w-10 !h-10 ml-1">
                            <img src="/images/avatar-placeholder.png"
                                 onerror="this.src='https://ui-avatars.com/api/?name=Editor+Jefe&background=0D8ABC&color=fff'"
                                 class="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 hover:ring-blue-500 transition-all">
                        </button>

                        <!-- Menú de Usuario -->
                        <mat-menu #userMenu="matMenu" xPosition="before" class="mt-2 custom-menu">
                            <div class="px-4 py-2 border-b dark:border-gray-700 mb-1">
                                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mi Cuenta</span>
                            </div>

                            <!-- Items con estilos ajustados al dark mode (dependen de styles.scss) -->
                            <button mat-menu-item class="dark:text-gray-200 dark:hover:bg-gray-700">
                                <mat-icon class="text-gray-500 dark:text-gray-400">badge</mat-icon>
                                <span>Perfil de Editor</span>
                            </button>
                            <button mat-menu-item class="dark:text-gray-200 dark:hover:bg-gray-700">
                                <mat-icon class="text-gray-500 dark:text-gray-400">assignment_ind</mat-icon>
                                <span>Mis Manuscritos</span>
                            </button>
                            <button mat-menu-item class="dark:text-gray-200 dark:hover:bg-gray-700">
                                <mat-icon class="text-gray-500 dark:text-gray-400">notifications_active</mat-icon>
                                <span>Notificaciones</span>
                                <span class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
                            </button>

                            <div class="border-t dark:border-gray-700 my-1"></div>

                            <button mat-menu-item (click)="logout()" class="dark:text-red-300 dark:hover:bg-red-900/20">
                                <mat-icon color="warn">logout</mat-icon>
                                <span class="text-red-600 dark:text-red-400">Cerrar Sesión</span>
                            </button>
                        </mat-menu>
                    </div>
                </div>
            </mat-toolbar>

            <!-- Contenido que se adapta al sidebar -->
            <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                <router-outlet></router-outlet>
            </div>
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `
})
export class MainLayoutComponent {
  themeService = inject(ThemeService);
  isExpanded = signal(true);

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { label: 'Usuarios', icon: 'group', link: '/users' },
    { label: 'Reportes', icon: 'bar_chart', link: '/reports' },
    { label: 'Ajustes', icon: 'settings', link: '/settings' },
  ];

  toggleMenu() {
    this.isExpanded.update(v => !v);
  }

  logout() {
    console.log('Cerrando sesión...');
    // this.router.navigate(['/login']);
  }
}

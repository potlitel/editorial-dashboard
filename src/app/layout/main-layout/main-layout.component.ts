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
    <mat-sidenav-container class="h-full w-full bg-gray-50 dark:bg-gray-900">

      <mat-sidenav #sidenav mode="side" opened
        class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 transition-all duration-300"
        [style.width.px]="isExpanded() ? 260 : 80">

        <div class="h-16 flex items-center justify-center border-b dark:border-gray-700 overflow-hidden">
           <mat-icon color="primary" class="transition-all duration-300"
             [class.scale-150]="isExpanded()" [class.scale-100]="!isExpanded()">
             admin_panel_settings
           </mat-icon>

           <span class="ml-3 font-bold text-xl dark:text-white whitespace-nowrap transition-all duration-300"
                 [style.opacity]="isExpanded() ? 1 : 0"
                 [style.width]="isExpanded() ? 'auto' : '0px'">
             AdminPro
           </span>
        </div>

        <mat-nav-list class="pt-4 px-2">
          <ng-container *ngFor="let item of menuItems">
            <a mat-list-item
               [routerLink]="item.link"
               routerLinkActive="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
               class="mb-2 rounded-lg overflow-hidden h-12"
               [matTooltip]="item.label"
               [matTooltipDisabled]="isExpanded()"
               matTooltipPosition="right">

              <div class="flex items-center h-full pl-2">
                <mat-icon class="mr-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600">{{item.icon}}</mat-icon>
                <span class="whitespace-nowrap transition-opacity duration-200"
                      [class.opacity-0]="!isExpanded()"
                      [class.hidden]="!isExpanded()">
                  {{item.label}}
                </span>
              </div>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="flex flex-col h-screen">

            <mat-toolbar class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 flex justify-between items-center shrink-0 z-20 relative">
            <div class="flex items-center">
                <button mat-icon-button (click)="toggleMenu()" class="mr-4">
                    <mat-icon>{{isExpanded() ? 'menu_open' : 'menu'}}</mat-icon>
                </button>
                <h2 class="text-lg font-medium m-0 hidden sm:block">Dashboard General</h2>
            </div>

            <div class="flex items-center gap-4">
                <button mat-icon-button (click)="themeService.toggleTheme()">
                <mat-icon class="text-gray-600 dark:text-gray-300">
                    {{themeService.isDarkMode() ? 'light_mode' : 'dark_mode'}}
                </mat-icon>
                </button>

                <div class="flex items-center gap-3 border-l pl-4 border-gray-300 dark:border-gray-600">
                    <div class="text-right hidden md:block">
                        <p class="text-sm font-bold m-0 leading-none dark:text-white">Admin User</p>
                        <p class="text-xs text-gray-500 m-0">admin@empresa.com</p>
                    </div>
                    <img src="/images/avatar-placeholder.png"
                         onerror="this.src='https://ui-avatars.com/api/?name=Admin+User'"
                         class="w-9 h-9 rounded-full bg-gray-200 cursor-pointer ring-2 ring-white dark:ring-gray-700">
                    <button mat-icon-button [matMenuTriggerFor]="userMenu" class="!p-0 !w-10 !h-10 ml-1">
                        <img src="/images/avatar-placeholder.png"
                            onerror="this.src='https://ui-avatars.com/api/?name=Editor+Jefe&background=0D8ABC&color=fff'"
                            class="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 hover:ring-blue-500 transition-all">
                    </button>

                    <mat-menu #userMenu="matMenu" xPosition="before" class="mt-2">
                        <div class="px-4 py-2 border-b dark:border-gray-700 mb-1">
                            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mi Cuenta</span>
                        </div>

                        <button mat-menu-item>
                            <mat-icon>badge</mat-icon>
                            <span>Perfil de Editor</span>
                        </button>
                        <button mat-menu-item>
                            <mat-icon>assignment_ind</mat-icon>
                            <span>Mis Manuscritos</span>
                        </button>
                        <button mat-menu-item>
                            <mat-icon>notifications_active</mat-icon>
                            <span>Notificaciones</span>
                            <span class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
                        </button>

                        <div class="border-t dark:border-gray-700 my-1"></div>

                        <button mat-menu-item (click)="logout()">
                            <mat-icon color="warn">logout</mat-icon>
                            <span class="text-red-600">Cerrar Sesión</span>
                        </button>
                    </mat-menu>
                </div>
            </div>
            </mat-toolbar>

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
    // Aquí iría la lógica de AuthService.logout()
    console.log('Cerrando sesión...');
    // this.router.navigate(['/login']);
  }
}

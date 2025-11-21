import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router'; // Importar Router
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarStateService } from '../../core/services/sidebar-state.service';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

// Estructura de un ítem de menú (los hijos)
interface MenuItem {
  label: string;
  icon: string;
  link: string;
}

// Estructura de una sección colapsable (el padre)
interface MenuSection {
  label: string;
  icon: string;
  children: MenuItem[];
}

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
        [style.width.px]="sidebarStateService.isExpanded() ? 260 : 80"
        style="transition: width 0.3s ease-in-out">

        <!-- HEADER CON BRANDING NEXUS EDITORIAL - AJUSTADO A h-16 (64px) para coincidir con el toolbar -->
        <div class="h-16 flex items-center justify-center border-b dark:border-gray-700 overflow-hidden relative">
            <!-- Icono auto_stories (siempre visible) -->
            <mat-icon class="transition-all duration-300 text-blue-600 dark:text-blue-400"
              [class.scale-[2.0]]="sidebarStateService.isExpanded()"
              [class.scale-125]="!sidebarStateService.isExpanded()"
              [class.mr-3]="sidebarStateService.isExpanded()">
              auto_stories
            </mat-icon>

            <!-- Texto Nexus Editorial (visible solo si está expandido) -->
            <div class="flex flex-col justify-center transition-all duration-300"
                 [style.opacity]="sidebarStateService.isExpanded() ? 1 : 0"
                 [style.width]="sidebarStateService.isExpanded() ? 'auto' : '0px'"
                 [class.hidden]="!sidebarStateService.isExpanded()">

                <span class="text-xl font-extrabold tracking-tight dark:text-white leading-none">
                    Nexus
                </span>
                <span class="text-sm font-bold text-blue-500 tracking-widest uppercase leading-none mt-0.5">
                    Editorial
                </span>
            </div>
        </div>

        <!-- NAVEGACIÓN AGRUPADA Y COLAPSABLE -->
        <mat-nav-list class="pt-4 px-2">

          <ng-container *ngFor="let section of menuSections">

            <!-- ENCABEZADO DE SECCIÓN COLAPSABLE (mat-list-item como botón) -->
            <a mat-list-item
               (click)="sidebarStateService.toggleSection(section.label)"
               class="mb-1 rounded-lg overflow-hidden h-12 group !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-700 cursor-pointer"
               [matTooltip]="section.label"
               [matTooltipDisabled]="sidebarStateService.isExpanded()"
               matTooltipPosition="right">

              <div class="flex items-center justify-between h-full pl-2 w-full">
                <div class="flex items-center">
                    <!-- Icono de la Sección -->
                    <mat-icon class="mr-4 text-gray-500 dark:text-gray-400 transition-colors">
                        {{section.icon}}
                    </mat-icon>

                    <!-- Etiqueta de la Sección (Visible solo si está expandido) -->
                    <span class="whitespace-nowrap transition-opacity duration-200 text-gray-700 dark:text-gray-200 font-bold text-sm"
                          [class.opacity-0]="!sidebarStateService.isExpanded()"
                          [class.hidden]="!sidebarStateService.isExpanded()">
                      {{section.label}}
                    </span>
                </div>

                <!-- Icono de Expansión/Colapso (Visible solo si está expandido) -->
                <mat-icon *ngIf="sidebarStateService.isExpanded()" class="text-gray-500 dark:text-gray-400 transition-transform duration-200"
                          [class.rotate-180]="sidebarStateService.isSectionExpanded(section.label)">
                    expand_more
                </mat-icon>
              </div>
            </a>

            <!-- LISTA DE ÍTEMS HIJOS (COLAPSABLE) -->
            <div *ngIf="sidebarStateService.isSectionExpanded(section.label) && sidebarStateService.isExpanded()" class="ml-4 transition-all duration-300 overflow-hidden">
                <ng-container *ngFor="let item of section.children">
                    <a mat-list-item
                       [routerLink]="item.link"
                       routerLinkActive="bg-blue-50 dark:bg-gray-700 !text-blue-600 dark:!text-blue-400"
                       class="mb-1 rounded-lg overflow-hidden h-10 group pl-0"
                       [matTooltip]="item.label"
                       [matTooltipDisabled]="sidebarStateService.isExpanded()"
                       matTooltipPosition="right">

                      <div class="flex items-center h-full pl-2">
                        <!-- Icono del Ítem Hijo -->
                        <mat-icon class="mr-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
                            {{item.icon}}
                        </mat-icon>

                        <!-- Texto del Ítem Hijo -->
                        <span class="whitespace-nowrap transition-opacity duration-200 text-gray-700 dark:text-gray-200 text-sm"
                              [class.opacity-0]="!sidebarStateService.isExpanded()"
                              [class.hidden]="!sidebarStateService.isExpanded()">
                          {{item.label}}
                        </span>
                      </div>
                    </a>
                </ng-container>
            </div>
          </ng-container>
        </mat-nav-list>

        <!-- Pie de página (se puede usar para el toggle del sidebar en el modo colapsado si no está en el toolbar) -->
        <div class="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
             <button mat-icon-button (click)="sidebarStateService.toggleSidebar()" class="w-full text-gray-600 dark:text-gray-300 justify-center"
                     [matTooltip]="sidebarStateService.isExpanded() ? 'Contraer' : 'Expandir'" matTooltipPosition="right">
                <mat-icon>{{sidebarStateService.isExpanded() ? 'chevron_left' : 'chevron_right'}}</mat-icon>
            </button>
        </div>

      </mat-sidenav>

      <!-- CONTENIDO PRINCIPAL -->
      <mat-sidenav-content>
        <div class="flex flex-col h-screen">

            <!-- TOOLBAR: USANDO currentRouteInfo() -->
            <mat-toolbar class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 flex justify-between items-center shrink-0 z-20 relative">
                <div class="flex items-center">
                    <button mat-icon-button (click)="sidebarStateService.toggleSidebar()" class="mr-4 sm:hidden">
                        <mat-icon class="text-gray-600 dark:text-gray-300">{{sidebarStateService.isExpanded() ? 'menu_open' : 'menu'}}</mat-icon>
                    </button>
                    <!-- TÍTULO DINÁMICO -->
                    <h2 class="text-lg font-medium m-0 hidden sm:flex items-center text-gray-800 dark:text-white">
                        <mat-icon class="mr-2 text-blue-600 dark:text-blue-400">{{ currentRouteInfo()?.icon }}</mat-icon>
                        {{ currentRouteInfo()?.label }}
                    </h2>
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

                            <!-- Ítems del menú generados dinámicamente -->
                            <ng-container *ngFor="let item of userMenuItems">
                                <a mat-menu-item [routerLink]="item.link" routerLinkActive="bg-blue-50 dark:bg-gray-700">
                                    <mat-icon class="text-gray-500 dark:text-gray-400">{{item.icon}}</mat-icon>
                                    <span>{{item.label}}</span>
                                    <!-- Si el ítem tiene un badge, lo mostramos -->
                                    <span *ngIf="item.badgeCount" class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{item.badgeCount}}</span>
                                </a>
                            </ng-container>

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
  router = inject(Router);
  // isExpanded = signal(true);

  // Signal para rastrear qué secciones están expandidas (Set<string>)
  // expandedSections = signal<Set<string>>(new Set(['Principal']));

  // INYECCIÓN DEL SERVICIO DE ESTADO DEL SIDEBAR
  sidebarStateService = inject(SidebarStateService);

  // Definición del menú por secciones colapsables
  menuSections: MenuSection[] = [
    {
      label: 'Principal',
      icon: 'home',
      children: [
        { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' }
      ],
    },
    {
      label: 'Producción Editorial',
      icon: 'auto_stories',
      children: [
        { label: 'Libros', icon: 'book', link: '/books' },
        { label: 'Series', icon: 'collections_bookmark', link: '/series' },
        { label: 'Géneros literarios', icon: 'category', link: '/genres' },
        { label: 'Contratos', icon: 'gavel', link: '/contracts' },
      ],
    },
    {
      label: 'Comunidad & Equipo',
      icon: 'groups',
      children: [
        { label: 'Autores', icon: 'person_pin', link: '/authors' },
        { label: 'Publishers', icon: 'business', link: '/publishers' },
        { label: 'Editores', icon: 'edit_note', link: '/editors' },
        { label: 'Usuarios', icon: 'group', link: '/users' },
      ],
    },
    {
      label: 'Feedback & Sistema',
      icon: 'tune',
      children: [
        { label: 'Reviews', icon: 'rate_review', link: '/reviews' },
        { label: 'Comentarios', icon: 'comment', link: '/comments' },
        { label: 'Reportes', icon: 'bar_chart', link: '/reports' },
        { label: 'Ajustes', icon: 'settings', link: '/settings' },
      ],
    },
  ];

  // Ítems del submenú del usuario (Avatar)
  userMenuItems = [
    { label: 'Perfil de Editor', icon: 'badge', link: '/profile' },
    { label: 'Mis Manuscritos', icon: 'assignment_ind', link: '/manuscripts' },
    { label: 'Notificaciones', icon: 'notifications_active', link: '/notifications', badgeCount: 3 }, // Ejemplo con contador
  ];

  /**
   * Observable que se actualiza con la información (label y icon) de la ruta activa.
   */
  currentRouteInfo: () => MenuItem | undefined;

  constructor() {
    // Aplanar todos los items para que el detector de ruta dinámica funcione
    const allMenuItems = this.menuSections.flatMap(section => section.children);

    const routeInfo$: Observable<MenuItem | undefined> = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null), // Dispara la comprobación inicial
      map(() => {
        const url = this.router.url;
        // Buscar el ítem activo en la lista completa
        const activeItem = allMenuItems.find(item => url.includes(item.link));
        // Si no encuentra una ruta, usa un fallback.
        return activeItem || { label: 'Nexus - Dashboard', icon: 'dashboard', link: '/' };
      })
    );

    // Convertir el Observable a una Signal
    this.currentRouteInfo = toSignal(routeInfo$, {
      initialValue: allMenuItems.find(item => this.router.url.includes(item.link)) || { label: 'Nexus - Dashboard', icon: 'dashboard', link: '/' }
    });
  }

  // toggleMenu() {
  //   this.isExpanded.update(v => !v);
  // }

  /**
   * Alterna el estado expandido/colapsado de una sección de menú.
   */
  // toggleSection(label: string) {
  //   if (!this.isExpanded()) {
  //       // Si el menú está colapsado, no permitimos colapsar las secciones, solo expandimos el menú principal
  //       this.toggleMenu();
  //       return;
  //   }

  //   this.expandedSections.update(currentSet => {
  //     const newSet = new Set(currentSet);
  //     if (newSet.has(label)) {
  //       newSet.delete(label);
  //     } else {
  //       newSet.add(label);
  //     }
  //     return newSet;
  //   });
  // }

  /**
   * Verifica si una sección está expandida.
   */
  // isSectionExpanded(label: string): boolean {
  //   return this.expandedSections().has(label);
  // }

  /**
   * Cierra la sesión del usuario (placeholder) y redirige a la página de login.
   * Se asume que la ruta de login es '/login'.
   */
  logout() {
    console.log('Cerrando sesión y redirigiendo a Login...');
    // Aquí se ejecutaría la lógica real de logout (limpiar tokens, etc.)
    this.router.navigate(['/login']);
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
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
    MatButtonModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="h-screen bg-gray-50 dark:bg-gray-900" autosize>

      <mat-sidenav #sidenav mode="side" opened
        class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out overflow-hidden"
        [style.width.px]="isExpanded() ? 250 : 92">

        <div class="h-16 flex items-center justify-center border-b dark:border-gray-700 whitespace-nowrap">
           <mat-icon color="primary" class="scale-150">admin_panel_settings</mat-icon>
           <span class="ml-3 font-bold text-xl dark:text-white transition-all duration-300 overflow-hidden"
                 [class.opacity-0]="!isExpanded()"
                 [class.w-0]="!isExpanded()"
                 [class.opacity-100]="isExpanded()">
             Editorial Books
           </span>
        </div>

        <mat-nav-list class="pt-4">
          <ng-container *ngFor="let item of menuItems">
            <a mat-list-item
               [routerLink]="item.link"
               routerLinkActive="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
               class="mb-1 mx-2 rounded-lg transition-colors relative group h-12"
               [matTooltip]="item.label"
               [matTooltipDisabled]="isExpanded()"
               matTooltipPosition="right">

              <div class="flex items-center px-2">
                <mat-icon class="mr-4">{{item.icon}}</mat-icon>

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

      <mat-sidenav-content class="flex flex-col h-full w-full">

        <mat-toolbar class="bg-white dark:bg-gray-800 shadow-sm z-10 px-4 flex justify-between items-center sticky top-0">
          <button mat-icon-button (click)="toggleMenu()">
            <mat-icon>{{isExpanded() ? 'menu_open' : 'menu'}}</mat-icon>
          </button>

          <div class="flex items-center gap-2">
            <button mat-icon-button (click)="themeService.toggleTheme()">
              <mat-icon>{{themeService.isDarkMode() ? 'light_mode' : 'dark_mode'}}</mat-icon>
            </button>
            <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
               <img src="https://i.pravatar.cc/150?img=3" alt="User">
            </div>
          </div>
        </mat-toolbar>

        <div class="p-6 flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
           <router-outlet></router-outlet>
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
    { label: 'Usuarios', icon: 'people', link: '/users' },
    { label: 'Ventas', icon: 'attach_money', link: '/sales' },
    { label: 'Configuración', icon: 'settings', link: '/settings' },
  ];

  toggleMenu() {
    this.isExpanded.update(v => !v);
  }
}

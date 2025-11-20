import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // (Placeholder) Ruta de Login - Usada para el redirect en logout()
  {
    path: 'login',
    // Usamos lazy loading para la ruta de login
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent), // Asumimos un componente de Login
    title: 'Nexus - Iniciar Sesión'
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // ESTA LÍNEA ES CRÍTICA: Redirige al dashboard si la ruta base es vacía
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Nexus - Dashboard',
      },
      // NUEVAS RUTAS DEL SUBMENÚ DEL USUARIO
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Nexus - Perfil de Usuario'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Nexus - Notificaciones'
      },
      // Más rutas aquí
      // Fallback (cualquier ruta no definida)
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

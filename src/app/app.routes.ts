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
      {
        path: 'genres',
        loadComponent: () => import('./pages/genres/genres.component').then(m => m.GenreComponent),
        title: 'Nexus - Géneros literarios'
      },
      {
        path: 'authors',
        loadComponent: () => import('./pages/authors/authors.component').then(m => m.AuthorComponent),
        title: 'Nexus - Autores'
      },
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contracts/contract.component').then(m => m.ContractComponent),
        title: 'Nexus - Contratos'
      },
      {
        path: 'publishers',
        loadComponent: () => import('./pages/publishers/publisher.component').then(m => m.PublisherComponent),
        title: 'Nexus - Editoriales'
      },
      {
        path: 'series',
        loadComponent: () => import('./pages/series/serie.component').then(m => m.SeriesComponent),
        title: 'Nexus - Colleciones de libros'
      },
      {
        path: 'editors',
        loadComponent: () => import('./pages/editors/editor.component').then(m => m.EditorsComponent),
        title: 'Nexus - Editores'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent),
        title: 'Nexus - Reseñas'
      },
      {
        path: 'comments',
        loadComponent: () => import('./pages/comments/comments.component').then(m => m.CommentsComponent),
        title: 'Nexus - Comentarios de reseñas'
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        title: 'Nexus - Usuarios'
      },
      // Más rutas aquí
      // Fallback (cualquier ruta no definida)
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

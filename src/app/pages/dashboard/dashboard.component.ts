import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material & Otros
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// --- Interfaz de Mocks para la demostración ---
interface ReportMetric {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

interface LeaderboardItem {
    id: number;
    name: string;
    metric: number;
    description: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatDividerModule,
    MatProgressBarModule, MatListModule, MatChipsModule, MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      <!-- Título de la Sección -->
      <header class="mb-8 border-b border-indigo-200 dark:border-indigo-800 pb-4">
        <h1 class="text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center">
          <mat-icon class="mr-3 text-4xl">analytics</mat-icon>
          Centro de Inteligencia Bibliográfica
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Análisis en tiempo real de nuestra colección, comunidad y popularidad de entidades.
        </p>
      </header>

      <!-- SECCIÓN 1: MÉTRICAS CLAVE (Basadas en Book, User, Review) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <mat-card *ngFor="let metric of mainMetrics()" class="metric-card rounded-xl shadow-lg hover:shadow-2xl transition duration-300 dark:bg-gray-800 border-t-4"
                  [ngStyle]="{'border-color': metric.color}">
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{ metric.title }}</p>
              <h2 class="text-3xl font-bold dark:text-white mt-1">{{ metric.value }}</h2>
            </div>
            <div [ngStyle]="{'background-color': metric.color + '20'}" class="p-3 rounded-full">
              <mat-icon [ngStyle]="{'color': metric.color}" class="text-3xl">{{ metric.icon }}</mat-icon>
            </div>
          </div>
          <mat-divider class="dark:bg-gray-700"></mat-divider>
          <div class="p-3 text-xs flex items-center text-gray-500 dark:text-gray-400">
            <mat-icon class="mr-1" [ngClass]="{'text-green-500': metric.trend === 'up', 'text-red-500': metric.trend === 'down', 'text-blue-500': metric.trend === 'stable' }">
                {{ metric.trend === 'up' ? 'arrow_upward' : (metric.trend === 'down' ? 'arrow_downward' : 'sync_alt') }}
            </mat-icon>
            <span>Últimos 30 días: {{ metric.trend === 'up' ? '+5%' : (metric.trend === 'down' ? '-2%' : 'Sin cambios') }}</span>
          </div>
        </mat-card>
      </div>

      <!-- SECCIÓN 2: LIDERAZGO Y DISTRIBUCIÓN (Basadas en Author, Genre, User/Followers) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <!-- CARD 1: Top 5 Autores (Por número de libros) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 lg:col-span-1">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 border-b dark:border-gray-700 pb-2">
                <mat-icon class="mr-2 text-indigo-500">trending_up</mat-icon> Top Autores (Libros)
            </h3>
            <mat-list>
              <mat-list-item *ngFor="let author of topAuthors(); let i = index">
                <div matListItemIcon class="font-bold text-lg" [ngClass]="{'text-yellow-500': i === 0, 'text-gray-400': i > 0}">
                    #{{ i + 1 }}
                </div>
                <div matListItemTitle class="font-medium dark:text-white">{{ author.name }}</div>
                <div matListItemLine class="text-sm text-gray-500 dark:text-gray-400">{{ author.description }}</div>
                <div matListItemMeta class="font-bold text-indigo-600 dark:text-indigo-400">{{ author.metric }}</div>
                <mat-divider *ngIf="i < topAuthors().length - 1"></mat-divider>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card>

        <!-- CARD 2: Distribución de Géneros (Basado en Genre) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 lg:col-span-1">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 border-b dark:border-gray-700 pb-2">
                <mat-icon class="mr-2 text-green-500">category</mat-icon> Distribución de Géneros
            </h3>
            <div *ngFor="let genre of genreDistribution()" class="mb-3">
                <div class="flex justify-between text-sm font-medium dark:text-gray-300">
                    <span class="text-green-500">{{ genre.name }}</span>
                    <span>{{ genre.percentage }}% ({{ genre.count }} libros)</span>
                </div>
                <mat-progress-bar [value]="genre.percentage" [color]="genre.color" mode="determinate" class="h-2 rounded-full mt-1"></mat-progress-bar>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">Análisis de la relación M:M con Géneros.</p>
          </div>
        </mat-card>

        <!-- CARD 3: Influencers de la Comunidad (Basado en User/Following) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800 lg:col-span-1">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 border-b dark:border-gray-700 pb-2">
                <mat-icon class="mr-2 text-pink-500">group</mat-icon> Influencers de la Comunidad
            </h3>
            <mat-list>
              <mat-list-item *ngFor="let user of topFollowedUsers(); let i = index">
                <div matListItemIcon class="font-bold text-lg" [ngClass]="{'text-pink-500': i === 0, 'text-gray-400': i > 0}">
                    #{{ i + 1 }}
                </div>
                <div matListItemTitle class="font-medium dark:text-white">{{ user.name }}</div>
                <div matListItemLine class="text-sm text-gray-500 dark:text-gray-400">{{ user.description }}</div>
                <div matListItemMeta class="font-bold text-pink-600 dark:text-pink-400">{{ user.metric }} Seg.</div>
                <mat-divider *ngIf="i < topFollowedUsers().length - 1"></mat-divider>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card>

      </div>

      <!-- SECCIÓN 3: PROFUNDIZACIÓN Y DETALLES (Basadas en Series, Publisher, Editor, Review) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- CARD 4: Libros en Tendencia (Basado en Reviews recientes) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 border-b dark:border-gray-700 pb-2">
                <mat-icon class="mr-2 text-teal-500">local_fire_department</mat-icon> Libros en Tendencia (Más Reseñas Recientes)
            </h3>
            <mat-list>
              <mat-list-item *ngFor="let book of trendingBooks(); let i = index" class="hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg">
                <div matListItemIcon class="font-bold text-lg text-teal-500">
                    {{ i + 1 }}.
                </div>
                <div matListItemTitle class="font-medium dark:text-white">{{ book.name }}</div>
                <div matListItemLine class="text-sm text-gray-500 dark:text-gray-400">
                    <mat-chip-listbox>
                        <mat-chip color="accent" class="text-xs">{{ book.description }}</mat-chip>
                    </mat-chip-listbox>
                </div>
                <div matListItemMeta class="flex flex-col items-end">
                    <span class="font-bold text-teal-600 dark:text-teal-400">{{ book.metric }}</span>
                    <span class="text-xs text-gray-500">Reseñas</span>
                </div>
                <mat-divider *ngIf="i < trendingBooks().length - 1"></mat-divider>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card>

        <!-- CARD 5: Resumen de Entidades M:1 (Series y Publishers) -->
        <mat-card class="rounded-xl shadow-xl dark:bg-gray-800">
          <div class="p-4">
            <h3 class="text-xl font-bold dark:text-white flex items-center mb-4 border-b dark:border-gray-700 pb-2">
                <mat-icon class="mr-2 text-orange-500">summarize</mat-icon> Análisis de Entidades M:1
            </h3>

            <!-- Mayor Contribución de Editorial -->
            <div class="mb-4 p-3 border-l-4 border-orange-500 dark:bg-gray-700/50 rounded-lg">
                <p class="font-semibold dark:text-white flex items-center">
                    <mat-icon class="mr-2 text-orange-500">business</mat-icon> Editorial con más Libros
                </p>
                <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ topPublisher().name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ topPublisher().metric }} libros publicados.</p>
            </div>

            <!-- Serie más Popular (Mayor Promedio de Rating) -->
            <div class="mb-4 p-3 border-l-4 border-purple-500 dark:bg-gray-700/50 rounded-lg">
                <p class="font-semibold dark:text-white flex items-center">
                    <mat-icon class="mr-2 text-purple-500">view_day</mat-icon> Serie Más Valorada
                </p>
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ topSeries().name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Rating Promedio: {{ topSeries().metric.toFixed(2) }} estrellas.</p>
            </div>

            <!-- Editor con más Proyectos (M:M) -->
            <div class="p-3 border-l-4 border-cyan-500 dark:bg-gray-700/50 rounded-lg">
                <p class="font-semibold dark:text-white flex items-center">
                    <mat-icon class="mr-2 text-cyan-500">people_alt</mat-icon> Editor Más Activo
                </p>
                <p class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{{ topEditor().name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Ha editado {{ topEditor().metric }} proyectos.</p>
            </div>

          </div>
        </mat-card>

      </div>

    </div>
  `,
  styles: [`
    .metric-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
    }
    .metric-card:hover {
        transform: translateY(-5px);
    }
    /* Estilos para el progreso para que se vea más moderno */
    :host ::ng-deep .mat-progress-bar-fill::after {
        background-color: var(--color-base);
    }
  `]
})
export class DashboardComponent {

    // --- MOCKS DE DATOS SIMULADOS (Para que los computed signals tengan de dónde "calcular") ---
    private totalBooks = 1450;
    private totalUsers = 485;
    private totalReviews = 9200;
    private averageRating = 4.35;

    private mockAuthors = [
        { id: 101, name: 'Isaac Asimov', books: 45 },
        { id: 102, name: 'Gabriel García Márquez', books: 18 },
        { id: 103, name: 'J.R.R. Tolkien', books: 7 },
        { id: 104, name: 'Jane Austen', books: 12 },
        { id: 105, name: 'George Orwell', books: 9 },
    ];

    private mockGenres = [
        { name: 'Ciencia Ficción', count: 320, color: 'blue' },
        { name: 'Fantasía Épica', count: 210, color: 'purple' },
        { name: 'Novela Histórica', count: 180, color: 'green' },
        { name: 'Thriller', count: 150, color: 'red' },
        { name: 'Realismo Mágico', count: 90, color: 'orange' },
    ];

    private mockUsers = [
        { name: 'Alice_Reads', followers: 125, description: 'La crítica literaria' },
        { name: 'Bob_Writer', followers: 98, description: 'El escritor de la comunidad' },
        { name: 'Charlie_Critic', followers: 85, description: 'Reseñas detalladas' },
        { name: 'Diana_Bookworm', followers: 70, description: 'Fanática de la fantasía' },
        { name: 'Eve_Rookie', followers: 55, description: 'Recién llegada' },
    ];

    private mockPublishers = [
        { name: 'Minotauro', books: 250 },
        { name: 'Debolsillo', books: 400 },
        { name: 'Sudamericana', books: 150 },
    ];

    private mockSeries = [
        { name: 'Trilogía Fundación', rating: 4.6, count: 3 },
        { name: 'El Señor de los Anillos', rating: 4.9, count: 3 },
        { name: 'Cien Años', rating: 4.2, count: 1 },
    ];

    private mockEditors = [
        { name: 'Elena Ramírez', projects: 80 },
        { name: 'Javier Alonso', projects: 120 },
        { name: 'Carmen Soto', projects: 50 },
    ];

    private mockTrendingBooks = [
        { name: 'El Problema de los Tres Cuerpos', reviews: 45, genre: 'Ciencia Ficción' },
        { name: 'Sapiens', reviews: 38, genre: 'No Ficción' },
        { name: 'La Biblioteca de Medianoche', reviews: 32, genre: 'Ficción Contemporánea' },
        { name: 'Dune', reviews: 29, genre: 'Ciencia Ficción' },
        { name: 'El Nombre del Viento', reviews: 25, genre: 'Fantasía' },
    ];

    // --- SIGNALS COMPUTADOS PARA LAS MÉTRICAS PRINCIPALES ---

    /**
     * Mapea los datos fijos a las tarjetas de métricas.
     * Basado en Book, User y Review.
     */
    mainMetrics = computed<ReportMetric[]>(() => [
        {
            title: 'Total de Libros',
            value: this.totalBooks.toLocaleString(),
            icon: 'menu_book',
            color: '#ef4444', // Red 500
            trend: 'up'
        },
        {
            title: 'Reseñas Pendientes',
            value: this.totalReviews.toLocaleString(),
            icon: 'rate_review',
            color: '#10b981', // Emerald 500
            trend: 'up'
        },
        {
            title: 'Rating Promedio',
            value: this.averageRating.toFixed(2) + ' / 5.0',
            icon: 'star',
            color: '#f59e0b', // Amber 500
            trend: 'stable'
        },
        {
            title: 'Comunidad Activa',
            value: this.totalUsers.toLocaleString(),
            icon: 'people',
            color: '#6366f1', // Indigo 500
            trend: 'up'
        },
    ]);

    /**
     * Top Autores por cantidad de libros.
     * Basado en la relación Author M:1.
     */
    topAuthors = computed<LeaderboardItem[]>(() =>
        this.mockAuthors
            .sort((a, b) => b.books - a.books)
            .slice(0, 5)
            .map(a => ({
                id: a.id,
                name: a.name,
                metric: a.books,
                description: a.books > 30 ? 'Autor Prolífico' : 'Contribuidor Clave'
            }))
    );

    /**
     * Distribución de Géneros.
     * Basado en la relación Genre M:M.
     */
    genreDistribution = computed<{ name: string, count: number, percentage: number, color: string }[]>(() => {
        const total = this.mockGenres.reduce((sum, g) => sum + g.count, 0);
        return this.mockGenres.map(g => ({
            ...g,
            percentage: Math.round((g.count / total) * 100),
            color: g.color === 'blue' ? 'primary' : (g.color === 'purple' ? 'accent' : 'warn')
        })).sort((a, b) => b.count - a.count);
    });

    /**
     * Usuarios con más seguidores.
     * Basado en la relación User M:M (followers).
     */
    topFollowedUsers = computed<LeaderboardItem[]>(() =>
        this.mockUsers
            .sort((a, b) => b.followers - a.followers)
            .slice(0, 5)
            .map(u => ({
                id: 0, // Mock ID
                name: u.name,
                metric: u.followers,
                description: u.description
            }))
    );

    /**
     * Libros con más actividad de reseña.
     * Basado en la relación Review 1:M (lado inverso).
     */
    trendingBooks = computed<LeaderboardItem[]>(() =>
        this.mockTrendingBooks
            .sort((a, b) => b.reviews - a.reviews)
            .slice(0, 5)
            .map(b => ({
                id: 0, // Mock ID
                name: b.name,
                metric: b.reviews,
                description: b.genre
            }))
    );

    /**
     * Editorial con más libros.
     * Basado en la relación Publisher M:1.
     */
    topPublisher = computed<LeaderboardItem>(() => {
        const top = this.mockPublishers.sort((a, b) => b.books - a.books)[0];
        return {
            id: 0,
            name: top.name,
            metric: top.books,
            description: ''
        };
    });

    /**
     * Serie con mayor rating promedio.
     * Basado en la relación Series M:1.
     */
    topSeries = computed<LeaderboardItem>(() => {
        const top = this.mockSeries.sort((a, b) => b.rating - a.rating)[0];
        return {
            id: 0,
            name: top.name,
            metric: top.rating,
            description: ''
        };
    });

    /**
     * Editor con más proyectos.
     * Basado en la relación Editor M:M.
     */
    topEditor = computed<LeaderboardItem>(() => {
        const top = this.mockEditors.sort((a, b) => b.projects - a.projects)[0];
        return {
            id: 0,
            name: top.name,
            metric: top.projects,
            description: ''
        };
    });
}

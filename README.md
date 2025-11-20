# 🚀 Angular Editorial Dashboard

Una solución **Frontend de nivel experto** construida con **Angular**, **TypeScript**, **Angular Material** y **Tailwind CSS**. Diseñada para ser escalable, modular y profesional.

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Características Principales

* **🔐 Autenticación Robusta:**
    * Diseño de Login "Split Screen" (Imagen + Formulario).
    * Validación de formularios con `ReactiveForms`.
    * Modal de Términos y Condiciones integrado.
    * Toggle entre Login y Registro.
* **🎨 UI/UX Profesional:**
    * Sidebar colapsable con animaciones y Tooltips inteligentes.
    * **Theme Switcher** (Modo Claro / Oscuro) con persistencia y servicio dedicado.
    * Diseño totalmente responsivo.
* **⚡ Arquitectura de Servicios:**
    * `ApiService` refactorizado con Genéricos `<T>`, manejo de errores centralizado e `HttpParams`.
    * Estructura lista para conectar endpoints reales.
* **📊 Dashboard Interactivo:**
    * Tarjetas de KPI con indicadores visuales.
    * Tabla de datos avanzada con **Filtrado**, **Ordenamiento** y **Paginación**.

## 🛠️ Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/angular-pro-dashboard.git](https://github.com/tu-usuario/angular-pro-dashboard.git)
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar servidor de desarrollo:**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`.

## 🔑 Credenciales de Prueba

Para acceder al sistema sin backend conectado, usa las siguientes credenciales "hardcoded" para pruebas:

* **Usuario:** `admin`
* **Contraseña:** `12345678`

## 📂 Estructura del Proyecto

* `src/app/core/services`: Servicios singleton (API, Theme).
* `src/app/auth`: Componentes relacionados con el acceso (Login, Modal).
* `src/app/layout`: Estructura principal (Sidebar, Toolbar).
* `src/app/pages`: Vistas principales (Dashboard, Usuarios).
* `src/app/shared`: Utilidades y componentes reusables.

---
Desarrollado con ❤️ usando Angular 20.

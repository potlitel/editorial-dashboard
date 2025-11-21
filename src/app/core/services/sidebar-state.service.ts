import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  // Signal para el estado de expansión/colapso del sidebar completo.
  public isExpanded = signal(true);

  // Signal para rastrear qué secciones del menú están abiertas.
  // Usamos un Set<string> para el seguimiento eficiente de nombres de sección.
  public expandedSections = signal<Set<string>>(new Set(['Principal']));

  constructor() { }

  /**
   * Alterna el estado de expansión del sidebar.
   */
  toggleSidebar() {
    this.isExpanded.update(v => !v);
  }

  /**
   * Alterna el estado expandido/colapsado de una sección de menú.
   * @param label El nombre de la sección a alternar.
   */
  toggleSection(label: string) {
    // Si el sidebar está colapsado, ignoramos el colapso de secciones y
    // primero expandimos el sidebar para que el usuario vea el menú.
    if (!this.isExpanded()) {
        this.toggleSidebar();
        return;
    }

    this.expandedSections.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }

  /**
   * Verifica si una sección está expandida.
   * @param label El nombre de la sección a verificar.
   */
  isSectionExpanded(label: string): boolean {
    return this.expandedSections().has(label);
  }
}

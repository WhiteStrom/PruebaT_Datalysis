import type { DashboardRepository } from '../domain/ports';

export class GetFiltersUseCase {
  constructor(private readonly repo: DashboardRepository) {}

  // Obtiene los estados disponibles (Ruta: /api/dashboard/filters/states)
  async getAvailableStates(): Promise<string[]> {
    return this.repo.getAvailableStates();
  }

  // Obtiene las categorias disponibles (Ruta: /api/dashboard/filters/categories)
  async getAvailableCategories(): Promise<string[]> {
    return this.repo.getAvailableCategories();
  }
}

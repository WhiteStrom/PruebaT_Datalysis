import type { DashboardRepository } from '../domain/ports';
import type { ProductRanking, CategoryRanking, DashboardFilters } from '../domain/entities';

export class GetRankingsUseCase {
  constructor(private readonly repo: DashboardRepository) {}

  // Obtiene los 10 productos mas vendidos (Limite establecido) (Ruta: /api/dashboard/rankings/products)
  async getTopProducts(filters: DashboardFilters, limit = 10): Promise<ProductRanking[]> {
    return this.repo.getTopProducts(filters, limit);
  }

  // Obtiene las 10 categorias mas vendidas (Limite establecido) (Ruta: /api/dashboard/rankings/categories)
  async getTopCategories(filters: DashboardFilters, limit = 10): Promise<CategoryRanking[]> {
    return this.repo.getTopCategories(filters, limit);
  }
}

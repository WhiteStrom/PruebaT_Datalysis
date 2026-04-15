import type { DashboardRepository } from '../domain/ports';
import type { TrendPoint, DashboardFilters } from '../domain/entities';

export class GetTrendUseCase {
  constructor(private readonly repo: DashboardRepository) {}

  // Obtiene la tendencia de los datos (Ruta: /api/dashboard/trend)
  async execute(filters: DashboardFilters): Promise<TrendPoint[]> {
    return this.repo.getTrend(filters);
  }
}

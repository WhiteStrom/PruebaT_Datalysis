import type { DashboardRepository } from '../domain/ports';
import type { KpiSnapshot, DashboardFilters } from '../domain/entities';

export class GetKpisUseCase {
  constructor(private readonly repo: DashboardRepository) {}

  // Ejecuta el caso de uso (Ruta: /api/dashboard/kpis)
  async execute(filters: DashboardFilters): Promise<KpiSnapshot> {
    return this.repo.getKpis(filters);
  }
}

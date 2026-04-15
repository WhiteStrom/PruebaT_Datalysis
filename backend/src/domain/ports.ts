// Interfaces de Puertos (Completos) - Para Infraestructura Hexagonal
import type {
  KpiSnapshot,
  TrendPoint,
  ProductRanking,
  CategoryRanking,
  DashboardFilters,
} from './entities';

// Repository Port - Exportacion de Interfaces para implementar en la Infraestructura Hexagonal (Completos)
export interface DashboardRepository {
  getKpis(filters: DashboardFilters): Promise<KpiSnapshot>;
  getTrend(filters: DashboardFilters): Promise<TrendPoint[]>;
  getTopProducts(filters: DashboardFilters, limit: number): Promise<ProductRanking[]>;
  getTopCategories(filters: DashboardFilters, limit: number): Promise<CategoryRanking[]>;
  getAvailableStates(): Promise<string[]>;
  getAvailableCategories(): Promise<string[]>;
}

import { GetKpisUseCase } from '../application/GetKpisUseCase';
import { GetTrendUseCase } from '../application/GetTrendUseCase';
import { GetRankingsUseCase } from '../application/GetRankingsUseCase';
import type { DashboardRepository } from '../domain/ports';
import type { KpiSnapshot, TrendPoint, ProductRanking, CategoryRanking } from '../domain/entities';

// ─── Mock Repository ──────────────────────────────────────────────────────────
const mockKpis: KpiSnapshot = {
  gmv: 10000,
  revenue: 9500,
  totalOrders: 100,
  totalCustomers: 90,
  avgOrderValue: 95,
  avgFreight: 12,
};

const mockTrend: TrendPoint[] = [
  { date: '2018-01-01', orders: 10, revenue: 950 },
  { date: '2018-01-02', orders: 15, revenue: 1425 },
];

const mockProducts: ProductRanking[] = [
  { productId: 'p1', categoryName: 'cama_mesa_banho', totalRevenue: 500, totalOrders: 10, rank: 1 },
  { productId: 'p2', categoryName: 'informatica', totalRevenue: 400, totalOrders: 8, rank: 2 },
];

const mockCategories: CategoryRanking[] = [
  { categoryName: 'cama_mesa_banho', totalRevenue: 3000, totalOrders: 60, percentage: 60 },
  { categoryName: 'informatica', totalRevenue: 2000, totalOrders: 40, percentage: 40 },
];

const mockRepo: DashboardRepository = {
  getKpis: jest.fn().mockResolvedValue(mockKpis),
  getTrend: jest.fn().mockResolvedValue(mockTrend),
  getTopProducts: jest.fn().mockResolvedValue(mockProducts),
  getTopCategories: jest.fn().mockResolvedValue(mockCategories),
  getAvailableStates: jest.fn().mockResolvedValue(['SP', 'RJ', 'MG']),
  getAvailableCategories: jest.fn().mockResolvedValue(['cama_mesa_banho', 'informatica']),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('GetKpisUseCase', () => {
  it('should return KPI snapshot from repository', async () => {
    const useCase = new GetKpisUseCase(mockRepo);
    const result = await useCase.execute({});
    expect(result).toEqual(mockKpis);
    expect(mockRepo.getKpis).toHaveBeenCalledWith({});
  });// Test KPI Listo

  it('should pass filters to repository', async () => {
    const useCase = new GetKpisUseCase(mockRepo);
    const filters = { startDate: '2018-01-01', endDate: '2018-12-31', state: 'SP' };
    await useCase.execute(filters);
    expect(mockRepo.getKpis).toHaveBeenCalledWith(filters);
  });  // Test Filtros Listo

  it('should compute avgOrderValue correctly', async () => {
    const useCase = new GetKpisUseCase(mockRepo);
    const result = await useCase.execute({});
    expect(result.avgOrderValue).toBe(95);
    expect(result.avgOrderValue).toBe(result.revenue / result.totalOrders);
  });
});// Test ACG Listo

describe('GetTrendUseCase', () => {
  it('should return trend points', async () => {
    const useCase = new GetTrendUseCase(mockRepo);
    const result = await useCase.execute({});
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ date: '2018-01-01', orders: 10 });
  });
});// Test Tendencias Listo(Ruta corregida)

describe('GetRankingsUseCase', () => {
  it('should return top products with rank', async () => {
    const useCase = new GetRankingsUseCase(mockRepo);
    const result = await useCase.getTopProducts({}, 10);
    expect(result).toHaveLength(2);
    expect(result[0]?.rank).toBe(1);
    expect(result[1]?.rank).toBe(2);
  });// Test Ranking Productos Listo (Ruta corregida)

  it('should return categories with percentage', async () => {
    const useCase = new GetRankingsUseCase(mockRepo);
    const result = await useCase.getTopCategories({}, 10);
    expect(result[0]?.percentage).toBe(60);
    expect(result[1]?.percentage).toBe(40);
  });// Test Ranking Categorias Listo (Ruta corregida)

  it('should pass limit to repository', async () => {
    const useCase = new GetRankingsUseCase(mockRepo);
    await useCase.getTopProducts({}, 5);
    expect(mockRepo.getTopProducts).toHaveBeenCalledWith({}, 5);
  });// Test Limite Listo
}); 

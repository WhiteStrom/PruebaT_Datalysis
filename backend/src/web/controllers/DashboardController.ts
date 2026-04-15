import type { Request, Response, NextFunction } from 'express';
import type { GetKpisUseCase } from '../../application/GetKpisUseCase';
import type { GetTrendUseCase } from '../../application/GetTrendUseCase';
import type { GetRankingsUseCase } from '../../application/GetRankingsUseCase';
import type { GetFiltersUseCase } from '../../application/GetFiltersUseCase';
import type { DashboardFilters } from '../../domain/entities';

// Se define la funcion parseFilters (Se encarga de parsear los filtros)
function parseFilters(query: Request['query']): DashboardFilters {
  return {
    startDate: typeof query['startDate'] === 'string' ? query['startDate'] : undefined,
    endDate: typeof query['endDate'] === 'string' ? query['endDate'] : undefined,
    state: typeof query['state'] === 'string' ? query['state'] : undefined,
    category: typeof query['category'] === 'string' ? query['category'] : undefined,
    granularity:
      query['granularity'] === 'weekly' || query['granularity'] === 'monthly'
        ? query['granularity']
        : 'daily',
  };
}

// Se define la clase DashboardController (Se encarga de manejar las peticiones del dashboard)
export class DashboardController {
  constructor(
    private readonly getKpisUseCase: GetKpisUseCase,
    private readonly getTrendUseCase: GetTrendUseCase,
    private readonly getRankingsUseCase: GetRankingsUseCase,
    private readonly getFiltersUseCase: GetFiltersUseCase
  ) {}

  // Se define la funcion getKpis (Se encarga de obtener los kpis)
  getKpis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = parseFilters(req.query);
      const data = await this.getKpisUseCase.execute(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // Se define la funcion getTrend (Se encarga de obtener la tendencia)
  getTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = parseFilters(req.query);
      const data = await this.getTrendUseCase.execute(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // Se define la funcion getTopProducts (Se encarga de obtener los productos mas vendidos)
  getTopProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = parseFilters(req.query);
      const limit = parseInt(String(req.query['limit'] ?? '10'), 10);
      const data = await this.getRankingsUseCase.getTopProducts(filters, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // Se define la funcion getTopCategories (Se encarga de obtener las categorias mas vendidas)
  getTopCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = parseFilters(req.query);
      const limit = parseInt(String(req.query['limit'] ?? '10'), 10);
      const data = await this.getRankingsUseCase.getTopCategories(filters, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // Se define la funcion getStates (Se encarga de obtener los estados)
  getStates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getFiltersUseCase.getAvailableStates();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // Se define la funcion getCategories (Se encarga de obtener las categorias)
  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getFiltersUseCase.getAvailableCategories();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

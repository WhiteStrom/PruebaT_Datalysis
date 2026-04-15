import { Router } from 'express';
import type { DashboardController } from '../controllers/DashboardController';

export function createDashboardRouter(controller: DashboardController): Router {
  const router = Router();

  // GET /api/kpis?startDate=&endDate=&state=&category= (Se encarga de obtener los kpis)
  router.get('/kpis', controller.getKpis);

  // GET /api/trend?startDate=&endDate=&state=&category=&granularity=daily|weekly|monthly (Se encarga de obtener la tendencia)
  router.get('/trend', controller.getTrend);

  // GET /api/rankings/products?limit=10&...filters (Se encarga de obtener los productos mas vendidos)
  router.get('/rankings/products', controller.getTopProducts);

  // GET /api/rankings/categories?limit=10&...filters (Se encarga de obtener las categorias mas vendidas)
  router.get('/rankings/categories', controller.getTopCategories);

  // GET /api/filters/states (Se encarga de obtener los estados)
  router.get('/filters/states', controller.getStates);

  // GET /api/filters/categories (Se encarga de obtener las categorias)
  router.get('/filters/categories', controller.getCategories);

  return router;
}
